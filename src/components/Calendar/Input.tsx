import { forwardRef, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { toGregorian, toEthiopian } from "ethiopian-date";
import { FiCalendar, FiX } from "react-icons/fi";
import { checkLeapYear } from "../../utils/EthiopianCalendar";
import { checkLeapYearGc } from "../../utils/calendar";
import cn from "../../utils/cn";
import type { DateRangeValue, PickerSize } from "../../types";

/** The three editable date segments, held as raw strings while typing. */
export interface DateSegments {
	day: string;
	month: string;
	year: string;
}

/** Props for {@link Input}. */
export interface InputProps {
	/** Toggle the calendar popup open/closed. */
	handleInputClick: (event: React.MouseEvent) => void;
	/** The currently displayed segments, derived from the selected date. */
	date: DateSegments;
	/** Commit a fully-entered date to the parent. */
	handleDateChange: (date: dayjs.Dayjs) => void;
	/** `true` when the Ethiopian calendar is active, `false` for Gregorian. */
	calendarTypeInt: boolean;
	style?: React.CSSProperties | undefined;
	disabled?: boolean | undefined;
	onBlur?: ((event: React.FocusEvent<HTMLDivElement>) => void) | undefined;
	placeholder?: boolean | string | undefined;
	dateRange?: boolean | undefined;
	selectedDateRange?: DateRangeValue | undefined;
	/** Show a clear (×) button when there is a value. */
	allowClear?: boolean | undefined;
	/** Called when the clear button is pressed. */
	onClear?: ((event: React.MouseEvent) => void) | undefined;
	/** Input field size, controlling its height. Defaults to `"md"`. */
	size?: PickerSize | undefined;
}

/** Maps a {@link PickerSize} to its container modifier class. */
const SIZE_CLASS: Record<PickerSize, string> = {
	sm: "datePickerContainerEt--sm",
	md: "datePickerContainerEt--md",
	lg: "datePickerContainerEt--lg",
};

/** Font size used for the range-mode summary text, per {@link PickerSize}. */
const SIZE_RANGE_FONT: Record<PickerSize, string> = {
	sm: "13px",
	md: "14px",
	lg: "16px",
};

const padStart2 = (value: string): string => value.padStart(2, "0");

const Input = forwardRef<HTMLDivElement, InputProps>(
	(
		{
			handleInputClick,
			date,
			handleDateChange,
			calendarTypeInt,
			style,
			disabled = false,
			onBlur,
			placeholder,
			dateRange = false,
			selectedDateRange = { startDate: null, endDate: null },
			allowClear = true,
			onClear,
			size = "md",
		},
		ref,
	) => {
		const monthInputRef = useRef<HTMLInputElement>(null);
		const dayInputRef = useRef<HTMLInputElement>(null);
		const yearInputRef = useRef<HTMLInputElement>(null);

		// Local, editable copy of the segments. Synced from `date` whenever the
		// parent's selection changes, but owned locally while the user types so
		// keystrokes are never lost to a no-op setter or a stale closure.
		const [segments, setSegments] = useState<DateSegments>(date);

		useEffect(() => {
			setSegments((prev) => {
				const sameValue =
					Number(prev.day) === Number(date.day) &&
					Number(prev.month) === Number(date.month) &&
					Number(prev.year) === Number(date.year);
				return sameValue ? prev : date;
			});
		}, [date]);

		const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
			e.target.select();
		};
		const handleInputMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
			e.preventDefault();
			e.currentTarget.focus();
			e.currentTarget.select();
		};

		/** Convert complete segments to a Gregorian `Dayjs` and lift to the parent. */
		const properDateConverter = (year: number, month: number, day: number) => {
			try {
				if (!calendarTypeInt) {
					handleDateChange(
						dayjs().year(year).month(month - 1).date(day).startOf("day"),
					);
				} else {
					const [gy, gm, gd] = toGregorian(year, month, day);
					handleDateChange(
						dayjs().year(gy).month(gm - 1).date(gd).startOf("day"),
					);
				}
			} catch {
				// Ignore incomplete/invalid combinations; the user is still typing.
			}
		};

		const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
			const { name, value } = e.target;
			if (value && value.length < 2 && name !== "year") {
				setSegments((prev) => ({ ...prev, [name]: padStart2(value) }));
			}
		};

		const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
			if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
				e.preventDefault();
			}
		};

		const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const { name, value } = e.target;
			const field = name as keyof DateSegments;
			const cur = segments;

			if (isNaN(Number(value))) return;
			if (+value === 0 && value.length > 1) return;

			// --- Ethiopian-calendar input guards ---
			if (field === "day" && +cur.month === 13 && calendarTypeInt && +value > 6) {
				return;
			}
			if (
				field === "month" &&
				+cur.year &&
				+cur.day &&
				+value > 12 &&
				+cur.day > checkLeapYear(+cur.year) &&
				calendarTypeInt
			) {
				return;
			}

			// --- Gregorian-calendar input guards (31/30/Feb handling) ---
			if (
				field === "day" &&
				(+cur.month === 2 ||
					+cur.month === 4 ||
					+cur.month === 6 ||
					+cur.month === 9 ||
					+cur.month === 11) &&
				+value > 30 &&
				!calendarTypeInt
			) {
				return;
			}
			if (field === "month" && +cur.day && +cur.day > 30 && !calendarTypeInt) {
				if ([2, 4, 6, 9, 11].includes(+value)) return;
			}
			if (field === "month" && +value === 2 && !calendarTypeInt) {
				if (+cur.day > 29) return;
				if (+cur.day > 28 && !checkLeapYearGc(+cur.year)) return;
			}
			if (field === "day" && +cur.month === 2 && !calendarTypeInt) {
				if (+value > 29) return;
				if (+value > 28 && !checkLeapYearGc(+cur.year)) return;
			}
			if (
				field === "year" &&
				+cur.month === 2 &&
				!calendarTypeInt &&
				value.length === 4
			) {
				if (+cur.day > 29) return;
				if (+cur.day > 28 && !checkLeapYearGc(+value)) return;
			}

			// Pagume (month 13) day guard: only restrict once a full 4-digit year
			// is present, otherwise a legitimate leap-year Pagume 6 is blocked.
			if (
				field === "day" &&
				+cur.month === 13 &&
				calendarTypeInt &&
				+value > 5 &&
				cur.year.length === 4
			) {
				if (checkLeapYear(+cur.year) < +value) return;
			}

			if (field === "month" && +value > 13 && calendarTypeInt) return;
			if (field === "month" && +value > 12 && !calendarTypeInt) return;
			if (field === "day" && +value > 30 && calendarTypeInt) return;
			if (field === "day" && +value > 31) return;

			const next: DateSegments = { ...cur, [field]: value };
			setSegments(next);

			// Convert using the freshly-built `next` values (never the stale state).
			if (next.year.length === 4 && +next.month > 0 && +next.day > 0) {
				properDateConverter(+next.year, +next.month, +next.day);
			}

			// Auto-advance focus between segments.
			if (value.length > 0 && field !== "year") {
				if (field === "month" && +value > 1) {
					yearInputRef.current?.focus();
				} else if (field === "day" && +value > 3) {
					monthInputRef.current?.focus();
				} else if (field === "month" && value.length === 2) {
					yearInputRef.current?.focus();
				} else if (field === "day" && value.length === 2) {
					monthInputRef.current?.focus();
				}
			}
		};

		/** Format the selected range for the read-only range display. */
		const formatDateRange = (): string => {
			if (!dateRange || !selectedDateRange.startDate) return "";

			const toEthiopianDate = (value: dayjs.Dayjs): string => {
				const d = dayjs(value);
				const [year, month, day] = toEthiopian(d.year(), d.month() + 1, d.date());
				return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
			};

			let displayText = toEthiopianDate(selectedDateRange.startDate);
			if (selectedDateRange.endDate) {
				displayText += ` - ${toEthiopianDate(selectedDateRange.endDate)}`;
			} else {
				displayText += " - Select end date";
			}
			return displayText;
		};

		const hasValue = dateRange
			? !!selectedDateRange.startDate
			: segments.day !== "" || segments.month !== "" || segments.year !== "";
		const showClear = allowClear && hasValue && !disabled;

		const inputStyle: React.CSSProperties = {
			width: "2.9ch",
			textAlign: "left",
			padding: 0,
			opacity: disabled ? 0.6 : 1,
			cursor: disabled ? "not-allowed" : "text",
		};

		return (
			<div
				className={cn("datePickerContainerEt", SIZE_CLASS[size])}
				style={{ width: "100%", minWidth: 0, ...style }}
				ref={ref}
				onBlur={(e) => {
					handleInputBlur(e as unknown as React.FocusEvent<HTMLInputElement>);
					onBlur?.(e);
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						width: "100%",
						minWidth: 0,
						opacity: disabled ? 0.6 : 1,
						pointerEvents: disabled ? "none" : "auto",
					}}
					onClick={(e) => {
						if (!disabled) handleInputClick(e);
					}}
				>
					{dateRange ? (
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "4px",
								flex: 1,
								minWidth: 0,
								color: selectedDateRange.startDate ? "#333" : "#999",
								fontSize: SIZE_RANGE_FONT[size],
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap",
							}}
						>
							{formatDateRange() ||
								(typeof placeholder === "string" && placeholder) ||
								"Select date range"}
						</div>
					) : (
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "4px",
								flex: "0 1 auto",
								minWidth: 0,
								whiteSpace: "nowrap",
							}}
						>
							<input
								ref={dayInputRef}
								autoComplete="off"
								type="text"
								value={segments.day}
								onChange={handleInputChange}
								onFocus={handleInputFocus}
								onMouseDown={handleInputMouseDown}
								onKeyDown={handleKeyDown}
								placeholder="DD"
								onBlur={handleInputBlur}
								maxLength={2}
								name="day"
								disabled={disabled}
								className="dateInputStyle"
								style={inputStyle}
							/>
							<span>/</span>
							<input
								ref={monthInputRef}
								type="text"
								value={segments.month}
								onChange={handleInputChange}
								onFocus={handleInputFocus}
								onBlur={handleInputBlur}
								onMouseDown={handleInputMouseDown}
								onKeyDown={handleKeyDown}
								placeholder="MM"
								maxLength={2}
								name="month"
								disabled={disabled}
								autoComplete="off"
								className="dateInputStyle"
								style={{ ...inputStyle, width: "3.8ch" }}
							/>
							<span>/</span>
							<input
								ref={yearInputRef}
								type="text"
								value={segments.year}
								onChange={handleInputChange}
								onMouseDown={handleInputMouseDown}
								onKeyDown={handleKeyDown}
								onFocus={handleInputFocus}
								onBlur={handleInputBlur}
								placeholder="YYYY"
								maxLength={4}
								name="year"
								disabled={disabled}
								className="dateInputStyle"
								autoComplete="off"
								style={{ ...inputStyle, width: "4.4ch" }}
							/>
						</div>
					)}
					<div
						style={{
							display: "flex",
							alignItems: "center",
							flexShrink: 0,
						}}
					>
						{showClear && (
							<button
								type="button"
								aria-label="Clear date"
								className="etClearButton"
								onMouseDown={(e) => e.preventDefault()}
								onClick={(e) => onClear?.(e)}
							>
								<FiX />
							</button>
						)}
						<div
							onClick={(e) => {
								if (!disabled) handleInputClick(e);
							}}
							style={{
								cursor: disabled ? "not-allowed" : "pointer",
								marginLeft: "8px",
								opacity: disabled ? 0.6 : 1,
								display: "flex",
								alignItems: "center",
							}}
						>
							<FiCalendar className="calendarIcon" />
						</div>
					</div>
				</div>
			</div>
		);
	},
);

Input.displayName = "Input";

export default Input;
