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
import { useLocation } from "react-router-dom";
import Select from "react-select";

export default function EditMeeting() {
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
  const location = useLocation();
  const row = location.state?.row;
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
        fileName: "",
      },
    ],
    location: "",
    status: "scheduled",
  });
  const navigate = useNavigate();
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

      toast.success("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item. Please try again.");
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
    console.log(row, "rowwww", new Date(row.date).toLocaleDateString());
    setEditingRow(row);
    setOpenAddModal(true);
    const participantIds = row.participants.map(
      (participant) => participant.id
    );
    setFormData({
      title: row.title,
      client_name: row.client_name?.id || "",
      description: row.description,
      meetingType: row.meetingType,
      date: new Date(row.date).toLocaleDateString(),
      startTime: row.startTime,
      endTime: row.endTime,
      organizer: row.organizer?.role,
      participants: participantIds,
      agendaItems: row.agendaItems.map((agendaItem) => ({
        templateName: agendaItem.templateName,
        templateFile: agendaItem.templateFile,
        meetingType: agendaItem.meetingType,
        fileName: agendaItem.fileName,
      })),
      location: row.location,
      status: row.status,
    });
    if (row.client_name?.id) {
      fetchDirectors(row.client_name.id);
    }
  };
  useEffect(() => {
    handleEditClick(row);
  }, [row]);

  //   const handleAgendaItemChange = (index, field, value) => {
  //     setFormData((prevData) => {
  //       const updatedAgendaItems = [...prevData.agendaItems];
  //       updatedAgendaItems[index] = {
  //         ...updatedAgendaItems[index],
  //         [field]: value,
  //       };
  //       return { ...prevData, agendaItems: updatedAgendaItems };
  //     });
  //   };
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
          updatedAgendaItems[index].fileName = selectedAgenda.fileName;
        } else {
          updatedAgendaItems[index].meetingType = "";
          updatedAgendaItems[index].fileName = "";
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
        { templateName: "", meetingType: "board_meeting", fileName: "" },
      ],
    }));
  };

  const removeAgendaItem = (index) => {
    if (formData.agendaItems.length > 1) {
      setFormData((prevData) => ({
        ...prevData,
        agendaItems: prevData.agendaItems.filter((_, i) => i !== index),
      }));
    } else {
      toast.error("Please fill atleast 1 Agenda Item");
    }
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
    const { meetingType, date, startTime, endTime, location } = formData;

    if (!meetingType || !date || !startTime || !endTime || !location) {
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
    try {
      let response;
      if (!validateForm()) {
        return;
      }
      if (editingRow) {
        console.log(formData, "cg-1");
        response = await fetch(`${apiURL}/meeting/${editingRow.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        if (!response.ok) {
          const errorData = await response.json();
          toast.error(errorData.message || "Error editing the meeting.");
          return;
        }

        toast.success("Meeting template edited successfully");
        navigate("/meeting");
      } else {
        response = await fetch(`${apiURL}/meeting`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        if (!response.ok) {
          const errorMessage = await response
            .json()
            .then((data) => data.message || "Failed to add item");
          toast.error(errorMessage);
          return;
        }
        toast.success("Meeting added successfully");
        const updatedResponse = await fetch(`${apiURL}/meeting`);
        const data = await updatedResponse.json();
        setRows(data.results);
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
        organizer: user.id,
        participants: [],
        agendaItems: [{ templateName: "", meetingType: "", fileName: "" }],
        location: "",
        status: "scheduled",
      });
    } catch (error) {
      toast.error("Failed to add/edit item. Please try again.");
    }
  };

  const options = directorList.map((director) => ({
    value: director.id,
    label: director.name,
  }));

  return (
    <>
      <div
        style={{ width: "50%", marginLeft: "15px" }}
        show={openAddModal}
        onHide={handleCloseAddModal}
      >
        <h2 className="mb-3 mt-5">Edit Meeting</h2>

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
                        <Select
                          options={agendaOptions}
                          placeholder="Select Meeting Template"
                          value={
                            agendaOptions.find(
                              (option) =>
                                option.value === agendaItem?.templateName
                            ) || null
                          }
                          onChange={(selectedOption) =>
                            handleAgendaItemChange(
                              index,
                              "templateName",
                              selectedOption ? selectedOption.value : ""
                            )
                          }
                          isClearable
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

                        <Select
                          options={agendaFileOptions}
                          value={
                            agendaFileOptions.find(
                              (option) => option.value === agendaItem?.fileName
                            ) || null
                          }
                          isDisabled
                          isSearchable={false}
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Button
                        className="d-flex align-items-center gap-2 mt-4"
                        variant="outline-danger"
                        onClick={() => removeAgendaItem(index)}
                      >
                        <FaTrash /> Agenda Item
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
                  <Select
                    isMulti
                    value={options.filter((option) =>
                      formData.participants.includes(option.value)
                    )}
                    options={options}
                    onChange={(selectedOptions) => {
                      const selectedValues = selectedOptions.map(
                        (option) => option.value
                      );

                      // Update formData with the new selected participants
                      setFormData({
                        ...formData,
                        participants: selectedValues,
                      });
                    }}
                    placeholder="Select participants"
                    className="basic-multi-select"
                    classNamePrefix="select"
                  />
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
            <div className="mt-2">
              <Button
                variant="primary"
                onClick={handleCloseAddModal}
                className="me-2"
              >
                Cancel
              </Button>
              <Button variant="secondary" type="submit" className="ml-2">
                Save
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </div>
      <ToastContainer autoClose={3000} />
    </>
  );
}
