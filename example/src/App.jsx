import React, { useState } from 'react';
import { EtCalendar } from 'react-ethiopian-calendar';
import { Container, Row, Col, Card, CardBody, CardTitle, Input } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [date, setDate] = useState(new Date("2025-06-19"));
  return (
    <Container className="py-4">
      <h1 className="mb-4">React Ethiopian Calendar Examples</h1>

      <Row>
        <Col md={12} className="mb-4">
          <Card>
            <CardBody>
              <CardTitle tag="h5">Custom Styling with Col</CardTitle>
              <Row>
                <Col md={4}>
                  <EtCalendar
                    value={date}
                    onChange={setDate}
                    calendarType={true}
                    lang="am"
                    minDate={new Date("2025-05-15")}
                    maxDate={new Date("2025-06-20")}
                  // inputStyle={{ border: "1px solid red" }}
                  />
                </Col>
                <Col md={4}>
                  <Input
                    type='text'
                  />
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
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
      </Row>
    </Container>
  );
}

export default App; 