import { describe, it, expect } from "vitest";
import { parseTime, toMinutes } from "./time";

describe("parseTime", () => {
	it("parses a valid 24-hour string", () => {
		expect(parseTime("13:45")).toEqual({ hour: 13, minute: 45 });
		expect(parseTime("00:00")).toEqual({ hour: 0, minute: 0 });
	});

	it("returns NaN components for empty or malformed input", () => {
		expect(parseTime("")).toEqual({ hour: NaN, minute: NaN });
		expect(parseTime(null)).toEqual({ hour: NaN, minute: NaN });
		expect(parseTime(undefined)).toEqual({ hour: NaN, minute: NaN });
		expect(parseTime("abc")).toEqual({ hour: NaN, minute: NaN });
		expect(parseTime("10")).toEqual({ hour: NaN, minute: NaN });
	});
});

describe("toMinutes", () => {
	it("converts to total minutes since midnight", () => {
		expect(toMinutes({ hour: 1, minute: 30 })).toBe(90);
		expect(toMinutes({ hour: 0, minute: 0 })).toBe(0);
		expect(toMinutes({ hour: 23, minute: 59 })).toBe(1439);
	});
});
