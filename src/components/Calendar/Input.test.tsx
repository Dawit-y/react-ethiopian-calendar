import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EtCalendar } from "./EtCalendar";

const inputs = () => ({
	day: screen.getByPlaceholderText("DD") as HTMLInputElement,
	month: screen.getByPlaceholderText("MM") as HTMLInputElement,
	year: screen.getByPlaceholderText("YYYY") as HTMLInputElement,
});

describe("Input – Ethiopian validation guards", () => {
	it("rejects a month greater than 13", () => {
		render(<EtCalendar />);
		const { month } = inputs();
		fireEvent.change(month, { target: { value: "14" } });
		expect(month.value).toBe("");
	});

	it("rejects a day greater than 30", () => {
		render(<EtCalendar />);
		const { day } = inputs();
		fireEvent.change(day, { target: { value: "31" } });
		expect(day.value).toBe("");
	});

	it("rejects a Pagume day greater than 6", () => {
		render(<EtCalendar />);
		const { day, month } = inputs();
		fireEvent.change(month, { target: { value: "13" } });
		fireEvent.change(day, { target: { value: "7" } });
		expect(day.value).toBe("");
	});

	it("rejects a leading-zero pair like 00", () => {
		render(<EtCalendar />);
		const { day } = inputs();
		fireEvent.change(day, { target: { value: "00" } });
		expect(day.value).toBe("");
	});

	it("rejects non-numeric input", () => {
		render(<EtCalendar />);
		const { day } = inputs();
		fireEvent.change(day, { target: { value: "ab" } });
		expect(day.value).toBe("");
	});
});

describe("Input – Gregorian validation guards", () => {
	it("rejects a month greater than 12", () => {
		render(<EtCalendar calendarType={false} />);
		const { month } = inputs();
		fireEvent.change(month, { target: { value: "13" } });
		expect(month.value).toBe("");
	});

	it("rejects February 30 / 31", () => {
		render(<EtCalendar calendarType={false} />);
		const { day, month } = inputs();
		fireEvent.change(month, { target: { value: "02" } });
		fireEvent.change(day, { target: { value: "30" } });
		expect(day.value).toBe("");
	});

	it("rejects February 29 in a non-leap year but accepts it in a leap year", () => {
		const { unmount } = render(<EtCalendar calendarType={false} />);
		let f = inputs();
		fireEvent.change(f.month, { target: { value: "02" } });
		fireEvent.change(f.year, { target: { value: "2023" } }); // non-leap
		fireEvent.change(f.day, { target: { value: "29" } });
		expect(f.day.value).toBe("");
		unmount();

		render(<EtCalendar calendarType={false} />);
		f = inputs();
		fireEvent.change(f.month, { target: { value: "02" } });
		fireEvent.change(f.year, { target: { value: "2024" } }); // leap
		fireEvent.change(f.day, { target: { value: "29" } });
		expect(f.day.value).toBe("29");
	});

	it("accepts Pagume 6 in an Ethiopian leap year", () => {
		render(<EtCalendar />);
		const { day, month, year } = inputs();
		fireEvent.change(year, { target: { value: "2015" } }); // 2015 % 4 === 3 (leap)
		fireEvent.change(month, { target: { value: "13" } });
		fireEvent.change(day, { target: { value: "6" } });
		expect(day.value).toBe("6");
	});

	it("advances and accepts a single-digit day greater than 3", () => {
		render(<EtCalendar />);
		const { day } = inputs();
		fireEvent.change(day, { target: { value: "5" } });
		expect(day.value).toBe("5");
	});
});

describe("Input – opening with a preselected value", () => {
	it("opens the calendar positioned on the selected date", () => {
		const { container } = render(<EtCalendar value={new Date("2024-09-11")} />);
		fireEvent.click(container.querySelector(".calendarIcon")!);
		expect(container.querySelector(".Cal")).not.toBeNull();
		expect(container.querySelectorAll(".selectedDate").length).toBe(1);
	});
});
