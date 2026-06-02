import dayjs from "dayjs";
import { toEthiopian, toGregorian } from "ethiopian-date";
import type { DayCell, EthiopianTuple } from "../types";

/** Total number of cells in a 6×7 month grid. */
const GRID_CELLS = 42;

/**
 * Number of days in Pagume (the 13th Ethiopian month) for the given year:
 * 6 in a leap year, otherwise 5. An Ethiopian year is leap when `year % 4 === 3`.
 */
export const checkLeapYear = (year: number): 5 | 6 => {
	return year % 4 === 3 ? 6 : 5;
};

/**
 * Length of an Ethiopian month: 30 days for months 1–12, and 5 or 6 for month
 * 13 (Pagume) depending on the leap year.
 */
export const ethiopianMonthLength = (month: number, year: number): number => {
	return month === 13 ? checkLeapYear(year) : 30;
};

/** Clamp a day to a valid value within the given Ethiopian month/year. */
const clampDay = (year: number, month: number, day: number): number => {
	return Math.min(day, ethiopianMonthLength(month, year));
};

/** Weekday (0=Sunday … 6=Saturday) of the given Ethiopian date. */
const dayOfWeek = (y: number, m: number, d: number): number => {
	const [gy, gm, gd] = toGregorian(y, m, d);
	return dayjs()
		.year(gy)
		.month(gm - 1)
		.date(gd)
		.day();
};

/**
 * Length of the month adjacent to (or equal to) the given month.
 * @param relative `"prev"` for the previous month, `"next"` for the next, `"current"` for this month.
 */
const monthLength = (
	month: number,
	year: number,
	relative: "prev" | "next" | "current",
): number => {
	if (relative === "prev") {
		return month === 1 ? checkLeapYear(year - 1) : 30;
	}
	if (relative === "next") {
		return month === 12 ? checkLeapYear(year) : 30;
	}
	return ethiopianMonthLength(month, year);
};

/** Advance one Ethiopian month, rolling the year at month 13 and clamping the day. */
export const nextMonth = (
	year: number,
	month: number,
	day: number,
): EthiopianTuple => {
	if (month === 13) {
		return [year + 1, 1, clampDay(year + 1, 1, day)];
	}
	return [year, month + 1, clampDay(year, month + 1, day)];
};

/** Advance one Ethiopian year, clamping the day to the target month. */
export const nextYear = (
	year: number,
	month: number,
	day: number,
): EthiopianTuple => {
	return [year + 1, month, clampDay(year + 1, month, day)];
};

/** Go back one Ethiopian month, rolling the year at month 1 and clamping the day. */
export const prevMonth = (
	year: number,
	month: number,
	day: number,
): EthiopianTuple => {
	if (month === 1) {
		return [year - 1, 13, clampDay(year - 1, 13, day)];
	}
	return [year, month - 1, clampDay(year, month - 1, day)];
};

/** Go back one Ethiopian year, clamping the day to the target month. */
export const prevYear = (
	year: number,
	month: number,
	day: number,
): EthiopianTuple => {
	return [year - 1, month, clampDay(year - 1, month, day)];
};

/**
 * Set the year while keeping the month, clamping the day so navigating away
 * from e.g. Pagume 6 into a non-leap year does not yield an invalid date.
 */
export const setEthiopianYear = (
	year: number,
	month: number,
	day: number,
): EthiopianTuple => {
	return [year, month, clampDay(year, month, day)];
};

/**
 * Build the 42-cell month grid for an Ethiopian month. Leading/trailing cells
 * are placeholders (no `date`); current-month cells carry a normalized `Dayjs`
 * date and a `today` flag.
 *
 * @param month 1-based Ethiopian month, defaults to the current Ethiopian month.
 * @param year  Ethiopian year, defaults to the current Ethiopian year.
 */
