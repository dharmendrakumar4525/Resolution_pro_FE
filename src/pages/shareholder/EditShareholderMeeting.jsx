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
import { useLocation } from "react-router-dom";
import Select from "react-select";

export default function EditShareholderMeeting() {
  const [rows, setRows] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => navigate(-1);
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientList, setClientList] = useState([]);
  const [shareholderList, setShareholderList] = useState([]);
  const [selectedAuditor, setSelectedAuditor] = useState({});
  const [selectedSecretary, setSelectedSecretary] = useState({});
  const [selectedKompany, setSelectedKompany] = useState(false);
  const [agendaList, setAgendaList] = useState([]);
  const [directorList, setDirectorList] = useState([]);
  const [buttonLoading, setButtonLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("refreshToken");
  const location = useLocation();
  const row = location.state?.row;
  const [formData, setFormData] = useState({
    title: "",
    client_name: "",
    meetingType: "shareholder_meeting",
    shareholder_meeting_type: "",
    auditor_participant: {},
    secretary_participant: {},
    date: "",
    startTime: "",
    organizer: user.id,
    participants: [],
    standard_time: "",
    other_participants: [],
    shareholder_participants: [],

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
        const idsToShow = [
          "677f7e3d2522b858279b624a",
          "677f7e642522b858279b6250",
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
  const fetchShareholderList = async (clientId) => {
    try {
      const response = await fetch(
        `${apiURL}/shareholder-data?company_id=${clientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setShareholderList(data.results);

      console.log(data.results, "shre");
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
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
  useEffect(() => {
    if (formData?.client_name && clientList.length > 0) {
      const selectedCompany = clientList.find(
        (company) => company._id === formData?.client_name
      );

      if (selectedCompany) {
        setSelectedKompany([selectedCompany]);
        console.log([selectedCompany], "itz updated");
      }
    }
  }, [formData?.client_name, clientList, rows]);
  const handleEditClick = (row) => {
    console.log(
      row?.client_name?.id,
      "rowwww",
      new Date(row.date).toLocaleDateString()
    );
    setEditingRow(row);
    setOpenAddModal(true);
    const transformedParticipants = row?.participants.map((participant) => ({
      director: participant?.director?.id,
      isPresent: participant?.isPresent,
    }));
    const transformedShareholders = row?.shareholder_participants.map(
      (shareholder) => ({
        shareholder: shareholder?.shareholder?.id,
        isPresent: shareholder?.isPresent,
      })
    );
    console.log(
      transformedShareholders,
      "sharehi",
      new Date(row.date).toLocaleDateString()
    );
    setFormData({
      title: row?.title,
      client_name: row?.client_name?.id || "",
      meetingType: "shareholder_meeting",
      date: row.date.split("T")[0],
      startTime: row?.startTime,
      standard_time: row?.standard_time,

      organizer: row.organizer?.role,
      shareholder_participants: transformedShareholders,

      participants: transformedParticipants,
      agendaItems: row.agendaItems?.map((agendaItem) => ({
        templateName: agendaItem.templateName,
        templateFile: agendaItem.templateFile,
        meetingType: agendaItem.meetingType,
      })),
      other_participants: row.other_participants.length
        ? row.other_participants
        : [],
      location: row.location,
    });
    setSelectedAuditor(row?.auditor_participant);
    setSelectedSecretary(row?.secretary_participant);
    if (row.client_name?.id) {
      fetchDirectors(row.client_name.id);
      fetchShareholderList(row.client_name.id);
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

  const handleAgendaItemChange = (selectedOption) => {
    if (!selectedOption) {
      setFormData((prevData) => ({
        ...prevData,
        agendaItems: [],
      }));
      return;
    }

    const agenda = agendaList?.find(
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

  const agendaOptions = agendaList?.map((agenda) => ({
    value: agenda.templateName,
    label: agenda.templateName,
  }));

  const directorOptions = directorList?.map((director) => ({
    value: director.id,
    label: director.name,
  }));
  const shareholderOptions = shareholderList?.map((shareholder) => ({
    value: shareholder.id,
    label: shareholder.name,
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

      const sanitizedFormData = {
        ...formData,
        other_participants: formData.other_participants?.map(
          ({ _id, ...rest }) => rest
        ),
      };

      let response;
      // Update an existing meeting
      response = await fetch(`${apiURL}/shareholder-meeting/${editingRow.id}`, {
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
      toast.success("Shareholder Meeting added successfully");
      navigate("/shareholder-meeting");
    } catch (error) {
      toast.error(
        "Failed to edit Shareholder Meeting Details. Please try again."
      );
    } finally {
      setButtonLoading(false);
    }
  };

  const options = directorList?.map((director) => ({
    value: director?.id,
    label: director?.name,
  }));
  console.log(clientList, "clientList");
  const clientOptions = clientList?.map((client) => ({
    value: client._id,
    label: client.company_name,
  }));
  const handleChange = (e) => {
    const { id, name, value } = e.target;
    console.log(id, name, value, "target");

    setFormData({ ...formData, [id || name]: value });
  };

  const handleClientChange = (selectedOption) => {
    setFormData({ ...formData, client_name: selectedOption?.value || "" });
    fetchDirectors(selectedOption?.value);
    fetchShareholderList(selectedOption?.value);
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
        style={{ marginLeft: "15px", marginRight: "15px" }}
        show={openAddModal}
        onHide={handleCloseAddModal}
      >
        <ToastContainer autoClose={1000} />

        <h2 className="mb-4 mt-3">Edit Shareholder Meeting</h2>

        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6} lg={4}>
                <Form.Group controlId="title">
                  <Form.Label>
                    Title<sup>*</sup>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData?.title}
                    onChange={handleChange}
                    placeholder="Enter Title"
                  />
                </Form.Group>
              </Col>
              <Col md={6} lg={4}>
                <Form.Group controlId="client_name">
                  <Form.Label>
                    Client Name<sup>*</sup>
                  </Form.Label>
                  <Select
                    isDisabled={true}
                    id="client-name-select"
                    options={clientOptions}
                    placeholder="Select Client"
                    value={clientOptions?.find(
                      (option) => option.value === formData.client_name
                    )}
                    onChange={handleClientChange}
                    isClearable
                  />
                </Form.Group>
              </Col>
              <Col md={6} lg={4}>
                <Form.Group controlId="shareholder_meeting_type">
                  <Form.Label>
                    Meeting Type<sup>*</sup>
                  </Form.Label>
                  <Select
                    isDisabled
                    id="meeting-type-select"
                    options={[
                      { value: "AGM", label: "Annual General Meeting" },
                      { value: "EGM", label: "Extraordinary General Meeting" },
                    ]}
                    placeholder="Select Meeting Type"
                    value={[
                      { value: "AGM", label: "Annual General Meeting" },
                      { value: "EGM", label: "Extraordinary General Meeting" },
                    ].find(
                      (option) =>
                        option.value === formData?.shareholder_meeting_type
                    )}
                    onChange={(selectedOption) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        shareholder_meeting_type: selectedOption?.value || "",
                      }))
                    }
                    isClearable
                  />
                </Form.Group>
              </Col>
              <Col md={6} lg={4}>
                <Form.Label>
                  Meeting Documents<sup>*</sup>
                </Form.Label>

                <Form.Group controlId="agendaItems">
                  <Select
                    isDisabled
                    options={agendaOptions}
                    placeholder="Select Meeting Document"
                    value={
                      formData?.agendaItems.length > 0
                        ? {
                            value: formData?.agendaItems[0].templateName,
                            label: formData?.agendaItems[0].templateName,
                          }
                        : null
                    }
                    onChange={handleAgendaItemChange}
                    isClearable
                  />
                </Form.Group>
              </Col>

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
                <Form.Group controlId="shareholder" className="mt-2">
                  <Form.Label>
                    Shareholders<sup>*</sup>
                  </Form.Label>

                  <Select
                    isMulti
                    required
                    options={[
                      { value: "selectAll", label: "Select All" },
                      ...shareholderOptions,
                    ]}
                    value={
                      formData.shareholder_participants.length ===
                      shareholderList.length
                        ? [
                            { value: "selectAll", label: "Select All" },
                            ...shareholderOptions,
                          ]
                        : shareholderOptions.filter((option) =>
                            formData.shareholder_participants.some(
                              (participant) =>
                                participant.shareholder === option.value
                            )
                          )
                    }
                    onChange={(selectedOptions) => {
                      if (
                        selectedOptions.some(
                          (option) => option.value === "selectAll"
                        ) &&
                        formData.shareholder_participants.length !==
                          shareholderOptions.length
                      ) {
                        setFormData({
                          ...formData,
                          shareholder_participants: shareholderOptions.map(
                            (option) => ({
                              shareholder: option.value,
                              isPresent: false,
                            })
                          ),
                        });
                      } else if (
                        selectedOptions.some(
                          (option) => option.value === "selectAll"
                        ) &&
                        formData.shareholder_participants.length ===
                          shareholderOptions.length
                      ) {
                        setFormData({
                          ...formData,
                          shareholder_participants: [],
                        });
                      } else {
                        // Normal selection without "Select All"
                        setFormData({
                          ...formData,
                          shareholder_participants: selectedOptions
                            .filter((option) => option.value !== "selectAll")
                            .map((option) => ({
                              shareholder: option.value,
                              isPresent: false,
                            })),
                        });
                      }
                    }}
                    isClearable
                    isSearchable
                  />
                </Form.Group>

                {shareholderList.length == 0 && (
                  <p style={{ color: "red", marginTop: "10px" }}>
                    Shareholder options are not available. Please add options
                    before proceeding.
                  </p>
                )}
              </Col>
              <Col md={6} lg={4}>
                <Form.Group controlId="participants" className="mt-2">
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
              <Col md={6} lg={4} className="mt-5">
                <Form.Group controlId="include_secretary">
                  <Form.Check
                    type="checkbox"
                    label="Include Secretary Participant"
                    checked={Object.keys(selectedSecretary || {}).length > 0}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setFormData((prevData) => ({
                        ...prevData,
                        secretary_participant: isChecked
                          ? {
                              name:
                                selectedKompany[0]?.sectory_detail?.name || "",
                              isPresent: false,
                              isPresent_vc: false,
                            }
                          : {},
                      }));
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={6} lg={4} className="mt-5">
                <Form.Group controlId="include_auditor">
                  <Form.Check
                    type="checkbox"
                    label="Include Auditor Participant"
                    checked={Object.keys(selectedAuditor || {}).length > 0}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setFormData((prevData) => ({
                        ...prevData,
                        auditor_participant: isChecked
                          ? {
                              name:
                                selectedKompany[0]?.auditor_detail?.name || "",
                              isPresent: false,
                              isPresent_vc: false,
                            }
                          : {},
                      }));
                    }}
                  />
                </Form.Group>
              </Col>

              <Row>
                <Form.Group className="mt-2" controlId="other-participants">
                  <Form.Label>Other Participants</Form.Label>
                  {formData?.other_participants?.map((participant, index) => (
                    <div key={index} className="participant-inputs">
                      <Row className="mt-4">
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
              </Row>

              <Button
                className="mt-3"
                style={{ width: "300px", marginBottom: "30px" }}
                type="button"
                onClick={handleAddParticipant}
              >
                Click to add more Participant
              </Button>
            </Row>
            <Row>
              <Col md={6} lg={4}>
                <Form.Group controlId="startTime">
                  <Form.Label>
                    Start Time<sup>*</sup>
                  </Form.Label>
                  <Form.Control
                    type="time"
                    value={formData?.startTime}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6} lg={4}>
                <Form.Group controlId="standard_time">
                  <Form.Label>
                    Time Zone<sup>*</sup>
                  </Form.Label>

                  <Form.Control
                    type="text"
                    placeholder="Enter Time Zone"
                    value={formData.standard_time}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6} lg={4}>
                <Form.Group controlId="location">
                  <Form.Label>
                    Location<sup>*</sup>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData?.location}
                    onChange={handleChange}
                    placeholder="Enter Location"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="mt-3">
              <Button
                variant="primary"
                onClick={() => navigate(-1)}
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
