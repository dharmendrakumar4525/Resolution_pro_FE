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
} from "react-bootstrap";
import { apiURL } from "../API/api";
import { FaFileWord } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TemplateGroupMeetings() {
  // const [rows, setRows] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    company_id: "",
    name: "",
    designation: "",
    begin_date: "",
    "din/pan": "",
    email: "",
  });


  const navigate = useNavigate();
const location=useLocation()
  const { id } = useParams();
console.log(location,"roww")
 const rows=location?.state?.groupItems
console.log(rows,"rows")
useEffect(()=>{
  setLoading(false)
},[rows])
  const handleViewClick = (row, index) => {
    console.log(row,"roww")
    setEditingRow(row);
    navigate(`/template-group-meeting-view/${id}`, {
      state: { index, fileUrl: `${row?.fileName}` },
    });
  };

  return (
    <>
      <Container fluid className="styled-table pt-3 mt-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Meeting Templates</h4>
        </div>

        {loading ? (
          <div className="text-center mt-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center mt-5">
            <h5>No data available</h5>
          </div>
        ) : (
          <div className="table-responsive mt-5">
            <Table bordered hover className="Master-table">
              <thead className="Master-Thead">
                <tr>
                  <th>Name</th>
                  <th>View template</th>
                </tr>
              </thead>
              <tbody>
                {rows?.map((row, index) => (
                  <tr key={row?._id}>
                    <td>{row?.templateName}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        onClick={() => handleViewClick(row, index)}
                        className="me-2"
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
      </Container>
      <ToastContainer />
    </>
  );
}
