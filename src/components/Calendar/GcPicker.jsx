import { useEffect, useRef, useState } from "react";
import { generateDate, months } from "../../utils/calendar";
import { GrFormNext, GrFormPrevious, GrNext, GrPrevious } from "react-icons/gr";
import cn from "../../utils/cn";
import dayjs from "dayjs";

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
}) => {
  const [showYear, setShowYear] = useState(false);
  const yearsContainerRef = useRef(null);
  const currentYearRef = useRef(null);

  useEffect(() => {
    if (yearsContainerRef.current && currentYearRef.current) {
      const yearItemOffsetTop = currentYearRef.current.offsetTop;
      const yearItemHeight = currentYearRef.current.offsetHeight;
      const containerHeight = yearsContainerRef.current.offsetHeight;

      // Scroll to the current year so that it is in the center of the container
      yearsContainerRef.current.scrollTop =
        yearItemOffsetTop - containerHeight / 2 + yearItemHeight / 2;
    }
  }, [showYear]);

  // Helper function to determine if a date is within the selected range
  const isDateInRange = (date) => {
    if (!dateRange || !selectedDateRange?.startDate || !selectedDateRange?.endDate) {
      return false;
    }

    try {
      const dateObj = dayjs(date);
      const startDate = dayjs(selectedDateRange.startDate);
      const endDate = dayjs(selectedDateRange.endDate);

      // Check if all dates are valid
      if (!dateObj.isValid() || !startDate.isValid() || !endDate.isValid()) {
        return false;
      }

      return dateObj.isSameOrAfter(startDate, 'day') && dateObj.isSameOrBefore(endDate, 'day');
    } catch (error) {
      console.warn('Error checking date range:', error);
      return false;
    }
  };

  // Helper function to determine if a date is the start or end of the range
  const getRangePosition = (date) => {
    if (!dateRange || !selectedDateRange?.startDate || !selectedDateRange?.endDate) {
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

      if (dateObj.isSame(startDate, 'day')) return 'start';
      if (dateObj.isSame(endDate, 'day')) return 'end';
      return null;
    } catch (error) {
      console.warn('Error checking range position:', error);
      return null;
    }
  };

  return (
    <>
      <div className="calendarContainerEt">
        <div className="topActions">
          <span>
            <button
              onClick={(e) => toggleCalendarType(e)}
              className="buttonBackgroundEn buttonStyle"
            />
            <span
              style={{ cursor: "pointer" }}
              onClick={() => setShowYear(!showYear)}
            >
              {months[today.month()]}, {today.year()}
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
              <span
                onClick={() => setToday(currentDate)}
                className="todayButton"
              >
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
            {" "}
            <div className="gridSevenEt w-fullEt">
              {days.map((day, index) => {
                return (
                  <span key={index} className="rowHeight dayOfWeek centerGrid">
                    {day}
                  </span>
                );
              })}
            </div>
            <div className=" gridSevenEt w-fullEt">
              {generateDate(today.month(), today.year()).map(
                ({ date, isCurrentMonth, today }, index) => {
                  const disableFutureDate = disableFuture && isFutureDate(date);

                  const isSelectedDate =
                    selectedDate &&
                    new Date(selectedDate).getTime() ===
                    new Date(date).getTime();

                  // Date range logic
                  const isInRange = isDateInRange(date);
                  const rangePosition = getRangePosition(date);
                  const isRangeStart = rangePosition === 'start';
                  const isRangeEnd = rangePosition === 'end';

                  return (
                    <span
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
                      key={index}
                      className="rowHeight dayText rowHeight centerGrid borderTop"
                    >
                      <span
                        className={cn(
                          isCurrentMonth ? "" : "grayText",
                          minDateIn && minDateIn >= date ? "grayText" : "",
                          maxDateIn && maxDateIn <= date ? "grayText" : "",
                          disabled ? "grayText" : "",
                          disableFutureDate ? "grayText" : "",
                          today && !isSelectedDate && !isInRange ? "backgroundBlue " : "",
                          "dateWidthAndHeight centerGrid",
                          isCurrentMonth ? "currentMonth" : "",
                          isSelectedDate ? "selectedDate" : "",
                          // Date range styling
                          isInRange ? "dateInRange" : "",
                          isRangeStart ? "rangeStart" : "",
                          isRangeEnd ? "rangeEnd" : ""
                        )}
                      >
                        {date.date()}
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
                  const isCurrentYear = today.year() === year;

                  if (minDateIn && new Date(minDateIn).getFullYear() > year)
                    return null;
                  if (maxDateIn && new Date(maxDateIn).getFullYear() < year)
                    return null;
                  return (
                    <div
                      key={year}
                      ref={isCurrentYear ? currentYearRef : null}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowYear(false);
                        setToday(today.year(year));
                      }}
                      className={cn(
                        "yearItem",
                        isCurrentYear ? "backgroundBlue" : ""
                      )}
                      style={{
                        padding: "5px",
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

export default GcPicker;
