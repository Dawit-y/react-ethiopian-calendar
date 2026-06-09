import {
	forwardRef,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import dayjs, { type Dayjs } from "dayjs";
import { toEthiopian } from "ethiopian-date";
import ElementPopper from "react-element-popper";
import "../../style/index.css";
import EtPicker from "./EtPicker";
import GcPicker from "./GcPicker";
import Input, { type DateSegments } from "./Input";
import type {
	DateRangeValue,
	EthiopianTuple,
	Language,
	PickerSize,
	SingleDateInput,
	SingleDateValue,
} from "../../types";

/** Weekday single-letter headers (Sunday-first). */
const WEEKDAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"] as const;

/** Value supplied to {@link EtCalendar}: a single date, or a range. */
export type EtCalendarValue = SingleDateInput | DateRangeValue;

/** Props for {@link EtCalendar}. */
export interface EtCalendarProps {
	/**
	 * Selected value. In single mode pass a `Date`/`Dayjs`/date-string; in range
	 * mode (`dateRange`) pass `{ startDate, endDate }`.
	 */
	value?: EtCalendarValue | null;
	/**
	 * Called when the selection changes. Receives a `Dayjs` in single mode, or a
	 * `{ startDate, endDate }` object in range mode. Receives `null` (single) or
	 * an empty `{ startDate: null, endDate: null }` (range) when the value is
	 * cleared via the clear button.
	 */
	onChange?: (value: Dayjs | DateRangeValue | null) => void;
	/** Show a clear (×) button that resets the value. Defaults to `true`. */
	allowClear?: boolean;
	/**
	 * Show a header button that lets the user switch between the Ethiopian and
	 * Gregorian calendar views. Defaults to `false`. The committed value
	 * (`onChange`) is the same underlying date regardless of the view.
	 */
	allowCalendarSwap?: boolean;
	/** `true` (default) for the Ethiopian calendar, `false` for Gregorian. */
	calendarType?: boolean;
	/** Minimum selectable date. */
	minDate?: SingleDateInput;
	/** Maximum selectable date. */
	maxDate?: SingleDateInput;
	/** Name forwarded to the form field. */
	name?: string;
	/** Disable the component. */
	disabled?: boolean;
	/** Prevent selecting dates after today. */
	disableFuture?: boolean;
	/** Stretch the component to its container's width. */
	fullWidth?: boolean;
	/** Custom border radius for the input. */
	borderRadius?: string;
	/** Placeholder text, or `false` to omit. */
	placeholder?: boolean | string;
	/** UI language: `"en"` (default), `"am"` (Amharic), or `"or"` (Afaan Oromoo). */
	lang?: Language;
	/** Accessible label. */
	label?: string;
	/** Inline styles applied to the input. */
	inputStyle?: React.CSSProperties;
	/** Inline styles applied to the wrapper. */
	style?: React.CSSProperties;
	/** Blur handler forwarded to the input. */
	onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;
	/** Enable date-range selection mode. */
	dateRange?: boolean;
	/** Accent color (any valid CSS color). Defaults to `"#0253a5"`. */
	primaryColor?: string;
	/**
	 * Size of the input field height: `"sm"` (compact), `"md"` (default), or
	 * `"lg"` (large). Only affects the input field, not the calendar grid.
	 */
	size?: PickerSize;
}

const EMPTY_SEGMENTS: DateSegments = { day: "", month: "", year: "" };

/** Normalize any accepted date input to a start-of-day `Dayjs`, or `null`. */
const normalizeDate = (date: SingleDateInput): SingleDateValue => {
	if (date === null || date === undefined || date === "") return null;
	const d = dayjs(date as dayjs.ConfigType);
	return d.isValid() ? d.startOf("day") : null;
};

const isRangeValue = (value: EtCalendarValue | null | undefined): value is DateRangeValue =>
	typeof value === "object" &&
	value !== null &&
	!dayjs.isDayjs(value) &&
	!(value instanceof Date) &&
	("startDate" in value || "endDate" in value);

const EtCalendar = forwardRef<HTMLDivElement, EtCalendarProps>(
	(
		{
			value,
			onChange,
			calendarType = true,
			minDate,
			maxDate,
			// `name`, `borderRadius`, and `label` are accepted for backward
			// compatibility but are not consumed by the current input markup.
			disabled = false,
			disableFuture = false,
			fullWidth,
			placeholder = false,
			lang = "en",
			inputStyle,
			style,
			onBlur,
			dateRange = false,
			primaryColor = "#0253a5",
			allowClear = true,
			allowCalendarSwap = false,
			size = "md",
		},
		ref,
	) => {
		const minDateIn = useMemo(() => normalizeDate(minDate), [minDate]);
		const maxDateIn = useMemo(() => normalizeDate(maxDate), [maxDate]);

		const [dateRangeError, setDateRangeError] = useState<string | null>(null);
		const [calendarTypeInt, setCalendarTypeInt] = useState(calendarType);
		const [showCalendar, setShowCalendar] = useState(false);

		const currentDate = useMemo(() => dayjs().startOf("day"), []);
		const etCurrentDate = useMemo<EthiopianTuple>(
			() =>
				toEthiopian(
					currentDate.year(),
					currentDate.month() + 1,
					currentDate.date(),
				),
			[currentDate],
		);

		const [today, setToday] = useState<Dayjs>(currentDate);
		const [etToday, setEtToday] = useState<EthiopianTuple>(etCurrentDate);

		const [selectedDate, setSelectedDate] = useState<SingleDateValue>(() =>
			dateRange ? null : normalizeDate(value as SingleDateInput),
		);

		const [selectedDateRange, setSelectedDateRange] = useState<DateRangeValue>(() => {
			if (!dateRange || !isRangeValue(value)) {
				return { startDate: null, endDate: null };
			}
			return {
				startDate: normalizeDate(value.startDate),
				endDate: normalizeDate(value.endDate),
			};
		});

		const calendarRef = useRef<HTMLDivElement>(null);
		const inputRef = useRef<HTMLDivElement>(null);

		useEffect(() => {
			if (minDateIn && maxDateIn && minDateIn.isAfter(maxDateIn)) {
				const error =
					"Invalid date range: minimum date cannot be after maximum date";
				setDateRangeError(error);
				console.warn(error);
			} else {
				setDateRangeError(null);
			}
		}, [minDateIn, maxDateIn]);

		useEffect(() => {
			setCalendarTypeInt(calendarType);
		}, [calendarType]);

		useEffect(() => {
			if (dateRange) {
				// Adopt whatever the parent provides — including an in-progress range
				// where only `startDate` is set. Resetting to empty here would wipe
				// the first click in a controlled range picker.
				if (isRangeValue(value)) {
					setSelectedDateRange({
						startDate: normalizeDate(value.startDate),
						endDate: normalizeDate(value.endDate),
					});
				} else {
					setSelectedDateRange({ startDate: null, endDate: null });
				}
			} else {
				setSelectedDate(normalizeDate(value as SingleDateInput));
			}
		}, [value, dateRange]);

		const isFutureDate = useCallback(
			(date: SingleDateInput) => {
				const dateObj = normalizeDate(date);
				return dateObj ? dateObj.isAfter(currentDate) : false;
			},
			[currentDate],
		);

		const syncNavigation = useCallback(
			(constrainedDate: Dayjs) => {
				if (calendarTypeInt) {
					setEtToday(
						toEthiopian(
							constrainedDate.year(),
							constrainedDate.month() + 1,
							constrainedDate.date(),
						),
					);
				} else {
					setToday(constrainedDate);
				}
			},
			[calendarTypeInt],
		);

		const handleDateChange = useCallback(
			(newDate: SingleDateInput) => {
				const normalizedDate = normalizeDate(newDate);
				if (!normalizedDate) return;

				let constrainedDate = normalizedDate;
				if (maxDateIn && constrainedDate.isAfter(maxDateIn)) {
					constrainedDate = maxDateIn;
				} else if (minDateIn && constrainedDate.isBefore(minDateIn)) {
					constrainedDate = minDateIn;
				}

				if (dateRange) {
					const newRange: DateRangeValue = { ...selectedDateRange };

					if (!newRange.startDate) {
						newRange.startDate = constrainedDate;
						newRange.endDate = null;
					} else if (!newRange.endDate) {
						if (constrainedDate.isSame(newRange.startDate, "day")) return;
						if (constrainedDate.isBefore(newRange.startDate)) {
							newRange.endDate = newRange.startDate;
							newRange.startDate = constrainedDate;
						} else {
							newRange.endDate = constrainedDate;
						}
						setShowCalendar(false);
					} else {
						newRange.startDate = constrainedDate;
						newRange.endDate = null;
					}

					setSelectedDateRange(newRange);
					onChange?.(newRange);
					syncNavigation(constrainedDate);
				} else {
					setSelectedDate(constrainedDate);
					setShowCalendar(false);
					onChange?.(constrainedDate);
					syncNavigation(constrainedDate);
				}
			},
			[dateRange, selectedDateRange, onChange, minDateIn, maxDateIn, syncNavigation],
		);

		const toggleCalendarType = useCallback((e: React.MouseEvent) => {
			e.stopPropagation();
			setCalendarTypeInt((prev) => !prev);
			setShowCalendar(true);
		}, []);

		const handleClear = useCallback(
			(e: React.MouseEvent) => {
				e.stopPropagation();
				if (dateRange) {
					const empty: DateRangeValue = { startDate: null, endDate: null };
					setSelectedDateRange(empty);
					onChange?.(empty);
				} else {
					setSelectedDate(null);
					onChange?.(null);
				}
			},
			[dateRange, onChange],
		);

		const handleInputClick = useCallback(
			(event: React.MouseEvent) => {
				event.stopPropagation();
				if (dateRangeError || disabled) return;

				if (!showCalendar) {
					const targetDate =
						selectedDate || selectedDateRange.startDate || minDateIn || currentDate;
					if (targetDate) syncNavigation(targetDate);
				}
				setShowCalendar((prev) => !prev);
			},
			[
				showCalendar,
				dateRangeError,
				disabled,
				selectedDate,
				selectedDateRange.startDate,
				minDateIn,
				currentDate,
				syncNavigation,
			],
		);

		useEffect(() => {
			function handleClickOutside(e: MouseEvent) {
				if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
					setShowCalendar(false);
				}
			}
			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}, []);

		const inputDate = useMemo<DateSegments>(() => {
			const toSegments = (target: Dayjs): DateSegments => {
				if (calendarTypeInt) {
					const [ey, em, ed] = toEthiopian(
						target.year(),
						target.month() + 1,
						target.date(),
					);
					return {
						day: String(ed).padStart(2, "0"),
						month: String(em).padStart(2, "0"),
						year: String(ey),
					};
				}
				return {
					day: String(target.date()).padStart(2, "0"),
					month: String(target.month() + 1).padStart(2, "0"),
					year: String(target.year()),
				};
			};

			if (dateRange) {
				return selectedDateRange.startDate
					? toSegments(selectedDateRange.startDate)
					: EMPTY_SEGMENTS;
			}
			return selectedDate ? toSegments(selectedDate) : EMPTY_SEGMENTS;
		}, [dateRange, selectedDateRange, selectedDate, calendarTypeInt]);

		const combinedInputStyle: React.CSSProperties = { ...style, ...inputStyle };
		const wrapperStyle = {
			"--et-primary-color": primaryColor,
			width: combinedInputStyle.width || (fullWidth ? "100%" : "auto"),
		} as React.CSSProperties;

		return (
			<div ref={ref} style={wrapperStyle}>
				<ElementPopper
					ref={calendarRef}
					zIndex={1000}
					containerStyle={{ width: "100%" }}
					element={
						<Input
							ref={inputRef}
							handleInputClick={handleInputClick}
							placeholder={placeholder}
							date={inputDate}
							handleDateChange={handleDateChange}
							calendarTypeInt={calendarTypeInt}
							style={{
								...combinedInputStyle,
								borderColor: dateRangeError
									? "#f46a6a"
									: combinedInputStyle.borderColor,
								opacity: dateRangeError ? 0.6 : 1,
							}}
							disabled={disabled || !!dateRangeError}
							onBlur={onBlur}
							dateRange={dateRange}
							selectedDateRange={selectedDateRange}
							allowClear={allowClear}
							onClear={handleClear}
							size={size}
						/>
					}
					popper={
						showCalendar ? (
							<div
								style={{
									width: combinedInputStyle.width || "100%",
									minWidth: combinedInputStyle.minWidth || "220px",
								}}
							>
								<div
									className="Cal"
									style={{
										width: "100%",
										minWidth: combinedInputStyle.minWidth || "220px",
									}}
								>
									{calendarTypeInt ? (
										<EtPicker
											minDateIn={minDateIn}
											maxDateIn={maxDateIn}
											selectedDate={selectedDate}
											selectedDateRange={selectedDateRange}
											toggleCalendarType={toggleCalendarType}
											allowCalendarSwap={allowCalendarSwap}
											handleDateChange={handleDateChange}
											disabled={disabled}
											disableFuture={disableFuture}
											lang={lang}
											etToday={etToday}
											setEtToday={setEtToday}
											days={WEEKDAY_INITIALS}
											isFutureDate={isFutureDate}
											etCurrentDate={etCurrentDate}
											dateRange={dateRange}
										/>
									) : (
										<GcPicker
											minDateIn={minDateIn}
											maxDateIn={maxDateIn}
											selectedDate={selectedDate}
											selectedDateRange={selectedDateRange}
											toggleCalendarType={toggleCalendarType}
											allowCalendarSwap={allowCalendarSwap}
											handleDateChange={handleDateChange}
											disabled={disabled}
											disableFuture={disableFuture}
											lang={lang}
											today={today}
											setToday={setToday}
											days={WEEKDAY_INITIALS}
											isFutureDate={isFutureDate}
											currentDate={currentDate}
											dateRange={dateRange}
										/>
									)}
								</div>
							</div>
						) : (
							<></>
						)
					}
					active={showCalendar}
					position="bottom-start"
				/>
				{dateRangeError && (
					<div style={{ color: "#f46a6a", fontSize: "12px", marginTop: "4px" }}>
						{dateRangeError}
					</div>
				)}
			</div>
		);
	},
);

EtCalendar.displayName = "EtCalendar";

export { EtCalendar };
