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

export default function AddShareholderMeeting() {
  const [rows, setRows] = useState([]);
  const [docxUrl, setDocxUrl] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => navigate(-1);
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientList, setClientList] = useState([]);
  const [shareholderList, setShareholderList] = useState([]);
  const [agendaList, setAgendaList] = useState([]);
  const [directorList, setDirectorList] = useState([]);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [selectedKompany, setSelectedKompany] = useState(false);
  const [clientDetail, setClientDetail] = useState({});

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("refreshToken");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    client_name: "",
    meetingType: "shareholder_meeting",
    shareholder_meeting_type: "",
    auditor_participant: {},
    secretary_participant: {},
    date: "",
    startTime: "",
    standard_time: "",
    organizer: user.id,
    participants: [],
    shareholder_participants: [],
    status: "scheduled",
    other_participants: [],
    agendaItems: [],
    variables: {},
    notes: {
      templateName: "Notice",
      meetingType: "shareholder_meeting",
      templateFile: "",
    },
    shortNotice: {
      templateName: "Notice",
      meetingType: "shareholder_meeting",
      templateFile: "",
    },
    mom: {
      templateName: "MOM",
      meetingType: "shareholder_meeting",
      templateFile: "",
    },
    attendance: {
      templateName: "Attendance",
      meetingType: "shareholder_meeting",
      templateFile: "",
    },
    acknowledgement: {
      templateName: "Acknowledgement",
      meetingType: "shareholder_meeting",
      templateFile: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiURL}/shareholder-meeting`, {
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
        console.log("data", data);
        const idsToShow = [
          "677f7e3d2522b858279b624a",
          "677f7e642522b858279b6250",
          "677f7e7e2522b858279b6256",
          "677f7e982522b858279b625c",
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
        setSelectedKompany([selectedCompany]);
        console.log([selectedCompany], "itz updated");
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
      title: result + " " + "Shareholder Meeting",
    }));
  };
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
      console.log(data.results, "shareholder");
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

  // const handleChange = (e) => {
  //   const { id, name, value } = e.target;
  //   setFormData({ ...formData, [id || name]: value });
  //   if (name === "client_name" && value) {
  //     fetchDirectors(value);
  //   }
  // };
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
          meetingType: "shareholder_meeting",
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
        if (formData?.agendaItems[0]?.templateName == "AGM Physical Agenda") {
          const acknowledgementTemplate = data?.results?.find(
            (item) => item.id === "677f7ecd2522b858279b6268"
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
            (item) => item.id === "677f7e7e2522b858279b6256"
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
            (item) => item.id === "677f7fc32522b858279b6288"
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
            (item) => item.id === "677f7eb92522b858279b6262"
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
            (item) => item.id === "677f80282522b858279b6294"
          );
          if (formData?.date) {
            const formDate = new Date(formData?.date);
            const currentDate = new Date();
            const timeDifference = formDate - currentDate;
            const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

            if (
              daysDifference <
                (clientDetail?.AGM_notice_period !== undefined
                  ? clientDetail.AGM_notice_period
                  : 7) &&
              daysDifference >= 0
            ) {
              setFormData((prevFormData) => ({
                ...prevFormData,
                notes: {
                  ...prevFormData.notes,
                  templateFile: noticeTemplate.fileName,
                  templateName: "Notice",
                },
                shortNotice: {
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
                shortNotice: null,
              }));
            }
          }
        } else if (
          formData?.agendaItems[0]?.templateName == "EGM Physical Agenda"
        ) {
          const acknowledgementTemplate = data?.results?.find(
            (item) => item.id === "677f7ef72522b858279b6277"
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
            (item) => item.id === "677f7e982522b858279b625c"
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
            (item) => item.id === "677f87d7d3115f06a4c3717a"
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
            (item) => item.id === "677f7eb92522b858279b6262"
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
            (item) => item.id === "677f80882522b858279b629d"
          );
          if (formData?.date) {
            const formDate = new Date(formData?.date);
            const currentDate = new Date();
            const timeDifference = formDate - currentDate;
            const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

            if (
              daysDifference <
                (clientDetail?.EGM_notice_period !== undefined
                  ? clientDetail.EGM_notice_period
                  : 7) &&
              daysDifference >= 0
            ) {
              setFormData((prevFormData) => ({
                ...prevFormData,
                notes: {
                  ...prevFormData.notes,
                  templateFile: noticeTemplate.fileName,
                  templateName: "Notice",
                },
                shortNotice: {
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
                shortNotice: null,
              }));
            }
          }
        } else if (
          formData?.agendaItems[0]?.templateName == "AGM Virtual Agenda"
        ) {
          const acknowledgementTemplate = data?.results?.find(
            (item) => item.id === "677f7ef72522b858279b6277"
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
            (item) => item.id === "677f7e982522b858279b625c"
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
            (item) => item.id === "677f87d7d3115f06a4c3717a"
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
            (item) => item.id === "677f7eb92522b858279b6262"
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
            (item) => item.id === "677f80882522b858279b629d"
          );
          if (formData?.date) {
            const formDate = new Date(formData?.date);
            const currentDate = new Date();
            const timeDifference = formDate - currentDate;
            const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

            if (
              daysDifference <
                (clientDetail?.AGM_notice_period !== undefined
                  ? clientDetail.AGM_notice_period
                  : 7) &&
              daysDifference >= 0
            ) {
              setFormData((prevFormData) => ({
                ...prevFormData,
                notes: {
                  ...prevFormData.notes,
                  templateFile: noticeTemplate.fileName,
                  templateName: "Notice",
                },
                shortNotice: {
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
                shortNotice: null,
              }));
            }
          }
        } else if (
          formData?.agendaItems[0]?.templateName == "EGM Virtual Agenda"
        ) {
          const acknowledgementTemplate = data?.results?.find(
            (item) => item.id === "677f7ef72522b858279b6277"
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
            (item) => item.id === "677f7e982522b858279b625c"
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
            (item) => item.id === "677f87d7d3115f06a4c3717a"
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
            (item) => item.id === "677f7eb92522b858279b6262"
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
            (item) => item.id === "677f80882522b858279b629d"
          );
          if (formData?.date) {
            const formDate = new Date(formData?.date);
            const currentDate = new Date();
            const timeDifference = formDate - currentDate;
            const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

            if (
              daysDifference <
                (clientDetail?.EGM_notice_period !== undefined
                  ? clientDetail.EGM_notice_period
                  : 7) &&
              daysDifference >= 0
            ) {
              setFormData((prevFormData) => ({
                ...prevFormData,
                notes: {
                  ...prevFormData.notes,
                  templateFile: noticeTemplate.fileName,
                  templateName: "Notice",
                },
                shortNotice: {
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
                shortNotice: null,
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
  const shareholderOptions = shareholderList?.map((shareholder) => ({
    value: shareholder.id,
    label: shareholder.name,
  }));
  const shareholderEquityOptions = shareholderList
    .filter((share) => share.type === "equity")
    ?.map((shareholder) => ({
      value: shareholder.id,
      label: shareholder.name,
    }));
  const shareholderPreferentialOptions = shareholderList
    .filter((share) => share.type === "preference")
    ?.map((shareholder) => ({
      value: shareholder.id,
      label: shareholder.name,
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

      response = await fetch(`${apiURL}/shareholder-meeting`, {
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
        setButtonLoading(false);
        return;
      }
      toast.success("Shareholder Meeting added successfully");
      navigate("/shareholder-meeting");
    } catch (error) {
      toast.error("Failed to make Shareholder Meeting. Please try again.");
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
      setClientDetail(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };
  const handleClientChange = (selectedOption) => {
    console.log(selectedOption, "selected");
    setFormData({ ...formData, client_name: selectedOption?.value || "" });
    fetchDirectors(selectedOption?.value);
    fetchShareholderList(selectedOption?.value);
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
  console.log(shareholderOptions);
  return (
    <>
      <div
        style={{ marginLeft: "15px", marginRight: "15px" }}
        show={openAddModal}
        onHide={handleCloseAddModal}
      >
        <ToastContainer autoClose={1000} />

        <h2 className="mb-4 mt-3">Add Shareholder Meeting</h2>

        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6} lg={4} className="mt-1">
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
                </Form.Group>
              </Col>
              <Col md={6} lg={4} className="mt-1">
                <Form.Group controlId="title">
                  <Form.Label>
                    Title <sup>*</sup>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter Title"
                  />
                </Form.Group>
              </Col>
              <Col md={6} lg={4} className="mt-1">
                <Form.Group controlId="shareholder_meeting_type">
                  <Form.Label>
                    Meeting Type<sup>*</sup>
                  </Form.Label>
                  <Select
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
              <Col md={6} lg={4} className="mt-2">
                <Form.Group controlId="date">
                  <Form.Label>
                    Date <sup>*</sup>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={formData?.date}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6} lg={4} className="mt-2">
                <Form.Group controlId="shareholder" className="mt-2">
                  <Form.Label>
                    Shareholders <sup>*</sup>
                  </Form.Label>

                  <Select
                    isMulti
                    required
                    options={[
                      { value: "selectAll", label: "Select All" },
                      {
                        value: "selectEquity",
                        label: "Select All Equity Shareholder",
                      },
                      {
                        value: "selectPreference",
                        label: "Select All Preference Shareholder",
                      },
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
                          (option) => option.value === "selectEquity"
                        )
                      ) {
                        setFormData({
                          ...formData,
                          shareholder_participants:
                            shareholderEquityOptions.map((option) => ({
                              shareholder: option.value,
                              isPresent: false,
                            })),
                        });
                      } else if (
                        selectedOptions.some(
                          (option) => option.value === "selectPreference"
                        )
                      ) {
                        setFormData({
                          ...formData,
                          shareholder_participants:
                            shareholderPreferentialOptions.map((option) => ({
                              shareholder: option.value,
                              isPresent: false,
                            })),
                        });
                      } else if (
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
              <Col md={6} lg={4} className="mt-3">
                <Form.Group controlId="participants">
                  <Form.Label>
                    Participants <sup>*</sup>
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
              <Col md={6} lg={4} className="mt-3">
                <Form.Label>
                  Meeting Documents <sup>*</sup>
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

            <Row>
              <Col>
                <Form.Group className="mt-2" controlId="other-participants">
                  <Form.Label>Other Participants</Form.Label>
                  {formData.other_participants.map((participant, index) => (
                    <div key={index} className="participant-inputs">
                      <Row className="mt-2">
                        <Col md={6} lg={4} className="mt-3">
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
                        <Col md={6} lg={4} className="mt-3">
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
                        <Col md={6} lg={4} className="mt-3">
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
                <Button
                  className="mt-3"
                  style={{ width: "300px", marginBottom: "30px" }}
                  type="button"
                  onClick={handleAddParticipant}
                >
                  Click to add more Participant
                </Button>
              </Col>
            </Row>
            <Row>
              <Col md={6} lg={4} className="mt-3">
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
              <Col md={6} lg={4} className="mt-3">
                <Form.Group controlId="standard_time">
                  <Form.Label className="f-label">
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
              <Col md={6} lg={4} className="mt-3">
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

            <div className="mt-4 mb-4">
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
