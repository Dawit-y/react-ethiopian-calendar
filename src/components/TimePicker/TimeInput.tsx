import { useState, useEffect, useRef } from "react";
import { MdSunny } from "react-icons/md";
import { FaMoon } from "react-icons/fa6";
import { BsSunriseFill } from "react-icons/bs";
import { RiMoonClearFill } from "react-icons/ri";
import { parseTime, type ParsedTime } from "../../utils/time";

/** Meridiem indicator. */
export type Period = "AM" | "PM";

/** The 12-hour representation kept in component state. */
interface DisplayTime {
	hour: number | "";
	minute: number | "";
	period: Period;
}

/** Props for {@link TimeInput}. */
export interface TimeInputProps {
	/** `true` for Ethiopian time, `false` for Gregorian (standard) time. */
	calendarType: boolean;
	/** Called with the normalized 24-hour time, or `null` when cleared. */
	onTimeChange: (time: ParsedTime | null) => void;
	/** Minimum selectable time as a 24-hour `"HH:mm"` string. */
	min?: string | undefined;
	/** Maximum selectable time as a 24-hour `"HH:mm"` string. */
	max?: string | undefined;
	/** Current value as a 24-hour `"HH:mm"` string, or `null`. */
	value: string | null;
	/** Disable all interaction. */
	disabled?: boolean;
	/** Render in an error state. */
	error?: boolean;
}

