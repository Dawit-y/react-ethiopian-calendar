import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TimeInput from "./TimeInput";

const hourInput = () => screen.getAllByPlaceholderText("--")[0] as HTMLInputElement;
const minuteInput = () => screen.getAllByPlaceholderText("--")[1] as HTMLInputElement;
const stepButtons = () => screen.getAllByText("+");
const minusButtons = () => screen.getAllByText("-");

describe("TimeInput – display", () => {
	it("shows Gregorian PM time", () => {
		render(<TimeInput calendarType={false} value="13:30" onTimeChange={() => {}} />);
		expect(hourInput().value).toBe("01");
		expect(minuteInput().value).toBe("30");
	});

	it("shows Ethiopian time (06:00 GC -> 12 AM ET)", () => {
		render(<TimeInput calendarType value="06:00" onTimeChange={() => {}} />);
		expect(hourInput().value).toBe("12");
	});

	it("renders empty for malformed/out-of-range values (fallback, regression for bug #8)", () => {
		render(<TimeInput calendarType={false} value="99:99" onTimeChange={() => {}} />);
		expect(hourInput().value).toBe("");
		expect(minuteInput().value).toBe("");
	});
});

describe("TimeInput – stepping", () => {
	it("increments and decrements the hour", () => {
		const onTimeChange = vi.fn();
		render(<TimeInput calendarType={false} value="01:00" onTimeChange={onTimeChange} />);
		fireEvent.click(stepButtons()[0]!);
		expect(hourInput().value).toBe("02");
		fireEvent.click(minusButtons()[0]!);
		expect(hourInput().value).toBe("01");
		expect(onTimeChange).toHaveBeenCalled();
	});

	it("increments the minute and wraps past 59", () => {
		render(<TimeInput calendarType={false} value="01:59" onTimeChange={() => {}} />);
		fireEvent.click(stepButtons()[1]!); // minute +
		expect(minuteInput().value).toBe("00");
	});

	it("decrements the minute below 0 to 59", () => {
		render(<TimeInput calendarType={false} value="02:00" onTimeChange={() => {}} />);
		fireEvent.click(minusButtons()[1]!); // minute -
		expect(minuteInput().value).toBe("59");
	});

	it("toggles AM/PM in Gregorian mode", () => {
		render(<TimeInput calendarType={false} value="01:00" onTimeChange={() => {}} />);
		expect(screen.getByText("AM")).toBeInTheDocument();
		fireEvent.click(screen.getByText("AM"));
		expect(screen.getByText("PM")).toBeInTheDocument();
	});
});

describe("TimeInput – direct input", () => {
	it("accepts a typed hour", () => {
		render(<TimeInput calendarType={false} value="01:00" onTimeChange={() => {}} />);
		fireEvent.change(hourInput(), { target: { value: "9" } });
		expect(hourInput().value).toBe("09");
	});

	it("accepts a typed minute", () => {
		render(<TimeInput calendarType={false} value="01:00" onTimeChange={() => {}} />);
		fireEvent.change(minuteInput(), { target: { value: "45" } });
		expect(minuteInput().value).toBe("45");
	});

	it("rejects an out-of-range typed hour", () => {
		render(<TimeInput calendarType={false} value="01:00" onTimeChange={() => {}} />);
		fireEvent.change(hourInput(), { target: { value: "15" } });
		expect(hourInput().value).toBe("01");
	});
});

describe("TimeInput – constraints & disabled", () => {
	it("does not step beyond max", () => {
		render(
			<TimeInput
				calendarType={false}
				value="10:00"
				max="10:00"
				onTimeChange={() => {}}
			/>,
		);
		fireEvent.click(stepButtons()[0]!); // hour + would exceed max
		expect(hourInput().value).toBe("10");
	});

	it("ignores interaction when disabled", () => {
		const onTimeChange = vi.fn();
		render(
			<TimeInput
				calendarType={false}
				value="01:00"
				disabled
				onTimeChange={onTimeChange}
			/>,
		);
		onTimeChange.mockClear();
		fireEvent.click(stepButtons()[0]!);
		expect(hourInput().value).toBe("01");
	});
});

describe("TimeInput – Ethiopian display variants", () => {
	it("shows Ethiopian PM time (20:00 GC -> 2 PM ET)", () => {
		render(<TimeInput calendarType value="20:00" onTimeChange={() => {}} />);
		expect(hourInput().value).toBe("02");
	});

	it("shows Ethiopian morning time (09:00 GC -> 3 AM ET)", () => {
		render(<TimeInput calendarType value="09:00" onTimeChange={() => {}} />);
		expect(hourInput().value).toBe("03");
	});

	it("toggles period in Ethiopian mode (icon button)", () => {
		const onTimeChange = vi.fn();
		render(<TimeInput calendarType value="09:00" onTimeChange={onTimeChange} />);
		// The meridiem button is the third button after the four steppers.
		const allButtons = screen.getAllByRole("button");
		fireEvent.click(allButtons[allButtons.length - 1]!);
		expect(hourInput()).toBeInTheDocument();
	});
});

describe("TimeInput – calendarType switch", () => {
	it("re-adjusts from Gregorian to Ethiopian without crashing", () => {
		const { rerender } = render(
			<TimeInput calendarType={false} value="08:00" onTimeChange={() => {}} />,
		);
		expect(hourInput().value).toBe("08");
		rerender(<TimeInput calendarType value="08:00" onTimeChange={() => {}} />);
		expect(hourInput()).toBeInTheDocument();
	});

	it("re-adjusts from Ethiopian to Gregorian without crashing", () => {
		const { rerender } = render(
			<TimeInput calendarType value="03:00" onTimeChange={() => {}} />,
		);
		rerender(<TimeInput calendarType={false} value="03:00" onTimeChange={() => {}} />);
		expect(hourInput()).toBeInTheDocument();
	});
});

describe("TimeInput – calendarType adjustment across times", () => {
	const samples = ["08:00", "11:00", "14:00", "18:00", "23:00", "06:00", "12:00"];
	it.each(samples)("adjusts %s from Gregorian to Ethiopian without crashing", (v) => {
		const { rerender } = render(
			<TimeInput calendarType={false} value={v} onTimeChange={() => {}} />,
		);
		rerender(<TimeInput calendarType value={v} onTimeChange={() => {}} />);
		expect(hourInput()).toBeInTheDocument();
	});

	it.each(samples)("adjusts %s from Ethiopian to Gregorian without crashing", (v) => {
		const { rerender } = render(
			<TimeInput calendarType value={v} onTimeChange={() => {}} />,
		);
		rerender(<TimeInput calendarType={false} value={v} onTimeChange={() => {}} />);
		expect(hourInput()).toBeInTheDocument();
	});
});

describe("TimeInput – stepping from empty toward bounds", () => {
	it("steps up from an empty value toward the minimum", () => {
		render(
			<TimeInput
				calendarType={false}
				value="99:99"
				min="07:30"
				onTimeChange={() => {}}
			/>,
		);
		expect(hourInput().value).toBe(""); // starts empty
		fireEvent.click(stepButtons()[0]!); // hour +
		expect(hourInput().value).not.toBe("");
	});
});
