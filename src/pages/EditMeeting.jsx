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
  const [buttonLoading, setButtonLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("refreshToken");
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
    organizer: user.id,
    participants: [],
    other_participants: [
      {
        name: "",
        email: "",
      },
    ],
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
        const usableAgendas = data.results.filter(
          (item) => item.status === "usable"
        );

        setAgendaList(usableAgendas);
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

  const handleEditClick = (row) => {
    console.log(row, "rowwww", new Date(row.date).toLocaleDateString());
    setEditingRow(row);
    setOpenAddModal(true);
    const participantIds = row.participants.map(
      (participant) => participant?.director?.id
    );
    setFormData({
      title: row.title,
      client_name: row.client_name?.id || "",
      description: row.description,
      meetingType: "board_meeting",
      date: new Date(row.date).toLocaleDateString(),
      startTime: row.startTime,
      organizer: row.organizer?.role,
      participants: participantIds,
      agendaItems: row.agendaItems.map((agendaItem) => ({
        templateName: agendaItem.templateName,
        templateFile: agendaItem.templateFile,
        meetingType: agendaItem.meetingType,
      })),
      other_participants: row.other_participants.length
        ? row.other_participants
        : [
            {
              name: "",
              email: "",
            },
          ],
      location: row.location,
    });
    if (row.client_name?.id) {
      fetchDirectors(row.client_name.id);
    }
  };
  useEffect(() => {
    handleEditClick(row);
  }, [row]);
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
    const updatedParticipants = formData?.other_participants?.map(
      (participant, i) =>
        i === index ? { ...participant, [field]: value } : participant
    );

    setFormData((prevState) => ({
      ...prevState,
      other_participants: updatedParticipants,
    }));
  };
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
    const { meetingType, date, startTime, location } = formData;

    if (!meetingType || !date || !startTime || !location) {
      toast.error("Please fill out all required fields.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonLoading(true);

    try {
      if (!validateForm()) {
        setButtonLoading(false);
        return;
      }

      if (editingRow) {
        const sanitizedFormData = {
          ...formData,
          other_participants: formData.other_participants.map(
            ({ _id, ...rest }) => rest
          ),
        };

        let response;
        // Update an existing meeting
        response = await fetch(`${apiURL}/meeting/${editingRow.id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sanitizedFormData),
        });
        if (!response.ok) {
          const errorData = await response.json();
          toast.error(errorData.message || "Error editing the meeting.");
          setButtonLoading(false);
          return;
        }
        navigate("/meeting");
        toast.success("Meeting document edited successfully");
      } else {
        const sanitizedFormData = {
          ...formData,
          other_participants: formData.other_participants.map(
            ({ _id, ...rest }) => rest
          ),
        };

        let response;
        // Create a new meeting
        response = await fetch(`${apiURL}/meeting`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sanitizedFormData),
        });
        if (!response.ok) {
          const errorData = await response.json();
          toast.error(errorData.message || "Failed to add item.");
          setButtonLoading(false);
          return;
        }

        toast.success("Meeting added successfully");
      }
    } catch (error) {
      toast.error("Failed to add/edit item. Please try again.");
    } finally {
      setButtonLoading(false); // Hide button spinner
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
                    {clientList.map((client) => (
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
                    options={[
                      { value: "selectAll", label: "Select All" },
                      ...directorOptions,
                    ]}
                    value={
                      formData.participants.length === directorOptions.length
                        ? [
                            { value: "selectAll", label: "Select All" },
                            ...directorOptions,
                          ]
                        : directorOptions.filter((option) =>
                            formData.participants.some(
                              (participant) =>
                                participant.director === option.value
                            )
                          )
                    }
                    onChange={(selectedOptions) => {
                      if (
                        selectedOptions.some(
                          (option) => option.value === "selectAll"
                        ) &&
                        formData.participants.length !== directorOptions.length
                      ) {
                        // Select all participants
                        setFormData({
                          ...formData,
                          participants: directorOptions.map((option) => ({
                            director: option.value,
                            isPresent: false,
                          })),
                        });
                      } else if (
                        selectedOptions.some(
                          (option) => option.value === "selectAll"
                        ) &&
                        formData.participants.length === directorOptions.length
                      ) {
                        setFormData({
                          ...formData,
                          participants: [],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          participants: selectedOptions
                            .filter((option) => option.value !== "selectAll")
                            .map((option) => ({
                              director: option.value,
                              isPresent: false,
                            })),
                        });
                      }
                    }}
                    isClearable
                    isSearchable
                  />
                </Form.Group>
              </Col>
            </Row>
            <Col>
              <Form.Group className="mt-2" controlId="other-participants">
                <Form.Label>Other Participants</Form.Label>
                {formData?.other_participants?.map((participant, index) => (
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