const TimeInput = ({
	calendarType,
	onTimeChange,
	min,
	max,
	value,
	disabled,
	error,
}: TimeInputProps) => {
	const get12HourFormat = (input: string | null): DisplayTime => {
		const { hour, minute } = parseTime(input);
		if (isNaN(hour) || isNaN(minute)) {
			return { hour: "", minute: "", period: "AM" };
		}
		if (calendarType) {
			if (hour >= 0 && hour <= 6) {
				return { hour: 6 + hour, minute, period: "PM" }; // ethiopian midnight to 12
			}
			if (hour > 6 && hour <= 18) {
				return { hour: hour - 6, minute, period: "AM" }; // ethiopian 6am to noon
			}
			if (hour > 18 && hour <= 24) {
				return { hour: hour - 18, minute, period: "PM" }; // ethiopian noon to midnight
			}
		} else {
			if (hour >= 0 && hour < 12) {
				return { hour, minute, period: "AM" }; // gregorian midnight to noon
			}
			if (hour >= 12 && hour < 24) {
				return { hour: hour - 12, minute, period: "PM" }; // gregorian noon to midnight
			}
			if (hour === 24) {
				return { hour: 12, minute, period: "AM" }; // gregorian midnight
			}
		}
		// Fallback for out-of-range hours so callers never destructure undefined.
		return { hour: "", minute: "", period: "AM" };
	};

	const initial = get12HourFormat(value);
	const [hours, setHours] = useState<number | "">(initial.hour);
	const [minutes, setMinutes] = useState<number | "">(initial.minute);
	const [period, setPeriod] = useState<Period>(initial.period);
	const minuteInputRef = useRef<HTMLInputElement>(null);
	const initialRender = useRef(true);

	const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
		e.target.select();
	};

	useEffect(() => {
		if (typeof hours === "number" && hours >= 2 && minuteInputRef.current) {
			minuteInputRef.current.focus();
		}
	}, [hours]);

	const isTimeWithinRange = (
		hour: number,
		minute: number,
		periodArg: Period,
	): boolean => {
		let adjustedHour = hour;
		if (calendarType) {
			adjustedHour = periodArg === "AM" ? (hour % 12) + 6 : (hour % 12) + 18;
		} else {
			if (periodArg === "PM" && hour !== 12) adjustedHour += 12;
			if (periodArg === "AM" && hour === 12) adjustedHour = 0;
		}

		if (min) {
			const { hour: minHour, minute: minMinute } = parseTime(min);
			if (adjustedHour * 60 + minute < minHour * 60 + minMinute) return false;
		}
		if (max) {
			const { hour: maxHour, minute: maxMinute } = parseTime(max);
			if (adjustedHour * 60 + minute > maxHour * 60 + maxMinute) return false;
		}
		return true;
	};

	const handleHourChange = (increment: number) => {
		if (disabled) return;
		setHours((prevHours) => {
			if (prevHours === "") {
				let newHours = increment > 0 ? 1 : 12;
				if (increment > 0 && min) {
					const { hour: minHour, minute: minMinute } = parseTime(min);
					if (isTimeWithinRange(minHour, minMinute, period)) {
						newHours = calendarType ? (minHour - 6) % 12 || 12 : minHour % 12 || 12;
						setPeriod(minHour >= 12 ? "PM" : "AM");
						setMinutes(minMinute);
					}
				} else if (increment < 0 && max) {
					const { hour: maxHour, minute: maxMinute } = parseTime(max);
					if (isTimeWithinRange(maxHour, maxMinute, period)) {
						newHours = calendarType ? (maxHour - 18) % 12 || 12 : maxHour % 12 || 12;
						setPeriod(maxHour >= 12 ? "PM" : "AM");
						setMinutes(maxMinute);
					}
				}
				return newHours;
			}

			let newHours = prevHours + increment;
			if (newHours > 12) newHours = 1;
			else if (newHours < 1) newHours = 12;

			const currentMinutes = minutes === "" ? 0 : minutes;
			if (isTimeWithinRange(newHours, currentMinutes, period)) {
				return newHours;
			}
			return prevHours;
		});
	};

	const handleMinuteChange = (increment: number) => {
		if (disabled) return;
		setMinutes((prevMinutes) => {
			const base = prevMinutes === "" ? 0 : prevMinutes;
			let newMinutes = base + increment;
			let newHours = hours === "" ? 0 : hours;

			if (newMinutes >= 60) {
				newMinutes = 0;
				newHours = (newHours % 12) + 1;
			} else if (newMinutes < 0) {
				newMinutes = 59;
				newHours = newHours - 1 < 1 ? 12 : newHours - 1;
			}

			if (isTimeWithinRange(newHours, newMinutes, period)) {
				setMinutes(newMinutes);
				setHours(newHours);
				return newMinutes;
			}
			return prevMinutes;
		});
	};

	const handleHourInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (disabled) return;
		const raw = e.target.value.replace(/^0+/, ""); // Remove leading zeros
		if (raw === "" || (Number(raw) >= 1 && Number(raw) <= 12)) {
			const newHours = Number(raw);
			const currentMinutes = minutes === "" ? 0 : minutes;
			if (raw === "" || isTimeWithinRange(newHours, currentMinutes, period)) {
				setHours(raw === "" ? "" : newHours);
			}
		}
	};

	const handleMinuteInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (disabled) return;
		const raw = e.target.value === "0" ? "0" : e.target.value.replace(/^0+/, "");
		if (raw === "" || (Number(raw) >= 0 && Number(raw) < 60)) {
			const newMinutes = Number(raw);
			const currentHours = hours === "" ? 0 : hours;
			if (raw === "" || isTimeWithinRange(currentHours, newMinutes, period)) {
				setMinutes(raw === "" ? "" : newMinutes);
			}
		}
	};

	const togglePeriod = () => {
		if (disabled) return;
		const newPeriod: Period = period === "AM" ? "PM" : "AM";
		const currentHours = hours === "" ? 0 : hours;
		const currentMinutes = minutes === "" ? 0 : minutes;
		if (isTimeWithinRange(currentHours, currentMinutes, newPeriod)) {
			setPeriod(newPeriod);
		}
	};

	const get24HourFormat = (): ParsedTime | null => {
		if (hours === "" || minutes === "") return null;
		let hour = hours;
		if (calendarType) {
			hour = period === "AM" ? (hour % 12) + 6 : (hour % 12) + 18;
		} else {
			if (period === "PM" && hour !== 12) hour += 12;
			if (period === "AM" && hour === 12) hour = 0;
		}
		return { hour: hour % 24, minute: minutes };
	};

	useEffect(() => {
		onTimeChange(get24HourFormat());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hours, minutes, period]);

	const adjustTimeForCalendarType = () => {
		let hour = hours === "" ? 0 : hours;
		let newPeriod = period;
		if (!calendarType && hour !== 0) {
			// Adjust to Ethiopian time
			if (hour > 6 && hour < 12 && period === "AM") {
				hour = (hour % 12) - 6;
				newPeriod = "PM";
			} else if (hour > 6 && hour < 12 && period === "PM") {
				hour = (hour % 12) - 6;
				newPeriod = "AM";
			} else if (hour >= 1 && hour < 6 && period === "AM") {
				hour = (hour % 12) + 6;
				newPeriod = "AM";
			} else if (hour >= 1 && hour < 6 && period === "PM") {
				hour = (hour % 12) + 6;
				newPeriod = "PM";
			} else if (hour === 12 && period === "AM") {
				hour = 6;
				newPeriod = "AM";
			} else if (hour === 12 && period === "PM") {
				hour = 6;
				newPeriod = "PM";
			} else if (hour === 6 && period === "AM") {
				hour = 12;
				newPeriod = "PM";
			} else if (hour === 6 && period === "PM") {
				hour = 12;
				newPeriod = "AM";
			}
		} else if (calendarType && hour !== 0) {
			// Adjust to Gregorian time
			if (hour > 6 && hour < 12 && period === "AM") {
				newPeriod = "AM";
				hour = hour - 6;
			} else if (hour >= 1 && hour < 6 && period === "PM") {
				newPeriod = "AM";
				hour = hour + 6;
			} else if (hour >= 1 && hour < 6 && period === "AM") {
				newPeriod = "PM";
				hour = hour + 6;
			} else if (hour > 6 && hour < 12 && period === "PM") {
				newPeriod = "PM";
				hour = hour - 6;
			} else if (hour === 6 && period === "AM") {
				newPeriod = "AM";
				hour = 12;
			} else if (hour === 6 && period === "PM") {
				newPeriod = "PM";
				hour = 12;
			} else if (hour === 12 && period === "AM") {
				newPeriod = "PM";
				hour = 6;
			} else if (hour === 12 && period === "PM") {
				newPeriod = "AM";
				hour = 6;
			}
			if (hour <= 0) hour += 12;
		}

		if (hours !== "") setHours(hour);
		setPeriod(newPeriod);
	};

	useEffect(() => {
		const next = get12HourFormat(value);
		setHours(next.hour);
		setMinutes(next.minute);
		setPeriod(next.period);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value]);

	useEffect(() => {
		if (initialRender.current) {
			initialRender.current = false;
		} else {
			adjustTimeForCalendarType();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [calendarType]);

	const getTextColor = (): string => {
		if (disabled) return "#CCCCCC";
		if (error) return "#ED4337";
		return "#555";
	};

	return (
		<div
			style={{
				display: "flex",
				borderRadius: "15px",
				alignItems: "center",
				justifyContent: "space-between",
				border: `1px solid ${error ? "#ED4337" : "#ccc"}`,
				width: "fit-content",
				paddingLeft: "0.5rem",
				paddingRight: "0.5rem",
				paddingTop: "0.1rem",
				paddingBottom: "0.1rem",
			}}
		>
			<div style={{ display: "flex", alignItems: "center", justifyItems: "center" }}>
				<div style={{ display: "flex", flexDirection: "column" }}>
					<button
						type="button"
						style={{
							padding: "4px",
							backgroundColor: "white",
							fontSize: "15px",
							color: disabled ? "#CCCCCC" : "#555",
							border: "none",
							cursor: "pointer",
						}}
						onClick={() => handleHourChange(1)}
					>
						+
					</button>
					<input
						type="text"
						className="no-focus-border"
						value={hours ? hours.toString().padStart(2, "0") : ""}
						onFocus={handleInputFocus}
						placeholder="--"
						onChange={handleHourInputChange}
						style={{
							width: "2rem",
							textAlign: "center",
							border: "none",
							color: getTextColor(),
							fontSize: "20px",
							appearance: "none",
							MozAppearance: "textfield",
						}}
					/>
					<button
						type="button"
						style={{
							padding: "4px",
							backgroundColor: "white",
							fontSize: "20px",
							border: "none",
							cursor: "pointer",
							color: disabled ? "#CCCCCC" : "#555",
						}}
						onClick={() => handleHourChange(-1)}
					>
						-
					</button>
				</div>
				<span style={{ marginBottom: "0.4rem" }}>:</span>
				<div style={{ display: "flex", flexDirection: "column" }}>
					<button
						type="button"
						style={{
							padding: "4px",
							backgroundColor: "white",
							fontSize: "15px",
							border: "none",
							cursor: "pointer",
							color: disabled ? "#CCCCCC" : "#555",
						}}
						onClick={() => handleMinuteChange(1)}
					>
						+
					</button>
					<input
						ref={minuteInputRef}
						type="text"
						className="no-focus-border"
						value={
							minutes === 0 || minutes ? minutes.toString().padStart(2, "0") : ""
						}
						placeholder="--"
						onFocus={handleInputFocus}
						onChange={handleMinuteInputChange}
						style={{
							width: "2rem",
							textAlign: "center",
							border: "none",
							fontSize: "20px",
							color: getTextColor(),
							appearance: "none",
							MozAppearance: "textfield",
						}}
					/>
					<button
						type="button"
						style={{
							padding: "4px",
							backgroundColor: "white",
							fontSize: "20px",
							border: "none",
							cursor: "pointer",
							color: disabled ? "#CCCCCC" : "#555",
						}}
						onClick={() => handleMinuteChange(-1)}
					>
						-
					</button>
				</div>
			</div>
			<div>
				<button
					type="button"
					style={{
						padding: "4px",
						backgroundColor: "white",
						fontSize: calendarType ? "30px" : "25px",
						marginLeft: "5px",
						border: "none",
						cursor: "pointer",
						color: disabled ? "#888888" : "#555",
					}}
					onClick={togglePeriod}
				>
					{calendarType ? (
						period === "AM" ? (
							hours === 12 ? (
								<BsSunriseFill style={{ color: disabled ? "#CCCCCC" : "#fdb813" }} />
							) : (
								<MdSunny style={{ color: disabled ? "#CCCCCC" : "#fdb813" }} />
							)
						) : hours === 12 ? (
							<RiMoonClearFill style={{ color: disabled ? "#CCCCCC" : "#1b2f52" }} />
						) : (
							<FaMoon style={{ color: disabled ? "#CCCCCC" : "#1b2f52" }} />
						)
					) : (
						<>{period === "AM" ? "AM" : "PM"}</>
					)}
				</button>
			</div>
		</div>
	);
};

export default TimeInput;
