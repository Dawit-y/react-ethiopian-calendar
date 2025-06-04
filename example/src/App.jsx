import { useState } from "react"
import { useFormik } from 'formik';
import DatePicker from './DatePicker';
import * as Yup from 'yup';
import { Container, Row, Col, Card, CardBody, CardTitle, Input, Label, FormFeedback, Button, Form, Modal, ModalBody } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { convertToEthiopian } from 'react-ethiopian-calendar';
import './styles.css';  // Import the custom styles

function App() {
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    date: Yup.string().required('Date is required'),
  });
  const initialValues = {
    name: '',
    date: '',
  };


  const validation = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      console.log(values);
    },
  });

  console.log("ethio date", convertToEthiopian("2025-05-29"))
  console.log("ethio date", convertToEthiopian("2025-05-20"))
  console.log("ethio date", convertToEthiopian("2025-06-02"))

  return (
    <Container className="py-4">
      <h1 className="mb-4"> Examples</h1>
      <Button color="success" onClick={toggle}>Open Modal</Button>
      <Modal isOpen={modal} toggle={toggle} className='custom-modal-xl'>
        <ModalBody>
          <Row>
            <Col md={12} className="mb-4">
              <Card>
                <CardBody>
                  <CardTitle tag="h5">Custom Styling with Col</CardTitle>
                  <Form onSubmit={validation.handleSubmit}>
                    <Row>
                      <Col className="col-md-6 mb-3">
                        <DatePicker
                          validation={validation}
                          componentId="date"
                          label="Date"
                          isRequired={true}
                          disabled={false}
                          minDate={new Date("2027-06-20")}
                          maxDate={new Date("2025-07-02")}
                        />
                      </Col>
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
      {/* <Row className="mt-4">
        <Col>
          <Card>
            <CardBody>
              <CardTitle tag="h5">Selected Date:</CardTitle>
              <pre className="bg-light p-3 rounded">
                {date ? new Date(date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  timeZone: 'Africa/Addis_Ababa'
                }) : 'No date selected'}
              </pre>
            </CardBody>
          </Card>
        </Col>
      </Row> */}
    </Container>
  );
}

export default App; 