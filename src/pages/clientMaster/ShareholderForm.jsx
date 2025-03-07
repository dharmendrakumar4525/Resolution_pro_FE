import React, { useEffect, useState } from "react";
import { Form, Button, Row, Col, Container, Spinner } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { apiURL } from "../../API/api";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import Select from "react-select";
export default function ShareholderForm() {
  const navigate = useNavigate();
  const { shareholderId } = useParams();
  const [managers, setManagers] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [consultants, setConsultants] = useState([]);
  const [validated, setValidated] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const token = localStorage.getItem("refreshToken");
  const location = useLocation();
  const clientId = location.state.clientId;

  const [step, setStep] = useState(1);
  console.log(managers, "manager-list");
  const [formData, setFormData] = useState({
    company_id: clientId,
    name: "",
    email: "",
    type: "",
    address: "",
    no_of_shares: "",
    holding_percent: "",
    beneficial_name: "",
    SBO_name: "",
    SBO_address: "",
    dematerialised: false,
    folio_no: "",
  joint_holders_name: "",
  guardian_name: "",
  occupation: "",
  pan_no: "",
  nationality: "",
  fdi: null,
  CIN_registration_number: "",
  nominal_value_per_share: null,
  holding_company: null,
  promoter: null,
  beneficial_owner_address: "",
  SBO_DOB: null,
  SBO_father_mother_spouse_name: "",
  SBO_occupation: "",
  SBO_nationality: "",
  SBO_pan: "",
  SBO_passport_no: "",
  SBO_date_of_declaration: null,
  SBO_date_of_cessation: null,
  });

  // Fetch customer data if editing
  useEffect(() => {
    if (shareholderId) {
      const fetchShareholderData = async () => {
        try {
          const response = await fetch(
            `${apiURL}/shareholder-data/${shareholderId}`,
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
          setEditingRow(data);
        } catch (error) {
          console.error("Error fetching customer data:", error);
          toast.error("Failed to load customer data");
        }
      };
      fetchShareholderData();
    }
  }, [shareholderId]);

  const handleChange = (e) => {
    const { id, value } = e.target;

    if (id.includes(".")) {
      const [parent, child] = id.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [id]: value,
      });
    }
  };
  const handleCheckboxChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value,
    });
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonLoading(true);
    try {
      if (editingRow) {
        const dataToSubmit = { ...formData };
        delete dataToSubmit.createdAt;
        delete dataToSubmit.updatedAt;
        delete dataToSubmit.id;
        const response = await fetch(
          `${apiURL}/shareholder-data/${editingRow?.id}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },

            body: JSON.stringify(dataToSubmit),
          }
        );
        if (!response.ok) {
          const errorMessage = await response.json();
          toast.error(errorMessage.message);
          setButtonLoading(false);

          return;
        }
        toast.success("Shareholder updated successfully");
        navigate(-1);
      } else {
        const response = await fetch(`${apiURL}/shareholder-data`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorMessage = await response.json();
          toast.error(errorMessage.message);
          setButtonLoading(false);

          return;
        }

        toast.success("Shareholder added successfully");
        navigate(-1);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setButtonLoading(false); // Hide button spinner
    }
  };
 

  return (
    <div className="pt-3 ps-3 pe-3 mb-3">
      <h2 className="mb-2">
        {shareholderId ? "Edit Shareholder" : "Add Shareholder"}
      </h2>

      <Form onSubmit={handleSubmit}>
  <Row>
    <Col md={6} lg={4} className="mt-2">
      <Form.Group controlId="name" className="mb-3">
        <Form.Label>
          Name<sup>*</sup>
        </Form.Label>
        <Form.Control
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter Name"
          required
        />
      </Form.Group>
    </Col>

    <Col md={6} lg={4} className="mt-2">
      <Form.Group controlId="pan_no" className="mb-3">
        <Form.Label>PAN Number</Form.Label>
        <Form.Control
          type="text"
          value={formData.pan_no}
          onChange={handleChange}
          placeholder="Enter PAN Number"
        />
      </Form.Group>
    </Col>

    <Col md={6} lg={4} className="mt-2">
      <Form.Group controlId="email" className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter Email"
        />
      </Form.Group>
    </Col>

    <Col md={6} lg={4} className="mt-2">
      <Form.Group controlId="type" className="mb-3">
        <Form.Label>Type</Form.Label>
        <Form.Select value={formData.type} onChange={handleChange}>
          <option value="" disabled>
            Select Type
          </option>
          <option value="equity">Equity</option>
          <option value="preference">Preference</option>
        </Form.Select>
      </Form.Group>
    </Col>

    <Col md={6} lg={4} className="mt-2">
      <Form.Group controlId="address" className="mb-3">
        <Form.Label>Address</Form.Label>
        <Form.Control
          type="text"
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter Address"
        />
      </Form.Group>
    </Col>

    <Col md={6} lg={4} className="mt-2">
      <Form.Group controlId="no_of_shares" className="mb-3">
        <Form.Label>Number of Shares</Form.Label>
        <Form.Control
          type="number"
          value={formData.no_of_shares}
          onChange={handleChange}
          placeholder="Enter Number of Shares"
        />
      </Form.Group>
    </Col>

    <Col md={6} lg={4} className="mt-2">
      <Form.Group controlId="holding_percent" className="mb-3">
        <Form.Label>Holding Percentage</Form.Label>
        <Form.Control
          type="number"
          value={formData.holding_percent}
          onChange={handleChange}
          placeholder="Enter Holding Percentage"
        />
      </Form.Group>
    </Col>

    <Col md={6} lg={4} className="mt-2">
      <Form.Group controlId="beneficial_name" className="mb-3">
        <Form.Label>Beneficial Owner Name</Form.Label>
        <Form.Control
          type="text"
          value={formData.beneficial_name}
          onChange={handleChange}
          placeholder="Enter Beneficial Owner Name"
        />
      </Form.Group>
    </Col>

    <Col md={6} lg={4} className="mt-2">
      <Form.Group controlId="SBO_name" className="mb-3">
        <Form.Label>SBO Name</Form.Label>
        <Form.Control
          type="text"
          value={formData.SBO_name}
          onChange={handleChange}
          placeholder="Enter SBO Name"
        />
      </Form.Group>
    </Col>

    <Col md={6} lg={4} className="mt-2">
      <Form.Group controlId="SBO_address" className="mb-3">
        <Form.Label>SBO Address</Form.Label>
        <Form.Control
          type="text"
          value={formData.SBO_address}
          onChange={handleChange}
          placeholder="Enter SBO Address"
        />
      </Form.Group>
    </Col>

    <Col md={6} lg={4} className="mt-5 ps-3">
      <Form.Group controlId="dematerialised">
        <Form.Check
          type="checkbox"
          id="dematerialised"
          label="Dematerialised"
          checked={formData.dematerialised}
          onChange={handleCheckboxChange}
        />
      </Form.Group>
    </Col>

    {/* Additional Fields */}
    <Col md={6} lg={4} className="mt-2">
      <Form.Group controlId="folio_no" className="mb-3">
        <Form.Label>Folio Number</Form.Label>
        <Form.Control
          type="text"
          value={formData.folio_no}
          onChange={handleChange}
          placeholder="Enter Folio Number"
        />
      </Form.Group>
    </Col>

    <Col md={6} lg={4} className="mt-2">
      <Form.Group controlId="joint_holders_name" className="mb-3">
        <Form.Label>Joint Holders Name</Form.Label>
        <Form.Control
          type="text"
          value={formData.joint_holders_name}
          onChange={handleChange}
          placeholder="Enter Joint Holders Name"
        />
      </Form.Group>
    </Col>

    <Col md={6} lg={4} className="mt-2">
      <Form.Group controlId="guardian_name" className="mb-3">
        <Form.Label>Guardian Name</Form.Label>
        <Form.Control
          type="text"
          value={formData.guardian_name}
          onChange={handleChange}
          placeholder="Enter Guardian Name"
        />
      </Form.Group>
    </Col>

    <Col md={6} lg={4} className="mt-2">
      <Form.Group controlId="occupation" className="mb-3">
        <Form.Label>Occupation</Form.Label>
        <Form.Control
          type="text"
          value={formData.occupation}
          onChange={handleChange}
          placeholder="Enter Occupation"
        />
      </Form.Group>
    </Col>

    <Col md={6} lg={4} className="mt-2">
      <Form.Group controlId="pan_no" className="mb-3">
        <Form.Label>PAN Number</Form.Label>
        <Form.Control
          type="text"
          value={formData.pan_no}
          onChange={handleChange}
          placeholder="Enter PAN Number"
        />
      </Form.Group>
    </Col>

    <Col md={6} lg={4} className="mt-2">
      <Form.Group controlId="nationality" className="mb-3">
        <Form.Label>Nationality</Form.Label>
        <Form.Control
          type="text"
          value={formData.nationality}
          onChange={handleChange}
          placeholder="Enter Nationality"
        />
      </Form.Group>
    </Col>
  </Row>

  <Button variant="primary" onClick={() => navigate(-1)} className="me-2">
    Cancel
  </Button>

  <Button type="submit" variant="secondary" className="ml-2">
    {buttonLoading ? (
      <Spinner
        as="span"
        animation="border"
        size="sm"
        role="status"
        aria-hidden="true"
      />
    ) : (
      "Save"
    )}
  </Button>
</Form>

      <ToastContainer autoClose={2000} />

    </div>
  );
}
