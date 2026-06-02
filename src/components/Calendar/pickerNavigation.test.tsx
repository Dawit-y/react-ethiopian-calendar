import { describe, it, expect } from "vitest";
import { render, fireEvent, within } from "@testing-library/react";
import { EtCalendar } from "./EtCalendar";

const open = (container: HTMLElement) =>
	fireEvent.click(container.querySelector(".calendarIcon")!);

const grid = (container: HTMLElement) => container.querySelector(".Cal") as HTMLElement;

describe("Ethiopian picker navigation", () => {
	it("navigates month/year and returns to today without throwing", () => {
		const { container } = render(<EtCalendar />);
		open(container);
		const buttons = grid(container).querySelectorAll(".monthButton");
		expect(buttons).toHaveLength(4); // prevYear, prevMonth, nextMonth, nextYear

		expect(() => {
			buttons.forEach((b) => fireEvent.click(b));
			fireEvent.click(grid(container).querySelector(".todayButton")!);
		}).not.toThrow();

		expect(grid(container).querySelectorAll(".currentMonth").length).toBe(30);
	});

	it("opens the year grid and selects a year", () => {
		const { container } = render(<EtCalendar />);
		open(container);
		const header = within(grid(container)).getByText(/, \d{4}$/);
		fireEvent.click(header);

		const yearItems = grid(container).querySelectorAll(".yearItem");
		expect(yearItems.length).toBeGreaterThan(0);

		fireEvent.click(within(grid(container)).getByText("2017"));
		// Back to the day grid.
		expect(grid(container).querySelectorAll(".currentMonth").length).toBeGreaterThan(0);
		expect(within(grid(container)).getByText(/, 2017$/)).toBeInTheDocument();
	});
});

describe("Afaan Oromoo (lang='or') support", () => {
	it("renders Oromoo month names and weekday headers", () => {
		const { container } = render(
			<EtCalendar value={new Date("2024-09-11")} lang="or" />,
		);
		open(container);
		const g = grid(container);
		// 2024-09-11 == Meskerem 2017 -> "Fulbaana" in Afaan Oromoo.
		expect(within(g).getByText(/^Fulbaana, \d{4}$/)).toBeInTheDocument();
		// Oromoo weekday headers.
		expect(within(g).getAllByText("Dil").length).toBeGreaterThan(0);
		expect(within(g).getByText("Jim")).toBeInTheDocument();
		// "Today" localized to Afaan Oromoo.
		expect(within(g).getByText("Har'a")).toBeInTheDocument();
	});
});

describe("picker cell states", () => {
	it("highlights the selected date in the Ethiopian view", () => {
		const { container } = render(<EtCalendar value={new Date("2024-09-11")} />);
		open(container);
		expect(grid(container).querySelectorAll(".selectedDate").length).toBe(1);
	});

	it("highlights the selected date in the Gregorian view", () => {
		const { container } = render(
			<EtCalendar calendarType={false} value={new Date("2024-09-11")} />,
		);
		open(container);
		expect(grid(container).querySelectorAll(".selectedDate").length).toBe(1);
	});

	it("grays out-of-bounds days using minDate/maxDate", () => {
		const { container } = render(
			<EtCalendar
				calendarType={false}
				value={new Date("2024-06-15")}
				minDate={new Date("2024-06-10")}
				maxDate={new Date("2024-06-20")}
			/>,
		);
		open(container);
		// Days before the 10th and after the 20th of June are grayed.
		expect(grid(container).querySelectorAll(".grayText").length).toBeGreaterThan(0);
	});
});

describe("Gregorian picker navigation", () => {
	it("navigates and opens the year grid", () => {
		const { container } = render(<EtCalendar calendarType={false} />);
		open(container);
		const buttons = grid(container).querySelectorAll(".monthButton");
		expect(() => buttons.forEach((b) => fireEvent.click(b))).not.toThrow();

		const header = within(grid(container)).getByText(/, \d{4}$/);
		fireEvent.click(header);
		expect(grid(container).querySelectorAll(".yearItem").length).toBeGreaterThan(0);
	});

	it("hides years outside the min/max bounds", () => {
		const { container } = render(
			<EtCalendar
				calendarType={false}
				minDate={new Date("2020-01-01")}
				maxDate={new Date("2026-12-31")}
			/>,
		);
		open(container);
		fireEvent.click(within(grid(container)).getByText(/, \d{4}$/));
		const years = Array.from(grid(container).querySelectorAll(".yearItem")).map(
			(el) => el.textContent,
		);
		expect(years).toContain("2020");
		expect(years).toContain("2026");
		expect(years).not.toContain("2019");
		expect(years).not.toContain("2027");
	});
});
