import { describe, it, expect } from "vitest";
import * as pkg from "./index";

describe("package public exports", () => {
	it("exports the documented runtime members", () => {
		expect(typeof pkg.EtCalendar).toBe("object"); // forwardRef component
		expect(typeof pkg.EtTimePicker).toBe("function");
		expect(typeof pkg.convertToEthiopian).toBe("function");
	});

	it("does not leak removed/internal helpers", () => {
		expect("etLabel" in pkg).toBe(false);
		expect("generateDate" in pkg).toBe(false);
		expect("CustomDatePicker" in pkg).toBe(false);
	});

	it("convertToEthiopian works through the public entry", () => {
		expect(pkg.convertToEthiopian("2024-09-11")).toMatchObject({
			year: 2017,
			month: 1,
			day: 1,
		});
	});
});
