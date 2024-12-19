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
  const [attendance, setAttendance] = useState({});
  const [minutes, setMinutes] = useState({});
  const [resolutions, setResolutions] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [participantAttendance, setParticipantAttendance] = useState([]);
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
        setRows(data?.agendaItems || []);
        console.log(data, "agena");
        setParticipants(data?.participants || []);
        setNotice(data?.notes || {});
        setMinutes(data?.mom || {});
        setAttendance(data?.attendance || {});
        setResolutions(data?.resolutions || []);
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
    if (`${row?.filedocx}` == null) {
      toast.warn("Please save the related document first");
      return;
    }
    navigate(`/template-group-meeting-view/${id}`, {
      state: { fileUrl: `${row?.filedocx}` },
    });
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
  useEffect(
    () => {
      console.log(notice, minutes, attendance, "mat");
      console.log(participants, "paerttg");
    },
    notice,
    minutes,
    attendance
  );
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

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ participants: transformedParticipants }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      toast.success("Attendance updated successfully:", data);
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
                  <th style={{ width: "30%" }}>Name</th>
                  <th>Edit</th>
                  <th>View</th>
                  <th>Download-as PDF</th>
                  <th>Download-as Docx</th>
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
                {row?.fileName && row?.fileName !== "" ? (
                  <Button
                    variant="outline-primary"
                    as="a"
                    href={`${row?.fileName}`}
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
                {row?.filedocx && row?.filedocx !== "" ? (
                  <Button
                    variant="outline-primary"
                    as="a"
                    href={`${row?.filedocx}`}
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
  );
}
