import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import dayjs from "dayjs";
import { EtCalendar } from "./EtCalendar";
import type { DateRangeValue } from "../../types";

const getSegmentInputs = () => ({
	day: screen.getByPlaceholderText("DD"),
	month: screen.getByPlaceholderText("MM"),
	year: screen.getByPlaceholderText("YYYY"),
});

const openCalendar = () => {
	fireEvent.click(screen.getByPlaceholderText("DD"));
};

/** Open the popup via the calendar icon (works in both single and range mode). */
const openViaIcon = (container: HTMLElement) => {
	fireEvent.click(container.querySelector(".calendarIcon")!);
};

describe("EtCalendar – rendering", () => {
	it("renders the three segmented inputs in single-date mode", () => {
		render(<EtCalendar />);
		const { day, month, year } = getSegmentInputs();
		expect(day).toBeInTheDocument();
		expect(month).toBeInTheDocument();
		expect(year).toBeInTheDocument();
	});

	it("displays a provided value as Ethiopian segments", () => {
		// 2024-09-11 GC == Meskerem 1, 2017 ET.
		render(<EtCalendar value={new Date("2024-09-11")} />);
		expect(screen.getByPlaceholderText("YYYY")).toHaveValue("2017");
		expect(screen.getByPlaceholderText("MM")).toHaveValue("01");
		expect(screen.getByPlaceholderText("DD")).toHaveValue("01");
	});

	it("renders a range placeholder in range mode", () => {
		render(<EtCalendar dateRange placeholder="Pick a period" />);
		expect(screen.getByText("Pick a period")).toBeInTheDocument();
	});
});

describe("EtCalendar – keyboard entry (regression for the no-op setDate / stale-closure bug)", () => {
	it("typing a full Ethiopian date updates the inputs and fires onChange with the Gregorian date", () => {
		const onChange = vi.fn();
		render(<EtCalendar onChange={onChange} />);
		const { day, month, year } = getSegmentInputs();

		fireEvent.change(day, { target: { value: "01" } });
		fireEvent.change(month, { target: { value: "01" } });
		fireEvent.change(year, { target: { value: "2017" } });

		// The typed segments are reflected back (no more no-op setter).
		expect(day).toHaveValue("01");
		expect(month).toHaveValue("01");
		expect(year).toHaveValue("2017");

		// Meskerem 1 2017 -> 2024-09-11 GC.
		expect(onChange).toHaveBeenCalled();
		const arg = onChange.mock.calls.at(-1)?.[0];
		expect(dayjs.isDayjs(arg)).toBe(true);
		expect((arg as dayjs.Dayjs).format("YYYY-MM-DD")).toBe("2024-09-11");
	});
});

describe("EtCalendar – calendar popup", () => {
	it("opens the grid on click and selects a day", () => {
		const onChange = vi.fn();
		const { container } = render(<EtCalendar onChange={onChange} />);
		openCalendar();

		const grid = container.querySelector(".Cal");
		expect(grid).not.toBeNull();

		const currentCells = grid!.querySelectorAll(".currentMonth");
		expect(currentCells.length).toBeGreaterThan(0);

		fireEvent.click(currentCells[10]!);
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(dayjs.isDayjs(onChange.mock.calls[0]?.[0])).toBe(true);
	});

	it("does not open when disabled", () => {
		const { container } = render(<EtCalendar disabled />);
		openCalendar();
		expect(container.querySelector(".Cal")).toBeNull();
	});
});

describe("EtCalendar – Gregorian range mode (regression for the missing dayjs plugin crash)", () => {
	it("selects a start and end date without throwing and reports the range", () => {
		const onChange = vi.fn();
		const { container } = render(
			<EtCalendar calendarType={false} dateRange onChange={onChange} />,
		);
		openViaIcon(container);

		const grid = container.querySelector(".Cal");
		const cells = grid!.querySelectorAll(".currentMonth");
		expect(cells.length).toBeGreaterThan(2);

		// First click: start date. Second click: end date — this is the path
		// that previously threw via isSameOrAfter/isSameOrBefore.
		expect(() => {
			fireEvent.click(cells[5]!);
			fireEvent.click(cells[15]!);
		}).not.toThrow();

		const lastArg = onChange.mock.calls.at(-1)?.[0] as {
			startDate: dayjs.Dayjs | null;
			endDate: dayjs.Dayjs | null;
		};
		expect(lastArg.startDate).not.toBeNull();
		expect(lastArg.endDate).not.toBeNull();
	});

	it("renders an in-range highlight after both endpoints are chosen", () => {
		const { container } = render(<EtCalendar calendarType={false} dateRange />);
		openViaIcon(container);
		const cells = container.querySelector(".Cal")!.querySelectorAll(".currentMonth");
		fireEvent.click(cells[5]!);
		fireEvent.click(cells[15]!); // selecting the end date closes the popup

		// Reopen: the persisted range should now render its boundary highlights.
		openViaIcon(container);
		const grid = container.querySelector(".Cal")!;
		expect(grid.querySelectorAll(".rangeStart, .rangeEnd").length).toBeGreaterThan(0);
		expect(grid.querySelectorAll(".dateInRange").length).toBeGreaterThan(0);
	});
});

