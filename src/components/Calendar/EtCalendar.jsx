import React, { useEffect, useRef, useState, useCallback } from "react";
import dayjs from "dayjs";
import { toEthiopian } from "ethiopian-date";
import ElementPopper from "react-element-popper";
import "../../style/index.css";
import EtPicker from "./EtPicker.jsx";
import GcPicker from "./GcPicker.jsx";
import Input from "./Input.jsx";

// Helper function to validate and normalize dates
const normalizeDate = (date) => {
	if (!date) return null;
	const dayjsDate = dayjs(date);
	return dayjsDate.isValid() ? dayjsDate.startOf("day") : null;
};

const EtCalendar = React.forwardRef(
	(
		{
			value,
			onChange,
			calendarType = true,
			minDate,
			maxDate,
			name,
			disabled = false,
			disableFuture = false,
			fullWidth,
			borderRadius,
			placeholder = false,
			lang = "en",
			label = "Date",
			inputStyle,
			style,
			onBlur,
			dateRange = false,
		},
		ref
	) => {
		// Normalize min/max dates
		const minDateIn = normalizeDate(minDate);
		const maxDateIn = normalizeDate(maxDate);

		const [dateRangeError, setDateRangeError] = useState(null);
		const [calendarTypeInt, setCalendarTypeInt] = useState(calendarType);
		const [showCalendar, setShowCalendar] = useState(false);

		const currentDate = dayjs().startOf("day");
		const etCurrentDate = toEthiopian(
			currentDate.year(),
			currentDate.month() + 1,
			currentDate.date()
		);

		// State for calendar navigation
		const [today, setToday] = useState(currentDate);
		const [etToday, setEtToday] = useState(etCurrentDate);

		// Handle selected dates
		const [selectedDate, setSelectedDate] = useState(() =>
			dateRange ? null : normalizeDate(value)
		);

		const [selectedDateRange, setSelectedDateRange] = useState(() => {
			if (!dateRange || !value) return { startDate: null, endDate: null };

			return {
				startDate: normalizeDate(value.startDate),
				endDate: normalizeDate(value.endDate),
			};
		});

		const calendarRef = useRef(null);
		const inputRef = useRef(null);
		const days = ["S", "M", "T", "W", "T", "F", "S"];

		// Validate date range
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

		// Update calendar type
		useEffect(() => {
			setCalendarTypeInt(calendarType);
		}, [calendarType]);

		// Sync with external value changes
		useEffect(() => {
			if (dateRange) {
				if (value && value.startDate && value.endDate) {
					setSelectedDateRange({
						startDate: normalizeDate(value.startDate),
						endDate: normalizeDate(value.endDate),
					});
				} else {
					setSelectedDateRange({ startDate: null, endDate: null });
				}
			} else {
				setSelectedDate(normalizeDate(value));
			}
		}, [value, dateRange]);

		const isFutureDate = useCallback(
			(date) => {
				const dateObj = normalizeDate(date);
				return dateObj ? dateObj.isAfter(currentDate) : false;
			},
			[currentDate]
		);

		const handleDateChange = useCallback(
			(newDate) => {
				const normalizedDate = normalizeDate(newDate);
				if (!normalizedDate) return;

				// Apply min/max constraints
				let constrainedDate = normalizedDate;
				if (maxDateIn && constrainedDate.isAfter(maxDateIn)) {
					constrainedDate = maxDateIn;
				} else if (minDateIn && constrainedDate.isBefore(minDateIn)) {
					constrainedDate = minDateIn;
				}

				if (dateRange) {
					let newRange = { ...selectedDateRange };

					if (!newRange.startDate) {
						// First click - set start date
						newRange.startDate = constrainedDate;
						newRange.endDate = null;
					} else if (!newRange.endDate) {
						if (constrainedDate.isSame(newRange.startDate, "day")) {
							return;
						} else if (constrainedDate.isBefore(newRange.startDate)) {
							// If end date is before start date, swap them
							newRange.endDate = newRange.startDate;
							newRange.startDate = constrainedDate;
						} else {
							newRange.endDate = constrainedDate;
						}

						// Close calendar after selecting valid end date
						setShowCalendar(false);
					} else {
						// Reset and start new range
						newRange.startDate = constrainedDate;
						newRange.endDate = null;
					}

					setSelectedDateRange(newRange);
					onChange?.(newRange);

					// Update calendar navigation to show the selected date
					if (calendarTypeInt) {
						const ethiopianDate = toEthiopian(
							constrainedDate.year(),
							constrainedDate.month() + 1,
							constrainedDate.date()
						);
						setEtToday(ethiopianDate);
					} else {
						setToday(constrainedDate);
					}
				} else {
					// Single date selection
					setSelectedDate(constrainedDate);
					setShowCalendar(false);
					onChange?.(constrainedDate);

					// Update calendar navigation
					if (calendarTypeInt) {
						const ethiopianDate = toEthiopian(
							constrainedDate.year(),
							constrainedDate.month() + 1,
							constrainedDate.date()
						);
						setEtToday(ethiopianDate);
					} else {
						setToday(constrainedDate);
					}
				}
			},
			[
				dateRange,
				selectedDateRange,
				onChange,
				calendarTypeInt,
				minDateIn,
				maxDateIn,
			]
		);

		const toggleCalendarType = useCallback((e) => {
			e.stopPropagation();
			setCalendarTypeInt((prev) => !prev);
			setShowCalendar(true);
		}, []);

		const handleInputClick = useCallback(
			(event) => {
				event.stopPropagation();
				if (dateRangeError || disabled) return;

				// Reset calendar to appropriate date when opening
				if (!showCalendar) {
					const targetDate =
						selectedDate ||
						selectedDateRange.startDate ||
						minDateIn ||
						currentDate;
					if (targetDate) {
						if (calendarTypeInt) {
							const ethiopianDate = toEthiopian(
								targetDate.year(),
								targetDate.month() + 1,
								targetDate.date()
							);
							setEtToday(ethiopianDate);
						} else {
							setToday(targetDate);
						}
					}
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
				calendarTypeInt,
			]
		);

		// Close calendar when clicking outside
		useEffect(() => {
			function handleClickOutside(e) {
				if (calendarRef.current && !calendarRef.current.contains(e.target)) {
					setShowCalendar(false);
				}
			}

			document.addEventListener("mousedown", handleClickOutside);
			return () =>
				document.removeEventListener("mousedown", handleClickOutside);
		}, []);

		// Format date for input display
		const formatDateForInput = useCallback(() => {
			if (dateRange) {
				if (!selectedDateRange.startDate)
					return { day: "", month: "", year: "" };

				const targetDate = selectedDateRange.startDate;
				if (calendarTypeInt) {
					const ethiopianDate = toEthiopian(
						targetDate.year(),
						targetDate.month() + 1,
						targetDate.date()
					);
					return {
						day: String(ethiopianDate[2]).padStart(2, "0"),
						month: String(ethiopianDate[1]).padStart(2, "0"),
						year: String(ethiopianDate[0]),
					};
				}
				return {
					day: String(targetDate.date()).padStart(2, "0"),
					month: String(targetDate.month() + 1).padStart(2, "0"),
					year: String(targetDate.year()),
				};
			}

			if (!selectedDate) return { day: "", month: "", year: "" };

			if (calendarTypeInt) {
				const ethiopianDate = toEthiopian(
					selectedDate.year(),
					selectedDate.month() + 1,
					selectedDate.date()
				);
				return {
					day: String(ethiopianDate[2]).padStart(2, "0"),
					month: String(ethiopianDate[1]).padStart(2, "0"),
					year: String(ethiopianDate[0]),
				};
			}

			return {
				day: String(selectedDate.date()).padStart(2, "0"),
				month: String(selectedDate.month() + 1).padStart(2, "0"),
				year: String(selectedDate.year()),
			};
		}, [dateRange, selectedDateRange, selectedDate, calendarTypeInt]);

		const inputDate = formatDateForInput();
		const combinedInputStyle = { ...style, ...inputStyle };

		return (
			<div
				ref={ref}
				style={{ width: combinedInputStyle?.width || (fullWidth ? "100%" : "auto") }}
			>
				<ElementPopper
					ref={calendarRef}
					zIndex={1000}
					containerStyle={{ width: "100%" }}
					element={
						<Input
							ref={inputRef}
							fullWidth={fullWidth}
							borderRadius={borderRadius}
							handleInputClick={handleInputClick}
							placeholder={placeholder}
							name={name}
							lang={lang}
							label={label}
							date={inputDate}
							setDate={() => { }} // This should be handled through the date picker
							handleDateChange={handleDateChange}
							calendarTypeInt={calendarTypeInt}
							showCalendar={showCalendar}
							style={{
								...combinedInputStyle,
								borderColor: dateRangeError
									? "#f46a6a"
									: combinedInputStyle?.borderColor,
								opacity: dateRangeError ? 0.6 : 1,
							}}
							disabled={disabled || !!dateRangeError}
							onBlur={onBlur}
							dateRange={dateRange}
							selectedDateRange={selectedDateRange}
						/>
					}
					popper={
						showCalendar && (
							<div
								style={{
									width: combinedInputStyle?.width || "100%",
									minWidth: combinedInputStyle?.minWidth || "220px",
								}}
							>
								<div
									className="Cal"
									style={{ width: "100%", minWidth: combinedInputStyle?.minWidth || "220px" }}
								>
									{calendarTypeInt ? (
										<EtPicker
											minDateIn={minDateIn}
											maxDateIn={maxDateIn}
											selectedDate={selectedDate}
											selectedDateRange={selectedDateRange}
											toggleCalendarType={toggleCalendarType}
											handleDateChange={handleDateChange}
											disabled={disabled}
											disableFuture={disableFuture}
											lang={lang}
											etToday={etToday}
											setEtToday={setEtToday}
											days={days}
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
											handleDateChange={handleDateChange}
											disabled={disabled}
											disableFuture={disableFuture}
											lang={lang}
											today={today}
											setToday={setToday}
											days={days}
											isFutureDate={isFutureDate}
											currentDate={currentDate}
											dateRange={dateRange}
										/>
									)}
								</div>
							</div>
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
	}
);

EtCalendar.displayName = "EtCalendar";

export { EtCalendar };
