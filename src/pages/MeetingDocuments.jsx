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
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState("agenda"); // Default tab

  const token = localStorage.getItem("refreshToken");
  const navigate = useNavigate();
  const { id } = useParams();

  // Tab-specific IDs
  const tabIds = {
    agenda: id,
    notice: "673ebf07ace56b4760e36c9c",
    mom: "673ebf07ace56b4760e36c9c",
    resolution: "673ebf07ace56b4760e36c9c",
    attendance: "673ebf07ace56b4760e36c9c",
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiURL}/meeting/${tabIds[key]}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();

        setRows(data?.agendaItems || []); // Adjust based on API response
        // if (key === "attendance") {
        //   setParticipants(data?.participants || []);
        // }
      } catch (error) {
        console.error(`Error fetching ${key} data:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [key, token]);

  const handleEditClick = (row, index) => {
    navigate(`/template-edit/${tabIds[key]}`, {
      state: { index, fileUrl: `${row?.templateFile}` },
    });
  };
  const handleView = (row) => {
    navigate(`/template-group-meeting-view/${tabIds[key]}`, {
      state: { fileUrl: `${row?.fileName}` },
    });
  };
  const handleNoticeEditClick = (row, index) => {
    navigate(`/doc-edit/${tabIds[key]}`, {
      state: { index, fileUrl: `https://gamerji-dharmendra.s3.amazonaws.com/agendas/Notice_1732180834066.docx` },
    });
  };

  const handleNoticeView = (row) => {
    navigate(`/template-group-meeting-view/${tabIds[key]}`, {
      state: {
        fileUrl: `https://gamerji-dharmendra.s3.amazonaws.com/agendas/Notice_1732180834066.docx`,
      },
    });
  };
  const handleMOMEditClick = (row, index) => {
    navigate(`/doc-edit/${tabIds[key]}`, {
      state: {
        index,
        fileUrl: `https://gamerji-dharmendra.s3.amazonaws.com/agendas/MOM_1732190305036.docx`,
      },
    });
  };

  const handleMOMView = (row) => {
    navigate(`/template-group-meeting-view/${tabIds[key]}`, {
      state: {
        fileUrl: `https://gamerji-dharmendra.s3.amazonaws.com/agendas/MOM_1732190305036.docx`,
      },
    });
  };
  const handleAttendanceEditClick = (row, index) => {
    navigate(`/doc-edit/${tabIds[key]}`, {
      state: {
        index,
        fileUrl: `https://gamerji-dharmendra.s3.amazonaws.com/agendas/Attendance_1732190319661.docx`,
      },
    });
  };

  const handleAttendanceView = (row) => {
    navigate(`/template-group-meeting-view/${tabIds[key]}`, {
      state: {
        fileUrl: `https://gamerji-dharmendra.s3.amazonaws.com/agendas/Attendance_1732190319661.docx`,
      },
    });
  };

  const handleResolEditClick = (row, index) => {
    navigate(`/doc-edit/${tabIds[key]}`, {
      state: {
        index,
        fileUrl: `https://gamerji-dharmendra.s3.amazonaws.com/agendas/Resolution_1732190446816.docx`,
      },
    });
  };

  const handleResolView = (row) => {
    navigate(`/template-group-meeting-view/${tabIds[key]}`, {
      state: {
        fileUrl: `https://gamerji-dharmendra.s3.amazonaws.com/agendas/Resolution_1732190446816.docx`,
      },
    });
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mt-3 mb-5 head-box">
        <h4 className="h4-heading-style">Meeting Info</h4>
      </div>
      <Tabs
        id="controlled-tab-example"
        activeKey={key}
        onSelect={(k) => setKey(k)}
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
          {loading ? (
            <SpinnerContent />
          ) : rows.length === 0 ? (
            <NoDataContent />
          ) : (
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
                      <td>Notice Document</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          onClick={() => handleNoticeEditClick(row, index)}
                        >
                          <FaEdit />
                        </Button>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          onClick={() => handleNoticeView(row)}
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
          )}
        </Tab>

        <Tab eventKey="mom" title="MOM">
          {loading ? (
            <SpinnerContent />
          ) : rows.length === 0 ? (
            <NoDataContent />
          ) : (
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
                      <td>MOM Document</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          onClick={() => handleMOMEditClick(row, index)}
                        >
                          <FaEdit />
                        </Button>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          onClick={() => handleMOMView(row)}
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
          )}
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
                {rows.map((row, index) => (
                  <tr key={row?._id}>
                    <td>Attendance</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        onClick={() => handleAttendanceEditClick(row, index)}
                      >
                        <FaEdit />
                      </Button>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        onClick={() => handleAttendanceView(row)}
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
                {rows.map((row, index) => (
                  <tr key={row?._id}>
                    <td>Resolution</td>
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
                        onClick={() => handleResolView(row)}
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