export const generateEthiopianDate = (
	month: number = toEthiopian(dayjs().year(), dayjs().month() + 1, dayjs().date())[1],
	year: number = toEthiopian(dayjs().year(), dayjs().month() + 1, dayjs().date())[2],
): DayCell[] => {
	const cells: DayCell[] = [];
	const currentLength = monthLength(month, year, "current");
	const prevLength = monthLength(month, year, "prev");
	const nextLength = monthLength(month, year, "next");
	const today = dayjs().startOf("day");

	// Prefix: trailing days of the previous month.
	const leading = dayOfWeek(year, month, 1);
	for (let i = prevLength - leading + 1; i <= prevLength; i++) {
		cells.push({ day: i, isCurrentMonth: false });
	}

	// Current month.
	for (let i = 1; i <= currentLength; i++) {
		const [gy, gm, gd] = toGregorian(year, month, i);
		const date = dayjs()
			.year(gy)
			.month(gm - 1)
			.date(gd)
			.startOf("day");
		cells.push({
			day: i,
			isCurrentMonth: true,
			today: today.isSame(date, "day"),
			date,
		});
	}

	// Suffix: leading days of the next month, filling to a full grid.
	const remaining = GRID_CELLS - cells.length;
	for (let i = 1; i <= remaining; i++) {
		const day = i <= nextLength ? i : i - nextLength;
		cells.push({ day, isCurrentMonth: false });
	}

	return cells;
};

/** Ethiopian month names in Amharic, indexed 0–12. */
export const etMonths: readonly string[] = [
	"መስከረም",
	"ጥቅምት",
	"ኅዳር",
	"ታህሳስ",
	"ጥር",
	"የካቲት",
	"መጋቢት",
	"ሚያዝያ",
	"ግንቦት",
	"ሰኔ",
	"ሐምሌ",
	"ነሐሴ",
	"ጳጉሜ",
];

/**
 * Ethiopian month names in Afaan Oromoo, indexed 0–12. These follow the common
 * Afaan Oromoo labelling of the Ethiopian months by season (Meskerem→Fulbaana,
 * …), with the 13th month (Pagume) rendered as "Qaammee".
 */
export const etMonthsOromiffa: readonly string[] = [
	"Fulbaana",
	"Onkololeessa",
	"Sadaasa",
	"Muddee",
	"Amajjii",
	"Guraandhala",
	"Bitootessa",
	"Elba",
	"Caamsaa",
	"Waxabajjii",
	"Adoolessa",
	"Hagayya",
	"Qaammee",
];

/** Ethiopian month names transliterated into English, indexed 0–12. */
export const etMonthsEnglish: readonly string[] = [
	"Meskerem",
	"Tikimt",
	"Hidar",
	"Tahsas",
	"Tir",
	"Yekatit",
	"Megabit",
	"Miazia",
	"Genbot",
	"Sene",
	"Hamle",
	"Nehase",
	"Pagume",
];

/** The result of {@link convertToEthiopian}. */
export interface EthiopianDate {
	year: number;
	month: number;
	day: number;
	monthName: string;
	monthNameEnglish: string;
}

/**
 * Convert a Gregorian date string to an Ethiopian date.
 *
 * @param dateString A date in `"yyyy/mm/dd"` or `"yyyy-mm-dd"` format.
 * @returns The Ethiopian year/month/day plus localized month names.
 * @throws {Error} If the string is not a valid, in-range Gregorian date.
 *
 * @example
 * convertToEthiopian("2024-09-11"); // { year: 2017, month: 1, day: 1, ... }
 */
export const convertToEthiopian = (dateString: string): EthiopianDate => {
	const invalid = (): never => {
		throw new Error(
			'Invalid date format. Please use "yyyy/mm/dd" or "yyyy-mm-dd"',
		);
	};

	if (typeof dateString !== "string") invalid();

	const parts = dateString.replace(/[-/]/g, "-").split("-");
	if (parts.length !== 3) invalid();

	const [year, month, day] = parts.map(Number) as [number, number, number];

	if (
		!Number.isInteger(year) ||
		!Number.isInteger(month) ||
		!Number.isInteger(day) ||
		year <= 0 ||
		month < 1 ||
		month > 12 ||
		day < 1 ||
		day > 31
	) {
		invalid();
	}

	const [etYear, etMonth, etDay] = toEthiopian(year, month, day);

	return {
		year: etYear,
		month: etMonth,
		day: etDay,
		monthName: etMonths[etMonth - 1] ?? "",
		monthNameEnglish: etMonthsEnglish[etMonth - 1] ?? "",
	};
};
