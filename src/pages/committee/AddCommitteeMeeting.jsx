import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiURL } from "../../API/api";
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

export default function AddCommitteeMeeting() {
  const [rows, setRows] = useState([]);
  const [docxUrl, setDocxUrl] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => navigate(-1);
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientList, setClientList] = useState([]);
  const [committeeList, setCommitteeList] = useState([]);
  const [agendaList, setAgendaList] = useState([]);
  const [directorList, setDirectorList] = useState([]);
  const [buttonLoading, setButtonLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("refreshToken");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    client_name: "",
    meetingType: "committee_meeting",
    date: "",
    startTime: "",
    standard_time: "",
    organizer: user.id,
    committee_id: "",
    participants: [],
    status: "scheduled",
    other_participants: [],
    agendaItems: [],
    variables: {},
    notes: {
      templateName: "Notice",
      meetingType: "committee_meeting",
      templateFile: "",
    },
    mom: {
      templateName: "MOM",
      meetingType: "committee_meeting",
      templateFile: "",
    },
    attendance: {
      templateName: "Attendance",
      meetingType: "committee_meeting",
      templateFile: "",
    },
    acknowledgement: {
      templateName: "Acknowledgement",
      meetingType: "committee_meeting",
      templateFile: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiURL}/committee-meeting`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setRows(data.results);
        // console.log(data.results,"meetCli")
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
        const idsToShow = [
          "67624c4b0ad6adf0a26aceb5",
          "67624fcd0ad6adf0a26aceeb",
        ];

        const usableAgendas = data.results.filter((item) =>
          idsToShow.includes(item.id)
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
    if (formData?.client_name && clientList.length > 0) {
      const selectedCompany = clientList.find(
        (company) => company._id === formData?.client_name
      );

      if (selectedCompany) {
        countPreviousMeetings(rows, selectedCompany._id);
      }
    }
  }, [formData?.client_name, clientList, rows]);
  function getOrdinalSuffix(number) {
    const suffixes = ["th", "st", "nd", "rd"];
    const value = number % 100;
    return (
      number + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0])
    );
  }
  const countPreviousMeetings = (meetData, selectedId) => {
    console.log(meetData, "meetDataaa");

    const previousCount = meetData.filter(
      (meeting) =>
        meeting?.client_name?.id === selectedId &&
        new Date(meeting.createdAt) < new Date()
    ).length;
    let result = getOrdinalSuffix(previousCount + 1);
    setFormData((prev) => ({
      ...prev,
      title: result + " " + "Committee Meeting",
    }));
  };
  const fetchCommitteeList = async (clientId) => {
    try {
      const response = await fetch(
        `${apiURL}/committee-member?client_name=${clientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setCommitteeList(data.results);
    } catch (error) {
      console.error("Error fetching Agenda:", error);
    }
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
    const updatedParticipants = formData?.other_participants.map(
      (participant, i) =>
        i === index ? { ...participant, [field]: value } : participant
    );

    setFormData((prevState) => ({
      ...prevState,
      other_participants: updatedParticipants,
    }));
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
          meetingType: "committee_meeting",
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

        setDocxUrl(data?.results);
        if (
          formData?.agendaItems[0]?.templateName == "Committee Agenda Physical"
        ) {
          const acknowledgementTemplate = data?.results?.find(
            (item) => item.id === "677e7c67e5450b6017e9e4e3"
          );
          console.log(acknowledgementTemplate, "a123");
          if (acknowledgementTemplate) {
            setFormData((prevFormData) => ({
              ...prevFormData,
              acknowledgement: {
                ...prevFormData.acknowledgement,
                templateFile: acknowledgementTemplate?.fileName,
              },
            }));
          }
          const noticeTemplate = data?.results?.find(
            (item) => item.id === "67624a370ad6adf0a26acea7"
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
            (item) => item.id === "67624da00ad6adf0a26acec9"
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
            (item) => item.id === "67624e1b0ad6adf0a26acedc"
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
            (item) => item.id === "677e7cfde5450b6017e9e4fc"
          );
          if (formData?.date) {
            const formDate = new Date(formData?.date);
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
        } else if (
          formData?.agendaItems[0]?.templateName == "Committee Agenda Virtual"
        ) {
          const acknowledgementTemplate = data?.results?.find(
            (item) => item.id === "677e7dade5450b6017e9e516"
          );
          console.log(acknowledgementTemplate, "a123");
          if (acknowledgementTemplate) {
            setFormData((prevFormData) => ({
              ...prevFormData,
              acknowledgement: {
                ...prevFormData.acknowledgement,
                templateFile: acknowledgementTemplate?.fileName,
              },
            }));
          }
          const noticeTemplate = data?.results?.find(
            (item) => item.id === "67624e660ad6adf0a26acee5"
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
            (item) => item.id === "677e7d61e5450b6017e9e50a"
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
            (item) => item.id === "67624e1b0ad6adf0a26acedc"
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
            (item) => item.id === "677e7e48e5450b6017e9e52a"
          );
          if (formData?.date) {
            const formDate = new Date(formData?.date);
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

  const agendaOptions = agendaList?.map((agenda) => ({
    value: agenda.templateName,
    label: agenda.templateName,
  }));

  const directorOptions = directorList?.map((director) => ({
    value: director.id,
    label: director.name,
  }));
  const CommitteeOptions = committeeList?.map((committee) => ({
    value: committee.id,
    label: committee.committee.name,
  }));
  const validateForm = () => {
    const {
      title,
      client_name,
      meetingType,
      date,
      startTime,
      organizer,
      location,
    } = formData;

    if (
      !title ||
      !client_name ||
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

      response = await fetch(`${apiURL}/committee-meeting`, {
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

      toast.success("Committee Meeting added successfully");
      navigate("/committee-meeting");
    } catch (error) {
      toast.error("Failed to add/edit item. Please try again.");
    } finally {
      setButtonLoading(false);
      setLoading(false);
    }
  };
  const clientOptions = clientList?.map((client) => ({
    value: client._id,
    label: client.company_name,
  }));
  const handleChange = (e) => {
    const { id, name, value } = e.target;
    console.log(id, name, value, "target");

    setFormData({ ...formData, [id || name]: value });
    // if (name === "client_name" && value) {
    //   fetchDirectors(value);
    // }
  };
  const fetchRegisteredAddress = async (cid) => {
    try {
      const response = await fetch(`${apiURL}/customer-maintenance/${cid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setFormData((prevData) => ({
        ...prevData,
        location: data.registered_address,
      }));
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };
  const handleClientChange = (selectedOption) => {
    console.log(selectedOption, "selected");
    setFormData({ ...formData, client_name: selectedOption?.value || "" });
    // if (name === "client_name" && value) {
    fetchCommitteeList(selectedOption?.value);
    fetchDirectors(selectedOption?.value);
    fetchRegisteredAddress(selectedOption?.value);

    // }
  };
  const timeZoneOptions = [
    { value: "IST", label: "Indian Standard Time (IST)" },
    { value: "UTC", label: "Coordinated Universal Time (UTC)" },
  ];
  const handleTimeZoneChange = (selectedOption) => {
    setFormData({
      ...formData,
      standard_time: selectedOption.value,
    });
    console.log("Selected Time Zone:", selectedOption.value);
  };

  return (
    <>
      <div
        style={{ marginRight: "15px", marginLeft: "15px" }}
        show={openAddModal}
        onHide={handleCloseAddModal}
      >
        <ToastContainer autoClose={3000} />

        <h2 className="mb-3 mt-5">Add Committee Meeting</h2>

        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6} lg={4}>
                <Form.Group controlId="client_name">
                  <Form.Label>
                    Client Name<sup>*</sup>
                  </Form.Label>
                  <Select
                    id="client-name-select"
                    options={clientOptions}
                    placeholder="Select Client"
                    value={clientOptions.find(
                      (option) => option.value === formData?.client_name
                    )}
                    onChange={handleClientChange}
                    isClearable
                  />
                  {/* <Form.Control
                    as="select"
                    name="client_name"
                    value={formData.client_name}
                    onChange={handleChange}
                    style={{
                      height: "50px", // Taller dropdown
                      width: "300px", // Wider dropdown
                      position: "absolute", // Positioned absolutely within its parent
                      top: "20px", // Distance from the top
                      left: "10px", // Distance from the left
                      padding: "10px", // More padding for better appearance
                    }}
                  >
                    <option value="">Select Client</option>
                    {clientList?.map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.company_name}
                      </option>
                    ))}
                  </Form.Control> */}
                </Form.Group>
              </Col>
              <Col md={6} lg={4}>
                <Form.Group controlId="title">
                  <Form.Label>
                    Title<sup>*</sup>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter Title"
                  />
                </Form.Group>
              </Col>
              <Col md={6} lg={4}>
                <Form.Label>
                  Meeting Documents<sup>*</sup>
                </Form.Label>

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
                </Form.Group>
              </Col>
            </Row>

            <Row className="mt-3">
              <Col md={6} lg={4}>
                <Form.Group controlId="date">
                  <Form.Label>
                    Date<sup>*</sup>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={formData?.date}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6} lg={4}>
                <Form.Group controlId="committee">
                  <Form.Label>
                    Committee<sup>*</sup>
                  </Form.Label>
                  <Select
                    options={CommitteeOptions}
                    onChange={(selectedOption) => {
                      const selectedCommittee = committeeList.find(
                        (committee) => committee.id === selectedOption.value
                      );

                      const members =
                        selectedCommittee?.committee_members.map((member) => ({
                          director: member.name.id,
                          isPresent: false,
                        })) || [];

                      setFormData({
                        ...formData,
                        committee_id: selectedOption.value,
                        participants: members,
                      });
                    }}
                    isClearable
                    isSearchable
                  />
                </Form.Group>
                {committeeList.length == 0 && (
                  <p style={{ color: "red", marginTop: "10px" }}>
                    Committee options are not available. Please add options
                    before proceeding.
                  </p>
                )}
              </Col>
              <Col md={6} lg={4}>
                <Form.Group controlId="participants">
                  <Form.Label>
                    Participants<sup>*</sup>
                  </Form.Label>
                  <Select
                    isDisabled
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
                {directorList.length == 0 && (
                  <p style={{ color: "red", marginTop: "10px" }}>
                    Director options are not available. Please add options
                    before proceeding.
                  </p>
                )}
              </Col>
            </Row>

            <Row>
              <Form.Group className="mt-2" controlId="other-participants">
                <Form.Label>Other Participants</Form.Label>
                {formData.other_participants.map((participant, index) => (
                  <div key={index} className="participant-inputs">
                    <Row className="mt-2">
                      <Col md={6} lg={4}>
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
                      <Col md={6} lg={4}>
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
                      <Col md={6} lg={4}>
                        <Button
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

              <Row>
                <Col>
                  <Button
                    className="mt-2"
                    style={{ width: "300px", marginBottom: "30px" }}
                    type="button"
                    onClick={handleAddParticipant}
                  >
                    Click to add more Participant
                  </Button>
                </Col>
              </Row>
            </Row>
            <Row></Row>
            <Row>
              <Col md={6} lg={4}>
                <Form.Group controlId="startTime">
                  <Form.Label className="f-label">
                    Start Time<sup>*</sup>
                  </Form.Label>
                  <Form.Control
                    type="time"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6} lg={4}>
                <Form.Group controlId="selectTimeZone">
                  <Form.Label className="f-label">
                    Select Time Zone<sup>*</sup>
                  </Form.Label>

                  <Select
                    id="time-zone-select"
                    options={timeZoneOptions}
                    onChange={handleTimeZoneChange}
                    isSearchable
                    placeholder="Choose Time Zone"
                  />
                </Form.Group>
              </Col>
              <Col md={6} lg={4}>
                <Form.Group controlId="location">
                  <Form.Label className="f-label">
                    Location<sup>*</sup>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
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
                Go Back
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
    </>
  );
}
