import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiURL } from "../API/api";
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
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";

export default function AddMeeting() {
  const [rows, setRows] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => navigate("/meeting");
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientList, setClientList] = useState([]);
  const [agendaList, setAgendaList] = useState([]);
  const [directorList, setDirectorList] = useState([]);
  const [buttonLoading, setButtonLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("refreshToken");
  const [formData, setFormData] = useState({
    title: "",
    client_name: "",
    description: "",
    meetingType: "board_meeting",
    date: "",
    startTime: "",
    endTime: "",
    organizer: user.id,
    participants: [],
    other_participants: [
      {
        name: "",
        email: "",
      },
    ],
    agendaItems: [],
    location: "",
    status: "scheduled",
  });
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiURL}/meeting`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setRows(data.results);
        console.log(data.results, "sadass");
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
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
        console.log(data.docs, "ds");
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    const fetchAgendaList = async () => {
      try {
        const response = await fetch(`${apiURL}/meeting-agenda-template`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        console.log("data", data);
        const usableAgendas = data.results.filter(
          (item) => item.status === "usable"
        );

        setAgendaList(usableAgendas);
        console.log(data.results, "mll");
      } catch (error) {
        console.error("Error fetching Agenda:", error);
      }
    };
    fetchClientList();
    fetchAgendaList();
  }, []);
  useEffect(() => {
    if (formData.client_name && clientList.length > 0) {
      const selectedCompany = clientList.find(
        (company) => company._id === formData.client_name
      );
      console.log("Selected Company ID:", selectedCompany);

      if (selectedCompany) {
        countPreviousMeetings(rows, selectedCompany._id);
      }
    }
  }, [formData.client_name, clientList, rows]);
  function getOrdinalSuffix(number) {
    const suffixes = ["th", "st", "nd", "rd"];
    const value = number % 100;
    return (
      number + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0])
    );
  }
  const countPreviousMeetings = (meetData, selectedId) => {
    const previousCount = meetData.filter(
      (meeting) =>
        meeting.client_name.id === selectedId &&
        new Date(meeting.createdAt) < new Date()
    ).length;
    let result = getOrdinalSuffix(previousCount + 1);
    setFormData((prev) => ({ ...prev, title: result + " " + "Board Meeting" }));
  };

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
  const handleAddParticipant = () => {
    setFormData((prevState) => ({
      ...prevState,
      other_participants: [
        ...prevState.other_participants,
        { name: "", email: "" },
      ],
    }));
  };
  const handleRemoveParticipant = (index) => {
    setFormData((prevState) => ({
      ...prevState,
      other_participants: prevState.other_participants.filter(
        (_, i) => i !== index
      ),
    }));
  };
  const handleParticipantChange = (index, field, value) => {
    const updatedParticipants = formData.other_participants.map(
      (participant, i) =>
        i === index ? { ...participant, [field]: value } : participant
    );

    setFormData((prevState) => ({
      ...prevState,
      other_participants: updatedParticipants,
    }));
  };

  const handleChange = (e) => {
    const { id, name, value } = e.target;
    setFormData({ ...formData, [id || name]: value });
    if (name === "client_name" && value) {
      fetchDirectors(value);
    }
  };

  const handleAgendaItemChange = (selectedOptions) => {
    const selectedAgendas = selectedOptions
      ? selectedOptions.map((option) => {
          const agenda = agendaList.find(
            (item) => item.templateName === option.value
          );
          return {
            templateName: option.value,
            meetingType: agenda?.meetingType || "",
            templateFile: agenda?.fileName || "",
          };
        })
      : [];

    setFormData((prevData) => ({
      ...prevData,
      agendaItems: selectedAgendas,
    }));
  };

  const handleSelectChange = (selectedOptions) => {
    // Extract only the selected values (IDs)
    const selectedValues = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];
    setFormData({ ...formData, agendaItems: selectedValues });
  };

  const agendaOptions = agendaList.map((agenda) => ({
    value: agenda.templateName,
    label: agenda.templateName,
  }));

  const agendaFileOptions = agendaList.map((agenda) => ({
    value: agenda.fileName,
    label: agenda.fileName,
  }));
  const directorOptions = directorList.map((director) => ({
    value: director.id,
    label: director.name,
  }));

  const validateForm = () => {
    const {
      title,
      client_name,
      description,
      meetingType,
      date,
      startTime,
      endTime,
      organizer,
      location,
    } = formData;

    if (
      !title ||
      !client_name ||
      !description ||
      !date ||
      !startTime ||
      !endTime ||
      !organizer ||
      !location
    ) {
      toast.error("Please fill out all required fields.");
      return false;
    }
    if (new Date(date) < new Date()) {
      toast.error("Date cannot be in the past.");
      return false;
    }

    if (startTime && endTime && endTime <= startTime) {
      toast.error("End time cannot be before or equal to start time.");
      return false;
    }

    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonLoading(true);
    if (!validateForm()) {
      return;
    }
    try {
      let response;
      if (editingRow) {
        response = await fetch(`${apiURL}/meeting/${editingRow.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          method: "PATCH",
          body: JSON.stringify(formData),
        });
        toast.success("Meeting template edited successfully");
        navigate("/meeting");
      } else {
        response = await fetch(`${apiURL}/meeting`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          toast.error(errorData.message || "Error editing the meeting.");
          return;
        }

        toast.success("Meeting added successfully");
        navigate("/meeting");
      }

      setFormData({
        title: "",
        client_name: "",
        description: "",
        meetingType: "",
        date: "",
        startTime: "",
        endTime: "",
        organizer: user.id,
        participants: [],
        agendaItems: [{ templateName: "", meetingType: "", templateFile: "" }],
        location: "",
        status: "scheduled",
      });
    } catch (error) {
      toast.error("Failed to add/edit item. Please try again.");
    } finally {
      setButtonLoading(false);
    }
  };

  return (
    <>
      <div
        style={{ width: "50%", marginLeft: "15px" }}
        show={openAddModal}
        onHide={handleCloseAddModal}
      >
        <h2 className="mb-3 mt-5">{editingRow ? "Edit" : "Add"} Meeting</h2>

        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col>
                <Form.Group controlId="title">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter Title"
                  />
                </Form.Group>
              </Col>

              <Col>
                <Form.Group controlId="client_name">
                  <Form.Label>Client Name</Form.Label>
                  <Form.Control
                    as="select"
                    name="client_name"
                    value={formData.client_name}
                    onChange={handleChange}
                  >
                    <option value="">Select Client</option>
                    {clientList?.map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.name}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Group controlId="description">
                  <Form.Label className="f-label">Description</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter Description"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mt-4">
              <h5>Meeting Documents</h5>

              <Form.Group controlId="agendaItems">
                <Select
                  options={agendaOptions}
                  placeholder="Select Meeting Documents"
                  isMulti
                  value={formData.agendaItems.map((item) => ({
                    value: item.templateName,
                    label: item.templateName,
                  }))}
                  onChange={handleAgendaItemChange}
                  isClearable
                />
              </Form.Group>
            </Row>

            <Row>
              <Col>
                <Form.Group controlId="date">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="participants" className="mt-2">
                  <Form.Label>Participants</Form.Label>
                  <Select
                    isMulti
                    options={directorOptions}
                    value={directorOptions.filter((option) =>
                      formData.participants.includes(option.value)
                    )}
                    onChange={(selectedOptions) => {
                      // Update the formData with the selected participant IDs
                      setFormData({
                        ...formData,
                        participants: selectedOptions.map(
                          (option) => option.value
                        ),
                      });
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Col>
              <Form.Group className="mt-2" controlId="other-participants">
                <Form.Label>Other Participants</Form.Label>
                {formData.other_participants.map((participant, index) => (
                  <div key={index} className="participant-inputs">
                    <Row>
                      <Col>
                        <Form.Control
                          type="text"
                          value={participant.name || ""}
                          onChange={(e) =>
                            handleParticipantChange(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          placeholder="Enter Participant Name"
                        />
                      </Col>
                      <Col>
                        <Form.Control
                          type="email"
                          value={participant.email || ""}
                          onChange={(e) =>
                            handleParticipantChange(
                              index,
                              "email",
                              e.target.value
                            )
                          }
                          placeholder="Enter Participant Email"
                        />
                      </Col>
                    </Row>

                    <Row>
                      <Col>
                        <Button
                          className="mt-2"
                          type="button"
                          variant="danger"
                          onClick={() => handleRemoveParticipant(index)}
                        >
                          Remove
                        </Button>
                      </Col>
                    </Row>
                  </div>
                ))}
              </Form.Group>
            </Col>
            <Row>
              <Button
                className="mt-2"
                style={{ width: "300px", marginBottom: "30px" }}
                type="button"
                onClick={handleAddParticipant}
              >
                Add Participant
              </Button>
            </Row>
            <Row>
              <Col>
                <Form.Group controlId="startTime">
                  <Form.Label>Start Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="endTime">
                  <Form.Label>End Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Group controlId="location">
                  <Form.Label className="f-label">Location</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter Location"
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="status">
                  <Form.Label className="f-label">Status</Form.Label>
                  <Form.Control
                    as="select"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="">Select Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
            <div className="mt-2">
              <Button
                variant="primary"
                onClick={handleCloseAddModal}
                className="me-2"
              >
                Cancel
              </Button>
              <Button variant="secondary" type="submit" className="ml-2">
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
            </div>
          </Form>
        </Modal.Body>
      </div>
      <ToastContainer autoClose={3000} />
    </>
  );
}
