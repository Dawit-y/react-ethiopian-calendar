import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { toEthiopian } from "ethiopian-date";
import ElementPopper from "react-element-popper";
import "../../style/index.css";
import EtPicker from "./EtPicker.jsx";
import GcPicker from "./GcPicker.jsx";
import Input from "./Input.jsx";

const EtCalendar = React.forwardRef(({
  value,
  onChange,
  calendarType,
  minDate,
  maxDate,
  name,
  disabled = false,
  disableFuture = false,
  fullWidth,
  borderRadius,
  placeholder = false,
  lang,
  label = "Date",
  inputStyle
}, ref) => {
  let minDateIn = null;
  let maxDateIn = null;
  if (minDate) {
    minDateIn = new Date(minDate).setHours(0, 0, 0, 0);
  }
  if (maxDate) {
    maxDateIn = new Date(maxDate).setHours(0, 0, 0, 0);
  }

  const [calendarTypeInt, setCalendarTypeInt] = useState(
    calendarType === undefined || calendarType === null ? true : calendarType
  );

  const currentDate = dayjs();
  const etCurrentDate = toEthiopian(
    currentDate.year(),
    currentDate.month() + 1,
    currentDate.date()
  );

  const [today, setToday] = useState(currentDate);
  const [etToday, setEtToday] = useState(etCurrentDate);
  const [selectedDate, setSelectedDate] = useState(value);
  const [showCalendar, setShowCalendar] = useState(false);

  const calendarRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setCalendarTypeInt(
      calendarType === undefined || calendarType === null ? true : calendarType
    );
  }, [calendarType]);

  useEffect(() => {
    setSelectedDate(value);
  }, [value]);

  const days = ["S", "M", "T", "W", "T", "F", "S"];

  const isFutureDate = (date) =>
    new Date(date).getTime() > new Date().setHours(0, 0, 0, 0);

  const handleDateChange = (newDate) => {
    if (maxDateIn && newDate > dayjs(maxDateIn)) {
      newDate = dayjs(maxDateIn);
    } else if (minDateIn && newDate < dayjs(minDateIn)) {
      newDate = dayjs(minDateIn);
    }

    if (calendarTypeInt === true) {
      const ethiopianDay = toEthiopian(
        newDate.year(),
        newDate.month() + 1,
        newDate.date()
      );
      setEtToday(ethiopianDay);
      setDate({
        day: ethiopianDay[2] < 10 ? `0${ethiopianDay[2]}` : ethiopianDay[2],
        month: ethiopianDay[1] < 10 ? `0${ethiopianDay[1]}` : ethiopianDay[1],
        year: ethiopianDay[0] < 10 ? `0${ethiopianDay[0]}` : ethiopianDay[0],
      });
    } else {
      setDate({
        day: newDate.date() < 10 ? `0${newDate.date()}` : newDate.date(),
        month:
          newDate.month() + 1 < 10
            ? `0${newDate.month() + 1}`
            : newDate.month() + 1,
        year: newDate.year(),
      });
      setToday(newDate);
    }

    setSelectedDate(newDate);
    setShowCalendar(false);
    if (onChange) {
      onChange(newDate);
    }
  };

  const toggleCalendarType = (e) => {
    if (calendarTypeInt && selectedDate) {
      setDate({
        day:
          selectedDate.date() < 10
            ? `0${selectedDate.date()}`
            : selectedDate.date(),
        month:
          selectedDate.month() + 1 < 10
            ? `0${selectedDate.month() + 1}`
            : selectedDate.month() + 1,
        year: selectedDate.year(),
      });
    } else if (!calendarTypeInt && selectedDate) {
      const ethiopianDay = toEthiopian(
        selectedDate.year(),
        selectedDate.month() + 1,
        selectedDate.date()
      );
      setDate({
        day: ethiopianDay[2] < 10 ? `0${ethiopianDay[2]}` : ethiopianDay[2],
        month: ethiopianDay[1] < 10 ? `0${ethiopianDay[1]}` : ethiopianDay[1],
        year: ethiopianDay[0] < 10 ? `0${ethiopianDay[0]}` : ethiopianDay[0],
      });
    }
    e.stopPropagation();
    setShowCalendar(true);
    if (selectedDate) {
      setToday(selectedDate);
      const etSelected = toEthiopian(
        selectedDate.year(),
        selectedDate.month() + 1,
        selectedDate.date()
      );
      setEtToday(etSelected);
    } else {
      setToday(currentDate);
      setEtToday(etCurrentDate);
    }

    setCalendarTypeInt(!calendarTypeInt);
  };

  const handleInputClick = (event) => {
    event.stopPropagation();
    if (!showCalendar && selectedDate) {
      const valueDate = dayjs(selectedDate);
      if (calendarTypeInt) {
        const ethiopianDay = toEthiopian(
          valueDate.year(),
          valueDate.month() + 1,
          valueDate.date()
        );
        setEtToday(ethiopianDay);
      } else {
        setToday(valueDate);
      }
    }
    setShowCalendar((prev) => !prev);
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const [date, setDate] = useState(() => {
    if (!value) return { day: "", month: "", year: "" };

    const valueDateGc = dayjs(new Date(value));
    const valueDateEt = toEthiopian(
      valueDateGc.year(),
      valueDateGc.month() + 1,
      valueDateGc.date()
    );

    return {
      day: calendarTypeInt
        ? valueDateEt[2] < 10
          ? `0${valueDateEt[2]}`
          : valueDateEt[2]
        : valueDateGc.date() < 10
          ? `0${valueDateGc.date()}`
          : valueDateGc.date(),
      month: calendarTypeInt
        ? valueDateEt[1] < 10
          ? `0${valueDateEt[1]}`
          : valueDateEt[1]
        : valueDateGc.month() + 1 < 10
          ? `0${valueDateGc.month() + 1}`
          : valueDateGc.month() + 1,
      year: calendarTypeInt ? valueDateEt[0] : valueDateGc.year(),
    };
  });

  return (
    <div ref={ref} style={{ width: inputStyle?.width || (fullWidth ? "100%" : "auto") }}>
      <ElementPopper
        ref={calendarRef}
        zIndex={1000}
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
            date={date}
            setDate={setDate}
            handleDateChange={handleDateChange}
            calendarTypeInt={calendarTypeInt}
            showCalendar={showCalendar}
            style={inputStyle}
          />
        }
        popper={
          showCalendar && (
            <div style={{ width: inputStyle?.width || "100%", minWidth: "320px" }}>
              <div>
                <div className="Cal" style={{ width: "100%", minWidth: "320px" }}>
                  {calendarTypeInt === true && (
                    <EtPicker
                      minDateIn={minDateIn}
                      maxDateIn={maxDateIn}
                      selectedDate={selectedDate}
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
                    />
                  )}
                  {calendarTypeInt === false && (
                    <GcPicker
                      minDateIn={minDateIn}
                      maxDateIn={maxDateIn}
                      selectedDate={selectedDate}
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
                    />
                  )}
                </div>
              </div>
            </div>
          )
        }
        active={showCalendar}
        position="bottom-start"
      />
    </div>
  );
});

EtCalendar.displayName = 'EtCalendar';

export { EtCalendar };
