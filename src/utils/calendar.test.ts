import { describe, it, expect } from "vitest";
import dayjs from "dayjs";
import { generateDate, months, checkLeapYearGc } from "./calendar";

describe("generateDate", () => {
	it("always returns a full 42-cell grid", () => {
		// August 2024 (month index 7).
		expect(generateDate(7, 2024)).toHaveLength(42);
		// February 2021 (28 days).
		expect(generateDate(1, 2021)).toHaveLength(42);
	});

	it("every cell carries a concrete date", () => {
		const cells = generateDate(7, 2024);
		expect(cells.every((c) => c.date !== undefined)).toBe(true);
	});

	// Regression for bug #2: leading cells were duplicated/off-by-one because
	// the old code used `.date(i)` from i=0.
	it("renders the correct trailing days of the previous month as the prefix", () => {
		// August 2024: the 1st is a Thursday (weekday 4), so 4 leading cells
		// should be Jul 28, 29, 30, 31 — NOT duplicates of August days.
		const cells = generateDate(7, 2024);
		const prefix = cells.slice(0, dayjs("2024-08-01").day());
		expect(prefix.map((c) => c.day)).toEqual([28, 29, 30, 31]);
		expect(prefix.every((c) => c.isCurrentMonth === false)).toBe(true);
		expect(prefix.every((c) => c.date?.month() === 6)).toBe(true); // July (index 6)
	});

	it("does not duplicate the first days of the current month", () => {
		const cells = generateDate(7, 2024);
		const firstOfMonth = cells.filter(
			(c) => c.isCurrentMonth && c.day === 1,
		);
		expect(firstOfMonth).toHaveLength(1);
	});

	it("marks today when the current month/year is shown", () => {
		const now = dayjs();
		const cells = generateDate(now.month(), now.year());
		const todays = cells.filter((c) => c.today);
		expect(todays).toHaveLength(1);
		expect(todays[0]?.date?.isSame(now, "day")).toBe(true);
	});

	it("has exactly the right number of current-month cells", () => {
		// April 2024 has 30 days.
		expect(generateDate(3, 2024).filter((c) => c.isCurrentMonth)).toHaveLength(30);
		// February 2024 (leap) has 29 days.
		expect(generateDate(1, 2024).filter((c) => c.isCurrentMonth)).toHaveLength(29);
	});
});

describe("months", () => {
	it("contains 12 names spelled correctly", () => {
		expect(months).toHaveLength(12);
		// Regression: the old code misspelled "September" as "Septemper".
		expect(months[8]).toBe("September");
		expect(months).not.toContain("Septemper");
	});
});

describe("checkLeapYearGc", () => {
	it("identifies Gregorian leap years", () => {
		expect(checkLeapYearGc(2024)).toBe(true);
		expect(checkLeapYearGc(2000)).toBe(true);
		expect(checkLeapYearGc(2023)).toBe(false);
		expect(checkLeapYearGc(1900)).toBe(false); // divisible by 100, not 400
	});
});
