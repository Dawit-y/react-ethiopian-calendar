import { useEffect, useState } from "react";
import TimeInput from "./TimeInput";
import { parseTime, toMinutes } from "../../utils/time";
import "../../style/index.css";

/** Props for {@link EtTimePicker}. */
export interface EtTimePickerProps {
	/** Current value as a 24-hour `"HH:mm"` string. Defaults to `"10:00"`. */
	value?: string;
	/** Called with the selected 24-hour `"HH:mm"` string. */
	onChange?: (time: string) => void;
	/** Minimum selectable time as a 24-hour `"HH:mm"` string. */
	minTime?: string;
	/** Maximum selectable time as a 24-hour `"HH:mm"` string. */
	maxTime?: string;
	/** `true` for Ethiopian time, `false` for Gregorian (standard) time. */
	calendarType?: boolean;
	/** Disable all interaction. */
	disabled?: boolean;
	/** Render in an error state. */
	error?: boolean;
}

/**
 * A 12-hour stepper time picker that understands Ethiopian time (where the day
 * starts at 6 AM). Values are exchanged with the parent as 24-hour `"HH:mm"`
 * strings.
 */
export const EtTimePicker = ({
	value = "10:00",
	onChange,
	minTime,
	maxTime,
	calendarType = true,
	disabled = false,
	error = false,
}: EtTimePickerProps) => {
	/** Returns the value if it satisfies the min/max bounds, otherwise `null`. */
	const getProperTimeBasedOnLimit = (time: string | undefined): string | null => {
		if (!time) return null;
		const current = toMinutes(parseTime(time));
		if (Number.isNaN(current)) return null;
		if (minTime && current < toMinutes(parseTime(minTime))) return null;
		if (maxTime && current > toMinutes(parseTime(maxTime))) return null;
		return time;
	};

	const [valueInt, setValueInt] = useState<string | null>(() =>
		getProperTimeBasedOnLimit(value),
	);

	useEffect(() => {
		setValueInt(getProperTimeBasedOnLimit(value));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [minTime, maxTime, value]);

	const onTimeChange = (time: { hour: number; minute: number } | null) => {
		if (!time) return;
		const h = time.hour.toString().padStart(2, "0");
		const m = time.minute.toString().padStart(2, "0");
		onChange?.(`${h}:${m}`);
	};

	return (
		<div>
			<TimeInput
				onTimeChange={onTimeChange}
				calendarType={calendarType}
				min={minTime}
				max={maxTime}
				value={valueInt}
				disabled={disabled}
				error={error}
			/>
		</div>
	);
};
