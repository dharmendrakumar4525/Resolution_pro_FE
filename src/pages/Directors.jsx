import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Directors() {
  const [rows, setRows] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_id: "",
    name: "",
    designation: "",
    begin_date: "",
    "din/pan": "",
    email: "",
  });
  const token = localStorage.getItem("refreshToken");
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${apiURL}/director-data/directors/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setRows(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleOpenAddModal = () => {
    setFormData({
      company_id: `${id}`,
      name: "",
      designation: "",
      begin_date: "",
      "din/pan": "",
      email: "",
    });
    setEditingRow(null);
    setOpenAddModal(true);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonLoading(true);
    try {
      if (editingRow) {
        await fetch(`${apiURL}/director-data/${editingRow?.id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        });
        setRows((prevRows) =>
          prevRows.map((row) =>
            row?.id === editingRow?.id ? { ...row, ...formData } : row
          )
        );
        toast.success("Director updated successfully");
      } else {
        const response = await fetch(`${apiURL}/director-data`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Failed to add director");
        }
        const data = await response.json();
        setRows((prevRows) => [...prevRows, data]);
        toast.success("Director added successfully");
      }
      setOpenAddModal(false);
      setFormData({
        company_id: "",
        name: "",
        designation: "",
        begin_date: "",
        "din/pan": "",
        email: "",
      });
    } catch (error) {
      toast.error("Failed to add/update director. Please try again.");
    } finally {
      setButtonLoading(false); // Hide button spinner
    }
  };

  const handleDeleteClick = async (row) => {
    try {
      await fetch(`${apiURL}/director-data/${row?.id}`, {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setRows((prevRows) => prevRows.filter((item) => item.id !== row?.id));

      toast.success("Director deleted successfully");
    } catch (error) {
      toast.error("Failed to delete director");
    }
  };

  const handleEditClick = (row) => {
    setEditingRow(row);
    setFormData({
      company_id: row?.company_id,
      name: row?.name,
      designation: row?.designation,
      begin_date: row?.begin_date,
      "din/pan": row["din/pan"],
      email: row?.email,
    });
    setOpenAddModal(true);
  };

  return (
    <>
      <Container fluid className="styled-table pt-3 mt-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Directors</h4>
          <Button
            variant="primary"
            className="btn-box"
            onClick={handleOpenAddModal}
          >
            <FaPlus style={{ marginRight: "8px" }} /> Add
          </Button>
        </div>

        <Modal
          show={openAddModal}
          onHide={() => setOpenAddModal(false)}
          className="p-2"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {editingRow ? "Edit Director" : "Add Director"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="name" className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter Name"
                  required
                />
              </Form.Group>

              <Form.Group controlId="designation" className="mb-3">
                <Form.Label>Designation</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="Enter Designation"
                  required
                />
              </Form.Group>

              <Form.Group controlId="begin_date" className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.begin_date}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group controlId="din/pan" className="mb-3">
                <Form.Label>DIN/PAN</Form.Label>
                <Form.Control
                  type="text"
                  value={formData["din/pan"]}
                  onChange={handleChange}
                  placeholder="Enter DIN/PAN"
                  required
                />
              </Form.Group>

              <Form.Group controlId="email" className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter Email"
                  required
                />
              </Form.Group>
              <Button
                variant="primary"
                onClick={() => setOpenAddModal(false)}
                className="me-2"
              >
                Cancel
              </Button>
              <Button type="submit" variant="secondary" className="ml-2">
                {buttonLoading ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : (
                  "Save"
                )}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

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
                  <th>Email</th>
                  <th>Designation</th>
                  <th>Start Date</th>
                  <th>DIN/PAN</th>
                  <th>End Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row?.id}>
                    <td>{row?.name}</td>
                    <td>{row?.email}</td>
                    <td>{row?.designation}</td>
                    <td>{row?.begin_date}</td>
                    <td>{row["din/pan"]}</td>
                    <td>{row?.end_date || "-"}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        onClick={() => handleEditClick(row)}
                        className="me-2"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={() => handleDeleteClick(row)}
                      >
                        <FaTrash />
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
