import { describe, it, expect } from "vitest";
import {
	checkLeapYear,
	ethiopianMonthLength,
	nextMonth,
	nextYear,
	prevMonth,
	prevYear,
	setEthiopianYear,
	generateEthiopianDate,
	convertToEthiopian,
	etMonths,
	etMonthsEnglish,
} from "./EthiopianCalendar";

describe("checkLeapYear", () => {
	it("returns 6 for Ethiopian leap years (year % 4 === 3)", () => {
		expect(checkLeapYear(2015)).toBe(6); // 2015 % 4 === 3
		expect(checkLeapYear(2011)).toBe(6);
		expect(checkLeapYear(2003)).toBe(6);
	});

	it("returns 5 for non-leap years", () => {
		expect(checkLeapYear(2016)).toBe(5);
		expect(checkLeapYear(2017)).toBe(5);
		expect(checkLeapYear(2014)).toBe(5);
	});
});

describe("ethiopianMonthLength", () => {
	it("returns 30 for months 1–12", () => {
		for (let m = 1; m <= 12; m++) {
			expect(ethiopianMonthLength(m, 2017)).toBe(30);
		}
	});

	it("returns the Pagume length for month 13", () => {
		expect(ethiopianMonthLength(13, 2015)).toBe(6); // leap
		expect(ethiopianMonthLength(13, 2017)).toBe(5); // non-leap
	});
});

describe("month navigation helpers", () => {
	it("nextMonth advances within a year", () => {
		expect(nextMonth(2017, 5, 10)).toEqual([2017, 6, 10]);
	});

	it("nextMonth rolls from month 13 into the next year", () => {
		expect(nextMonth(2017, 13, 3)).toEqual([2018, 1, 3]);
	});

	it("prevMonth goes back within a year", () => {
		expect(prevMonth(2017, 6, 10)).toEqual([2017, 5, 10]);
	});

	it("prevMonth rolls from month 1 into month 13 of the previous year", () => {
		// 2016 is non-leap (2016 % 4 = 0) so Pagume has 5 days; day clamps from 30.
		expect(prevMonth(2017, 1, 30)).toEqual([2016, 13, 5]);
	});

	// Regression for bug #5: navigation must clamp the day to the target month.
	it("nextMonth clamps day 30 when entering Pagume (non-leap)", () => {
		expect(nextMonth(2017, 12, 30)).toEqual([2017, 13, 5]);
	});

	it("nextYear/prevYear clamp Pagume 6 when landing on a non-leap year", () => {
		// From Pagume 6 of leap year 2015 to non-leap 2016 -> clamp to 5.
		expect(nextYear(2015, 13, 6)).toEqual([2016, 13, 5]);
		expect(prevYear(2015, 13, 6)).toEqual([2014, 13, 5]);
	});

	it("nextYear/prevYear keep Pagume 6 when landing on another leap year", () => {
		// 2011 and 2019 are both leap (% 4 === 3).
		expect(setEthiopianYear(2011, 13, 6)).toEqual([2011, 13, 6]);
	});

	it("setEthiopianYear clamps the day to the target month/year", () => {
		expect(setEthiopianYear(2016, 13, 6)).toEqual([2016, 13, 5]);
		expect(setEthiopianYear(2017, 5, 10)).toEqual([2017, 5, 10]);
	});
});

describe("generateEthiopianDate", () => {
	it("always returns a full 42-cell grid", () => {
		expect(generateEthiopianDate(1, 2017)).toHaveLength(42);
		expect(generateEthiopianDate(13, 2015)).toHaveLength(42);
	});

	it("marks current-month cells and attaches a date to them", () => {
		const cells = generateEthiopianDate(1, 2017);
		const current = cells.filter((c) => c.isCurrentMonth);
		expect(current).toHaveLength(30); // Meskerem has 30 days
		expect(current.every((c) => c.date !== undefined)).toBe(true);
		expect(current.map((c) => c.day)).toEqual(
			Array.from({ length: 30 }, (_, i) => i + 1),
		);
	});

	it("renders Pagume with the correct number of current-month cells", () => {
		expect(
			generateEthiopianDate(13, 2015).filter((c) => c.isCurrentMonth),
		).toHaveLength(6);
		expect(
			generateEthiopianDate(13, 2017).filter((c) => c.isCurrentMonth),
		).toHaveLength(5);
	});
});

describe("convertToEthiopian", () => {
	it("converts a valid Gregorian date (new-year anchor)", () => {
		expect(convertToEthiopian("2024-09-11")).toEqual({
			year: 2017,
			month: 1,
			day: 1,
			monthName: etMonths[0],
			monthNameEnglish: etMonthsEnglish[0],
		});
	});

	it("accepts both slash and dash separators", () => {
		expect(convertToEthiopian("2024/09/11")).toEqual(
			convertToEthiopian("2024-09-11"),
		);
	});

	// Regression for bug #7: out-of-range and malformed inputs must throw.
	it("throws on an out-of-range month", () => {
		expect(() => convertToEthiopian("2024-13-40")).toThrow(/Invalid date/);
	});

	it("throws on too many components", () => {
		expect(() => convertToEthiopian("2024-1-1-1")).toThrow(/Invalid date/);
	});

	it("throws on non-numeric or empty input", () => {
		expect(() => convertToEthiopian("not-a-date")).toThrow(/Invalid date/);
		expect(() => convertToEthiopian("")).toThrow(/Invalid date/);
	});

	it("throws on a zero component", () => {
		expect(() => convertToEthiopian("2024-00-11")).toThrow(/Invalid date/);
	});
});
