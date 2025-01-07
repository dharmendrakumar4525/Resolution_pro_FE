// CustomerMaintenanceForm.js

import React, { useEffect, useState } from "react";
import { Form, Button, Row, Col, Container, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { apiURL } from "../API/api";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
export default function CustomerMaintenanceForm() {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const [managers, setManagers] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [validated, setValidated] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const token = localStorage.getItem("refreshToken");
  const [formData, setFormData] = useState({
    company_name: "",
    date_of_incorporation: "",
    registered_address: "",
    cin: "",
    email_id: "",
    date_of_last_agm: null,
    registration_number: "",
    authorised_capital_equity: "",
    authorised_capital_preference_capital: "",
    paid_up_capital_equity: "",
    paid_up_capital_preference_capital: "",
    company_subcategory: "",
    roc_code: "",
    date_of_balance_sheet: null,
    class_of_company: "",
    pan: "",
    secretary_detail: {
      name: null,
      email: null,
    },
    auditor_detail: {
      name: null,
      email: null,
    },
    alloted_consultant: "",
    alloted_manager: "",
  });

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await fetch(
          `${apiURL}/users?role=672c47cb38903b464c9d2923`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setManagers(data.results);
      } catch (error) {
        console.error("Error fetching managers:", error);
      }
    };
    fetchManagers();
  }, []);
  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        const response = await fetch(
          `${apiURL}/users?role=6728ae3b6177fee637232a73`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setConsultants(data.results);
      } catch (error) {
        console.error("Error fetching managers:", error);
      }
    };
    fetchConsultants();
  }, []);
  // Fetch customer data if editing
  useEffect(() => {
    if (customerId) {
      const fetchCustomerData = async () => {
        try {
          const response = await fetch(
            `${apiURL}/customer-maintenance/${customerId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          const data = await response.json();
          console.log(data, "unfilterred");
          setFormData(data);
        } catch (error) {
          console.error("Error fetching customer data:", error);
          toast.error("Failed to load customer data");
        }
      };
      fetchCustomerData();
    }
  }, [customerId]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleAuditorChange = (field, value) => {
    if (value == "") {
      value = null;
    }
    setFormData((prevData) => ({
      ...prevData,
      auditor_detail: { ...prevData.auditor_detail, [field]: value },
    }));
  };

  const handleSecretaryChange = (field, value) => {
    if (value == "") {
      value = null;
    }
    setFormData((prevData) => ({
      ...prevData,
      secretary_detail: { ...prevData.secretary_detail, [field]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonLoading(true);
    const incorporationDate = new Date(formData?.date_of_incorporation);
    const lastAGMDate = new Date(formData?.date_of_last_agm);
    const bsDate = new Date(formData?.date_of_balance_sheet);
    if (
      parseFloat(formData.paid_up_capital_equity) >
      parseFloat(formData.authorised_capital_equity)
    ) {
      toast.error(
        "Paid-up capital (Equity) cannot be more than the Authorized capital (Equity) of the Company."
      );
      setButtonLoading(false);
      return;
    }

    if (
      parseFloat(formData.paid_up_capital_preference_capital) >
      parseFloat(formData.authorised_capital_preference_capital)
    ) {
      toast.error(
        "Paid-up capital (Preference) cannot be more than the Authorized capital (Preference) of the Company."
      );
      setButtonLoading(false);
      return;
    }
    if (lastAGMDate <= incorporationDate) {
      toast.error("Date of Last AGM must be after the Date of Incorporation.");
      setButtonLoading(false);
      return;
    }

    if (bsDate <= incorporationDate) {
      toast.error(
        "Balance Sheet Date must be after the Date of Incorporation."
      );
      setButtonLoading(false);
      return;
    }
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
    } else {
      const updatedFormData = {
        ...formData,
        alloted_manager: formData?.alloted_manager?.id || null,
        alloted_consultant: formData?.alloted_consultant?.id || null,
      };
      try {
        const dataToSubmit = { ...updatedFormData };
        delete dataToSubmit.createdAt;
        delete dataToSubmit.updatedAt;
        delete dataToSubmit.id;

        const token = localStorage.getItem("refreshToken");
        const method = customerId ? "PATCH" : "POST";
        const endpoint = customerId
          ? `${apiURL}/customer-maintenance/${customerId}`
          : `${apiURL}/customer-maintenance`;

        const requestConfig = {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        };

        if (customerId) {
          requestConfig.body = JSON.stringify(dataToSubmit);
        } else {
          requestConfig.body = JSON.stringify(updatedFormData);
        }
        const response = await fetch(endpoint, requestConfig);

        if (!response.ok) {
          const errorMessage = await response
            .json()
            .then((data) => data.message || "Failed to save customer data");
          toast.error(errorMessage);
          return;
        }

        toast.success(
          `Customer ${customerId ? "updated" : "added"} successfully`
        );
        navigate("/client-records");
      } catch (error) {
        console.error("Error saving customer data:", error);
        toast.error("Failed to save customer data");
      } finally {
        setButtonLoading(false); // Hide button spinner
      }
    }
    setValidated(true);
  };
  console.log(formData, "ds");
  return (
    <Container>
      <div className="customer-form-container mt-4">
        <h2 className="mb-4">{customerId ? "Edit Client" : "Add Client"}</h2>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="company_name">
                <Form.Label>
                  Company Name<sup>*</sup>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData?.company_name}
                  onChange={handleChange}
                  placeholder="Enter Company Name"
                  required
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="pan">
                <Form.Label>
                  PAN <sup>*</sup>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData?.pan}
                  onChange={handleChange}
                  placeholder="Enter PAN"
                  required
                />
              </Form.Group>
            </Col>

            <Col>
              <Form.Group controlId="registered_address">
                <Form.Label>
                  Registered Address<sup>*</sup>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData?.registered_address}
                  onChange={handleChange}
                  placeholder="Enter Registered Address"
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="registration_number">
                <Form.Label>
                  Registeration Number<sup>*</sup>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData?.registration_number}
                  onChange={handleChange}
                  placeholder="Enter Registeration Number"
                  required
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="roc_code">
                <Form.Label>
                  ROC Code<sup>*</sup>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData?.roc_code}
                  onChange={handleChange}
                  placeholder="Enter ROC Code"
                  required
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="company_subcategory">
                <Form.Label>
                  Company Subcategory<sup>*</sup>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData?.company_subcategory}
                  onChange={handleChange}
                  placeholder="Enter Company Subcategory"
                  isInvalid={!!errors.company_subcategory}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.company_subcategory}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="authorised_capital_equity">
                <Form.Label>
                  Authorised Capital (Equity)<sup>*</sup>
                </Form.Label>
                <Form.Control
                  type="number"
                  value={formData?.authorised_capital_equity}
                  onChange={handleChange}
                  placeholder="Enter Authorised Capital (Equity)"
                  required
                  isInvalid={!!errors.authorised_capital_equity}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.authorised_capital_equity}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col>
              <Form.Group controlId="authorised_capital_preference_capital">
                <Form.Label>
                  Authorised Capital (Preference)<sup>*</sup>
                </Form.Label>
                <Form.Control
                  type="number"
                  value={formData?.authorised_capital_preference_capital}
                  onChange={handleChange}
                  placeholder="Enter Authorised Capital (Preference)"
                  required
                  isInvalid={!!errors.authorised_capital_preference_capital}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.authorised_capital_preference_capital}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="paid_up_capital_equity">
                <Form.Label>
                  Paid Up Capital (Equity)<sup>*</sup>
                </Form.Label>
                <Form.Control
                  type="number"
                  value={formData?.paid_up_capital_equity}
                  onChange={handleChange}
                  placeholder="Enter Paid Up Capital (Equity)"
                  required
                  isInvalid={!!errors.paid_up_capital_equity}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.paid_up_capital_equity}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <Form.Group controlId="paid_up_capital_preference_capital">
                <Form.Label>
                  Paid Up Capital (Preference)<sup>*</sup>
                </Form.Label>
                <Form.Control
                  type="number"
                  value={formData?.paid_up_capital_preference_capital}
                  onChange={handleChange}
                  placeholder="Enter Paid Up Capital (Preference)"
                  required
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="date_of_balance_sheet">
                <Form.Label>Date of Balance Sheet</Form.Label>
                <Form.Control
                  type="date"
                  value={formData?.date_of_balance_sheet?.split("T")[0]}
                  onChange={handleChange}
                  // isInvalid={!!errors.date_of_balance_sheet}
                />
                {/* <Form.Control.Feedback type="invalid">
                  {errors.date_of_balance_sheet}
                </Form.Control.Feedback> */}
              </Form.Group>
            </Col>

            <Col>
              <Form.Group controlId="class_of_company">
                <Form.Label>
                  Class of Company<sup>*</sup>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData?.class_of_company}
                  onChange={handleChange}
                  placeholder="Enter Class of Company"
                  // isInvalid={!!errors.class_of_company}
                  required
                />
                {/* <Form.Control.Feedback type="invalid">
                  {errors.class_of_company}
                </Form.Control.Feedback> */}
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="cin">
                <Form.Label>
                  CIN<sup>*</sup>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData?.cin}
                  onChange={handleChange}
                  placeholder="Enter CIN"
                  required
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="secretary_detail.name">
                <Form.Label>Secretary Name</Form.Label>
                <Form.Control
                  type="text"
                  name="secretary_detail.name"
                  value={formData?.secretary_detail.name}
                  onChange={(e) =>
                    handleSecretaryChange("name", e.target.value)
                  }
                  placeholder="Enter Secretary Name"
                />
              </Form.Group>
            </Col>

            <Col>
              <Form.Group controlId="secretary_detail.email">
                <Form.Label>Secretary Email</Form.Label>
                <Form.Control
                  type="email"
                  name="secretary_detail.email"
                  value={formData?.secretary_detail.email}
                  onChange={(e) =>
                    handleSecretaryChange("email", e.target.value)
                  }
                  placeholder="Enter Secretary Email"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="alloted_manager">
                <Form.Label>
                  Client Manager<sup>*</sup>
                </Form.Label>
                <Form.Control
                  as="select"
                  value={formData?.alloted_manager?.id || ""}
                  onChange={(e) => {
                    const selectedManager = managers.find(
                      (manager) => manager.id === e.target.value
                    );
                    setFormData((prevData) => ({
                      ...prevData,
                      alloted_manager: selectedManager,
                    }));
                  }}
                >
                  <option value="">Select Client Manager</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="auditor_detail.name">
                <Form.Label>Auditor Name</Form.Label>
                <Form.Control
                  type="text"
                  name="auditor_detail.name"
                  value={formData?.auditor_detail.name}
                  onChange={(e) => handleAuditorChange("name", e.target.value)}
                  placeholder="Enter Auditor Name"
                />
              </Form.Group>
            </Col>

            <Col>
              <Form.Group controlId="auditor_detail.email">
                <Form.Label>Auditor Email</Form.Label>
                <Form.Control
                  type="email"
                  name="auditor_detail.email"
                  value={formData?.auditor_detail.email}
                  onChange={(e) => handleAuditorChange("email", e.target.value)}
                  placeholder="Enter Auditor Email"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="date_of_incorporation">
                <Form.Label>
                  Date of Incorporation<sup>*</sup>
                </Form.Label>
                <Form.Control
                  type="date"
                  value={formData?.date_of_incorporation.split("T")[0]}
                  onChange={handleChange}
                  placeholder="Enter Date of Incorporation"
                  required
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="date_of_last_agm">
                <Form.Label>
                  Date of Last AGM<sup>*</sup>
                </Form.Label>
                <Form.Control
                  type="date"
                  value={formData?.date_of_last_agm?.split("T")[0]}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="alloted_consultants">
                <Form.Label>
                  Client Consultant<sup>*</sup>
                </Form.Label>
                <Form.Control
                  as="select"
                  required
                  value={formData?.alloted_consultant?.id || ""}
                  onChange={(e) =>
                    handleChange({
                      target: {
                        id: "alloted_consultant",
                        value: {
                          ...consultants.find(
                            (consultant) => consultant.id === e.target.value
                          ),
                        },
                      },
                    })
                  }
                >
                  <option value="">Select Client Consultant</option>
                  {consultants.map((consultant) => (
                    <option key={consultant.id} value={consultant.id}>
                      {consultant.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3" style={{ width: "34%" }}>
            <Col>
              <Form.Group controlId="email_id">
                <Form.Label>
                  Email Address<sup>*</sup>
                </Form.Label>
                <Form.Control
                  type="email"
                  value={formData?.email_id}
                  onChange={handleChange}
                  placeholder="Enter Email Address"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Button variant="success" type="submit" className="ms-3 float-end">
            {buttonLoading ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              <>{customerId ? "Update Client" : "Save"}</>
            )}
          </Button>
        </Form>
        <ToastContainer />
      </div>
    </Container>
  );
}
