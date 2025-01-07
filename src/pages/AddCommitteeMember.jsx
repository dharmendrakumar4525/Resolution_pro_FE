import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Container,
  Spinner,
} from "react-bootstrap";
import { apiURL } from "../API/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

export default function AddCommitteeMember({ onSave }) {
  const [clientList, setClientList] = useState([]);
  const [committeeList, setCommitteeList] = useState([]);
  const [directorList, setDirectorList] = useState([]);
  const [formData, setFormData] = useState({
    clientName: "",
    committee: "",
    isEmail: false,
    location: "",
    committeeMembers: [{ name: "", from: "", to: "", email: "" }],
  });
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const { rolePermissions } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("refreshToken");
  useEffect(() => {
    const fetchClientList = async () => {
      try {
        const response = await fetch(`${apiURL}/customer-maintenance`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setClientList(data.docs);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

    const fetchCommitteeList = async () => {
      try {
        const response = await fetch(`${apiURL}/committee-master`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setCommitteeList(data.results);
      } catch (error) {
        console.error("Error fetching committees:", error);
      }
    };

    fetchClientList();
    fetchCommitteeList();
  }, []);

  const fetchDirectors = async (clientId) => {
    try {
      const response = await fetch(
        `${apiURL}/director-data/directors/${clientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setDirectorList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching directors:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...formData.committeeMembers];
    updatedMembers[index][field] = value;
    setFormData({ ...formData, committeeMembers: updatedMembers });
  };

  const addMember = () => {
    setFormData({
      ...formData,
      committeeMembers: [
        ...formData.committeeMembers,
        { name: "", from: "", to: "", email: "" },
      ],
    });
  };

  const removeMember = (index) => {
    if (formData.committeeMembers.length > 1) {
      const updatedMembers = [...formData.committeeMembers];
      updatedMembers.splice(index, 1);
      setFormData({ ...formData, committeeMembers: updatedMembers });
    } else {
      toast.error("Please fill atleast 1 Member Details");
    }
  };
  const validateForm = () => {
    const { clientName, committee, committeeMembers } = formData;

    // Check if main fields are filled
    if (!clientName || !committee) {
      toast.error("Please fill out all required fields.");
      return false;
    }

    // Check if each committee member has complete details
    for (let member of committeeMembers) {
      if (!member.name || !member.from || !member.to || !member.email) {
        toast.error("Please fill out all fields for each committee member.");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setButtonLoading(true);
    try {
      const payload = {
        client_name: formData.clientName,
        committee: formData.committee,
        is_email: formData.isEmail,
        committee_members: formData.committeeMembers,
      };

      const response = await fetch(`${apiURL}/committee-member`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },

        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorMessage = await response
          .json()
          .then((data) => data.message || "Failed to add committee member");
        toast.error(errorMessage);
        return;
      }

      toast.success("Committee member added successfully");
      setTimeout(() => {
        navigate("/committee-members");
      }, 2000);
    } catch (error) {
      toast.error("Failed to add member. Please try again.");
    } finally {
      setLoading(false);
      setButtonLoading(false);
    }
  };
  const clientOptions = clientList?.map((client) => ({
    value: client._id,
    label: client.company_name,
  }));

  const handleClientChange = (selectedOption) => {
    console.log(selectedOption, "selected");
    setFormData({ ...formData, clientName: selectedOption?.value || "" });
    fetchDirectors(selectedOption?.value);
  };

  return (
    <div
      className="mt-4 ml-10"
      style={{ marginLeft: "20px", marginRight: "15%" }}
    >
      <h2>Add Committee Member</h2>
      <Form onSubmit={handleSubmit}>
        <Row className="mt-4">
          <Col>
            <Form.Group controlId="client_name">
              <Form.Label>
                Client Name<sup>*</sup>
              </Form.Label>
              <Select
                id="client-name-select"
                options={clientOptions}
                placeholder="Select Client"
                value={clientOptions.find(
                  (option) => option.value === formData?.clientName
                )}
                onChange={handleClientChange}
                isClearable
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="committee">
              <Form.Label>
                Committee<sup>*</sup>
              </Form.Label>
              <Form.Control
                as="select"
                name="committee"
                value={formData.committee}
                onChange={handleChange}
              >
                <option value="">Select Committee</option>
                {committeeList.map((committee) => (
                  <option key={committee.id} value={committee.id}>
                    {committee.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>

        {formData.committeeMembers.map((member, index) => (
          <Row key={index}>
            <Col md={6} lg={4}>
              <Form.Group className="mt-3">
                <Form.Label>
                  Director<sup>*</sup>
                </Form.Label>
                <Form.Control
                  as="select"
                  value={member.name}
                  onChange={(e) => {
                    const selectedDirector = directorList.find(
                      (director) => director.id === e.target.value
                    );
                    handleMemberChange(index, "name", selectedDirector.id);
                    handleMemberChange(index, "email", selectedDirector.email);
                  }}
                >
                  <option value="">Select Director</option>
                  {directorList.map((director) => (
                    <option key={director.id} value={director.id}>
                      {director.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={6} lg={4}>
              <Form.Group className="mt-3">
                <Form.Label>
                  From Date<sup>*</sup>
                </Form.Label>
                <Form.Control
                  type="date"
                  value={member.from}
                  onChange={(e) =>
                    handleMemberChange(index, "from", e.target.value)
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6} lg={4}>
              <Form.Group className="mt-3">
                <Form.Label>To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={member.to}
                  onChange={(e) =>
                    handleMemberChange(index, "to", e.target.value)
                  }
                />
              </Form.Group>
            </Col>

            <Col md={6} lg={4}>
              <Button
                className="mt-2"
                variant="danger"
                onClick={() => removeMember(index)}
              >
                Remove Member
              </Button>
            </Col>
          </Row>
        ))}

        <div
          className="d-flex justify-content-between mb-3 mt-5"
          style={{ width: "30%" }}
        >
          <Button onClick={addMember} variant="secondary">
            Add new Committee Member
          </Button>
        </div>
        <Row>
          <Col>
            {" "}
            <Button
              variant="primary"
              onClick={() => navigate(-1)}
              style={{ marginRight: "20px" }}
            >
              Go Back
            </Button>
            <Button variant="secondary" type="submit" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : "Save"}
            </Button>
          </Col>
        </Row>
      </Form>
      <ToastContainer />
    </div>
  );
}
