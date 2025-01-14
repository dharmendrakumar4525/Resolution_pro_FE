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
    committeeMembers: [],
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
  console.log(directorList, "dirr");
  const directorOptions = directorList.map((director) => ({
    value: director.id,
    label: director.name,
  }));

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setButtonLoading(true);
    try {
      const payload = {
        client_name: formData.clientName,
        committee: formData.committee,
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

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="participants">
              <Form.Label>
                Participants<sup>*</sup>
              </Form.Label>
              <Select
                isMulti
                required
                options={[
                  { value: "selectAll", label: "Select All" },
                  ...directorOptions,
                ]}
                value={
                  formData?.committeeMembers?.length === directorOptions?.length
                    ? [
                        { value: "selectAll", label: "Select All" },
                        ...directorOptions,
                      ]
                    : directorOptions.filter((option) =>
                        formData.committeeMembers.some(
                          (participant) => participant?.name === option.value
                        )
                      )
                }
                onChange={(selectedOptions) => {
                  if (
                    selectedOptions.some(
                      (option) => option.value === "selectAll"
                    ) &&
                    formData.committeeMembers.length !== directorOptions?.length
                  ) {
                    // Select all participants
                    setFormData({
                      ...formData,
                      committeeMembers: directorOptions?.map((option) => ({
                        name: option.value,
                      })),
                    });
                  } else if (
                    selectedOptions.some(
                      (option) => option.value === "selectAll"
                    ) &&
                    formData.committeeMembers.length === directorOptions.length
                  ) {
                    setFormData({
                      ...formData,
                      committeeMembers: [],
                    });
                  } else {
                    setFormData({
                      ...formData,
                      committeeMembers: selectedOptions
                        .filter((option) => option.value !== "selectAll")
                        .map((option) => ({
                          name: option.value,
                        })),
                    });
                  }
                }}
                isClearable
                isSearchable
              />
            </Form.Group>
            {directorList.length == 0 && (
              <p style={{ color: "red", marginTop: "10px" }}>
                Director options are not available. Please add options before
                proceeding.
              </p>
            )}
          </Col>
        </Row>

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
