import { useEffect, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { EtCalendar, type DateRangeValue } from "react-ethiopian-calendar";
import "react-ethiopian-calendar/style.css";
import { Label } from "reactstrap";
import type { FormikLike } from "./formik";

/** Convert a Dayjs (single-mode onChange value) to a "yyyy/mm/dd" string. */
function formatDate(value: Dayjs | DateRangeValue | null): string {
	if (!value || !dayjs.isDayjs(value)) return "";
	return value.format("YYYY/MM/DD");
}

/** Convert a "yyyy/mm/dd" string back to a Date for the controlled value. */
function parseDateString(dateStr: string): Date | null {
	if (!dateStr) return null;
	const parsed = new Date(dateStr.replace(/\//g, "-"));
	return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export interface EtDatePickerProps {
	isRequired?: boolean;
	validation: FormikLike;
	componentId: string;
	minDate?: Date;
	maxDate?: Date;
	label?: string;
	disabled?: boolean;
}

function EtDatePicker({
	isRequired,
	validation,
	componentId,
	minDate,
	maxDate,
	label,
	disabled,
}: EtDatePickerProps) {
	const rawValue = validation?.values?.[componentId] ?? "";
	const [selectedDate, setSelectedDate] = useState<Date | null>(
		parseDateString(rawValue),
	);

	useEffect(() => {
		setSelectedDate(parseDateString(rawValue));
	}, [rawValue]);

	const hasError =
		validation?.touched?.[componentId] && validation?.errors?.[componentId];

	const handleDateChange = (value: Dayjs | DateRangeValue | null) => {
		const formatted = formatDate(value);
		validation.setFieldValue(componentId, formatted, true);
		setSelectedDate(formatted && dayjs.isDayjs(value) ? value.toDate() : null);
	};

	return (
		<>
			<Label>
				{label ?? componentId}{" "}
				{isRequired && <span className="text-danger">*</span>}
			</Label>
			<div className={hasError ? "is-invalid" : ""}>
				<EtCalendar
					key={selectedDate ? selectedDate.toISOString() : "null"}
					onChange={handleDateChange}
					onBlur={validation.handleBlur}
					value={selectedDate}
					calendarType
					fullWidth
					lang="am"
					minDate={minDate}
					maxDate={maxDate}
					disabled={disabled}
					inputStyle={hasError ? { border: "1px solid #f46a6a" } : {}}
					primaryColor="#e85d04"
				/>
			</div>
			{hasError && (
				<div className="text-danger small mt-1">
					{validation.errors[componentId]}
				</div>
			)}
		</>
	);
}

export default EtDatePicker;
