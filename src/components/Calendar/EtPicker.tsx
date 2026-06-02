import { useMemo, useState } from "react";
import type { Dayjs } from "dayjs";
import { toEthiopian } from "ethiopian-date";
import { GrFormNext, GrFormPrevious, GrNext, GrPrevious } from "react-icons/gr";
import { MdSwapHoriz } from "react-icons/md";
import {
	etMonths,
	etMonthsEnglish,
	etMonthsOromiffa,
	generateEthiopianDate,
	nextMonth,
	nextYear,
	prevMonth,
	prevYear,
	setEthiopianYear,
} from "../../utils/EthiopianCalendar";
import { isDateInRange, getRangePosition } from "../../utils/dateRange";
import cn from "../../utils/cn";
import Lang from "../Lang";
import YearGrid from "./YearGrid";
import type { CalendarPickerBaseProps, EthiopianTuple } from "../../types";

/** Props for {@link EtPicker}. */
export interface EtPickerProps extends CalendarPickerBaseProps {
	/** The Ethiopian month currently in view, as `[year, month, day]`. */
	etToday: EthiopianTuple;
	/** Update the Ethiopian month in view. */
	setEtToday: (value: EthiopianTuple) => void;
	/** The current (real) Ethiopian date, used by the "Today" shortcut. */
	etCurrentDate: EthiopianTuple;
}

const ET_DAY_HEADERS_AM = ["እ", "ሰ", "ማ", "ረ", "ሐ", "ዓ", "ቅ"];
const ET_DAY_HEADERS_OR = ["Dil", "Wix", "Kib", "Roo", "Kam", "Jim", "San"];

/** Localized Ethiopian month-name lists, keyed by language. */
const ET_MONTHS_BY_LANG = {
	am: etMonths,
	en: etMonthsEnglish,
	or: etMonthsOromiffa,
} as const;

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
	toggleCalendarType,
	allowCalendarSwap,
}: EtPickerProps) => {
	const [showYear, setShowYear] = useState(false);

	const monthNames = ET_MONTHS_BY_LANG[lang];
	const dayHeaders =
		lang === "am" ? ET_DAY_HEADERS_AM : lang === "or" ? ET_DAY_HEADERS_OR : days;

	const cells = useMemo(
		() => generateEthiopianDate(etToday[1], etToday[0]),
		[etToday],
	);

	const etBounds = useMemo(() => {
		const minYear = minDateIn
			? toEthiopian(minDateIn.year(), minDateIn.month() + 1, minDateIn.date())[0]
			: null;
		const maxYear = maxDateIn
			? toEthiopian(maxDateIn.year(), maxDateIn.month() + 1, maxDateIn.date())[0]
			: null;
		return { minYear, maxYear };
	}, [minDateIn, maxDateIn]);

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
							title="Switch to Gregorian calendar"
							aria-label="Switch to Gregorian calendar"
						>
							<MdSwapHoriz />
							<span>GC</span>
						</button>
					)}
					<span
						style={{ cursor: "pointer" }}
						onClick={() => setShowYear(!showYear)}
					>
						{`${monthNames[etToday[1] - 1] ?? ""}, ${etToday[0]}`}
					</span>
				</span>
				{!showYear && (
					<div className="monthButtons">
						<GrPrevious
							onClick={() => setEtToday(prevYear(etToday[0], etToday[1], etToday[2]))}
							className="monthButton"
						/>
						<GrFormPrevious
							onClick={() => setEtToday(prevMonth(etToday[0], etToday[1], etToday[2]))}
							className="monthButton"
						/>
						<span onClick={() => setEtToday(etCurrentDate)} className="todayButton">
							<Lang selectedLang={lang} am="ዛሬ" or="Har'a" en="Today" />
						</span>
						<GrFormNext
							onClick={() => setEtToday(nextMonth(etToday[0], etToday[1], etToday[2]))}
							className="monthButton"
						/>
						<GrNext
							onClick={() => setEtToday(nextYear(etToday[0], etToday[1], etToday[2]))}
							className="monthButton"
						/>
					</div>
				)}
			</div>
			{!showYear ? (
				<div className="etHeight">
					<div className="gridSevenEt w-fullEt ">
						{dayHeaders.map((day, index) => (
							<span key={index} className="rowHeight dayOfWeek centerGrid">
								{day}
							</span>
						))}
					</div>
					<div className="gridSevenEt w-fullEt etHeight">
						{cells.map(({ day, isCurrentMonth, today: isToday, date }, index) => {
							const disableFutureDate =
								!!date && disableFuture && isFutureDate(date);
							const outOfBounds = !!date && isOutOfBounds(date);
							const isSelectedDate =
								!!selectedDate &&
								isCurrentMonth &&
								!!date &&
								selectedDate.isSame(date, "day");
							const isInRange =
								isCurrentMonth &&
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
								dateRange && isCurrentMonth,
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
										style={{
											cursor:
												!isCurrentMonth ||
												disabled ||
												disableFutureDate ||
												outOfBounds
													? "not-allowed"
													: "pointer",
										}}
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
										{day}
									</span>
								</span>
							);
						})}
					</div>
				</div>
			) : (
				<YearGrid
					currentYear={etToday[0]}
					isYearDisabled={(year) =>
						(etBounds.minYear !== null && etBounds.minYear > year) ||
						(etBounds.maxYear !== null && etBounds.maxYear < year)
					}
					onSelect={(year) => {
						setShowYear(false);
						setEtToday(setEthiopianYear(year, etToday[1], etToday[2]));
					}}
				/>
			)}
		</div>
	);
};

export default EtPicker;