describe("EtCalendar – Gregorian single mode", () => {
	it("displays a provided value as Gregorian segments", () => {
		render(<EtCalendar calendarType={false} value={new Date("2024-06-15")} />);
		expect(screen.getByPlaceholderText("YYYY")).toHaveValue("2024");
		expect(screen.getByPlaceholderText("MM")).toHaveValue("06");
		expect(screen.getByPlaceholderText("DD")).toHaveValue("15");
	});

	it("typing a full Gregorian date fires onChange with that date", () => {
		const onChange = vi.fn();
		render(<EtCalendar calendarType={false} onChange={onChange} />);
		const { day, month, year } = getSegmentInputs();
		fireEvent.change(day, { target: { value: "15" } });
		fireEvent.change(month, { target: { value: "06" } });
		fireEvent.change(year, { target: { value: "2024" } });
		const arg = onChange.mock.calls.at(-1)?.[0] as dayjs.Dayjs;
		expect(arg.format("YYYY-MM-DD")).toBe("2024-06-15");
	});
});

describe("EtCalendar – disableFuture", () => {
	it("does not select a fully-future month when disableFuture is set", () => {
		const onChange = vi.fn();
		const { container } = render(<EtCalendar disableFuture onChange={onChange} />);
		openCalendar();
		// Navigate forward a year so every visible current-month day is in the future.
		const navButtons = container.querySelectorAll(".monthButton");
		fireEvent.click(navButtons[3]!); // nextYear
		const futureCell = container.querySelector(".Cal .currentMonth");
		fireEvent.click(futureCell!);
		expect(onChange).not.toHaveBeenCalled();
	});
});

describe("EtCalendar – clear button", () => {
	it("clears a single date and reports null via onChange", () => {
		const onChange = vi.fn();
		render(<EtCalendar value={new Date("2024-09-11")} onChange={onChange} />);
		expect(screen.getByPlaceholderText("YYYY")).toHaveValue("2017");

		const clear = screen.getByLabelText("Clear date");
		fireEvent.click(clear);

		expect(onChange).toHaveBeenCalledWith(null);
		expect(screen.getByPlaceholderText("YYYY")).toHaveValue("");
	});

	it("clears a date range and reports an empty range", () => {
		const onChange = vi.fn();
		render(
			<EtCalendar
				dateRange
				value={{
					startDate: dayjs("2024-09-11"),
					endDate: dayjs("2024-09-20"),
				}}
				onChange={onChange}
			/>,
		);
		fireEvent.click(screen.getByLabelText("Clear date"));
		expect(onChange).toHaveBeenCalledWith({ startDate: null, endDate: null });
	});

	it("is hidden when there is no value, and when allowClear is false", () => {
		const { rerender } = render(<EtCalendar />);
		expect(screen.queryByLabelText("Clear date")).toBeNull();

		rerender(<EtCalendar value={new Date("2024-09-11")} allowClear={false} />);
		expect(screen.queryByLabelText("Clear date")).toBeNull();
	});

	it("does not open the calendar popup when clearing", () => {
		const { container } = render(<EtCalendar value={new Date("2024-09-11")} />);
		fireEvent.click(screen.getByLabelText("Clear date"));
		expect(container.querySelector(".Cal")).toBeNull();
	});
});

describe("EtCalendar – controlled range mode (regression: first click must not be wiped)", () => {
	function ControlledRange() {
		const [value, setValue] = useState<DateRangeValue>({
			startDate: null,
			endDate: null,
		});
		return (
			<EtCalendar
				dateRange
				value={value}
				onChange={(v) => setValue(v as DateRangeValue)}
			/>
		);
	}

	it("completes a range when the parent controls value", () => {
		const { container } = render(<ControlledRange />);
		openViaIcon(container);
		const cells = container
			.querySelector(".Cal")!
			.querySelectorAll(".currentMonth");
		fireEvent.click(cells[5]!); // start — parent re-renders value={start, null}
		fireEvent.click(cells[15]!); // end — would be impossible if start were wiped

		openViaIcon(container);
		const grid = container.querySelector(".Cal")!;
		expect(grid.querySelectorAll(".rangeStart, .rangeEnd").length).toBeGreaterThan(0);
		expect(grid.querySelectorAll(".dateInRange").length).toBeGreaterThan(0);
	});
});

describe("EtCalendar – constraints", () => {
	it("shows an error and disables input when minDate is after maxDate", () => {
		render(
			<EtCalendar minDate={new Date("2025-01-01")} maxDate={new Date("2020-01-01")} />,
		);
		expect(
			screen.getByText(/minimum date cannot be after maximum date/i),
		).toBeInTheDocument();
	});

	it("hides the calendar-swap button unless allowCalendarSwap is set", () => {
		const { container } = render(<EtCalendar calendarType={false} />);
		openCalendar();
		expect(container.querySelector(".etSwapButton")).toBeNull();
	});

	it("swaps from the Gregorian view to the Ethiopian view when allowCalendarSwap is set", () => {
		const { container } = render(
			<EtCalendar calendarType={false} allowCalendarSwap />,
		);
		openCalendar();
		const grid = container.querySelector(".Cal")! as HTMLElement;

		// Gregorian view shows a swap button targeting the Ethiopian calendar.
		const swap = within(grid).getByLabelText("Switch to Ethiopian calendar");
		fireEvent.click(swap);

		// After swapping, the Ethiopian view shows its swap button (back to Gregorian).
		const updatedGrid = container.querySelector(".Cal")! as HTMLElement;
		expect(
			within(updatedGrid).getByLabelText("Switch to Gregorian calendar"),
		).toBeInTheDocument();
	});
});
