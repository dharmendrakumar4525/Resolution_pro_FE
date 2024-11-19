import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

import {
  Form,
  Button,
  Card,
  Container,
  Alert,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (e) {
      toast.error(e.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container
      fluid
      className="login-container d-flex justify-content-center align-items-center"
    >
      <Row className="justify-content-center ">
        <Col xs={12} md={12} lg={12}>
          <Card className="p-2 shadow-lg" style={{ borderRadius: "15px" }}>
            <Card.Body>
              <h2 className="text-center mb-4 text-primary fw-bold">Login</h2>
              {error && (
                <Alert variant="danger" className="text-center">
                  {error}
                </Alert>
              )}

              <Form>
                <Form.Group controlId="email" className="mb-3">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="form-control-custom"
                    style={{ width: "300px" }}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="password" className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="form-control-custom"
                    required
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  className="w-100 mt-3 fw-bold"
                  onClick={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner animation="border" size="sm" /> Logging in...
                    </>
                  ) : (
                    "Login"
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

export default LoginPage;
