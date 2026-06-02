/** A parsed time. Components are `NaN` when the source string is invalid. */
export interface ParsedTime {
	hour: number;
	minute: number;
}

/**
 * Parse an `"HH:mm"` (24-hour) string into numeric components.
 * Returns `{ hour: NaN, minute: NaN }` for empty or malformed input.
 */
export const parseTime = (time: string | null | undefined): ParsedTime => {
	if (!time) return { hour: NaN, minute: NaN };
	const [hour, minute] = time.split(":").map(Number);
	if (
		hour === undefined ||
		minute === undefined ||
		Number.isNaN(hour) ||
		Number.isNaN(minute)
	) {
		return { hour: NaN, minute: NaN };
	}
	return { hour, minute };
};

/** Total minutes since midnight for a parsed time. */
export const toMinutes = ({ hour, minute }: ParsedTime): number =>
	hour * 60 + minute;
