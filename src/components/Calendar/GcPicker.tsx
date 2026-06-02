import { useMemo, useState } from "react";
import type { Dayjs } from "dayjs";
import { GrFormNext, GrFormPrevious, GrNext, GrPrevious } from "react-icons/gr";
import { MdSwapHoriz } from "react-icons/md";
import { generateDate, months } from "../../utils/calendar";
import { isDateInRange, getRangePosition } from "../../utils/dateRange";
import cn from "../../utils/cn";
import YearGrid from "./YearGrid";
import type { CalendarPickerBaseProps } from "../../types";

/** Props for {@link GcPicker}. */
export interface GcPickerProps extends CalendarPickerBaseProps {
	/** The month currently in view. */
	today: Dayjs;
	/** Update the month in view. */
	setToday: (date: Dayjs) => void;
	/** The current (real) date, used by the "Today" shortcut. */
	currentDate: Dayjs;
}

const GcPicker = ({
	minDateIn,
	maxDateIn,
	selectedDate,
	selectedDateRange,
	toggleCalendarType,
	today,
	setToday,
	days,
	disableFuture,
	disabled,
	handleDateChange,
	isFutureDate,
	currentDate,
	dateRange = false,
	allowCalendarSwap,
}: GcPickerProps) => {
	const [showYear, setShowYear] = useState(false);

	const cells = useMemo(
		() => generateDate(today.month(), today.year()),
		[today],
	);

	const isOutOfBounds = (date: Dayjs): boolean =>
		(!!minDateIn && date.isBefore(minDateIn, "day")) ||
		(!!maxDateIn && date.isAfter(maxDateIn, "day"));

	return (
		<div className="calendarContainerEt">
			<div className="topActions">
				<span style={{ display: "inline-flex", alignItems: "center" }}>
					{allowCalendarSwap && (
						<button
							type="button"
							className="etSwapButton"
							onClick={toggleCalendarType}
							title="Switch to Ethiopian calendar"
							aria-label="Switch to Ethiopian calendar"
						>
							<MdSwapHoriz />
							<span>ET</span>
						</button>
					)}
					<span
						style={{ cursor: "pointer" }}
						onClick={() => setShowYear(!showYear)}
					>
						{months[today.month()] ?? ""}, {today.year()}
					</span>
				</span>
				{!showYear && (
					<div className="monthButtons">
						<GrPrevious
							onClick={() => setToday(today.year(today.year() - 1))}
							className="monthButton"
						/>
						<GrFormPrevious
							onClick={() => setToday(today.month(today.month() - 1))}
							className="monthButton"
						/>
						<span onClick={() => setToday(currentDate)} className="todayButton">
							Today
						</span>
						<GrFormNext
							onClick={() => setToday(today.month(today.month() + 1))}
							className="monthButton"
						/>
						<GrNext
							onClick={() => setToday(today.year(today.year() + 1))}
							className="monthButton"
						/>
					</div>
				)}
			</div>
			{!showYear ? (
				<div className="etHeight">
					<div className="gridSevenEt w-fullEt">
						{days.map((day, index) => (
							<span key={index} className="rowHeight dayOfWeek centerGrid">
								{day}
							</span>
						))}
					</div>
					<div className="gridSevenEt w-fullEt">
						{cells.map(({ date, isCurrentMonth, today: isToday }, index) => {
							const disableFutureDate =
								!!date && disableFuture && isFutureDate(date);
							const outOfBounds = !!date && isOutOfBounds(date);
							const isSelectedDate =
								!!selectedDate && !!date && selectedDate.isSame(date, "day");
							const isInRange =
								dateRange &&
								isDateInRange(date, selectedDateRange, {
									minDate: minDateIn,
									maxDate: maxDateIn,
									disableFuture,
									isFutureDate,
								});
							const rangePosition = getRangePosition(
								date,
								selectedDateRange,
								dateRange,
							);

							return (
								<span
									key={index}
									onClick={() => {
										if (
											isCurrentMonth &&
											date &&
											!disabled &&
											!disableFutureDate &&
											!outOfBounds
										) {
											handleDateChange(date);
										}
									}}
									className="rowHeight dayText rowHeight centerGrid borderTop"
								>
									<span
										className={cn(
											isCurrentMonth ? "" : "grayText",
											outOfBounds ? "grayText" : "",
											disabled ? "grayText" : "",
											disableFutureDate ? "grayText" : "",
											isToday && !isSelectedDate && !isInRange
												? "backgroundBlue "
												: "",
											"dateWidthAndHeight centerGrid",
											isCurrentMonth ? "currentMonth" : "",
											isSelectedDate ? "selectedDate" : "",
											isInRange ? "dateInRange" : "",
											rangePosition === "start" ? "rangeStart" : "",
											rangePosition === "end" ? "rangeEnd" : "",
										)}
									>
										{date ? date.date() : ""}
									</span>
								</span>
							);
						})}
					</div>
				</div>
			) : (
				<YearGrid
					currentYear={today.year()}
					isYearDisabled={(year) =>
						(!!minDateIn && minDateIn.year() > year) ||
						(!!maxDateIn && maxDateIn.year() < year)
					}
					onSelect={(year) => {
						setShowYear(false);
						setToday(today.year(year));
					}}
				/>
			)}
		</div>
	);
};

export default GcPicker;
