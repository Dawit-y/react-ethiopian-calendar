import { forwardRef } from "react";
import dayjs from "dayjs";
import { toGregorian } from "ethiopian-date";
import { useRef } from "react";
import { FiCalendar } from "react-icons/fi";
import { checkLeapYear } from "../../utils/EthiopianCalendar";
import { checkLeapYearGc } from "../../utils/calendar";

const Input = forwardRef(({
  handleInputClick,
  date,
  setDate,
  handleDateChange,
  calendarTypeInt,
  style,
  disabled,
  onBlur
}, ref) => {
  const monthInputRef = useRef(null);
  const dayInputRef = useRef(null);
  const yearInputRef = useRef(null);

  const handleInputFocus = (e) => {
    e.target.select();
  };
  const handleInputMouseDown = (e) => {
    e.preventDefault();
    e.target.focus();
    e.target.select();
  };

  const properDateConverter = (year, month, day) => {
    if (!calendarTypeInt) {
      handleDateChange(
        dayjs()
          .year(year)
          .month(month - 1)
          .date(day)
          .startOf("day")
      );
    } else {
      const gcCalender = toGregorian(year, month, day);
      handleDateChange(
        dayjs()
          .year(gcCalender[0])
          .month(gcCalender[1] - 1)
          .date(gcCalender[2])
          .startOf("day")
      );
    }
  };
  const formatInputValue = (value) => {
    return value.padStart(2, "0");
  };
  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    if (value && value.length < 2 && name !== "year") {
      setDate({ ...date, [name]: formatInputValue(value) });
    }
  };

  const handleKeyDown = (e) => {
    // If the length of the input value is equal to the maxLength, prevent arrow keys from moving the cursor

    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (isNaN(value)) {
      return;
    }

    if (+value === 0 && value.length > 1) {
      return;
    }
    if (name === "day" && +date.month === 13 && calendarTypeInt && +value > 6) {
      return;
    }
    if (
      name === "month" &&
      +date.year &&
      +date.day &&
      +value > 12 &&
      +date.day > checkLeapYear(+date.year) &&
      calendarTypeInt
    ) {
      return;
    }

    // check 31 days for the month of January, March, May, July, August, October, December
    if (
      name === "day" &&
      (+date.month === 2 ||
        +date.month === 4 ||
        +date.month === 6 ||
        +date.month === 9 ||
        +date.month === 11) &&
      +value > 30 &&
      !calendarTypeInt
    ) {
      return;
    }
    if (name === "month" && +date.day && +date.day > 30 && !calendarTypeInt) {
      if (
        +value === 2 ||
        +value === 4 ||
        +value === 6 ||
        +value === 9 ||
        +value === 11
      ) {
        return;
      }
    }
    if (name === "month" && +value === 2 && !calendarTypeInt) {
      if (+date.day > 29) {
        return;
      }
      if (+date.day > 28 && !checkLeapYearGc(+date.year)) {
        return;
      }
    }
    if (name === "day" && +date.month === 2 && !calendarTypeInt) {
      if (+value > 29) {
        return;
      }
      if (+value > 28 && !checkLeapYearGc(+date.year)) {
        return;
      }
    }
    if (
      name === "year" &&
      +date.month === 2 &&
      !calendarTypeInt &&
      value.length === 4
    ) {
      if (+date.day > 29) {
        return;
      }
      if (+date.day > 28 && !checkLeapYearGc(+value)) {
        return;
      }
    }

    if (
      name === "day" &&
      +date.month === 13 &&
      calendarTypeInt &&
      +value > 5 &&
      +date.year !== ""
    ) {
      if (checkLeapYear(+date.year) < +value) {
        return;
      }
    }
    if (name === "month" && +value > 13 && calendarTypeInt) {
      return;
    }
    if (name === "month" && +value > 12 && !calendarTypeInt) {
      return;
    }
    if (name === "day" && +value > 30 && calendarTypeInt) {
      return;
    }
    if (name === "day" && +value > 31) {
      return;
    }
    setDate({ ...date, [name]: value });

    if (date.year.length === 4 && +date.month > 0 && +date.day > 0) {
      properDateConverter(+date.year, +date.month, +date.day);
    }
    if (
      name === "year" &&
      value.length === 4 &&
      +date.month > 0 &&
      +date.day > 0
    ) {
      properDateConverter(+value, +date.month, +date.day);
    }
    if (
      name === "month" &&
      +value > 0 &&
      date.year.length === 4 &&
      +date.day > 0
    ) {
      properDateConverter(+date.year, +value, +date.day);
    }
    if (
      name === "day" &&
      +value > 0 &&
      date.year.length === 4 &&
      +date.day > 0
    ) {
      properDateConverter(+date.year, +date.month, +value);
    }

    if (value.length > 0 && name !== "year") {
      if (name === "month" && +value > 1) {
        yearInputRef.current.focus();
      } else if (name === "day" && value > 3) {
        monthInputRef.current.focus();
      } else if (name === "month" && value.length === 2) {
        yearInputRef.current.focus();
      } else if (name === "day" && value.length === 2) {
        monthInputRef.current.focus();
      }
    }
  };
  return (
    <div
      className={`datePickerContainerEt`}
      style={{
        width: "100%",
        padding: "",
        ...style,
      }}
      ref={ref}
      disabled={disabled}
      onBlur={(e) => {
        handleInputBlur(e);
        onBlur?.(e);
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          opacity: disabled ? 0.6 : 1,
          pointerEvents: disabled ? 'none' : 'auto'
        }}
        onClick={(e) => {
          if (!disabled) {
            handleInputClick(e);
          }
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            width: "30%",
            minWidth: "150px"
          }}
        >
          <input
            ref={dayInputRef}
            autoComplete="off"
            type="text"
            value={date.day}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onMouseDown={handleInputMouseDown}
            onKeyDown={handleKeyDown}
            placeholder="DD"
            onBlur={(e) => {
              handleInputBlur(e);
              onBlur?.(e);
            }}
            maxLength="2"
            name="day"
            disabled={disabled}
            className="dateInputStyle"
            style={{
              flex: 1,
              minWidth: "20px",
              textAlign: "left",
              padding: 0,
              opacity: disabled ? 0.6 : 1,
              cursor: disabled ? 'not-allowed' : 'text'
            }}
          />
          <span>/</span>
          <input
            ref={monthInputRef}
            type="text"
            value={date.month}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={(e) => {
              handleInputBlur(e);
              onBlur?.(e);
            }}
            onMouseDown={handleInputMouseDown}
            onKeyDown={handleKeyDown}
            placeholder="MM"
            maxLength="2"
            name="month"
            disabled={disabled}
            autoComplete="off"
            className="dateInputStyle"
            style={{
              flex: 1,
              minWidth: "30px",
              textAlign: "left",
              padding: 0,
              opacity: disabled ? 0.6 : 1,
              cursor: disabled ? 'not-allowed' : 'text'
            }}
          />
          <span>/</span>
          <input
            ref={yearInputRef}
            type="text"
            value={date.year}
            onChange={handleInputChange}
            onMouseDown={handleInputMouseDown}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={(e) => {
              handleInputBlur(e);
              onBlur?.(e);
            }}
            placeholder="YYYY"
            maxLength="4"
            name="year"
            disabled={disabled}
            className="dateInputStyle"
            autoComplete="off"
            style={{
              flex: 2,
              minWidth: "30px",
              textAlign: "left",
              padding: 0,
              opacity: disabled ? 0.6 : 1,
              cursor: disabled ? 'not-allowed' : 'text'
            }}
          />
          {/* <span
            style={{
              fontSize: "12px",
              marginLeft: "4px",
            }}
          >
            {calendarTypeInt ? "ET" : "GC"}
          </span> */}
        </div>
        <div
          onClick={(e) => {
            if (!disabled) {
              handleInputClick(e);
            }
          }}
          style={{
            cursor: disabled ? 'not-allowed' : 'pointer',
            marginLeft: "8px",
            opacity: disabled ? 0.6 : 1
          }}
        >
          <FiCalendar className="calendarIcon" />
        </div>
      </div>
    </div>
  );
});

export default Input;
