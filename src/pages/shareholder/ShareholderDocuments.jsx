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

export default function ShareholderDocuments() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get("tab");
  const [rows, setRows] = useState([]);
  const [meetData, setMeetData] = useState([]);
  const [notice, setNotice] = useState({});
  const [attendance, setAttendance] = useState({});
  const [minutes, setMinutes] = useState({});
  const [acknowledgement, setAcknowledgement] = useState({});
  const [resolutions, setResolutions] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [shareholderParticipants, setShareolderParticipants] = useState([]);
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
        const response = await fetch(`${apiURL}/shareholder-meeting/${id}`, {
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
        setShareolderParticipants(data?.shareholder_participants || []);
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
          `${apiURL}/meeting-agenda-template/677f7ff12522b858279b628e`,
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
      state: { index, fileUrl: `${row?.templateFile}`, page: "shareholder" },
    });
  };
  const handleView = (row) => {
    if (`${row?.filedocx}` == null) {
      toast.warn("Please save the related document first");
      return;
    }
    navigate(`/template-group-meeting-view/${id}`, {
      state: { fileUrl: `${row?.filedocx}`, page: "shareholder" },
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
        `${apiURL}/shareholder-meeting/${meetData.id}`,
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
        page: "shareholder",
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
        page: "shareholder",
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
        page: "shareholder",
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
        page: "shareholder",
      },
    });
  };
  const handleAbsenceEdit = (item, index) => {
    navigate(`/leave-edit/${id}`, {
      state: {
        index,
        fileUrl: item?.templateFile,
        leaveInfo: item,
        page: "shareholder",
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
        page: "shareholder",
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
        page: "shareholder",
      },
    });
  };

  const handleResolEditClick = (row, index) => {
    navigate(`/resolution-edit/${id}`, {
      state: {
        index,
        fileUrl: row?.templateFile,
        resolTitle: row?.templateName,
        page: "shareholder",
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
        page: "shareholder",
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
  const handleShareholderCheckboxChange = (e, participant) => {
    const isChecked = e.target.checked;

    const updatedParticipants = shareholderParticipants.map((p) =>
      p.shareholder.id === participant.shareholder.id
        ? { ...p, isPresent: isChecked }
        : p
    );
    setShareolderParticipants(updatedParticipants);
  };

  const patchAttendance = async () => {
    try {
      const url = `${apiURL}/shareholder-meeting/${id}`;
      const transformedParticipants = participants.map((participant) => ({
        director: participant?.director?.id,
        isPresent: participant?.isPresent,
      }));
      const absentees = participants
        .filter((participant) => participant.isPresent === false)
        .map((participant) => ({
          director: participant?.director?.id,
          templateName: `Leave of Absence`,
          meetingType: "shareholder_meeting",
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
        toast.success("Director Attendance updated successfully");
        setRefresh(!refresh);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      toast.error("Error updating attendance:", error);
    }
  };
  const patchShareholderAttendance = async () => {
    try {
      const url = `${apiURL}/shareholder-meeting/${id}`;
      const transformedShareholderParticipants = shareholderParticipants.map(
        (participant) => ({
          shareholder: participant?.shareholder?.id,
          isPresent: participant?.isPresent,
        })
      );

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shareholder_participants: transformedShareholderParticipants,
        }),
      });

      if (response.ok) {
        toast.success("Shareholder Attendance updated successfully");
        setRefresh(!refresh);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      toast.error("Error updating attendance:", error);
    }
  };
  const handleDownload = () => {
    if (notice?.fileName) {
      saveAs(notice.fileName, "customFileName.docx");
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
        name: `SM_Notice_${meetData?.client_name?.name}_dated_${formatDate(
          new Date()
        )}.pdf`,
      });
    }
    if (attendance?.fileName && fileType === "pdf") {
      downloadLinks.push({
        url: attendance?.fileName,
        name: `Attendance_Sheet_of_SM_dated_${formatDate(new Date())}.pdf`,
      });
    }
    if (minutes?.fileName && fileType === "pdf") {
      downloadLinks.push({
        url: minutes?.fileName,
        name: `SM_MOM_dated_${formatDate(new Date())}.pdf`,
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
            name: `SM_Resolution_${index + 1}_dated_${formatDate(
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
        name: `SM_Notice_${meetData?.client_name?.name}_dated_${formatDate(
          new Date()
        )}.docx`,
      });
    }
    if (attendance?.filedocx) {
      downloadDocxLinks.push({
        url: attendance?.filedocx,
        name: `Attendance_Sheet_of_SM_dated_${formatDate(new Date())}.docx`,
      });
    }
    if (minutes?.filedocx) {
      downloadDocxLinks.push({
        url: minutes?.filedocx,
        name: `SM_MOM_dated_${formatDate(new Date())}.docx`,
      });
    }
    if (Array.isArray(resolutions) && resolutions.length) {
      resolutions.forEach((row, index) => {
        if (row?.filedocx) {
          downloadDocxLinks.push({
            url: row?.filedocx,
            name: `SM_Resolution_${index + 1}_dated_${formatDate(
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
                      onClick={() => handleNoticeView(notice?.filedocx, 1)}
                      disabled={!notice?.filedocx}
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
                      onClick={() => handleMOMView(minutes?.filedocx, 11)}
                      disabled={!minutes?.filedocx}
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
                  <th>Director Name</th>
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
                  <th>Shareholder Name</th>
                  <th>Present in the Meeting</th>
                </tr>
              </thead>
              <tbody>
                {shareholderParticipants?.map((participant, index) => (
                  <tr key={index}>
                    <td>{participant?.shareholder?.name}</td>
                    <td>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={participant?.isPresent}
                        onChange={(e) =>
                          handleShareholderCheckboxChange(e, participant)
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
              onClick={patchShareholderAttendance}
            >
              Mark Shareholder Attendance
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
                      disabled={!attendance?.filedocx}
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
                        disabled={!item?.filedocx}
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
                        disabled={!row?.filedocx}
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
                      disabled={!acknowledgement?.filedocx}
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
                  disabled={!row?.filedocx}
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
