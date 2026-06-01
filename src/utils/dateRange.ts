import dayjs, { type Dayjs } from "dayjs";
import type { DateRangeValue } from "../types";

/** Options controlling whether a date is considered selectable within a range. */
export interface RangeConstraints {
	minDate?: Dayjs | null;
	maxDate?: Dayjs | null;
	disableFuture?: boolean;
	isFutureDate?: (date: Dayjs) => boolean;
}

/**
 * Whether `date` falls within the (inclusive) selected range.
 *
 * Uses `isSame`/`isAfter`/`isBefore` only — deliberately avoiding the
 * `isSameOrAfter`/`isSameOrBefore` dayjs plugins, which are not registered by
 * this package and would throw at runtime.
 */
export const isDateInRange = (
	date: Dayjs | undefined,
	range: DateRangeValue | undefined,
	{ minDate, maxDate, disableFuture, isFutureDate }: RangeConstraints = {},
): boolean => {
	if (!date || !range?.startDate || !range?.endDate) return false;

	const dateObj = dayjs(date).startOf("day");
	const startDate = dayjs(range.startDate).startOf("day");
	const endDate = dayjs(range.endDate).startOf("day");

	if (!dateObj.isValid() || !startDate.isValid() || !endDate.isValid()) {
		return false;
	}

	// A disabled date is never shown as part of the range.
	if (disableFuture && isFutureDate?.(dateObj)) return false;
	if (minDate && dateObj.isBefore(dayjs(minDate).startOf("day"))) return false;
	if (maxDate && dateObj.isAfter(dayjs(maxDate).startOf("day"))) return false;

	const afterStart =
		dateObj.isSame(startDate, "day") || dateObj.isAfter(startDate, "day");
	const beforeEnd =
		dateObj.isSame(endDate, "day") || dateObj.isBefore(endDate, "day");

	return afterStart && beforeEnd;
};

/**
 * Whether `date` is the `"start"` or `"end"` boundary of the selected range,
 * or `null` when it is neither (or when range selection is inactive).
 */
export const getRangePosition = (
	date: Dayjs | undefined,
	range: DateRangeValue | undefined,
	enabled: boolean,
): "start" | "end" | null => {
	if (!enabled || !date || !range?.startDate || !range?.endDate) return null;

	const dateObj = dayjs(date);
	const startDate = dayjs(range.startDate);
	const endDate = dayjs(range.endDate);

	if (!dateObj.isValid() || !startDate.isValid() || !endDate.isValid()) {
		return null;
	}

	if (dateObj.isSame(startDate, "day")) return "start";
	if (dateObj.isSame(endDate, "day")) return "end";
	return null;
};
