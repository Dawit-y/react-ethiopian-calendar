import { useState } from "react"
import { useFormik } from 'formik';
import DatePicker from './DatePicker';
import DateRangePicker from './DateRangePicker';
import * as Yup from 'yup';
import { Container, Row, Col, Card, CardBody, CardTitle, Input, Label, FormFeedback, Button, Form, Modal, ModalBody, InputGroup } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { EtCalendar } from 'react-ethiopian-calendar';
import './styles.css';  // Import the custom styles

function App() {
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    date: Yup.string().required('Date is required'),
    dateRange: Yup.string().required('Date range is required'),
  });
  const initialValues = {
    name: '',
    date: '',
    dateRange: '',
  };

  const validation = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      console.log(values);
    },
  });

  // Sample search parameters for testing
  const [searchParams, setSearchParams] = useState({});
  const [textValue, setTextValue] = useState('');
  const [selectValue, setSelectValue] = useState('');

  const handleSearchKey = (key, value) => {
    setSearchParams(prev => ({ ...prev, [key]: value }));
  };

  const inputStyles = { width: "100%", maxWidth: "100%" };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Ethiopian Calendar Examples (React 19)</h1>

      {/* Advanced Search Grid Layout Test */}
      <Row className="mb-4">
        <Col>
          <Card>
            <CardBody>
              <CardTitle tag="h5">Advanced Search Grid Layout Test</CardTitle>
              <p className="text-muted mb-3">
                Testing the EtCalendar date range component in a grid layout similar to AdvancedSearch component
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "1rem",
                }}
              >
                {/* Text Input */}
                <div>
                  <Label>Text Search</Label>
                  <Input
                    type="text"
                    placeholder="Search text"
                    value={textValue}
                    onChange={(e) => {
                      setTextValue(e.target.value);
                      handleSearchKey('textSearch', e.target.value);
                    }}
                    style={inputStyles}
                  />
                </div>

                {/* Dropdown Input */}
                <div>
                  <Label>Dropdown Search</Label>
                  <Input
                    type="select"
                    value={selectValue}
                    onChange={(e) => {
                      setSelectValue(e.target.value);
                      handleSearchKey('dropdownSearch', e.target.value);
                    }}
                    style={inputStyles}
                  >
                    <option value="">Select option</option>
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                  </Input>
                </div>

                {/* Date Range Input - This is what we're testing */}
                <div>
                  <Label>Date Range (Ethiopian)</Label>
                  <EtCalendar
                    calendarType={true}
                    lang="am"
                    dateRange={true}
                    placeholder="Select date something"
                    onChange={(dateRange) => {
                      console.log('Selected date range:', dateRange);
                      if (dateRange && dateRange.startDate && dateRange.endDate) {
                        handleSearchKey('date_start', dateRange.startDate.format('YYYY-MM-DD'));
                        handleSearchKey('date_end', dateRange.endDate.format('YYYY-MM-DD'));
                      } else {
                        handleSearchKey('date_start', '');
                        handleSearchKey('date_end', '');
                      }
                    }}
                    style={inputStyles}
                  />
                </div>

                {/* Another Text Input */}
                <div>
                  <Label>Another Text Field</Label>
                  <Input
                    type="text"
                    placeholder="Another field"
                    style={inputStyles}
                    onChange={(e) => handleSearchKey('anotherField', e.target.value)}
                  />
                </div>
                {/* Another Text Input */}
                <div>
                  <Label>Another Text Field</Label>
                  <Input
                    type="text"
                    placeholder="Another field"
                    style={inputStyles}
                    onChange={(e) => handleSearchKey('anotherField', e.target.value)}
                  />
                </div>
                {/* Another Text Input */}
                <div>
                  <Label>Another Text Field</Label>
                  <Input
                    type="text"
                    placeholder="Another field"
                    style={inputStyles}
                    onChange={(e) => handleSearchKey('anotherField', e.target.value)}
                  />
                </div>
                {/* Another Text Input */}
                <div>
                  <Label>Another Text Field</Label>
                  <Input
                    type="text"
                    placeholder="Another field"
                    style={inputStyles}
                    onChange={(e) => handleSearchKey('anotherField', e.target.value)}
                  />
                </div>
                {/* Another Text Input */}
                <div>
                  <Label>Another Text Field</Label>
                  <Input
                    type="text"
                    placeholder="Another field"
                    style={inputStyles}
                    onChange={(e) => handleSearchKey('anotherField', e.target.value)}
                  />
                </div>
              </div>

              {/* Search Parameters Display */}
              <div className="mt-3 p-3 bg-light rounded">
                <h6>Current Search Parameters:</h6>
                <pre className="mb-0">
                  {JSON.stringify(searchParams, null, 2)}
                </pre>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Single Date Picker Example */}
      <Row className="mb-4">
        <Col>
          <Card>
            <CardBody>
              <CardTitle tag="h5">Single Date Picker</CardTitle>
              <DatePicker
                validation={validation}
                componentId="date"
                label="Select Date"
                isRequired={true}
                disabled={false}
                minDate={new Date("2020-01-01")}
                maxDate={new Date("2030-12-31")}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Date Range Picker Example */}
      <Row className="mb-4">
        <Col>
          <Card>
            <CardBody>
              <CardTitle tag="h5">Date Range Picker</CardTitle>
              <DateRangePicker
                validation={validation}
                componentId="dateRange"
                label="Select Date Range"
                isRequired={true}
                disabled={false}
                minDate={new Date("2020-01-01")}
                maxDate={new Date("2030-12-31")}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Form Example */}
      <Row className="mb-4">
        <Col>
          <Card>
            <CardBody>
              <CardTitle tag="h5">Form with Both Pickers</CardTitle>
              <Button color="success" onClick={toggle}>Open Form Modal</Button>
              <Modal isOpen={modal} toggle={toggle} className='custom-modal-xl'>
                <ModalBody>
                  <Row>
                    <Col md={12} className="mb-4">
                      <Card>
                        <CardBody>
                          <CardTitle tag="h5">Form with Date Pickers</CardTitle>
                          <Form onSubmit={validation.handleSubmit}>
                            <Row>
                              <Col className="col-md-6 mb-3">
                                <DatePicker
                                  validation={validation}
                                  componentId="date"
                                  label="Single Date"
                                  isRequired={true}
                                  disabled={false}
                                  minDate={new Date("2020-01-01")}
                                  maxDate={new Date("2030-12-31")}
                                />
                              </Col>
                              <Col className="col-md-6 mb-3">
                                <DateRangePicker
                                  validation={validation}
                                  componentId="dateRange"
                                  label="Date Range"
                                  isRequired={true}
                                  disabled={false}
                                  minDate={new Date("2020-01-01")}
                                  maxDate={new Date("2030-12-31")}
                                />
                              </Col>
                            </Row>
                            <Row>
                              <Col className="col-md-6 mb-3">
                                <Label>
                                  {"Name"}
                                  <span className="text-danger">*</span>
                                </Label>
                                <Input
                                  name="name"
                                  type="text"
                                  placeholder={"Name"}
                                  onChange={validation.handleChange}
                                  onBlur={validation.handleBlur}
                                  value={validation.values.name || ""}
                                  invalid={
                                    validation.touched.name &&
                                      validation.errors.name
                                      ? true
                                      : false
                                  }
                                  maxLength={20}
                                />
                                {validation.touched.name &&
                                  validation.errors.name ? (
                                  <FormFeedback type="invalid">
                                    {validation.errors.name}
                                  </FormFeedback>
                                ) : null}
                              </Col>
                            </Row>
                            <Button className='mt-3' color="primary" type="submit" >Submit</Button>
                          </Form>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                </ModalBody>
              </Modal>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Direct Usage Example */}
      <Row className="mb-4">
        <Col>
          <Card>
            <CardBody>
              <CardTitle tag="h5">Direct Component Usage</CardTitle>
              <Row>
                <Col md={6}>
                  <Label>Single Date (Ethiopian Calendar)</Label>
                  <EtCalendar
                    calendarType={true}
                    lang="am"
                    placeholder="Select date"
                    onChange={(date) => console.log('Selected date:', date)}
                  />
                </Col>
                <Col md={6}>
                  <Label>Date Range (Ethiopian Calendar)</Label>
                  <EtCalendar
                    calendarType={true}
                    lang="am"
                    dateRange={true}
                    placeholder="Pick a Period ..."
                    onChange={(dateRange) => console.log('Selected date range:', dateRange)}
                  />
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
