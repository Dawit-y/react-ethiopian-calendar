import { useEffect, useRef, useState } from "react";
import {
	etMonths,
	etMonthsEnglish,
	generateEthiopianDate,
	nextMonth,
	nextYear,
	prevMonth,
	prevYear,
} from "../../utils/EthiopianCalendar";
import { GrFormNext, GrFormPrevious, GrNext, GrPrevious } from "react-icons/gr";
import Lang from "../Lang.jsx";
import cn from "../../utils/cn";
import { toEthiopian } from "ethiopian-date";
import dayjs from "dayjs";

const EtPicker = ({
	minDateIn,
	maxDateIn,
	selectedDate,
	selectedDateRange,
	etToday,
	setEtToday,
	days,
	disableFuture,
	disabled,
	handleDateChange,
	lang,
	isFutureDate,
	etCurrentDate,
	dateRange = false,
}) => {
	const etDays = ["እ", "ሰ", "ማ", "ረ", "ሐ", "ዓ", "ቅ"];
	const [showYear, setShowYear] = useState(false);
	const yearsContainerRef = useRef(null);
	const currentYearRef = useRef(null);

	useEffect(() => {
		if (yearsContainerRef.current && currentYearRef.current) {
			const yearItemOffsetTop = currentYearRef.current.offsetTop;
			const yearItemHeight = currentYearRef.current.offsetHeight;
			const containerHeight = yearsContainerRef.current.offsetHeight;
			yearsContainerRef.current.scrollTop =
				yearItemOffsetTop - containerHeight / 2 + yearItemHeight / 2;
		}
	}, [showYear]);

	// Helper function to determine if a date is within the selected range
	const isDateInRange = (date) => {
		if (
			!dateRange ||
			!selectedDateRange?.startDate ||
			!selectedDateRange?.endDate ||
			!date
		) {
			return false;
		}

		try {
			const dateObj = dayjs(date).startOf("day");
			const startDate = dayjs(selectedDateRange.startDate).startOf("day");
			const endDate = dayjs(selectedDateRange.endDate).startOf("day");

			// Check if all dates are valid
			if (!dateObj.isValid() || !startDate.isValid() || !endDate.isValid()) {
				return false;
			}

			// Check if the date is disabled
			const isDisabled = () => {
				if (disableFuture && isFutureDate(date)) return true;
				if (minDateIn && dateObj.isBefore(dayjs(minDateIn).startOf("day")))
					return true;
				if (maxDateIn && dateObj.isAfter(dayjs(maxDateIn).startOf("day")))
					return true;
				return false;
			};

			// If date is disabled, don't show it as in range
			if (isDisabled()) {
				return false;
			}

			// Check if date is within the selected range (inclusive)
			const isAfterOrSameStart =
				dateObj.isSame(startDate, "day") || dateObj.isAfter(startDate, "day");
			const isBeforeOrSameEnd =
				dateObj.isSame(endDate, "day") || dateObj.isBefore(endDate, "day");

			return isAfterOrSameStart && isBeforeOrSameEnd;
		} catch (error) {
			console.warn("Error checking date range:", error);
			return false;
		}
	};

	// Helper function to determine if a date is the start or end of the range
	const getRangePosition = (date, isCurrentMonth) => {
		if (
			!dateRange ||
			!selectedDateRange?.startDate ||
			!selectedDateRange?.endDate ||
			!isCurrentMonth
		) {
			return null;
		}

		try {
			const dateObj = dayjs(date);
			const startDate = dayjs(selectedDateRange.startDate);
			const endDate = dayjs(selectedDateRange.endDate);

			// Check if all dates are valid
			if (!dateObj.isValid() || !startDate.isValid() || !endDate.isValid()) {
				return null;
			}

			if (dateObj.isSame(startDate, "day")) return "start";
			if (dateObj.isSame(endDate, "day")) return "end";
			return null;
		} catch (error) {
			console.warn("Error checking range position:", error);
			return null;
		}
	};

	return (
		<>
			<div className="calendarContainerEt">
				<div className="topActions">
					<span>
						{/* <button
              // onClick={(e) => toggleCalendarType(e)}
              className="buttonStyle buttonBackgroundEt"
            /> */}
						<span
							style={{ cursor: "pointer" }}
							onClick={() => setShowYear(!showYear)}
						>
							{lang === "am" ? (
								<>
									{etMonths[etToday[1] - 1]}, {etToday[0]}
								</>
							) : (
								<>
									{etMonthsEnglish[etToday[1] - 1]}, {etToday[0]}
								</>
							)}
						</span>
					</span>
					{!showYear && (
						<div className="monthButtons">
							<GrPrevious
								onClick={() =>
									setEtToday(prevYear(etToday[0], etToday[1], etToday[2]))
								}
								className="monthButton"
							/>
							<GrFormPrevious
								onClick={() =>
									setEtToday(prevMonth(etToday[0], etToday[1], etToday[2]))
								}
								className="monthButton"
							/>
							<span
								onClick={() => setEtToday(etCurrentDate)}
								className="todayButton"
							>
								<Lang selectedLang={lang} am="ዛሬ" en="Today" />
							</span>
							<GrFormNext
								onClick={() =>
									setEtToday(nextMonth(etToday[0], etToday[1], etToday[2]))
								}
								className="monthButton"
							/>
							<GrNext
								onClick={() =>
									setEtToday(nextYear(etToday[0], etToday[1], etToday[2]))
								}
								className="monthButton"
							/>
						</div>
					)}
				</div>
				{!showYear ? (
					<div className="etHeight">
						<div className="gridSevenEt w-fullEt ">
							{lang === "am"
								? etDays.map((day, index) => {
										return (
											<span
												key={index}
												className="rowHeight dayOfWeek centerGrid"
											>
												{day}
											</span>
										);
								  })
								: days.map((day, index) => {
										return (
											<span
												key={index}
												className="rowHeight dayOfWeek centerGrid"
											>
												{day}
											</span>
										);
								  })}
						</div>
						<div className=" gridSevenEt w-fullEt etHeight">
							{generateEthiopianDate(etToday[1], etToday[0]).map(
								({ day, isCurrentMonth, today, date }, index) => {
									const disableFutureDate = disableFuture && isFutureDate(date);
									const isSelectedDate =
										selectedDate &&
										isCurrentMonth &&
										dayjs(selectedDate).format("YYYY-MM-DD") ===
											dayjs(date).format("YYYY-MM-DD");

									// Date range logic
									const isInRange = isCurrentMonth && isDateInRange(date);
									const rangePosition = getRangePosition(date, isCurrentMonth);
									const isRangeStart = rangePosition === "start";
									const isRangeEnd = rangePosition === "end";

									return (
										<span
											key={index}
											onClick={() => {
												if (isCurrentMonth) {
													if (
														!disabled &&
														!disableFutureDate &&
														(!minDateIn || minDateIn <= date) &&
														(!maxDateIn || maxDateIn >= date)
													) {
														handleDateChange(date);
													}
												}
											}}
											className="rowHeight dayText rowHeight centerGrid borderTop"
										>
											<span
												style={{
													cursor:
														!isCurrentMonth ||
														disabled ||
														disableFutureDate ||
														(minDateIn && minDateIn > date) ||
														(maxDateIn && maxDateIn < date)
															? "not-allowed"
															: "pointer",
												}}
												className={cn(
													isCurrentMonth ? "" : "grayText",
													minDateIn && minDateIn > date ? "grayText" : "",
													maxDateIn && maxDateIn < date ? "grayText" : "",
													disabled ? "grayText" : "",
													disableFutureDate ? "grayText" : "",
													today && !isSelectedDate && !isInRange
														? "backgroundBlue "
														: "",
													"dateWidthAndHeight centerGrid",
													isCurrentMonth ? "currentMonth" : "",
													isSelectedDate ? "selectedDate" : "",
													// Date range styling
													isInRange ? "dateInRange" : "",
													isRangeStart ? "rangeStart" : "",
													isRangeEnd ? "rangeEnd" : ""
												)}
											>
												{day}
											</span>
										</span>
									);
								}
							)}
						</div>
					</div>
				) : (
					<div
						className="yearsGridContainer"
						ref={yearsContainerRef}
						style={{
							overflowY: "auto",
							maxHeight: "260px",
						}}
					>
						<div
							className="yearsGrid"
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(4, 1fr)",
								gap: "10px",
							}}
						>
							{Array.from({ length: 2100 - 1900 }, (_, i) => 1900 + i).map(
								(year) => {
									const isCurrentYear = etToday[0] === year;

									if (minDateIn) {
										const etMin = toEthiopian(
											new Date(minDateIn).getFullYear(),
											new Date(minDateIn).getMonth() + 1,
											new Date(minDateIn).getDate()
										);
										if (etMin[0] > year) {
											return;
										}
									}
									if (maxDateIn) {
										const etMax = toEthiopian(
											new Date(maxDateIn).getFullYear(),
											new Date(maxDateIn).getMonth() + 1,
											new Date(maxDateIn).getDate()
										);
										if (etMax[0] < year) {
											return;
										}
									}

									return (
										<div
											key={year}
											ref={isCurrentYear ? currentYearRef : null}
											onClick={(e) => {
												e.stopPropagation();
												setShowYear(false);
												setEtToday([year, etToday[1], etToday[2]]);
											}}
											className={cn(
												"yearItem",
												isCurrentYear ? "backgroundBlue" : ""
											)}
											style={{
												padding: "5px",
												textAlign: "center",
											}}
										>
											{year}
										</div>
									);
								}
							)}
						</div>
					</div>
				)}
			</div>
		</>
	);
};


export default EtPicker;
