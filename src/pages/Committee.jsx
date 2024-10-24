import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Form,
  Table,
  FormControl,
  Container,
  Spinner,
  Pagination,
} from "react-bootstrap";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { apiURL } from "../API/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Committee() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    committeeName: "",
  });

  useEffect(() => {
    const fetchData = async (pageNo) => {
      try {
        const response = await fetch(
          `${apiURL}/committee-master?page=${pageNo}`
        );
        const data = await response.json();
        setRows(data.results);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData(page);
  }, [page]);

  const handleOpenModal = () => {
    setOpenModal(true);
    setFormData({ committeeName: "" });
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
    setFormData({ committeeName: row.name });
  };

  const handleDeleteClick = async (row) => {
    try {
      const response = await fetch(`${apiURL}/committee-master/${row.id}`, {
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
        await fetch(`${apiURL}/committee-master/${editingRow.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: formData.committeeName }),
        });
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === editingRow.id
              ? { ...row, name: formData.committeeName }
              : row
          )
        );
        toast.success("Committee Master edited successfully");
      } else {
        const response = await fetch(`${apiURL}/committee-master`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: formData.committeeName }),
        });
        const data = await response.json();
        setRows((prevRows) => [...prevRows, data]);
        toast.success("Committee member added successfully");
      }
      handleCloseModal();
    } catch (error) {
      toast.error("Failed to add/edit item. Please try again.");
    }
  };
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const columns = [
    { header: "Committee Master Name", field: "name" },
    { header: "Actions", field: "action" },
  ];

  return (
    <>
      <Container fluid className="styled-table pt-3 mt-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Committee Master</h4>
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
              {editingRow ? "Edit Committee Master" : "Add Committee Master"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="committeeName">
                <Form.Label>Committee Master Name</Form.Label>
                <FormControl
                  value={formData.committeeName}
                  onChange={handleChange}
                  placeholder="Enter Committee Master Name"
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
                    <td>{row.name}</td>
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
            <Pagination className="mt-4">
              <Pagination.Prev
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              />
              {Array.from({ length: totalPages }, (_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === page}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              />
            </Pagination>
          </div>
        )}
      </Container>
      <ToastContainer />
    </>
  );
}
