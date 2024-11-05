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

export default function Meeting() {
  const [rows, setRows] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => setOpenAddModal(false);
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
    organizer: "",
    participants: [],
    agendaItems: [
      {
        templateName: "",
        meetingType: "",
        fileName: "",
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
        console.log(data.results, "agendaName");
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

  const handleDeleteClick = async (row) => {
    try {
      const response = await fetch(`${apiURL}/meeting/${row.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      setRows((prevRows) => prevRows.filter((item) => item.id !== row.id));

      alert("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { id, name, value } = e.target;
    setFormData({ ...formData, [id || name]: value });
    if (name === "client_name" && value) {
      fetchDirectors(value);
    }
  };
  const handleDirectorSelection = (e) => {
    const selectedDirectorId = e.target.value;
    const selectedDirector = directorList.find(
      (director) => director.id === selectedDirectorId
    );
    if (selectedDirector) {
      setFormData((prevData) => ({
        ...prevData,
        participants: [...prevData.participants, selectedDirector],
      }));
    }
  };
  const handleParticipantChange = (selectedDirectorId) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      participants: [...prevFormData.participants, selectedDirectorId],
    }));
  };

  const handleEditClick = (row) => {
    setEditingRow(row);
    setOpenAddModal(true);
    setFormData({
      title: row.title,
      client_name: row.client_name?._id || "",
      description: row.description,
      meetingType: row.meetingType,
      date: row.date,
      startTime: row.startTime,
      endTime: row.endTime,
      organizer: row.organizer,
      participants: row.participants || [],
      agendaItems: row.agendaItems.map((agendaItem) => ({
        templateName: agendaItem.templateName,
        meetingType: agendaItem.meetingType,
        fileName: agendaItem.fileName,
      })),
      location: row.location,
      status: row.status,
    });
  };

  const handleAgendaItemChange = (index, field, value) => {
    setFormData((prevData) => {
      const updatedAgendaItems = [...prevData.agendaItems];
      updatedAgendaItems[index] = {
        ...updatedAgendaItems[index],
        [field]: value,
      };
      return { ...prevData, agendaItems: updatedAgendaItems };
    });
  };

  const addAgendaItem = () => {
    setFormData((prevData) => ({
      ...prevData,
      agendaItems: [
        ...prevData.agendaItems,
        { templateName: "", meetingType: "board_meeting", fileName: "" },
      ],
    }));
  };

  const removeAgendaItem = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      agendaItems: prevData.agendaItems.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === editingRow.id ? { ...row, ...formData } : row
          )
        );
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
        const data = await response.json();
        setRows((prevRows) => [...prevRows, data]);
      }

      handleCloseAddModal();
      setFormData({
        title: "",
        client_name: "",
        description: "",
        meetingType: "",
        date: "",
        startTime: "",
        endTime: "",
        organizer: "",
        participants: [],
        agendaItems: [{ templateName: "", meetingType: "", fileName: "" }],
        location: "",
        status: "scheduled",
      });
    } catch (error) {
      toast.error("Failed to add/edit item. Please try again.");
    }
  };

  const handleOpenNewAddModal = () => {
    setEditingRow(null);
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
      agendaItems: [{ templateName: "", meetingType: "", fileName: "" }],
      location: "",
      status: "scheduled",
    });
    setOpenAddModal(true);
  };

  return (
    <>
      <Container fluid className="styled-table pt-3 mt-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Meeting</h4>
          <Button
            variant="primary"
            className="btn-box"
            onClick={handleOpenNewAddModal}
          >
            <FaPlus style={{ marginRight: "8px" }} /> Add
          </Button>
        </div>

        <Modal show={openAddModal} onHide={handleCloseAddModal}>
          <Modal.Header closeButton>
            <Modal.Title>{editingRow ? "Edit" : "Add"} Meeting</Modal.Title>
          </Modal.Header>
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
                      <option value="committee_meeting">
                        Committee Meeting
                      </option>
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
                            type="text"
                            value={agendaItem?.templateName || ""}
                            onChange={(e) =>
                              handleAgendaItemChange(
                                index,
                                "templateName",
                                e.target.value
                              )
                            }
                            placeholder="Enter Template Name"
                          />
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
                            value={agendaItem?.fileName || ""}
                            onChange={(e) =>
                              handleAgendaItemChange(
                                index,
                                "fileName",
                                e.target.value
                              )
                            }
                          >
                            <option value="">Select Meeting Agenda</option>
                            {agendaList.map((agenda) => (
                              <option key={agenda.id} value={agenda.fileName}>
                                {agenda.templateName}
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
                          <FaTrash /> Location
                        </Button>
                      </Col>
                    </Row>
                  </div>
                ))}
                <Button variant="primary" onClick={addAgendaItem}>
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
                  <Form.Group className="mt-3">
                    <Form.Label>Director</Form.Label>
                    <Form.Control
                      as="select"
                      onChange={(e) => {
                        const selectedDirectorId = e.target.value;
                        if (selectedDirectorId) {
                          handleParticipantChange(selectedDirectorId);
                        }
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

              <Button variant="primary" type="submit" className="mt-3 me-2">
                Save
              </Button>
              <Button
                variant="secondary"
                onClick={handleCloseAddModal}
                className="mt-3 ml-2"
              >
                Cancel
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        {loading ? (
          <div className="text-center mt-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center mt-5">
            <h5>No data available</h5>
          </div>
        ) : (
          <Table bordered hover responsive className="Master-table mt-5">
            <thead className="Master-Thead">
              <tr>
                <th>Meeting Name</th>
                <th>Client Name</th>
                <th>Meeting Type</th>
                <th>Agendas'</th>
                <th>Start Time</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <td>{row.title}</td>
                  <td>{row.client_name.name}</td>
                  <td>{row.meetingType}</td>
                  <td>
                    <button
                      style={{ textAlign: "center" }}
                      className="director-btn"
                      onClick={() => navigate(`/meeting-template/${row.id}`)}
                    >
                      View Agendas
                    </button>
                  </td>
                  <td style={{ textAlign: "center" }}>{row.startTime}</td>
                  <td>{new Date(row.date).toLocaleDateString()}</td>

                  <td>
                    <Button
                      variant="outline-secondary"
                      onClick={() => handleEditClick(row)}
                      className="me-2"
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      onClick={() => handleDeleteClick(row)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Container>
      <ToastContainer />
    </>
  );
}
