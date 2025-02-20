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
import { apiURL } from "../../../API/api";
import { FaEdit, FaTrash, FaPlus, FaFileWord } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const token = localStorage.getItem("refreshToken");

export default function DirectorDocuments() {
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
        const response = await fetch(
          `${apiURL}/director-docs?director_id=${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setRows(data?.results || []);
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
      state: { index, fileUrl: `${row?.templateFile}`, page: "board" },
    });
  };
  const handleView = (row) => {
    if (`${row?.filehtml}` == null) {
      toast.warn("Please save the related document first");
      return;
    }
    navigate(`/template-group-meeting-view/${id}`, {
      state: { fileUrl: `${row?.filehtml}` },
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

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mt-3 mb-5 head-box">
        <h4 className="h4-heading-style">Director Documents</h4>
      </div>

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
        {/* <Button
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
            </Button> */}
      </div>

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
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row?._id}>
              <td>MBP-Form</td>
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
            </tr>
          ))}
          {rows.map((row, index) => (
            <tr key={row?._id}>
              <td>Dir-8 Form</td>
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
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
