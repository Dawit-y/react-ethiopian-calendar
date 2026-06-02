import dayjs from "dayjs";
import type { DayCell } from "../types";

/** Total number of cells in a 6×7 month grid. */
const GRID_CELLS = 42;

/**
 * Build the 42-cell month grid for the Gregorian calendar.
 *
 * The grid always contains 6 weeks (42 cells): leading cells are the trailing
 * days of the previous month, then the days of the current month, then the
 * leading days of the next month. Every cell carries a concrete `date` so the
 * UI can render and (for current-month cells) select it.
 *
 * @param month 0-based month (matches `dayjs().month()`), defaults to the current month.
 * @param year  full year, defaults to the current year.
 */
export const generateDate = (
	month: number = dayjs().month(),
	year: number = dayjs().year(),
): DayCell[] => {
	const firstDateOfMonth = dayjs().year(year).month(month).startOf("month");
	const lastDateOfMonth = dayjs().year(year).month(month).endOf("month");
	const today = dayjs().startOf("day");
	const cells: DayCell[] = [];

	// Prefix: trailing days of the previous month so the 1st lands on the
	// correct weekday. `day()` is the 0-based weekday of the 1st.
	const leadingDays = firstDateOfMonth.day();
	for (let i = leadingDays; i > 0; i--) {
		const date = firstDateOfMonth.subtract(i, "day");
		cells.push({ day: date.date(), date, isCurrentMonth: false });
	}

	// Current month.
	for (let d = 1; d <= lastDateOfMonth.date(); d++) {
		const date = firstDateOfMonth.date(d);
		cells.push({
			day: d,
			date,
			isCurrentMonth: true,
			today: today.isSame(date, "day"),
		});
	}

	// Suffix: leading days of the next month to fill the grid.
	const remaining = GRID_CELLS - cells.length;
	for (let i = 1; i <= remaining; i++) {
		const date = lastDateOfMonth.add(i, "day").startOf("day");
		cells.push({ day: date.date(), date, isCurrentMonth: false });
	}

	return cells;
};

/** Gregorian month names, indexed 0–11. */
export const months: readonly string[] = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

/** Whether a Gregorian year is a leap year. */
export const checkLeapYearGc = (year: number): boolean => {
	return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};
