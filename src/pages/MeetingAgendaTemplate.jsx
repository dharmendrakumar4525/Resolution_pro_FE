import React, { useEffect, useState } from "react";
import { apiURL } from "../API/api";
import {
  Button,
  Form,
  Row,
  Col,
  Modal,
  Table,
  Container,
  Spinner,
} from "react-bootstrap";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function MeetingAgendaTemplate() {
  const [rows, setRows] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [formData, setFormData] = useState({
    status: "",
    meetingType: "",
    templateName: "",
    fileName: "",
    by: "",
    at: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiURL}/meeting-agenda-template`);
        const data = await response.json();
        setRows(data.results);
      } catch (error) {
        console.error("Error fetching data:", error);
      }finally {
        setLoading(false); 
      }
    };
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingRow(null);
    setFormData({
      status: "",
      meetingType: "",
      templateName: "",
      fileName: "",
      by: "",
      at: "",
    });
    setOpenAddModal(true);
  };

  

  const handleCloseAddModal = () => setOpenAddModal(false);

  const handleDeleteClick = async (row) => {
    try {
      const response = await fetch(
        `${apiURL}/meeting-agenda-template/${row.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      setRows((prevRows) => prevRows.filter((item) => item.id !== row.id));
      alert("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleEditClick = (row) => {
    setEditingRow(row);
    setOpenAddModal(true);
    setFormData({
      status: row.status,
      meetingType: row.meetingType,
      templateName: row.templateName,
      fileName: row.fileName,
      by: row.by,
      at: row.at,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editingRow) {
        response = await fetch(
          `${apiURL}/meeting-agenda-template/${editingRow.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === editingRow.id ? { ...row, ...formData } : row
          )
        );
        toast.success("Meeting Agenda template edited successfully");
      } else {
        response = await fetch(`${apiURL}/meeting-agenda-template`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Failed to add item");
        }

        const data = await response.json();
        setRows((prevRows) => [...prevRows, data]);
      }
      toast.success("Meeting Agenda template added successfully");

      handleCloseAddModal();
      setFormData({
        status: "",
        meetingType: "",
        templateName: "",
        fileName: "",
        by: "",
        at: "",
      });
    } catch (error) {
      toast.error("Failed to add/edit item. Please try again.");
    }
  };

  return (
    <>
      <Container className="styled-table pt-3 mt-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Meeting Agenda Template</h4>
          <Button
            variant="primary"
            className="btn-box"
            onClick={handleOpenAddModal}
          >
            <FaPlus style={{ marginRight: "8px" }} /> Add
          </Button>
        </div>

        <Modal show={openAddModal} onHide={handleCloseAddModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingRow ? "Edit" : "Add"} Meeting Agenda
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="status">
                    <Form.Label className="f-label">Status</Form.Label>
                    <Form.Control
                      as="select"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="">Select Status</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="canceled">Canceled</option>
                    </Form.Control>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="meetingType">
                    <Form.Label className="f-label">Meeting Type</Form.Label>
                    <Form.Control
                      as="select"
                      value={formData.meetingType}
                      onChange={handleChange}
                    >
                      <option value="">Select Meeting Type</option>
                      <option value="Board Meeting">Board Meeting</option>
                      <option value="Committee Meeting">
                        Committee Meeting
                      </option>
                      <option value="Circular Resolution">
                        Circular Resolution
                      </option>
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group controlId="templateName">
                    <Form.Label className="f-label">Template Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.templateName}
                      onChange={handleChange}
                      placeholder="Enter Template Name"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="fileName">
                    <Form.Label className="f-label">File Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.fileName}
                      onChange={handleChange}
                      placeholder="Enter File Name"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="by">
                    <Form.Label className="f-label">By</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.by}
                      onChange={handleChange}
                      placeholder="Enter By"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="at">
                    <Form.Label className="f-label">At</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.at}
                      onChange={handleChange}
                      placeholder="Enter At"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button type="submit" variant="primary" className="me-2">
                Save
              </Button>
              <Button
                variant="secondary"
                onClick={handleCloseAddModal}
                className="ml-2"
              >
                Cancel
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
        <Table striped bordered hover responsive className="mt-5 ">
          <thead>
            <tr>
              <th>Status</th>
              <th>Meeting Type</th>
              <th>Template Name</th>
              <th>File Name</th>
              <th>By</th>
              <th>At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.status}</td>
                <td>{row.meetingType}</td>
                <td>{row.templateName}</td>
                <td>{row.fileName}</td>
                <td>{row.by}</td>
                <td>{row.at}</td>
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
        )}
      </Container>
      <ToastContainer />
    </>
  );
}
