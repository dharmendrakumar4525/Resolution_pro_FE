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

export default function MeetingDocuments() {
  const [rows, setRows] = useState([]);
  const [notice, setNotice] = useState({});
  const [attendances, setAttendances] = useState({});
  const [minutes, setMinutes] = useState({});
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
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
        setRows(data?.agendaItems || []); // Adjust based on API response
        console.log(data?.agendaItems || [], "agena"); // Adjust based on API response
        // if (key === "attendance") {
        //   setParticipants(data?.participants || []);
        // }
        setNotice(data?.notes || {});
        setMinutes(data?.mom || {});
        setAttendances(data?.attendance || {});
      } catch (error) {
        console.error(`Error fetching ${key} data:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [key, token]);

  const handleEditClick = (row, index) => {
    navigate(`/template-edit/${id}`, {
      state: { index, fileUrl: `${row?.templateFile}` },
    });
  };
  const handleView = (row) => {
    navigate(`/template-group-meeting-view/${id}`, {
      state: { fileUrl: `${row?.fileName}` },
    });
  };
  const handleNoticeEditClick = (url, index) => {
    console.log(url, "notice");
    navigate(`/notice-edit/${id}`, {
      state: {
        index,
        fileUrl: url,
      },
    });
  };

  const handleNoticeView = (url, index) => {
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
    navigate(`/template-group-meeting-view/${id}}`, {
      state: {
        index,
        fileUrl: url,
      },
    });
  };
  const handleAttendanceEditClick = (url, index) => {
    navigate(`/doc-edit/${id}`, {
      state: {
        index,
        fileUrl: url,
      },
    });
  };

  const handleAttendanceView = (url, index) => {
    navigate(`/template-group-meeting-view/${id}`, {
      state: {
        index,
        fileUrl: url,
      },
    });
  };

  const handleResolEditClick = (url, index) => {
    navigate(`/doc-edit/${id}}`, {
      state: {
        index,
        fileUrl: `https://gamerji-dharmendra.s3.amazonaws.com/agendas/Resolution_1732190446816.docx`,
      },
    });
  };

  const handleResolView = (url) => {
    navigate(`/template-group-meeting-view/${id}`, {
      state: {
        fileUrl: `https://gamerji-dharmendra.s3.amazonaws.com/agendas/Resolution_1732190446816.docx`,
      },
    });
  };
  useEffect(
    () => {
      console.log(notice, minutes, attendances, "mat");
    },
    notice,
    minutes,
    attendances
  );
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
              k == "resolution") &&
            !rows.some((row) => row?.fileName)
          ) {
            toast.warning("Please save meeting agenda document first.");
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
              handleEditClick={handleEditClick}
              handleView={handleView}
            />
          )}
        </Tab>

        <Tab eventKey="notice" title="Notice">
          <div className="table-responsive mt-5">
            <Table bordered hover className="Master-table">
              <thead className="Master-Thead">
                <tr>
                  <th>Name</th>
                  <th>Edit</th>
                  <th>View</th>
                  <th>Download</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Notice Document</td>
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
                      onClick={() => handleNoticeView(notice?.fileName, 1)}
                    >
                      <FaFileWord />
                    </Button>
                  </td>
                  <td>
                    <Button variant="outline-primary">
                      <a
                        href="https://gamerji-dharmendra.s3.amazonaws.com/agendas/Notice_1732180834066.docx"
                        download="customFileName.docx"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaFileWord />
                      </a>
                    </Button>
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
                  <th>Name</th>
                  <th>Edit</th>
                  <th>View</th>
                  <th>Download</th>
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
                      onClick={() => handleMOMView(minutes?.fileName, 11)}
                    >
                      <FaFileWord />
                    </Button>
                  </td>
                  <td>
                    <Button variant="outline-primary">
                      <a
                        href="https://gamerji-dharmendra.s3.amazonaws.com/agendas/MOM_1732190305036.docx"
                        download="customFileName.docx"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaFileWord />
                      </a>
                    </Button>
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
                  <th>Edit</th>
                  <th>View</th>
                  <th>Download</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Attendance Document</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      onClick={() =>
                        handleAttendanceEditClick(attendances?.templateFile, 1)
                      }
                    >
                      <FaEdit />
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      onClick={() =>
                        handleAttendanceView(attendances?.fileName, 1)
                      }
                    >
                      <FaFileWord />
                    </Button>
                  </td>
                  <td>
                    <Button variant="outline-primary">
                      <a
                        href="https://gamerji-dharmendra.s3.amazonaws.com/agendas/Attendance_1732190319661.docx"
                        download="customFileName.docx"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaFileWord />
                      </a>
                    </Button>
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Tab>

        <Tab eventKey="resolution" title="Resolution">
          <div className="table-responsive mt-5">
            <Table bordered hover className="Master-table">
              <thead className="Master-Thead">
                <tr>
                  <th>Name</th>
                  <th>Edit</th>
                  <th>View</th>
                  <th>Download</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Resolution Document</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      onClick={() => handleResolEditClick(1, 1)}
                    >
                      <FaEdit />
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      onClick={() => handleResolView(1)}
                    >
                      <FaFileWord />
                    </Button>
                  </td>
                  <td>
                    <Button variant="outline-primary">
                      <a
                        href="https://gamerji-dharmendra.s3.amazonaws.com/agendas/Resolution_1732190446816.docx"
                        download="customFileName.docx"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaFileWord />
                      </a>
                    </Button>
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

function TableContent({ rows, handleEditClick, handleView }) {
  return (
    <div className="table-responsive mt-5">
      <Table bordered hover className="Master-table">
        <thead className="Master-Thead">
          <tr>
            <th>Name</th>
            <th>Edit</th>
            <th>View</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row?._id}>
              <td>{row?.templateName}</td>
              <td>
                <Button
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
                <Button variant="outline-primary">
                  <a
                    href={row?.fileName}
                    download="customFileName.docx"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFileWord />
                  </a>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
