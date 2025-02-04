import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { apiURL } from "../../API/api";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Associates() {
  const [rows, setRows] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    company_id: "",
    name: "",
    address: "",
    CIN_FCRN: "",
  });
  const token = localStorage.getItem("refreshToken");
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${apiURL}/client-associate-company?company_id=${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setRows(data.results);
        console.log(data.results);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refresh]);
  const handleOpenAddModal = () => {
    setFormData({
      company_id: `${id}`,
      name: "",
      address: "",
      CIN_FCRN: "",
    });
    setEditingRow(null);
    setOpenAddModal(true);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };
  const handleCheckboxChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonLoading(true);
    try {
      if (editingRow) {
        await fetch(`${apiURL}/client-associate-company/${editingRow?.id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        });
        setRefresh((prev) => !prev);

        toast.success("Associate updated successfully");
      } else {
        const response = await fetch(`${apiURL}/client-associate-company`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorMessage = await response.json();
          toast.error(errorMessage.message);
          setButtonLoading(false);

          return;
        }
        setRefresh((prev) => !prev);

        toast.success("Associate added successfully");
      }
      setOpenAddModal(false);
      setFormData({
        company_id: `${id}`,
        name: "",
        address: "",
        CIN_FCRN: "",
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setButtonLoading(false); // Hide button spinner
    }
  };

  const handleDeleteClick = async (row) => {
    try {
      const response = await fetch(
        `${apiURL}/client-associate-company/${row?.id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        const errorMessage = await response.json();
        toast.error(errorMessage.message);
        setButtonLoading(false);

        return;
      }

      setRefresh((prev) => !prev);

      toast.success("Associate deleted successfully");
    } catch (error) {
      toast.error("Failed to delete shareholder");
    }
  };

  const handleEditClick = (row) => {
    setEditingRow(row);
    setFormData({
      company_id: row?.company_id || "",
      name: row?.name || "",
      address: row?.address || "",
      CIN_FCRN: row?.CIN_FCRN || "",
    });
    setOpenAddModal(true);
  };

  return (
    <>
      <Container fluid className="styled-table pt-3 mt-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Associates</h4>
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
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {editingRow ? "Edit Associate" : "Add Associate"}
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

              <Form.Group controlId="address" className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter Address"
                />
              </Form.Group>

              <Form.Group controlId="CIN_FCRN" className="mb-3">
                <Form.Label>CIN/FCRN</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.CIN_FCRN}
                  onChange={handleChange}
                  placeholder="Enter CIN/FCRN"
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
                  <th>Address</th>
                  <th>CIN/FCRN</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row?.id}>
                    <td>{row?.name}</td>
                    <td>{row?.address || "-"}</td>
                    <td>{row?.CIN_FCRN || "-"}</td>
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
        <Button variant="primary" onClick={() => navigate(-1)} className="mt-3">
          Go Back
        </Button>
        <ToastContainer autoClose={1000} />
      </Container>
    </>
  );
}
