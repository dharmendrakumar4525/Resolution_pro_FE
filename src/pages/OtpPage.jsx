import React, { useEffect, useState } from "react";
import {
  Form,
  Button,
  Card,
  Container,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import OTPInput from "otp-input-react";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";

const OtpPage = () => {
  const [OTP, setOTP] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { verifyOtp } = useAuth();

  const handleOtpSubmit = async () => {
    setIsLoading(true);
    try {
      await verifyOtp(OTP);
    } catch (error) {
      // toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container
      fluid
      className="otp-container d-flex justify-content-center align-items-center"
    >
      <Row className="justify-content-center">
        <Col xs={12} md={12}>
          <Card className="p-4 shadow-lg otp-card">
            <Card.Body>
              <h2 className="text-center mb-4 text-primary fw-bold">
                Enter OTP
              </h2>
              <Form>
                <div className="d-flex justify-content-center p-4">
                  <OTPInput
                    style={{ display: "flex", justifyContent: "center" }}
                    value={OTP}
                    onChange={setOTP}
                    autoFocus
                    OTPLength={6}
                    otpType="number"
                    disabled={false}
                  />
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
      <ToastContainer />
    </Container>
  );
};

export default OtpPage;
