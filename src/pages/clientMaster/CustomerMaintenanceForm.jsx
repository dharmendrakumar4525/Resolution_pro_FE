import React, { useEffect, useState } from "react";
import { Form, Button, Row, Col, Container, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { apiURL } from "../../API/api";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import Select from "react-select";
export default function CustomerMaintenanceForm() {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const [managers, setManagers] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [validated, setValidated] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const token = localStorage.getItem("refreshToken");

  const [step, setStep] = useState(1);
  console.log(managers, "manager-list");
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
    alloted_consultant_2: "",
    alloted_manager: "",
    books_of_account: "",
    total_paid_up_capital_last_audited: null,
    net_worth_lau: null,
    turnover_lau: null,
    net_profit_lau: null,
    company_type: "",
    isin: "",
    RTA_name: "",
    DP_name: "",
    depositry_name: "",
    BM_notice_period: null,
    CM_notice_period: null,
    AGM_notice_period: null,
    EGM_notice_period: null,
    client_prev_name: "",
    client_effective_date: null,
    BM_next_due_date: null,
    AGM_next_due_date: null,
    promoters_MGT_names: [],
    BM_calender_year_no: null,
    business_nature: "",
    cost_auditor_detail: {
      name: null,
      address: "",
      from: null,
      to: null,
    },
    holding_company_detail: {
      name: null,
      address: "",
      CIN_FCRN: null,
    },
    internal_auditor_detail: {
      name: null,
      address: "",
      from: null,
      to: null,
    },
    items_req_secial_resol_AOA: "",
    special_provision_AOA: "",
    BM_last_serial: {
      type: "",
      serial_no: null,
    },
    CM_last_serial: {
      type: "",
      serial_no: null,
    },
    AGM_last_serial: {
      type: "",
      serial_no: null,
    },
    EGM_last_serial: {
      type: "",
      serial_no: null,
    },
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
          setFormData((prevData) => ({
            ...data,
            alloted_consultant: data.alloted_consultant?.id,
            alloted_manager: data.alloted_manager?.id,
          }));
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

    if (id === "promoters_MGT_names") {
      // Split the input value by commas and update the array in the state
      setFormData((prevData) => ({
        ...prevData,
        [id]: value.split(",").map((item) => item.trim()), // Trim spaces from each item
      }));
    } else if (id.startsWith("cost_auditor_detail")) {
      const fieldName = id.split("cost_auditor_detail_")[1];
      setFormData((prevData) => ({
        ...prevData,
        cost_auditor_detail: {
          ...prevData.cost_auditor_detail,
          [fieldName]: value,
        },
      }));
    } else if (id.startsWith("internal_auditor_detail")) {
      const fieldName = id.split("internal_auditor_detail_")[1];

      setFormData((prevData) => ({
        ...prevData,
        internal_auditor_detail: {
          ...prevData.internal_auditor_detail,
          [fieldName]: value,
        },
      }));
    } else if (id.startsWith("holding_company_detail")) {
      const fieldName = id.split("holding_company_detail_")[1];

      setFormData((prevData) => ({
        ...prevData,
        holding_company_detail: {
          ...prevData.holding_company_detail,
          [fieldName]: value,
        },
      }));
    } else if (id.startsWith("BM_last_serial")) {
      const fieldName = id.split("BM_last_serial_")[1];

      setFormData((prevData) => ({
        ...prevData,
        BM_last_serial: {
          ...prevData.BM_last_serial,
          [fieldName]: value,
        },
      }));
    } else if (id.startsWith("CM_last_serial")) {
      const fieldName = id.split("CM_last_serial_")[1];

      setFormData((prevData) => ({
        ...prevData,
        CM_last_serial: {
          ...prevData.CM_last_serial,
          [fieldName]: value,
        },
      }));
    } else if (id.startsWith("AGM_last_serial")) {
      const fieldName = id.split("AGM_last_serial_")[1];

      setFormData((prevData) => ({
        ...prevData,
        AGM_last_serial: {
          ...prevData.AGM_last_serial,
          [fieldName]: value,
        },
      }));
    } else if (id.startsWith("EGM_last_serial")) {
      const fieldName = id.split("EGM_last_serial_")[1];

      setFormData((prevData) => ({
        ...prevData,
        EGM_last_serial: {
          ...prevData.EGM_last_serial,
          [fieldName]: value,
        },
      }));
    } else {
      setFormData((prevData) => ({ ...prevData, [id]: value }));
    }
  };
  const handleManagerChange = (selectedOption) => {
    console.log("manager", selectedOption.value);
    setFormData((prevData) => ({
      ...prevData,
      alloted_manager: selectedOption?.value,
    }));
  };

  const handleConsultantChange = (selectedOption) => {
    console.log("Consultant", selectedOption.value);

    setFormData((prevData) => ({
      ...prevData,
      alloted_consultant: selectedOption?.value,
    }));
  };
  const handleConsultant2Change = (selectedOption) => {
    setFormData((prevData) => ({
      ...prevData,
      alloted_consultant_2: selectedOption?.value,
    }));
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
  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
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
        alloted_manager: formData?.alloted_manager,
        alloted_consultant: formData?.alloted_consultant,
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
  return (
    <Container>
      <div className="customer-form-container mt-4">
        <div className="d-flex justify-content-between mb-3">
          <h2>{customerId ? "Edit Client" : "Add Client"}</h2>
          <div className="mb-3 stepper-navigation">
            <Button
              variant="secondary"
              disabled={step === 1}
              onClick={handlePrevious}
            >
              Previous
            </Button>
            <span className="mx-3">Step {step} of 3</span>
            <Button
              variant="secondary"
              disabled={step === 3}
              onClick={handleNext}
            >
              Next
            </Button>
          </div>
        </div>
        <Form onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <Row className="mb-3">
                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="company_name">
                    <Form.Label>
                      Name of the Client Company<sup>*</sup>
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
                <Col md={6} lg={4} className="mt-3">
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

                <Col md={6} lg={4} className="mt-3">
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
                <Col md={6} lg={4} className="mt-3">
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
                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="company_subcategory">
                    <Form.Label>
                      Sub-Category of the Company<sup>*</sup>
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
                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="authorised_capital_equity">
                    <Form.Label>
                      Authorised Share Capital (Equity)<sup>*</sup>
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

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="authorised_capital_preference_capital">
                    <Form.Label>
                      Authorised Share Capital (Preference)<sup>*</sup>
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
                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="paid_up_capital_equity">
                    <Form.Label>
                      Paid Up Share Capital (Equity)<sup>*</sup>
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
                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="paid_up_capital_preference_capital">
                    <Form.Label>
                      Paid Up Share Capital (Preference)<sup>*</sup>
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
                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="date_of_balance_sheet">
                    <Form.Label>
                      Date of Balance Sheet<sup>*</sup>
                    </Form.Label>
                    <Form.Control
                      type="date"
                      required
                      value={formData?.date_of_balance_sheet?.split("T")[0]}
                      onChange={handleChange}
                      // isInvalid={!!errors.date_of_balance_sheet}
                    />
                    {/* <Form.Control.Feedback type="invalid">
                  {errors.date_of_balance_sheet}
                </Form.Control.Feedback> */}
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
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
                <Col md={6} lg={4} className="mt-3">
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
                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="email_id">
                    <Form.Label>Email ID of the Client Company</Form.Label>
                    <Form.Control
                      type="email"
                      value={formData?.email_id}
                      onChange={handleChange}
                      placeholder="Enter Email Address"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="secretary_detail.name">
                    <Form.Label>Name of the CS</Form.Label>
                    <Form.Control
                      type="text"
                      name="secretary_detail.name"
                      value={formData?.secretary_detail.name}
                      onChange={(e) =>
                        handleSecretaryChange("name", e.target.value)
                      }
                      placeholder="Enter Company Secretary Name"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="secretary_detail.email">
                    <Form.Label>Email ID of the CS</Form.Label>
                    <Form.Control
                      type="email"
                      name="secretary_detail.email"
                      value={formData?.secretary_detail.email}
                      onChange={(e) =>
                        handleSecretaryChange("email", e.target.value)
                      }
                      placeholder="Enter Company Secretary Email"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="alloted_manager">
                    <Form.Label>Client Manager</Form.Label>
                    <Select
                      options={managers.map((manager) => ({
                        value: manager.id,
                        label: manager.name,
                      }))}
                      value={managers
                        .map((manager) => ({
                          value: manager.id,
                          label: manager.name,
                        }))
                        .find(
                          (option) =>
                            // option.value === formData.alloted_manager.id ||
                            option.value === formData.alloted_manager
                        )}
                      onChange={handleManagerChange}
                      placeholder="Select Client Manager"
                      isClearable
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="auditor_detail.name">
                    <Form.Label>Name of the Auditor</Form.Label>
                    <Form.Control
                      type="text"
                      name="auditor_detail.name"
                      value={formData?.auditor_detail.name}
                      onChange={(e) =>
                        handleAuditorChange("name", e.target.value)
                      }
                      placeholder="Enter Auditor Name"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="auditor_detail.email">
                    <Form.Label>Email ID of the Auditor</Form.Label>
                    <Form.Control
                      type="email"
                      name="auditor_detail.email"
                      value={formData?.auditor_detail.email}
                      onChange={(e) =>
                        handleAuditorChange("email", e.target.value)
                      }
                      placeholder="Enter Auditor Email"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="registration_number">
                    <Form.Label>Reg No. of the Firm</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData?.registration_number}
                      onChange={handleChange}
                      placeholder="Enter Registeration Number"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="date_of_incorporation">
                    <Form.Label>DOI of the Company</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData?.date_of_incorporation.split("T")[0]}
                      onChange={handleChange}
                      placeholder="Enter Date of Incorporation"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="date_of_last_agm">
                    <Form.Label>Date of Last AGM</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData?.date_of_last_agm?.split("T")[0]}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="alloted_consultants">
                    <Form.Label>Client Consultant 1</Form.Label>
                    <Select
                      options={consultants.map((consultant) => ({
                        value: consultant.id,
                        label: consultant.name,
                      }))}
                      value={consultants
                        .map((consultant) => ({
                          value: consultant.id,
                          label: consultant.name,
                        }))
                        .find(
                          (option) =>
                            // option.value === formData.alloted_consultant.id ||
                            option.value === formData.alloted_consultant
                        )}
                      onChange={handleConsultantChange}
                      placeholder="Select Client Consultant"
                      isClearable
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="alloted_consultants_2">
                    <Form.Label>Client Consultant 2</Form.Label>
                    <Select
                      options={consultants.map((consultant) => ({
                        value: consultant.id,
                        label: consultant.name,
                      }))}
                      value={consultants
                        .map((consultant) => ({
                          value: consultant.id,
                          label: consultant.name,
                        }))
                        .find(
                          (option) =>
                            // option.value === formData.alloted_consultant.id ||
                            option.value === formData.alloted_consultant_2
                        )}
                      onChange={handleConsultant2Change}
                      placeholder="Select Client Consultant"
                      isClearable
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="holding_company_detail_name">
                    <Form.Label>Name of the Holding Company</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData?.holding_company_detail?.name || ""}
                      onChange={handleChange}
                      placeholder="Enter Holding Company Name"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="holding_company_detail_address">
                    <Form.Label>Address of the Holding Company</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData?.holding_company_detail?.address || ""}
                      onChange={handleChange}
                      placeholder="Enter Holding Company Address"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="holding_company_detail_CIN_FCRN">
                    <Form.Label>Holding Company CIN/FCRN</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData?.holding_company_detail?.CIN_FCRN || ""}
                      onChange={handleChange}
                      placeholder="Enter Holding Company CIN/FCRN"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}
          {step === 2 && (
            <>
              <Row className="mb-3">
                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="books_of_account">
                    <Form.Label>Books of Accounts maintained at ?</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData?.books_of_account}
                      onChange={handleChange}
                      placeholder="Enter Books of Account"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="total_paid_up_capital_last_audited">
                    <Form.Label>
                      Total Paid-Up Capital (Last Audited)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      value={formData?.total_paid_up_capital_last_audited}
                      onChange={handleChange}
                      placeholder="Enter Total Paid-Up Capital (Last Audited)"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="net_worth_lau">
                    <Form.Label>Net Worth (Last Audited)</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData?.net_worth_lau}
                      onChange={handleChange}
                      placeholder="Enter Net Worth (Last Audited)"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="turnover_lau">
                    <Form.Label>Turnover (Last Audited)</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData?.turnover_lau}
                      onChange={handleChange}
                      placeholder="Enter Turnover (Last Audited)"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="net_profit_lau">
                    <Form.Label>Net Profit (Last Audited)</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData?.net_profit_lau}
                      onChange={handleChange}
                      placeholder="Enter Net Profit (Last Audited)"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="company_type">
                    <Form.Label>Company Type</Form.Label>
                    <Form.Control
                      as="select"
                      value={formData?.company_type}
                      onChange={handleChange}
                    >
                      <option value="">Select Company Type</option>
                      <option value="small_company">Small Company</option>
                      <option value="non_small_company">
                        Non-Small Company
                      </option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="isin">
                    <Form.Label>ISIN</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData?.isin}
                      onChange={handleChange}
                      placeholder="Enter ISIN"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="RTA_name">
                    <Form.Label>RTA Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData?.RTA_name}
                      onChange={handleChange}
                      placeholder="Enter RTA Name"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="DP_name">
                    <Form.Label>DP Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData?.DP_name}
                      onChange={handleChange}
                      placeholder="Enter DP Name"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="depositry_name">
                    <Form.Label>Depository Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData?.depositry_name}
                      onChange={handleChange}
                      placeholder="Enter Depository Name"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="BM_notice_period">
                    <Form.Label>BM Notice Period</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData?.BM_notice_period}
                      onChange={handleChange}
                      placeholder="Enter BM Notice Period"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="CM_notice_period">
                    <Form.Label>CM Notice Period</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData?.CM_notice_period}
                      onChange={handleChange}
                      placeholder="Enter CM Notice Period"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="AGM_notice_period">
                    <Form.Label>AGM Notice Period</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData?.AGM_notice_period}
                      onChange={handleChange}
                      placeholder="Enter AGM Notice Period"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="EGM_notice_period">
                    <Form.Label>EGM Notice Period</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData?.EGM_notice_period}
                      onChange={handleChange}
                      placeholder="Enter EGM Notice Period"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="client_prev_name">
                    <Form.Label>Client Previous Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData?.client_prev_name}
                      onChange={handleChange}
                      placeholder="Enter Client Previous Name"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="client_effective_date">
                    <Form.Label>Duration of previous name</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData?.client_effective_date?.split("T")[0]}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="BM_next_due_date">
                    <Form.Label>BM Next Due Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData?.BM_next_due_date?.split("T")[0]}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="AGM_next_due_date">
                    <Form.Label>AGM Next Due Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData?.AGM_next_due_date?.split("T")[0]}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="promoters_MGT_names">
                    <Form.Label>Name of the promoters as per MGT-7</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData?.promoters_MGT_names.join(", ")}
                      onChange={handleChange}
                      placeholder="Enter Promoters (MGT Names)"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="BM_calender_year_no">
                    <Form.Label>No of BM held in the CY</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData?.BM_calender_year_no}
                      onChange={handleChange}
                      placeholder="Enter BM Calendar Year No."
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="business_nature">
                    <Form.Label>Main business activity</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData?.business_nature}
                      onChange={handleChange}
                      placeholder="Enter Nature of Business"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}
          {step === 3 && (
            <>
              <Row className="mb-3">
                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="cost_auditor_detail_name">
                    <Form.Label>Cost Auditor Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData?.cost_auditor_detail?.name}
                      onChange={handleChange}
                      placeholder="Enter Cost Auditor Name"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="cost_auditor_detail_address">
                    <Form.Label>Cost Auditor Address</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData?.cost_auditor_detail?.address}
                      onChange={handleChange}
                      placeholder="Enter Cost Auditor Address"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="cost_auditor_detail_from">
                    <Form.Label>Cost Auditor From</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData?.cost_auditor_detail?.from?.split("T")[0]}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="cost_auditor_detail_to">
                    <Form.Label>Cost Auditor To</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData?.cost_auditor_detail?.to?.split("T")[0]}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="internal_auditor_detail_name">
                    <Form.Label>Internal Auditor Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData?.internal_auditor_detail?.name}
                      onChange={handleChange}
                      placeholder="Enter Internal Auditor Name"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="internal_auditor_detail_address">
                    <Form.Label>Internal Auditor Address</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData?.internal_auditor_detail?.address}
                      onChange={handleChange}
                      placeholder="Enter Internal Auditor Address"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="internal_auditor_detail_from">
                    <Form.Label>Internal Auditor From</Form.Label>
                    <Form.Control
                      type="date"
                      value={
                        formData?.internal_auditor_detail?.from?.split("T")[0]
                      }
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="internal_auditor_detail_to">
                    <Form.Label>Internal Auditor To</Form.Label>
                    <Form.Control
                      type="date"
                      value={
                        formData?.internal_auditor_detail?.to?.split("T")[0]
                      }
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="items_req_secial_resol_AOA">
                    <Form.Label>
                      Items Requiring Special Resolution (AOA)
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={formData?.items_req_secial_resol_AOA}
                      onChange={handleChange}
                      placeholder="Enter Items Requiring Special Resolution (AOA)"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="special_provision_AOA">
                    <Form.Label>Special Provision (AOA)</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData?.special_provision_AOA}
                      onChange={handleChange}
                      placeholder="Enter Special Provision (AOA)"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="BM_last_serial_type">
                    <Form.Label>BM Last Serial Type</Form.Label>
                    <Form.Control
                      as="select"
                      value={formData?.BM_last_serial?.type}
                      onChange={handleChange}
                    >
                      <option value="">Select BM Last Serial Type</option>
                      <option value="regular">Regular</option>
                      <option value="financial">Financial</option>
                    </Form.Control>
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="BM_last_serial_serial_no">
                    <Form.Label>BM Last Serial No</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData?.BM_last_serial?.serial_no}
                      onChange={handleChange}
                      placeholder="Enter BM Last Serial No"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="CM_last_serial_type">
                    <Form.Label>CM Last Serial Type</Form.Label>
                    <Form.Control
                      as="select"
                      type="text"
                      value={formData?.CM_last_serial?.type}
                      onChange={handleChange}
                      placeholder="Enter CM Last Serial Type"
                    >
                      <option value="">Select BM Last Serial Type</option>
                      <option value="regular">Regular</option>
                      <option value="financial">Financial</option>
                    </Form.Control>
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="CM_last_serial_serial_no">
                    <Form.Label>No of CM held in the CY</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData?.CM_last_serial?.serial_no}
                      onChange={handleChange}
                      placeholder="Enter CM Last Serial No"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="AGM_last_serial_type">
                    <Form.Label>AGM Last Serial Type</Form.Label>
                    <Form.Control
                      as="select"
                      type="text"
                      value={formData?.AGM_last_serial?.type}
                      onChange={handleChange}
                      placeholder="Enter AGM Last Serial Type"
                    >
                      <option value="">Select AGM Last Serial Type</option>
                      <option value="regular">Regular</option>
                      <option value="financial">Financial</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="AGM_last_serial_serial_no">
                    <Form.Label>No of AGM held in the CY</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData?.AGM_last_serial?.serial_no}
                      onChange={handleChange}
                      placeholder="Enter AGM Last Serial No"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="EGM_last_serial_type">
                    <Form.Label>EGM Last Serial Type</Form.Label>
                    <Form.Control
                      as="select"
                      type="text"
                      value={formData?.EGM_last_serial?.type}
                      onChange={handleChange}
                      placeholder="Enter EGM Last Serial Type"
                    >
                      <option value="">Select EGM Last Serial Type</option>
                      <option value="regular">Regular</option>
                      <option value="financial">Financial</option>
                    </Form.Control>
                  </Form.Group>
                </Col>

                <Col md={6} lg={4} className="mt-3">
                  <Form.Group controlId="EGM_last_serial_serial_no">
                    <Form.Label>No of EGM held in the CY</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData?.EGM_last_serial?.serial_no}
                      onChange={handleChange}
                      placeholder="Enter EGM Last Serial No"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button
                variant="success"
                type="submit"
                className="ms-3 float-end"
              >
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
            </>
          )}
        </Form>
        <ToastContainer />
      </div>
    </Container>
  );
}
