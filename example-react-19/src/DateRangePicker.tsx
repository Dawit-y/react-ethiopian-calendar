import { useState } from "react";
import type { Dayjs } from "dayjs";
import { EtCalendar, type DateRangeValue } from "react-ethiopian-calendar";
import "react-ethiopian-calendar/style.css";
import { Label } from "reactstrap";
import type { FormikLike } from "./formik";

export interface DateRangePickerProps {
	isRequired?: boolean;
	validation?: FormikLike;
	componentId: string;
	minDate?: Date;
	maxDate?: Date;
	label?: string;
	disabled?: boolean;
}

function DateRangePicker({
	isRequired,
	validation,
	componentId,
	minDate,
	maxDate,
	label,
	disabled,
}: DateRangePickerProps) {
	const [selectedDateRange, setSelectedDateRange] = useState<DateRangeValue>({
		startDate: null,
		endDate: null,
	});

	const handleDateRangeChange = (value: Dayjs | DateRangeValue | null) => {
		// In range mode EtCalendar reports a { startDate, endDate } object (or an
		// empty one when cleared).
		const range: DateRangeValue =
			value && "startDate" in value ? value : { startDate: null, endDate: null };
		setSelectedDateRange(range);

		if (validation && componentId) {
			if (range.startDate && range.endDate) {
				const start = range.startDate.format("YYYY/MM/DD");
				const end = range.endDate.format("YYYY/MM/DD");
				validation.setFieldValue(componentId, `${start} - ${end}`, true);
			} else {
				validation.setFieldValue(componentId, "", true);
			}
		}
	};

	const hasError =
		validation?.touched?.[componentId] && validation?.errors?.[componentId];

	return (
		<>
			<Label>
				{label ?? componentId}{" "}
				{isRequired && <span className="text-danger">*</span>}
			</Label>
			<div className={hasError ? "is-invalid" : ""}>
				<EtCalendar
					onChange={handleDateRangeChange}
					onBlur={validation?.handleBlur}
					value={selectedDateRange}
					calendarType
					fullWidth
					lang="am"
					minDate={minDate}
					maxDate={maxDate}
					disabled={disabled}
					dateRange
					inputStyle={hasError ? { border: "1px solid #f46a6a" } : {}}
					primaryColor="#0c5c35"
				/>
			</div>
			{hasError && (
				<div className="text-danger small mt-1">
					{validation?.errors[componentId]}
				</div>
			)}
			{selectedDateRange.startDate && (
				<div className="mt-2">
					<small className="text-muted">
						Selected: {selectedDateRange.startDate.format("MM/DD/YYYY")}
						{selectedDateRange.endDate &&
							` to ${selectedDateRange.endDate.format("MM/DD/YYYY")}`}
					</small>
				</div>
			)}
		</>
	);
}

export default DateRangePicker;
