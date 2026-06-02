import { describe, it, expect } from "vitest";
import dayjs from "dayjs";
import { isDateInRange, getRangePosition } from "./dateRange";

const range = {
	startDate: dayjs("2024-08-10").startOf("day"),
	endDate: dayjs("2024-08-20").startOf("day"),
};

describe("isDateInRange", () => {
	// Regression for bug #1: must not rely on the unregistered
	// isSameOrAfter/isSameOrBefore dayjs plugins (which would throw).
	it("does not throw and includes the inclusive boundaries", () => {
		expect(isDateInRange(dayjs("2024-08-10"), range)).toBe(true);
		expect(isDateInRange(dayjs("2024-08-20"), range)).toBe(true);
		expect(isDateInRange(dayjs("2024-08-15"), range)).toBe(true);
	});

	it("excludes dates outside the range", () => {
		expect(isDateInRange(dayjs("2024-08-09"), range)).toBe(false);
		expect(isDateInRange(dayjs("2024-08-21"), range)).toBe(false);
	});

	it("returns false when the range is incomplete or the date is missing", () => {
		expect(isDateInRange(undefined, range)).toBe(false);
		expect(isDateInRange(dayjs("2024-08-15"), { startDate: range.startDate, endDate: null })).toBe(false);
		expect(isDateInRange(dayjs("2024-08-15"), undefined)).toBe(false);
	});

	it("excludes dates disabled by min/max/future constraints", () => {
		expect(
			isDateInRange(dayjs("2024-08-15"), range, {
				minDate: dayjs("2024-08-16"),
			}),
		).toBe(false);
		expect(
			isDateInRange(dayjs("2024-08-15"), range, {
				maxDate: dayjs("2024-08-14"),
			}),
		).toBe(false);
		expect(
			isDateInRange(dayjs("2024-08-15"), range, {
				disableFuture: true,
				isFutureDate: () => true,
			}),
		).toBe(false);
	});
});

describe("getRangePosition", () => {
	it("identifies the start and end boundaries", () => {
		expect(getRangePosition(dayjs("2024-08-10"), range, true)).toBe("start");
		expect(getRangePosition(dayjs("2024-08-20"), range, true)).toBe("end");
	});

	it("returns null for interior dates and when disabled", () => {
		expect(getRangePosition(dayjs("2024-08-15"), range, true)).toBeNull();
		expect(getRangePosition(dayjs("2024-08-10"), range, false)).toBeNull();
		expect(getRangePosition(undefined, range, true)).toBeNull();
	});
});
