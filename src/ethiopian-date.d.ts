/**
 * Ambient type declarations for the untyped `ethiopian-date` package (v0.0.6).
 *
 * The package converts between the Ethiopian and Gregorian calendars. Each
 * function accepts EITHER a single `[year, month, day]` tuple OR three separate
 * numeric arguments, and returns a `[year, month, day]` tuple.
 *
 * NOTE: both functions THROW (an `Exception` with a `message`/`name`) when any
 * input is `0`, `null`, `undefined`, or when the argument count is not exactly 3,
 * and `toEthiopian` additionally throws for Gregorian dates 5–14 May 1582.
 * Callers must guard against zero/invalid components.
 */
declare module "ethiopian-date" {
	/** A `[year, month, day]` calendar tuple. */
	export type DateTuple = [year: number, month: number, day: number];

	/**
	 * Convert an Ethiopian date to a Gregorian date.
	 * @throws if any component is `0`/`null`/`undefined` or the arity is wrong.
	 */
	export function toGregorian(date: DateTuple): DateTuple;
	export function toGregorian(year: number, month: number, day: number): DateTuple;

	/**
	 * Convert a Gregorian date to an Ethiopian date.
	 * @throws if any component is `0`/`null`/`undefined`, the arity is wrong, or
	 *         the date falls in the invalid 5–14 May 1582 range.
	 */
	export function toEthiopian(date: DateTuple): DateTuple;
	export function toEthiopian(year: number, month: number, day: number): DateTuple;
}
