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
import { useParams, useNavigate } from "react-router-dom";
import { apiURL } from "../API/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";

export default function EditCommitteeMember() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clientList, setClientList] = useState([]);
  const [committeeList, setCommitteeList] = useState([]);
  const [directorList, setDirectorList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    committee: "",
    committeeMembers: [],
  });
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
        console.error("Error fetching client data:", error);
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
        console.error("Error fetching committee data:", error);
      }
    };
    const fetchCommitteeMember = async (id) => {
      try {
        const response = await fetch(`${apiURL}/committee-member/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        // const data=dataj.results
        console.log(data, "dataa");
        if (data) {
          setFormData({
            clientName: data.client_name.id,
            committee: data.committee.id,
            committeeMembers: data.committee_members.map((member) => ({
              name: member.name.id,
            })),
          });
          // setDirectorList(data.committee_members);
          fetchDirectors(data.client_name?.id);
        }
      } catch (error) {
        console.error("Error fetching committee member data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientList();
    fetchCommitteeList();
    fetchCommitteeMember(id);
  }, [id]);

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
  const directorOptions = directorList.map((director) => ({
    value: director.id,
    label: director.name,
  }));

  // const fetchDirectors = async (clientId) => {
  //   try {
  //     const response = await fetch(
  //       `${apiURL}/director-data/directors/${clientId}`
  //     );
  //     const data = await response.json();
  //     setDirectorList(Array.isArray(data) ? data : []);
  //   } catch (error) {
  //     console.error("Error fetching directors:", error);
  //   }
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "clientName" && value) {
      // fetchDirectors(value);
    }
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
      // PATCH request to update the committee member
      const response = await fetch(`${apiURL}/committee-member/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorMessage = await response
          .json()
          .then((data) => data.message || "Failed to update committee member.");
        toast.error(errorMessage);
        return;
      }

      toast.success("Committee member updated successfully");
      navigate("/committee-members");
    } catch (error) {
      toast.error("Failed to update committee member. Please try again.");
    } finally {
      setLoading(false);
      setButtonLoading(false);
    }
  };
  console.log("object", directorList);
  return (
    <div
      className="mt-4 ml-10"
      style={{ marginRight: "15px", marginLeft: "15px" }}
    >
      <h2>Edit Committee Member</h2>

      <Form onSubmit={handleSubmit}>
        <Row className="mt-4 mb-3">
          <Col>
            <Form.Group controlId="clientName">
              <Form.Label>
                Client Name<sup>*</sup>
              </Form.Label>
              <Form.Control
                as="select"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                disabled
              >
                <option value="">Select Client</option>
                {clientList.map((client) => (
                  <option key={client.id} value={client._id}>
                    {client.company_name}
                  </option>
                ))}
              </Form.Control>
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
          <Col>
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
                          (participant) => participant.name?.id === option.value
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
