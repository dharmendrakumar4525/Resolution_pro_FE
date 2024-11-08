import React, { useEffect, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { apiURL } from "../API/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function EditCommitteeMember() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clientList, setClientList] = useState([]);
  const [committeeList, setCommitteeList] = useState([]);
  const [directorList, setDirectorList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    clientName: "",
    committee: "",
    isEmail: false,
    committeeMembers: [],
  });
  useEffect(() => {
    const fetchClientList = async () => {
      try {
        const token = localStorage.getItem("refreshToken");

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
        const response = await fetch(`${apiURL}/committee-master`);
        const data = await response.json();
        setCommitteeList(data.results);
      } catch (error) {
        console.error("Error fetching committee data:", error);
      }
    };

    const fetchCommitteeMember = async (id) => {
      try {
        const response = await fetch(`${apiURL}/committee-member/${id}`);
        const data = await response.json();

        if (data) {
          setFormData({
            clientName: data.client_name.id,
            committee: data.committee.id,
            isEmail: data.is_email,
            committeeMembers: data.committee_members.map((member) => ({
              name: member.name.id,
              email: member.name.email,
              from: member.from.split("T")[0],
              to: member.to.split("T")[0],
            })),
          });
          setDirectorList(data.committee_members);
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
    try {
      // PATCH request to update the committee member
      const response = await fetch(`${apiURL}/committee-member/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
    }
  };

  return (
    <div className="mt-4 ml-10" style={{ width: "50%", marginLeft: "15px" }}>
      <h2>Edit Committee Member</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="clientName" className="mt-4">
          <Form.Label>Client Name</Form.Label>
          <Form.Control
            as="select"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
          >
            <option value="">Select Client</option>
            {clientList.map((client) => (
              <option key={client.id} value={client._id}>
                {client.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="committee" className="mt-3">
          <Form.Label>Committee</Form.Label>
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
        <Form.Group controlId="isEmail" className="mt-3">
          <Form.Check
            type="checkbox"
            label="Send Email Notifications"
            checked={formData.isEmail}
            onChange={(e) =>
              setFormData({ ...formData, isEmail: e.target.checked })
            }
          />
        </Form.Group>
        {formData.committeeMembers.map((member, index) => (
          <div key={index}>
            <Form.Group className="mt-3">
              <Form.Label>Director</Form.Label>
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
                  <option key={director.name.id} value={director.name.id}>
                    {director.name.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Label>From Date</Form.Label>
              <Form.Control
                type="date"
                value={member.from}
                onChange={(e) =>
                  handleMemberChange(index, "from", e.target.value)
                }
              />
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Label>To Date</Form.Label>
              <Form.Control
                type="date"
                value={member.to}
                onChange={(e) =>
                  handleMemberChange(index, "to", e.target.value)
                }
              />
            </Form.Group>
            <Button
              className="mt-2"
              variant="danger"
              onClick={() => removeMember(index)}
            >
              Remove Member
            </Button>
            <hr />
          </div>
        ))}
        <div
          className="d-flex justify-content-between mb-3"
          style={{ width: "50%" }}
        >
          <Button onClick={addMember} variant="secondary">
            Add Committee Member
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "Save"}
          </Button>
        </div>
      </Form>
      <ToastContainer />
    </div>
  );
}
