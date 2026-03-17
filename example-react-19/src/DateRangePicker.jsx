import { useState } from 'react';
import { EtCalendar } from 'react-ethiopian-calendar';
import 'react-ethiopian-calendar/src/style/index.css';
import { Label } from 'reactstrap';

function DateRangePicker({
    isRequired,
    validation,
    componentId,
    minDate,
    maxDate,
    label,
    disabled
}) {
    const [selectedDateRange, setSelectedDateRange] = useState({ startDate: null, endDate: null });

    const handleDateRangeChange = (dateRange) => {
        setSelectedDateRange(dateRange);

        // If using with formik validation, you can format the range for the form
        if (validation && componentId) {
            if (dateRange.startDate && dateRange.endDate) {
                const startFormatted = dateRange.startDate.format('YYYY/MM/DD');
                const endFormatted = dateRange.endDate.format('YYYY/MM/DD');
                validation.setFieldValue(componentId, `${startFormatted} - ${endFormatted}`, true);
            } else {
                validation.setFieldValue(componentId, '', true);
            }
        }
    };

    const hasError = validation?.touched?.[componentId] && validation?.errors?.[componentId];

    return (
			<>
				<Label>
					{label ? label : componentId}{" "}
					{isRequired && <span className="text-danger">*</span>}
				</Label>
				<div className={hasError ? "is-invalid" : ""}>
					<EtCalendar
						onChange={handleDateRangeChange}
						onBlur={validation?.handleBlur}
						value={selectedDateRange}
						calendarType={true}
						lang="am"
						minDate={minDate}
						maxDate={maxDate}
						disabled={disabled}
						dateRange={true}
						inputStyle={hasError ? { border: "1px solid #f46a6a" } : {}}
						primaryColor="#0c5c35"
					/>
				</div>
				{hasError && (
					<div className="text-danger small mt-1">
						{validation.errors[componentId]}
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
