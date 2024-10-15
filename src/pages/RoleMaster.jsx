import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Form,
  Table,
  FormControl,
  Container,
  Spinner,
} from "react-bootstrap";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { apiURL } from "../API/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RoleMaster() {
  const [rows, setRows] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    roleName: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiURL}/role`);
        const data = await response.json();
        setRows(data.results);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenModal = () => {
    setOpenModal(true);
    setFormData({ roleName: "" });
    setEditingRow(null);
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleEditClick = (row) => {
    setEditingRow(row);
    setOpenModal(true);
    setFormData({ roleName: row.role });
  };

  const handleDeleteClick = async (row) => {
    try {
      const response = await fetch(`${apiURL}/role/${row.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      setRows((prevRows) => prevRows.filter((item) => item.id !== row.id));
      toast.success("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRow) {
        await fetch(`${apiURL}/role/${editingRow.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: formData.roleName }),
        });
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === editingRow.id ? { ...row, role: formData.roleName } : row
          )
        );
        toast.success("Role Master edited successfully");
      } else {
        const response = await fetch(`${apiURL}/role`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: formData.roleName }),
        });
        const data = await response.json();
        setRows((prevRows) => [...prevRows, data]);
        toast.success("Role added successfully");
      }
      handleCloseModal();
    } catch (error) {
      toast.error("Failed to add/edit item. Please try again.");
    }
  };

  const columns = [
    { header: "Role Master Name", field: "name" },
    { header: "Actions", field: "action" },
  ];

  return (
    <>
      <Container fluid className="styled-table pt-3 mt-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Role Master</h4>
          <Button
            variant="primary"
            className="btn-box"
            onClick={handleOpenModal}
          >
            <FaPlus style={{ marginRight: "8px" }} /> Add
          </Button>
        </div>

        <Modal show={openModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingRow ? "Edit Role Master" : "Add Role Master"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="roleName">
                <Form.Label>Role Master Name</Form.Label>
                <FormControl
                  value={formData.roleName}
                  onChange={handleChange}
                  placeholder="Enter Role Master Name"
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="mt-3 me-2">
                Save
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
            <Table striped bordered hover>
              <thead>
                <tr>
                  {columns.map((col, idx) => (
                    <th key={idx}>{col.header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.role}</td>
                    <td>
                      <Button
                        variant="outline-secondary"
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
