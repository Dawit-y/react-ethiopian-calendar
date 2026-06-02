import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EtTimePicker } from "./EtTimePicker";

const getHourInput = () => screen.getAllByPlaceholderText("--")[0] as HTMLInputElement;
const getMinuteInput = () => screen.getAllByPlaceholderText("--")[1] as HTMLInputElement;

describe("EtTimePicker", () => {
	// Regression for bug #4: with default props the picker used to render empty
	// because the default value violated the default minTime.
	it("renders its default value instead of an empty field", () => {
		render(<EtTimePicker />);
		// 10:00 (24h) in Ethiopian time -> 4:00 AM displayed.
		expect(getHourInput().value).toBe("04");
		expect(getMinuteInput().value).toBe("00");
	});

	it("still blanks the value when it falls below an explicit minTime", () => {
		render(<EtTimePicker value="10:00" minTime="11:00" />);
		expect(getHourInput().value).toBe("");
	});

	it("renders Gregorian time when calendarType is false", () => {
		render(<EtTimePicker value="13:30" calendarType={false} />);
		expect(getHourInput().value).toBe("01"); // 13:30 -> 1:30 PM
		expect(getMinuteInput().value).toBe("30");
	});

	it("emits an HH:mm string when the hour is stepped", () => {
		const onChange = vi.fn();
		render(<EtTimePicker value="13:30" calendarType={false} onChange={onChange} />);
		const plusButtons = screen.getAllByText("+");
		fireEvent.click(plusButtons[0]!); // increment hour
		expect(onChange).toHaveBeenCalled();
		const last = onChange.mock.calls.at(-1)?.[0] as string;
		expect(last).toMatch(/^\d{2}:\d{2}$/);
	});
});
