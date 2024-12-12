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
  const [docxUrl, setDocxUrl] = useState([]);
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
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    client_name: "",
    description: "",
    meetingType: "board_meeting",
    date: "",
    description: "To disburse Salary",
    startTime: "",
    organizer: user.id,
    participants: [],
    status: "scheduled",
    other_participants: [],
    agendaItems: [],
    variables: {},
    notes: {
      templateName: "Notice",
      meetingType: "board_meeting",
      templateFile: "",
    },
    mom: {
      templateName: "MOM",
      meetingType: "board_meeting",
      templateFile: "",
    },
    attendance: {
      templateName: "Attendance",
      meetingType: "board_meeting",
      templateFile: "",
    },
  });

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
        const idsToSkip = [
          "673efb66ace56b4760e37c61",
          "673f2063640f38762b0450c4",
          "673f2072640f38762b0450ca",
          "67515198aa5dd74676e405be",
          "6756b022696ba6002745bbeb",
          "6756ab53696ba6002745bbe5",
          "6756aaaa696ba6002745bbd9",
        ];

        const usableAgendas = data.results.filter(
          (item) => item.status === "usable" && !idsToSkip.includes(item.id)
        );

        setAgendaList(usableAgendas);
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
  const handleAgendaItemChange = (selectedOption) => {
    if (!selectedOption) {
      setFormData((prevData) => ({
        ...prevData,
        agendaItems: [],
      }));
      return;
    }

    const agenda = agendaList.find(
      (item) => item.templateName === selectedOption.value
    );

    setFormData((prevData) => ({
      ...prevData,
      agendaItems: [
        {
          templateName: selectedOption.value,
          meetingType: agenda?.meetingType || "",
          templateFile: agenda?.fileName || "",
        },
      ],
    }));
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiURL}/meeting-agenda-template`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        console.log(data, "daada");
        console.log(formData?.agendaItems[0], "selectedOption");

        setDocxUrl(data?.results);
        if (formData?.agendaItems[0]?.templateName == "BM Agenda Physical") {
          const noticeTemplate = data?.results?.find(
            (item) => item.id === "673efb66ace56b4760e37c61"
          );

          if (noticeTemplate) {
            setFormData((prevFormData) => ({
              ...prevFormData,
              notes: {
                ...prevFormData.notes,
                templateFile: noticeTemplate.fileName,
              },
            }));
          }
          const momTemplate = data?.results?.find(
            (item) => item.id === "673f2063640f38762b0450c4"
          );

          if (momTemplate) {
            setFormData((prevFormData) => ({
              ...prevFormData,
              mom: {
                ...prevFormData.mom,
                templateFile: momTemplate.fileName,
              },
            }));
          }
          const attendanceTemplate = data?.results?.find(
            (item) => item.id === "673f2072640f38762b0450ca"
          );

          if (attendanceTemplate) {
            setFormData((prevFormData) => ({
              ...prevFormData,
              attendance: {
                ...prevFormData.attendance,
                templateFile: attendanceTemplate.fileName,
              },
            }));
          }
          const shortNoticeTemplate = data?.results?.find(
            (item) => item.id === "67515198aa5dd74676e405be"
          );
          if (formData.date) {
            const formDate = new Date(formData.date);
            const currentDate = new Date();
            const timeDifference = formDate - currentDate;
            const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

            if (daysDifference < 7 && daysDifference >= 0) {
              setFormData((prevFormData) => ({
                ...prevFormData,
                notes: {
                  ...prevFormData.notes,
                  templateFile: shortNoticeTemplate.fileName,
                  templateName: "Short Notice",
                },
              }));
            } else {
              setFormData((prevFormData) => ({
                ...prevFormData,
                notes: {
                  ...prevFormData.notes,
                  templateFile: noticeTemplate.fileName,
                },
              }));
            }
          }
        } else if (formData?.agendaItems[0]?.templateName == "VC_BM_Agenda") {
          const noticeTemplate = data?.results?.find(
            (item) => item.id === "6756aaaa696ba6002745bbd9"
          );

          if (noticeTemplate) {
            setFormData((prevFormData) => ({
              ...prevFormData,
              notes: {
                ...prevFormData.notes,
                templateFile: noticeTemplate.fileName,
              },
            }));
          }
          const momTemplate = data?.results?.find(
            (item) => item.id === "6756ab53696ba6002745bbe5"
          );

          if (momTemplate) {
            setFormData((prevFormData) => ({
              ...prevFormData,
              mom: {
                ...prevFormData.mom,
                templateFile: momTemplate.fileName,
              },
            }));
          }
          const attendanceTemplate = data?.results?.find(
            (item) => item.id === "673f2072640f38762b0450ca"
          );

          if (attendanceTemplate) {
            setFormData((prevFormData) => ({
              ...prevFormData,
              attendance: {
                ...prevFormData.attendance,
                templateFile: attendanceTemplate.fileName,
              },
            }));
          }
          const shortNoticeTemplate = data?.results?.find(
            (item) => item.id === "6756b022696ba6002745bbeb"
          );
          if (formData.date) {
            const formDate = new Date(formData.date);
            const currentDate = new Date();
            const timeDifference = formDate - currentDate;
            const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

            if (daysDifference < 7 && daysDifference >= 0) {
              setFormData((prevFormData) => ({
                ...prevFormData,
                notes: {
                  ...prevFormData.notes,
                  templateFile: shortNoticeTemplate.fileName,
                  templateName: "Short Notice",
                },
              }));
            } else {
              setFormData((prevFormData) => ({
                ...prevFormData,
                notes: {
                  ...prevFormData.notes,
                  templateFile: noticeTemplate.fileName,
                },
              }));
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formData?.agendaItems[0]]);

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
      organizer,
      location,
    } = formData;

    if (
      !title ||
      !client_name ||
      !description ||
      !date ||
      !startTime ||
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

    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setButtonLoading(true);
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
    } catch (error) {
      toast.error("Failed to add/edit item. Please try again.");
    } finally {
      setButtonLoading(false);
      setLoading(false);
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
                    {clientList?.map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.company_name}
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

            <Row className="mt-2 mb-2">
              <Form.Label>Meeting Documents</Form.Label>

              <Form.Group controlId="agendaItems">
                <Select
                  options={agendaOptions}
                  placeholder="Select Meeting Document"
                  value={
                    formData.agendaItems.length > 0
                      ? {
                          value: formData.agendaItems[0].templateName,
                          label: formData.agendaItems[0].templateName,
                        }
                      : null
                  }
                  onChange={handleAgendaItemChange}
                  isClearable
                />

                {/* <Select
                  options={agendaOptions}
                  placeholder="Select Meeting Documents"
                  isMulti
                  value={
                    formData.agendaItems.length > 0
                      ? {
                          value: formData.agendaItems[0].templateName,
                          label: formData.agendaItems[0].templateName,
                        }
                      : null
                  }
                  onChange={handleAgendaItemChange}
                  isClearable
                /> */}
              </Form.Group>
            </Row>

            <Row>
              <Col>
                <Form.Group controlId="date">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData?.date}
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
                {formData.other_participants.map((participant, index) => (
                  <div key={index} className="participant-inputs">
                    <Row className="mt-2">
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
                Click to add more Participant
              </Button>
            </Row>
            <Row>
              <Col>
                <Form.Group controlId="startTime">
                  <Form.Label className="f-label">Start Time</Form.Label>
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

            <div className="mt-4">
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
