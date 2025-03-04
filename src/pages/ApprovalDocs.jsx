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

export default function ApprovalDocs() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("refreshToken");
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiURL}/meeting-approval`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setRows(data?.results || []);
      } catch (error) {
        console.error(`Error fetching data:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleEditClick = (row, index) => {
    navigate(`/template-edit/${id}`, {
      state: { index, fileUrl: `${row?.templateFile}` },
    });
  };
  const handleView = (row) => {
    // console.log(`${row?.meeting_id}`,"ghjk")
    // return
    if (`${row?.meeting_id?.agendaItems[0]?.filehtml}` == null) {
      toast.warn("Please save the related document first");
      return;
    }
    navigate(`/template-group-meeting-view/${row._id}`, {
      state: {
        fileUrl: `${row?.meeting_id?.agendaItems[0]?.filehtml}`,
        page: "approval",
        meetData: row,
      },
    });
  };
  console.log(rows, "rowsss");
  return (
    <>
      <div className="d-flex align-items-center justify-content-between mt-3 mb-5 head-box">
        <h4 className="h4-heading-style">Approval</h4>
      </div>
      {rows.length === 0 ? (
        <div className="text-center mt-5">
          <h5>No data available</h5>
        </div>
      ) : (
        <Table bordered hover className="Master-table">
          <thead className="Master-Thead">
            <tr>
              <th style={{ width: "30%" }}>Company Name</th>
              <th style={{ width: "30%" }}>Meeting Name</th>
              <th style={{ width: "30%" }}>Meeting Type</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row?.id}>
                <td
                  style={{
                    width: "30%",
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  {row?.company_id?.company_name}
                </td>
                <td>{row?.meeting_id?.title}</td>
                <td>{row?.meeting_type}</td>

                <td>
                  <Button
                    variant="outline-primary"
                    onClick={() => handleView(row)}
                  >
                    <FaFileWord />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

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
