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
import { saveAs } from "file-saver";
import { apiURL } from "../../API/api";
import { FaEdit, FaTrash, FaPlus, FaFileWord } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const token = localStorage.getItem("refreshToken");

export default function CommitteeDocuments() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get("tab");
  const [rows, setRows] = useState([]);
  const [meetData, setMeetData] = useState([]);
  const [notice, setNotice] = useState({});
  const [attendance, setAttendance] = useState({});
  const [minutes, setMinutes] = useState({});
  const [buttonLoading, setButtonLoading] = useState(false);
  const [acknowledgement, setAcknowledgement] = useState({});
  const [resolutions, setResolutions] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [leaveUrl, setLeaveUrl] = useState("");
  const [participantAttendance, setParticipantAttendance] = useState([]);
  const [leaveOfAbsence, setLeaveOfAbsence] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [key, setKey] = useState(tab || "agenda");

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
        const response = await fetch(`${apiURL}/committee-meeting/${id}`, {
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
          `${apiURL}/meeting-agenda-template/677e7cb8e5450b6017e9e4f1`,
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
      state: { index, fileUrl: `${row?.templateFile}`, page: "committee" },
    });
  };
  const handleView = (row) => {
    if (`${row?.filehtml}` == null) {
      toast.warn("Please save the related document first");
      return;
    }
    navigate(`/template-group-meeting-view/${id}`, {
      state: { fileUrl: `${row?.filehtml}`, page: "committee" },
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
      const patchResponse = await fetch(
        `${apiURL}/committee-meeting/${meetData.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_approved: false,
            approval_status: "review",
          }),
        }
      );
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
        page: "committee",
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
        page: "committee",
      },
    });
  };
  const handleMOMEditClick = (url, index) => {
    navigate(`/mom-edit/${id}`, {
      state: {
        index,
        fileUrl: url,
        page: "committee",
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
        page: "committee",
      },
    });
  };
  const handleAttendanceEditClick = (url, index) => {
    navigate(`/attendance-edit/${id}`, {
      state: {
        index,
        fileUrl: url,
        page: "committee",
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
        page: "committee",
      },
    });
  };
  const handleAbsenceEdit = (item, index) => {
    navigate(`/leave-edit/${id}`, {
      state: {
        index,
        fileUrl: item?.templateFile,
        leaveInfo: item,
        page: "committee",
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
        page: "committee",
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
        page: "committee",
      },
    });
  };

  const handleResolEditClick = (row, index) => {
    navigate(`/resolution-edit/${id}`, {
      state: {
        index,
        fileUrl: row?.templateFile,
        resolTitle: row?.templateName,
        page: "committee",
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
        page: "committee",
      },
    });
  };

  const handleCheckboxChange = (e, participant, field) => {
    const isChecked = e.target.checked;

    const updatedParticipants = participants.map((p) => {
      if (p.director.id === participant.director.id) {
        if (field === "isPresent") {
          return {
            ...p,
            isPresent: isChecked,
            isPresent_vc: isChecked ? false : p.isPresent_vc,
          };
        } else if (field === "isPresent_vc") {
          if (!p.isPresent) {
            return { ...p, isPresent_vc: isChecked };
          }
        } else if (field === "isChairman") {
          return { ...p, isChairman: isChecked };
        }
      }
      return p;
    });

    setParticipants(updatedParticipants);
  };

  const patchAttendance = async () => {
    setButtonLoading(true);

    try {
      const url = `${apiURL}/committee-meeting/${id}`;
      const transformedParticipants = participants.map((participant) => ({
        director: participant?.director?.id,
        isPresent: participant?.isPresent,
        isPresent_vc: participant?.isPresent_vc,
        isChairman: participant?.isChairman,
      }));
      const absentees = participants
        .filter(
          (participant) =>
            participant.isPresent === false &&
            participant.isPresent_vc === false
        )

        .map((participant) => ({
          director: participant?.director?.id,
          templateName: `Leave of Absence`,
          meetingType: "committee_meeting",
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
        setRefresh((prev) => !prev);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      toast.error("Error updating attendance:", error);
    } finally {
      setButtonLoading(false);
    }
  };
  const handleDownload = () => {
    if (notice?.filedocx) {
      saveAs(notice.filedocx, "customFileName.docx");
    } else {
      console.error("File URL is not available");
    }
  };
  const handleDownloadAllPdf = async (fileType) => {
    const downloadLinks = [];
    const formatDate = (date) => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // Prepare download links for all sections if available
    if (notice?.fileName && fileType === "pdf") {
      downloadLinks.push({
        url: notice?.fileName,
        name: `CM_Notice_${meetData?.client_name?.name}_dated_${formatDate(
          new Date()
        )}.pdf`,
      });
    }
    if (attendance?.fileName && fileType === "pdf") {
      downloadLinks.push({
        url: attendance?.fileName,
        name: `Attendance_Sheet_of_CM_dated_${formatDate(new Date())}.pdf`,
      });
    }
    if (minutes?.fileName && fileType === "pdf") {
      downloadLinks.push({
        url: minutes?.fileName,
        name: `CM_MOM_dated_${formatDate(new Date())}.pdf`,
      });
    }
    if (
      Array.isArray(resolutions) &&
      resolutions.length &&
      fileType === "pdf"
    ) {
      resolutions.forEach((row, index) => {
        if (row?.fileName) {
          downloadLinks.push({
            url: row?.fileName,
            name: `CM_Resolution_${index + 1}_dated_${formatDate(
              new Date()
            )}.pdf`,
          });
        }
      });
    }

    // Sequential download
    for (const { url, name } of downloadLinks) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to download ${name}`);
        }
        const blob = await response.blob();
        saveAs(blob, name); // Using saveAs for better compatibility
      } catch (error) {
        console.error("Download failed:", error);
      }
    }
  };

  const handleDownloadAllDocx = async () => {
    const downloadDocxLinks = [];
    const formatDate = (date) => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // Prepare download links
    if (notice?.filedocx) {
      downloadDocxLinks.push({
        url: notice?.filedocx,
        name: `CM_Notice_${meetData?.client_name?.name}_dated_${formatDate(
          new Date()
        )}.docx`,
      });
    }
    if (attendance?.filedocx) {
      downloadDocxLinks.push({
        url: attendance?.filedocx,
        name: `Attendance_Sheet_of_CM_dated_${formatDate(new Date())}.docx`,
      });
    }
    if (minutes?.filedocx) {
      downloadDocxLinks.push({
        url: minutes?.filedocx,
        name: `CM_MOM_dated_${formatDate(new Date())}.docx`,
      });
    }
    if (Array.isArray(resolutions) && resolutions.length) {
      resolutions.forEach((row, index) => {
        if (row?.filedocx) {
          downloadDocxLinks.push({
            url: row?.filedocx,
            name: `CM_Resolution_${index + 1}_dated_${formatDate(
              new Date()
            )}.docx`,
          });
        }
      });
    }

    // Sequential download
    for (const { url, name } of downloadDocxLinks) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to download ${name}`);
        }
        const blob = await response.blob();
        saveAs(blob, name);
      } catch (error) {
        console.error("Download failed:", error);
      }
    }
  };

  const allFilesAvailable = [
    notice?.fileName,
    attendance?.fileName,
    minutes?.fileName,
    ...resolutions.map((row) => row?.fileName),
  ].every((file) => file); // Check if all files are available
  const allDocxFilesAvailable = [
    notice?.filedocx,
    attendance?.filedocx,
    minutes?.filedocx,
    ...resolutions.map((row) => row?.filedocx),
  ].every((file) => file); // Check if all files are available
  const approvalTabs = [
    "notice",
    "mom",
    "attendance",
    "resolution",
    "acknowledgement",
  ];

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
            approvalTabs.includes(k) &&
            meetData.approval_status !== "approved"
          ) {
            toast.warning("Need approval to see saved documents.");
          } else if (k === "leaveOfAbsence" && leaveOfAbsence.length === 0) {
            toast.warning("No absentees found");
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
          <div className="d-flex justify-content-end mb-3">
            <Button
              variant="primary"
              disabled={!allFilesAvailable}
              onClick={() => handleDownloadAllPdf("pdf")}
              className="me-2"
            >
              Download All as PDF
            </Button>
            <Button
              variant="secondary"
              disabled={!allDocxFilesAvailable}
              onClick={() => handleDownloadAllDocx("docx")}
            >
              Download All as DOCX
            </Button>
          </div>
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
                      onClick={() => handleNoticeView(notice?.filehtml, 1)}
                      disabled={!notice?.filehtml}
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
                        onClick={handleDownload}
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
                      onClick={() => handleMOMView(minutes?.filehtml, 11)}
                      disabled={!minutes?.filehtml}
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
                  <th style={{ width: "40%" }}>Name</th>
                  <th style={{ width: "20%" }}>Present in the Meeting</th>
                  <th style={{ width: "20%" }}>
                    Present in the Meeting(through Video Call)
                  </th>
                  <th style={{ width: "20%" }}>Selected Chairman</th>
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
                        onChange={(e) =>
                          handleCheckboxChange(e, participant, "isPresent")
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={participant?.isPresent_vc}
                        onChange={(e) =>
                          handleCheckboxChange(e, participant, "isPresent_vc")
                        }
                        disabled={participant?.isPresent}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={participant?.isChairman}
                        onChange={(e) =>
                          handleCheckboxChange(e, participant, "isChairman")
                        }
                        // disabled={participant?.isPresent}
                        disabled={
                          !participant.isChairman &&
                          participants.some((p) => p.isChairman)
                        }
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
              {buttonLoading ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                "Mark Attendance"
              )}
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
                        handleAttendanceView(attendance?.filehtml, 1)
                      }
                      disabled={!attendance?.filehtml}
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
                        onClick={() => handleAbsenceView(item?.filehtml, index)}
                        disabled={!item?.filehtml}
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
                        onClick={() => handleResolView(row?.filehtml)}
                        disabled={!row?.filehtml}
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
                        handleAcknowledgementView(acknowledgement?.filehtml, 11)
                      }
                      disabled={!acknowledgement?.filehtml}
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
      <div
        className="d-flex flex-column justify-content-end mt-3"
        style={{ height: "100%" }}
      >
        <Button
          variant="primary"
          onClick={() => navigate(-1)}
          className="align-self-start"
        >
          Go Back
        </Button>
      </div>

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
  console.log(meetData, "dsq");
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
                  disabled={!row?.filehtml}
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
                  disabled={meetData.approval_status !== "approved"}
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
                  disabled={meetData.approval_status !== "approved"}
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
