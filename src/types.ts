import type { MouseEvent as ReactMouseEvent } from "react";
import type { Dayjs } from "dayjs";

/** Supported UI languages: Amharic (`"am"`), English (`"en"`), or Afaan Oromoo (`"or"`). */
export type Language = "am" | "en" | "or";

/**
 * Size of the picker's input field, controlling its height (not the calendar
 * grid): `"sm"` (compact), `"md"` (default), or `"lg"` (large).
 */
export type PickerSize = "sm" | "md" | "lg";

/**
 * A `[year, month, day]` tuple as produced/consumed by the `ethiopian-date`
 * package. Month is 1-based (1–13, where 13 is Pagume).
 */
export type EthiopianTuple = [year: number, month: number, day: number];

/**
 * A selected date range. Both endpoints are normalized to the start of the day
 * (`dayjs().startOf("day")`) or `null` when unset.
 */
export interface DateRangeValue {
	startDate: Dayjs | null;
	endDate: Dayjs | null;
}

/**
 * Any value accepted for a single selected date. Accepts native `Date`, a
 * `Dayjs` instance, an ISO-ish string, or a millisecond timestamp. `null`/
 * `undefined` clear the selection.
 */
export type SingleDateInput = Date | Dayjs | string | number | null | undefined;

/** A single normalized calendar value, or `null` when nothing is selected. */
export type SingleDateValue = Dayjs | null;

/** Props shared by both the Ethiopian and Gregorian month-grid pickers. */
export interface CalendarPickerBaseProps {
	minDateIn: Dayjs | null;
	maxDateIn: Dayjs | null;
	selectedDate: SingleDateValue;
	selectedDateRange: DateRangeValue;
	handleDateChange: (date: Dayjs) => void;
	disabled: boolean;
	disableFuture: boolean;
	lang: Language;
	days: readonly string[];
	isFutureDate: (date: Dayjs) => boolean;
	dateRange: boolean;
	/** Toggle between the Ethiopian and Gregorian calendar systems. */
	toggleCalendarType: (event: ReactMouseEvent) => void;
	/** Whether to render the calendar-system swap button. */
	allowCalendarSwap: boolean;
}

/** A cell in a rendered month grid (used by both calendar systems). */
export interface DayCell {
	/** The day-of-month number to display (1-based), or `""` for placeholder cells. */
	day: number | "";
	/** Whether this cell belongs to the month currently in view. */
	isCurrentMonth: boolean;
	/** Whether this cell represents the current local day. */
	today?: boolean;
	/** The normalized `Dayjs` date this cell represents, when known. */
	date?: Dayjs;
}
