import React, { useState } from "react";
import {
  Form,
  Button,
  Card,
  Container,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

const OtpPage = () => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const { verifyOtp } = useAuth();

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      
      if (value !== "" && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleOtpSubmit = async () => {
    setIsLoading(true);
    await verifyOtp(otp.join(""));
    setIsLoading(false);
  };

  return (
    <Container fluid className="otp-container d-flex justify-content-center align-items-center">
      <Row className="justify-content-center">
        <Col xs={12} md={12}>
          <Card className="p-4 shadow-lg otp-card">
            <Card.Body>
              <h2 className="text-center mb-4 text-primary fw-bold">Enter OTP</h2>

              <Form>
                <div className="d-flex justify-content-center mb-4">
                  {otp.map((value, index) => (
                    <Form.Control
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      value={value}
                      onChange={(e) => handleOtpChange(e, index)}
                      maxLength="1"
                      className="otp-input mx-2"
                      disabled={isLoading}
                      style={{ width: "50px", height: "50px", textAlign: "center", fontSize: "24px" }}
                    />
                  ))}
                </div>

                <Button
                  variant="primary"
                  className="w-100 fw-bold"
                  onClick={handleOtpSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner animation="border" size="sm" /> Verifying OTP...
                    </>
                  ) : (
                    "Submit OTP"
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OtpPage;
