import "./style/index.css";

export * from "./components/Calendar";
export * from "./components/TimePicker";
export { convertToEthiopian } from "./utils/EthiopianCalendar";

// Public type exports for consumers.
export type { EtCalendarProps, EtCalendarValue } from "./components/Calendar";
export type { EtTimePickerProps } from "./components/TimePicker";
export type { EthiopianDate } from "./utils/EthiopianCalendar";
export type {
	DateRangeValue,
	SingleDateInput,
	SingleDateValue,
	Language,
	PickerSize,
	EthiopianTuple,
} from "./types";
