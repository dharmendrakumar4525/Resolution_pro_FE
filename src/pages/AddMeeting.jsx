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

  const user = JSON.parse(localStorage.getItem("user")) || {};
  console.log(user);
  const [formData, setFormData] = useState({
    title: "",
    client_name: "",
    description: "",
    meetingType: "",
    date: "",
    startTime: "",
    endTime: "",
    organizer: user.id,
    participants: [],
    agendaItems: [
      {
        templateName: "",
        meetingType: "",
        templateFile: "",
      },
    ],
    location: "",
    status: "scheduled",
  });
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiURL}/meeting`);
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
        const response = await fetch(`${apiURL}/customer-maintenance`);
        const data = await response.json();
        setClientList(data.docs);
        console.log(data.docs, "ds");
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    const fetchAgendaList = async () => {
      try {
        const response = await fetch(`${apiURL}/meeting-agenda-template`);
        const data = await response.json();
        setAgendaList(data.results);
      } catch (error) {
        console.error("Error fetching Agenda:", error);
      }
    };
    fetchClientList();
    fetchAgendaList();
  }, []);
  const fetchDirectors = async (clientId) => {
    try {
      const response = await fetch(
        `${apiURL}/director-data/directors/${clientId}`
      );
      const data = await response.json();
      setDirectorList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching directors:", error);
    }
  };

  const handleChange = (e) => {
    const { id, name, value } = e.target;
    setFormData({ ...formData, [id || name]: value });
    if (name === "client_name" && value) {
      fetchDirectors(value);
    }
  };

  const handleAgendaItemChange = (index, field, value) => {
    setFormData((prevData) => {
      const updatedAgendaItems = [...prevData.agendaItems];

      // Update the selected field value
      updatedAgendaItems[index] = {
        ...updatedAgendaItems[index],
        [field]: value,
      };

      // Auto-fill related fields based on Template Name selection
      if (field === "templateName") {
        const selectedAgenda = agendaList.find(
          (agenda) => agenda.templateName === value
        );

        if (selectedAgenda) {
          updatedAgendaItems[index].meetingType = selectedAgenda.meetingType;
          updatedAgendaItems[index].templateFile = selectedAgenda.fileName;
        } else {
          updatedAgendaItems[index].meetingType = "";
          updatedAgendaItems[index].templateFile = "";
        }
      }

      return { ...prevData, agendaItems: updatedAgendaItems };
    });
  };

  const addAgendaItem = () => {
    setFormData((prevData) => ({
      ...prevData,
      agendaItems: [
        ...prevData.agendaItems,
        { templateName: "", meetingType: "board_meeting", templateFile: "" },
      ],
    }));
  };

  const removeAgendaItem = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      agendaItems: prevData.agendaItems.filter((_, i) => i !== index),
    }));
  };
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
      !meetingType ||
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
    if (!validateForm()) {
      return;
    }
    try {
      let response;
      if (editingRow) {
        response = await fetch(`${apiURL}/meeting/${editingRow.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        toast.success("Meeting template edited successfully");
      } else {
        response = await fetch(`${apiURL}/meeting`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Failed to add item");
        }
        toast.success("Meeting added successfully");
        navigate("/meeting");
      }

      handleCloseAddModal();
      navigate("/meeting");
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
                <Form.Group controlId="client_name">
                  <Form.Label>Client Name</Form.Label>
                  <Form.Control
                    as="select"
                    name="client_name"
                    value={formData.client_name}
                    onChange={handleChange}
                  >
                    <option value="">Select Client</option>
                    {clientList.map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.name}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
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
              <Col>
                <Form.Group controlId="meetingType">
                  <Form.Label className="f-label">Meeting Type</Form.Label>
                  <Form.Control
                    as="select"
                    value={formData.meetingType}
                    onChange={handleChange}
                  >
                    <option value="">Select Meeting Type</option>

                    <option value="board_meeting">Board Meeting</option>
                    <option value="committee_meeting">Committee Meeting</option>
                    <option value="annual_general_meeting">
                      annual_general_meeting
                    </option>
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mt-4">
              <h5>Agenda Items</h5>

              {formData?.agendaItems?.map((agendaItem, index) => (
                <div key={index} className="agenda-item-block mb-4">
                  <Row className="mb-3">
                    <Col>
                      <Form.Group controlId={`templateName-${index}`}>
                        <Form.Label>Template Name</Form.Label>

                        <Form.Control
                          as="select"
                          value={agendaItem?.templateName || ""}
                          onChange={(e) =>
                            handleAgendaItemChange(
                              index,
                              "templateName",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Select Meeting template</option>
                          {agendaList.map((agenda) => (
                            <option key={agenda.id} value={agenda.templateName}>
                              {agenda.templateName}
                            </option>
                          ))}
                        </Form.Control>
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group controlId={`meetingType-${index}`}>
                        <Form.Label>Meeting Type</Form.Label>
                        <Form.Control
                          as="select"
                          value={agendaItem?.meetingType || ""}
                          onChange={(e) =>
                            handleAgendaItemChange(
                              index,
                              "meetingType",
                              e.target.value
                            )
                          }
                        >
                          <option value="board_meeting">Board Meeting</option>
                          <option value="committee_meeting">
                            Committee Meeting
                          </option>
                          <option value="annual_general_meeting">
                            Annual General Meeting
                          </option>
                        </Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Group controlId={`fileName-${index}`}>
                        <Form.Label className="f-label">File Name</Form.Label>

                        <Form.Control
                          as="select"
                          value={agendaItem?.templateFile || ""}
                          onChange={(e) =>
                            handleAgendaItemChange(
                              index,
                              "templateFile",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Select Meeting Agenda</option>
                          {agendaList.map((agenda) => (
                            <option key={agenda.id} value={agenda.fileName}>
                              {agenda.fileName}
                            </option>
                          ))}
                        </Form.Control>
                      </Form.Group>
                    </Col>
                    <Col>
                      <Button
                        className="d-flex align-items-center gap-2 mt-4"
                        variant="outline-danger"
                        onClick={() => removeAgendaItem(index)}
                      >
                        <FaTrash /> Agenda Template
                      </Button>
                    </Col>
                  </Row>
                </div>
              ))}
              <Button
                className="add-button mb-4"
                variant="primary"
                onClick={addAgendaItem}
              >
                Add Agenda Item
              </Button>
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
                  <Form.Control
                    as="select"
                    multiple
                    value={formData.participants}
                    onChange={(e) => {
                      // Convert selected options to an array of selected values
                      const selectedOptions = Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      );

                      // Update formData with the new selected participants
                      setFormData({
                        ...formData,
                        participants: selectedOptions,
                      });
                    }}
                  >
                    {directorList.map((director) => (
                      <option key={director.id} value={director.id}>
                        {director.name}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
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

            <Button
              variant="primary"
              onClick={handleCloseAddModal}
              className="mt-3 ml-2"
            >
              Cancel
            </Button>
            <Button variant="secondary" type="submit" className="mt-3 me-2">
              Save
            </Button>
          </Form>
        </Modal.Body>
      </div>
    </>
  );
}
