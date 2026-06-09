import { useFormik } from "formik";
import * as Yup from "yup";
import {
	Container,
	Row,
	Col,
	Card,
	CardBody,
	CardTitle,
	Input,
	Label,
	FormFeedback,
	Button,
	Form,
} from "reactstrap";
import { EtCalendar } from "react-ethiopian-calendar";
import "react-ethiopian-calendar/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import DatePicker from "./DatePicker";
import DateRangePicker from "./DateRangePicker";
import type { FormikLike } from "./formik";

interface FormValues {
	date: string;
	dateRange: string;
	name: string;
}

function App() {
	const validation = useFormik<FormValues>({
		initialValues: { date: "", dateRange: "", name: "" },
		validationSchema: Yup.object({
			date: Yup.string().required("Date is required"),
			dateRange: Yup.string().required("Date range is required"),
			name: Yup.string().required("Name is required"),
		}),
		onSubmit: (values) => {
			console.log("Submitted:", values);
			window.alert(JSON.stringify(values, null, 2));
		},
	});
	const formik = validation as unknown as FormikLike;

	return (
		<Container className="py-4" style={{ maxWidth: 860 }}>
			<h1 className="mb-1">React Ethiopian Calendar</h1>
			<p className="text-muted mb-4">
				Single-date and date-range pickers with Formik integration.
			</p>

			<Card className="mb-4">
				<CardBody>
					<CardTitle tag="h5" className="mb-3">
						Form integration (Formik)
					</CardTitle>
					<Form onSubmit={validation.handleSubmit}>
						<Row>
							<Col md={6} className="mb-3">
								<DatePicker
									validation={formik}
									componentId="date"
									label="Single Date"
									isRequired
									minDate={new Date("2020-01-01")}
									maxDate={new Date("2030-12-31")}
								/>
							</Col>
							<Col md={6} className="mb-3">
								<DateRangePicker
									validation={formik}
									componentId="dateRange"
									label="Date Range"
									isRequired
									minDate={new Date("2020-01-01")}
									maxDate={new Date("2030-12-31")}
								/>
							</Col>
						</Row>
						<Row>
							<Col md={6} className="mb-3">
								<Label>
									Name<span className="text-danger">*</span>
								</Label>
								<Input
									name="name"
									type="text"
									placeholder="Name"
									onChange={validation.handleChange}
									onBlur={validation.handleBlur}
									value={validation.values.name || ""}
									invalid={!!(validation.touched.name && validation.errors.name)}
									maxLength={20}
								/>
								{validation.touched.name && validation.errors.name ? (
									<FormFeedback>{validation.errors.name}</FormFeedback>
								) : null}
							</Col>
						</Row>
						<Button color="primary" type="submit">
							Submit
						</Button>
					</Form>
				</CardBody>
			</Card>

			<Card className="mb-4">
				<CardBody>
					<CardTitle tag="h5" className="mb-3">
						Input field sizes
					</CardTitle>
					<p className="text-muted">
						The <code>size</code> prop changes the input field height only
						(<code>sm</code> / <code>md</code> / <code>lg</code>); the calendar
						number grid stays the same. Defaults to <code>md</code>.
					</p>
					<Row>
						<Col md={4} className="mb-3">
							<Label>Small (sm)</Label>
							<EtCalendar
								size="sm"
								lang="am"
								fullWidth
								placeholder="Select date"
								onChange={(d) => console.log("sm:", d)}
							/>
						</Col>
						<Col md={4} className="mb-3">
							<Label>Medium (md, default)</Label>
							<EtCalendar
								size="md"
								lang="am"
								fullWidth
								placeholder="Select date"
								onChange={(d) => console.log("md:", d)}
							/>
						</Col>
						<Col md={4} className="mb-3">
							<Label>Large (lg)</Label>
							<EtCalendar
								size="lg"
								lang="am"
								fullWidth
								placeholder="Select date"
								onChange={(d) => console.log("lg:", d)}
							/>
						</Col>
					</Row>
					<Row>
						<Col md={6} className="mb-3">
							<Label>Range picker — small</Label>
							<EtCalendar
								size="sm"
								dateRange
								lang="en"
								fullWidth
								placeholder="Select range"
								onChange={(d) => console.log("range sm:", d)}
							/>
						</Col>
						<Col md={6} className="mb-3">
							<Label>Range picker — large</Label>
							<EtCalendar
								size="lg"
								dateRange
								lang="en"
								fullWidth
								placeholder="Select range"
								onChange={(d) => console.log("range lg:", d)}
							/>
						</Col>
					</Row>
				</CardBody>
			</Card>

			<Card>
				<CardBody>
					<CardTitle tag="h5" className="mb-3">
						Direct usage — calendar type & theming
					</CardTitle>
					<Row>
						<Col md={6} className="mb-3">
							<Label>Ethiopian (custom color)</Label>
							<EtCalendar
								calendarType
								lang="am"
								fullWidth
								allowCalendarSwap
								placeholder="Select date"
								primaryColor="#0c5c35"
								onChange={(d) => console.log("Ethiopian date:", d)}
							/>
						</Col>
						<Col md={6} className="mb-3">
							<Label>Gregorian</Label>
							<EtCalendar
								calendarType={false}
								lang="en"
								fullWidth
								allowCalendarSwap
								placeholder="Select date"
								onChange={(d) => console.log("Gregorian date:", d)}
							/>
						</Col>
					</Row>
				</CardBody>
			</Card>
		</Container>
	);
}

export default App;
