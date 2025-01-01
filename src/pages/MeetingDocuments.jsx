import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Button,
  Form,
  Modal,
  Table,
  Container,
  Col,
  Row,
  Spinner,
  Tabs,
  Tab,
} from "react-bootstrap";
import { apiURL } from "../API/api";
import { FaEdit, FaTrash, FaPlus, FaFileWord } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const token = localStorage.getItem("refreshToken");

export default function MeetingDocuments() {
  const [rows, setRows] = useState([]);
  const [meetData, setMeetData] = useState([]);
  const [notice, setNotice] = useState({});
  const [attendance, setAttendance] = useState({});
  const [minutes, setMinutes] = useState({});
  const [acknowledgement, setAcknowledgement] = useState({});
  const [resolutions, setResolutions] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [leaveUrl, setLeaveUrl] = useState("");
  const [participantAttendance, setParticipantAttendance] = useState([]);
  const [leaveOfAbsence, setLeaveOfAbsence] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [key, setKey] = useState("agenda"); // Default tab

  const token = localStorage.getItem("refreshToken");
  const navigate = useNavigate();
  const { id } = useParams();

  // Tab-specific IDs
  const tabIds = {
    agenda: id,
    notice: id,
    mom: id,
    resolution: id,
    attendance: id,
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiURL}/meeting/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setRows(data?.agendaItems || []);
        setMeetData(data);
        console.log(data, "agena");
        setParticipants(data?.participants || []);
        setNotice(data?.notes || {});
        setMinutes(data?.mom || {});
        setAcknowledgement(data?.acknowledgement || {});
        setAttendance(data?.attendance || {});
        setResolutions(data?.resolutions || []);
        setLeaveOfAbsence(data?.leave_of_absense || []);
      } catch (error) {
        console.error(`Error fetching ${key} data:`, error);
      } finally {
        setLoading(false);
      }
    };
    const fetchLeaveAgendaUrl = async () => {
      try {
        const response = await fetch(
          `${apiURL}/meeting-agenda-template/676a5898db544a64c6baa096`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setLeaveUrl(data?.fileName);
      } catch (error) {
        console.error("Error fetching Agenda:", error);
      }
    };

    fetchData();

    fetchLeaveAgendaUrl();
  }, [key, refresh]);

  const handleEditClick = (row, index) => {
    navigate(`/template-edit/${id}`, {
      state: { index, fileUrl: `${row?.templateFile}` },
    });
  };
  const handleView = (row) => {
    if (`${row?.filedocx}` == null) {
      toast.warn("Please save the related document first");
      return;
    }
    navigate(`/template-group-meeting-view/${id}`, {
      state: { fileUrl: `${row?.filedocx}` },
    });
  };
  const sendApproval = async (meetData) => {
    const formData = {
      meeting_id: meetData?.id,
      meeting_type: meetData?.meetingType,
      company_id: meetData?.client_name.id,
    };
    try {
      const response = await fetch(`${apiURL}/meeting-approval`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const patchResponse = await fetch(`${apiURL}/meeting/${meetData.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_approved: false, approval_status: "review" }),
      });
      if (response.ok && patchResponse.ok) {
        setMeetData((prevData) => ({
          ...prevData,
          is_approved: false,
        }));
        toast.success("Document send for approval");
      } else {
        console.log("Failed to save the document.");
      }
    } catch (error) {
      toast.error("Error occurred while saving the document.");
    }
  };
  const handleNoticeEditClick = (url, index) => {
    navigate(`/notice-edit/${id}`, {
      state: {
        index,
        fileUrl: url,
      },
    });
  };

  const handleNoticeView = (url, index) => {
    if (url == null) {
      toast.warn("Please save the related document first");
      return;
    }
    navigate(`/template-group-meeting-view/${id}}`, {
      state: {
        index,
        fileUrl: url,
      },
    });
  };
  const handleMOMEditClick = (url, index) => {
    navigate(`/mom-edit/${id}`, {
      state: {
        index,
        fileUrl: url,
      },
    });
  };

  const handleMOMView = (url, index) => {
    if (url == null) {
      toast.warn("Please save the related document first");
      return;
    }
    navigate(`/template-group-meeting-view/${id}}`, {
      state: {
        index,
        fileUrl: url,
      },
    });
  };
  const handleAttendanceEditClick = (url, index) => {
    navigate(`/attendance-edit/${id}`, {
      state: {
        index,
        fileUrl: url,
      },
    });
  };

  const handleAttendanceView = (url, index) => {
    if (url == null) {
      toast.warn("Please save the related document first");
      return;
    }
    navigate(`/template-group-meeting-view/${id}`, {
      state: {
        index,
        fileUrl: url,
      },
    });
  };
  const handleAbsenceEdit = (item, index) => {
    navigate(`/leave-edit/${id}`, {
      state: {
        index,
        fileUrl: item?.templateFile,
        leaveInfo: item,
      },
    });
  };

  const handleAbsenceView = (url, index) => {
    if (url == null) {
      toast.warn("Please save the related document first");
      return;
    }
    navigate(`/template-group-meeting-view/${id}`, {
      state: {
        index,
        fileUrl: url,
      },
    });
  };
  const handleAcknowledgementEdit = (url, index) => {
    navigate(`/acknowledgement-edit/${id}`, {
      state: {
        index,
        fileUrl: url,
      },
    });
  };

  const handleAcknowledgementView = (url, index) => {
    if (url == null) {
      toast.warn("Please save the related document first");
      return;
    }
    navigate(`/template-group-meeting-view/${id}`, {
      state: {
        index,
        fileUrl: url,
      },
    });
  };

  const handleResolEditClick = (row, index) => {
    navigate(`/resolution-edit/${id}`, {
      state: {
        index,
        fileUrl: row?.templateFile,
        resolTitle: row?.templateName,
      },
    });
  };

  const handleResolView = (url) => {
    if (url == null) {
      toast.warn("Please save the related document first");
      return;
    }
    navigate(`/template-group-meeting-view/${id}`, {
      state: {
        fileUrl: url,
      },
    });
  };

  const handleCheckboxChange = (e, participant) => {
    const isChecked = e.target.checked;

    const updatedParticipants = participants.map((p) =>
      p.director.id === participant.director.id
        ? { ...p, isPresent: isChecked }
        : p
    );
    setParticipants(updatedParticipants);
  };

  const patchAttendance = async () => {
    try {
      const url = `${apiURL}/meeting/${id}`;
      const transformedParticipants = participants.map((participant) => ({
        director: participant?.director?.id,
        isPresent: participant?.isPresent,
      }));
      const absentees = participants
        .filter((participant) => participant.isPresent === false)
        .map((participant) => ({
          director: participant?.director?.id,
          templateName: `Leave of Absence`,
          meetingType: "board_meeting",
          templateFile: leaveUrl,
        }));

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participants: transformedParticipants,
          leave_of_absense: absentees,
        }),
      });

      if (response.ok) {
        toast.success("Attendance updated successfully");
        setRefresh(!refresh);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      toast.error("Error updating attendance:", error);
    }
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mt-3 mb-5 head-box">
        <h4 className="h4-heading-style">Meeting Info</h4>
      </div>
      <Tabs
        id="controlled-tab-example"
        activeKey={key}
        onSelect={(k) => {
          if (
            (k === "notice" ||
              k === "mom" ||
              k === "attendance" ||

              k == "resolution" ||
              k === "acknowledgement") &&
            !rows.some((row) => row?.fileName)
          ) {
            toast.warning("Please save meeting agenda document first.");
          } else if (k === "leaveOfAbsence" && leaveOfAbsence.length === 0) {
            toast.warning("Please mark attendance first.");

              k == "resolution") &&
            meetData?.approval_status !== "approved"
          ) {
            toast.warning("Documents are available only after approval.");

          } else {
            setKey(k);
          }
        }}
        className="mb-3"
      >
        <Tab eventKey="agenda" title="Meeting Agenda">
          {loading ? (
            <SpinnerContent />
          ) : rows.length === 0 ? (
            <NoDataContent />
          ) : (
            <TableContent
              rows={rows}
              meetData={meetData}
              handleEditClick={handleEditClick}
              handleView={handleView}
              sendApproval={sendApproval}
            />
          )}
        </Tab>

        <Tab eventKey="notice" title="Notice">
          <div className="table-responsive mt-5">
            <Table bordered hover className="Master-table">
              <thead className="Master-Thead">
                <tr>
                  <th style={{ width: "30%" }}>Name</th>
                  <th>Edit</th>
                  <th>View</th>
                  <th>Download-as PDF</th>
                  <th>Download-as Docx</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {notice.templateName === "Short Notice"
                      ? "Short Notice"
                      : "Notice"}
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      onClick={() =>
                        handleNoticeEditClick(notice?.templateFile, 1)
                      }
                    >
                      <FaEdit />
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      onClick={() => handleNoticeView(notice?.filedocx, 1)}
                    >
                      <FaFileWord />
                    </Button>
                  </td>
                  <td>
                    {notice?.fileName && notice?.fileName !== "" ? (
                      <Button
                        variant="outline-primary"
                        as="a"
                        href={notice?.fileName}
                        download="customFileName.docx"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <FaFileWord />
                      </Button>
                    ) : (
                      <span>No file available</span>
                    )}
                  </td>

                  <td>
                    {notice?.filedocx && notice?.filedocx !== "" ? (
                      <Button
                        variant="outline-primary"
                        as="a"
                        href={notice?.filedocx}
                        download="customFileName.docx"
                        rel="noopener noreferrer"
                      >
                        <FaFileWord />
                      </Button>
                    ) : (
                      <span>No file available</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Tab>

        <Tab eventKey="mom" title="MOM">
          <div className="table-responsive mt-5">
            <Table bordered hover className="Master-table">
              <thead className="Master-Thead">
                <tr>
                  <th style={{ width: "30%" }}>Name</th>
                  <th>Edit</th>
                  <th>View</th>
                  <th>Download-as PDF</th>
                  <th>Download-as Docx</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>MOM Document</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      onClick={() =>
                        handleMOMEditClick(minutes.templateFile, 1)
                      }
                    >
                      <FaEdit />
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      onClick={() => handleMOMView(minutes?.filedocx, 11)}
                    >
                      <FaFileWord />
                    </Button>
                  </td>
                  <td>
                    {minutes?.fileName && minutes?.fileName !== "" ? (
                      <Button
                        variant="outline-primary"
                        as="a"
                        href={minutes?.fileName}
                        download="customFileName.docx"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <FaFileWord />
                      </Button>
                    ) : (
                      <span>No file available</span>
                    )}
                  </td>

                  <td>
                    {minutes?.filedocx ? (
                      <Button
                        variant="outline-primary"
                        as="a"
                        href={minutes?.filedocx}
                        download="customFileName.docx"
                        rel="noopener noreferrer"
                      >
                        <FaFileWord />
                      </Button>
                    ) : (
                      <span>No file available</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Tab>

        <Tab eventKey="attendance" title="Attendance Register">
          <div className="table-responsive mt-5">
            <Table bordered hover className="Master-table">
              <thead className="Master-Thead">
                <tr>
                  <th>Name</th>
                  <th>Present in the Meeting</th>
                </tr>
              </thead>
              <tbody>
                {participants?.map((participant, index) => (
                  <tr key={index}>
                    <td>{participant?.director?.name}</td>
                    <td>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={participant?.isPresent}
                        onChange={(e) => handleCheckboxChange(e, participant)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Button
              className="mb-4 mt-2"
              style={{ alignContent: "right" }}
              onClick={patchAttendance}
            >
              Mark Attendance
            </Button>
            <br />
            <Table bordered hover className="Master-table">
              <thead className="Master-Thead">
                <tr>
                  <th style={{ width: "30%" }}>Name</th>
                  <th>Edit</th>
                  <th>View</th>
                  <th>Download-as PDF</th>
                  <th>Download-as Docx</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Attendance Document</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      onClick={() =>
                        handleAttendanceEditClick(attendance?.templateFile, 1)
                      }
                    >
                      <FaEdit />
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      onClick={() =>
                        handleAttendanceView(attendance?.filedocx, 1)
                      }
                    >
                      <FaFileWord />
                    </Button>
                  </td>
                  <td>
                    {attendance?.fileName ? (
                      <Button
                        variant="outline-primary"
                        as="a"
                        href={attendance?.fileName}
                        download="customFileName.docx"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <FaFileWord />
                      </Button>
                    ) : (
                      <span>No file available</span>
                    )}
                  </td>

                  <td>
                    {attendance?.filedocx ? (
                      <Button
                        variant="outline-primary"
                        as="a"
                        href={attendance?.filedocx}
                        download="customFileName.docx"
                        rel="noopener noreferrer"
                      >
                        <FaFileWord />
                      </Button>
                    ) : (
                      <span>No file available</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Tab>
        <Tab eventKey="leaveOfAbsence" title="Leave of Absence">
          <div className="table-responsive mt-5">
            <br />
            <Table bordered hover className="Master-table">
              <thead className="Master-Thead">
                <tr>
                  <th style={{ width: "30%" }}>Name</th>
                  <th>Edit</th>
                  <th>View</th>
                  <th>Download-as PDF</th>
                  <th>Download-as Docx</th>
                </tr>
              </thead>
              <tbody>
                {leaveOfAbsence?.map((item, index) => (
                  <tr key={index}>
                    <td>
                      {item?.director?.name} {item.templateName}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        onClick={() => handleAbsenceEdit(item, index)}
                      >
                        <FaEdit />
                      </Button>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        onClick={() => handleAbsenceView(item?.filedocx, index)}
                      >
                        <FaFileWord />
                      </Button>
                    </td>
                    <td>
                      {item?.fileName ? (
                        <Button
                          variant="outline-primary"
                          as="a"
                          href={item?.fileName}
                          download="customFileName.docx"
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <FaFileWord />
                        </Button>
                      ) : (
                        <span>No file available</span>
                      )}
                    </td>
                    <td>
                      {item?.filedocx ? (
                        <Button
                          variant="outline-primary"
                          as="a"
                          href={item?.filedocx}
                          download="customFileName.docx"
                          rel="noopener noreferrer"
                        >
                          <FaFileWord />
                        </Button>
                      ) : (
                        <span>No file available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Tab>

        <Tab eventKey="resolution" title="Resolution">
          <div className="table-responsive mt-5">
            <Table bordered hover className="Master-table">
              <thead className="Master-Thead">
                <tr>
                  <th style={{ width: "30%" }}>Name</th>
                  <th>Edit</th>
                  <th>View</th>
                  <th>Download-as PDF</th>
                  <th>Download-as Docx</th>
                </tr>
              </thead>
              <tbody>
                {resolutions.map((row, index) => (
                  <tr key={row?._id}>
                    <td>{row?.templateName}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        onClick={() => handleResolEditClick(row, index)}
                      >
                        <FaEdit />
                      </Button>
                    </td>

                    <td>
                      <Button
                        variant="outline-primary"
                        onClick={() => handleResolView(row?.filedocx)}
                      >
                        <FaFileWord />
                      </Button>
                    </td>
                    <td>
                      {row?.fileName && row?.fileName !== "" ? (
                        <Button
                          variant="outline-primary"
                          as="a"
                          href={`${row?.fileName}`}
                          download="customFileName.docx"
                          rel="noopener noreferrer"
                        >
                          <FaFileWord />
                        </Button>
                      ) : (
                        <span>No file available</span>
                      )}
                    </td>

                    <td>
                      {row?.filedocx && row?.filedocx !== "" ? (
                        <Button
                          variant="outline-primary"
                          as="a"
                          href={`${row?.filedocx}`}
                          download="customFileName.docx"
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <FaFileWord />
                        </Button>
                      ) : (
                        <span>No file available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Tab>
        <Tab eventKey="acknowledgement" title="Acknowledgement">
          <div className="table-responsive mt-5">
            <Table bordered hover className="Master-table">
              <thead className="Master-Thead">
                <tr>
                  <th style={{ width: "30%" }}>Name</th>
                  <th>Edit</th>
                  <th>View</th>
                  <th>Download-as PDF</th>
                  <th>Download-as Docx</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Acknowledgement Document</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      onClick={() =>
                        handleAcknowledgementEdit(
                          acknowledgement.templateFile,
                          1
                        )
                      }
                    >
                      <FaEdit />
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      onClick={() =>
                        handleAcknowledgementView(acknowledgement?.filedocx, 11)
                      }
                    >
                      <FaFileWord />
                    </Button>
                  </td>
                  <td>
                    {acknowledgement?.fileName &&
                    acknowledgement?.fileName !== "" ? (
                      <Button
                        variant="outline-primary"
                        as="a"
                        href={acknowledgement?.fileName}
                        download="customFileName.docx"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <FaFileWord />
                      </Button>
                    ) : (
                      <span>No file available</span>
                    )}
                  </td>

                  <td>
                    {acknowledgement?.filedocx ? (
                      <Button
                        variant="outline-primary"
                        as="a"
                        href={acknowledgement?.filedocx}
                        download="customFileName.docx"
                        rel="noopener noreferrer"
                      >
                        <FaFileWord />
                      </Button>
                    ) : (
                      <span>No file available</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Tab>
      </Tabs>
      <ToastContainer />
    </>
  );
}

function SpinnerContent() {
  return (
    <div className="text-center mt-5">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
}

function NoDataContent() {
  return (
    <div className="text-center mt-5">
      <h5>No data available</h5>
    </div>
  );
}

function TableContent({
  meetData,
  rows,
  handleEditClick,
  handleView,
  sendApproval,
}) {
  console.log(meetData);
  return (
    <div className="table-responsive mt-5">
      <Table bordered hover className="Master-table">
        <thead className="Master-Thead">
          <tr>
            <th style={{ width: "30%" }}>Name</th>
            <th>Edit</th>
            <th>View</th>
            <th>Download-as PDF</th>
            <th>Download-as Docx</th>
            <th>Send for approval</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row?._id}>
              <td>{row?.templateName}</td>
              <td>
                <Button
                  disabled={meetData?.approval_status == "approved"}
                  variant="outline-primary"
                  onClick={() => handleEditClick(row, index)}
                >
                  <FaEdit />
                </Button>
              </td>
              <td>
                <Button
                  variant="outline-primary"
                  onClick={() => handleView(row)}
                >
                  <FaFileWord />
                </Button>
              </td>
              <td>
                <Button
                  variant="outline-primary"
                  as="a"
                  href={`${row?.fileName}`}
                  download="customFileName.docx"
                  rel="noopener noreferrer"
                  target="_blank"
                  disabled={!row.is_active == true}
                >
                  <FaFileWord />
                </Button>
              </td>

              <td>
                <Button
                  variant="outline-primary"
                  as="a"
                  href={`${row?.filedocx}`}
                  download="customFileName.docx"
                  rel="noopener noreferrer"
                  disabled={!row.is_active == true}
                >
                  <FaFileWord />
                </Button>
              </td>
              <td>
                <Button
                  disabled={meetData?.is_approved == false}
                  onClick={() => sendApproval(meetData)}
                >
                  Send
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
