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
  const [initial, setInitial] = useState(``);
  const [meetData, setMeetData] = useState([]);

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
        // console.log(data?.results);
      } catch (error) {
        console.error(`Error fetching ${key} data:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [key, refresh]);

  const handleDirEditClick = (row, index) => {
    navigate(`/dir-generate/${row?.id}`, {
      state: { index, fileUrl: `${row?.templateFile}` },
    });
  };
  const handleMbpEditClick = (row, index) => {
    navigate(`/mbp-generate/${row?.id}`, {
      state: { index, fileUrl: `${row?.templateFile}` },
    });
  };
  const handleDirView = (row) => {
    navigate(`/template-group-meeting-view/${id}`, {
      state: { fileUrl: `${row?.DIR_doc?.filehtml}` },
    });
  };
  const handleMbpView = (row) => {
    navigate(`/template-group-meeting-view/${id}`, {
      state: { fileUrl: `${row?.MBP_doc?.filehtml}` },
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
                      variant="outline-primary"
                      onClick={() => handleMbpEditClick(row, index)}
                    >
                      <FaEdit />
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      onClick={() => handleMbpView(row)}
                      disabled={!row?.MBP_doc?.filehtml}
                    >
                      <FaFileWord />
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      as="a"
                      href={`${row?.MBP_doc?.fileName}`}
                      download="customFileName.pdf"
                      rel="noopener noreferrer"
                      target="_blank"
                      disabled={!row?.MBP_doc?.fileName}
                    >
                      <FaFileWord />
                    </Button>
                  </td>

                  <td>
                    <Button
                      variant="outline-primary"
                      as="a"
                      href={`${row?.MBP_doc?.filedocx}`}
                      download="customFileName.docx"
                      rel="noopener noreferrer"
                      disabled={!row?.MBP_doc?.filedocx}
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
                      variant="outline-primary"
                      onClick={() => handleDirEditClick(row, index)}
                    >
                      <FaEdit />
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      onClick={() => handleDirView(row)}
                      disabled={!row?.DIR_doc?.filehtml}
                    >
                      <FaFileWord />
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      as="a"
                      href={`${row?.DIR_doc?.fileName}`}
                      download="customFileName.pdf"
                      rel="noopener noreferrer"
                      target="_blank"
                      disabled={!row?.DIR_doc?.fileName}
                    >
                      <FaFileWord />
                    </Button>
                  </td>

                  <td>
                    <Button
                      variant="outline-primary"
                      as="a"
                      href={`${row?.DIR_doc?.filedocx}`}
                      download="customFileName.docx"
                      rel="noopener noreferrer"
                      disabled={!row?.DIR_doc?.filedocx}
                    >
                      <FaFileWord />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

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
