import React, { useEffect, useState } from "react";
import { apiURL } from "../API/api";
import {
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Container,
  Spinner,
} from "react-bootstrap";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Meeting() {
  const [rows, setRows] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => setOpenAddModal(false);
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [formData, setFormData] = useState({
    status: "",
    meetingType: "",
    templateType: "",
    templateName: "",
    fileName: "",
    by: "",
    at: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiURL}/meeting-template`);
        const data = await response.json();
        setRows(data.meetingTemplates);
      } catch (error) {
        console.error("Error fetching data:", error);
      }finally {
        setLoading(false); 
      }
    };

    fetchData();
  }, []);

  const handleDeleteClick = async (row) => {
    try {
      const response = await fetch(`${apiURL}/meeting-template/${row.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

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
    const { id, name, value } = e.target;
    setFormData({ ...formData, [id || name]: value });
    console.log(formData);
  };

  const handleEditClick = (row) => {
    setEditingRow(row);
    setOpenAddModal(true);
    setFormData({
      status: row.status,
      meetingType: row.meetingType,
      templateType: row.templateType,
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
        response = await fetch(`${apiURL}/meeting-template/${editingRow.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === editingRow.id ? { ...row, ...formData } : row
          )
        );
        toast.success("Meeting template edited successfully");
      } else {
        response = await fetch(`${apiURL}/meeting-template`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Failed to add item");
        }
        toast.success("Meeting template added successfully");
        const data = await response.json();
        setRows((prevRows) => [...prevRows, data]);
      }

      handleCloseAddModal();
      setFormData({
        status: "",
        meetingType: "",
        templateType: "",
        templateName: "",
        fileName: "",
        by: "",
        at: "",
      });
    } catch (error) {
      toast.error("Failed to add/edit item. Please try again.");
    }
  };

  const handleOpenNewAddModal = () => {
    setEditingRow(null);
    setFormData({
      status: "",
      meetingType: "",
      templateType: "",
      templateName: "",
      fileName: "",
      by: "",
      at: "",
    });
    setOpenAddModal(true);
  };

  return (
    <>
<Container fluid className="styled-table pt-3 mt-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Meeting Template</h4>
          <Button
            variant="primary"
            className="btn-box"
            onClick={handleOpenNewAddModal}
          >
            <FaPlus style={{ marginRight: "8px" }} /> Add
          </Button>
        </div>

        <Modal show={openAddModal} onHide={handleCloseAddModal}>
          <Modal.Header closeButton>
            <Modal.Title>{editingRow ? "Edit" : "Add"} Meeting</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
            <Row>
              <Form.Group controlId="status">
                <Form.Label >Status</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.status}
                  onChange={handleChange}
                  placeholder="Enter Status"
                />
              </Form.Group>
              </Row>

              <Row>
                <Col>
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
                <Col>
                  <Form.Group controlId="meetingType">
                    <Form.Label className="f-label">Meeting Type</Form.Label>
                    <Form.Control
                      as="select"
                      value={formData.meetingType}
                      onChange={handleChange}
                    >
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
                <Col>
                  <Form.Group controlId="templateType">
                    <Form.Label className="f-label">Template Type</Form.Label>
                    <Form.Control
                      as="select"
                      value={formData.templateType}
                      onChange={handleChange}
                    >
                      <option value="General Template">General Template</option>
                      <option value="Leave Of Absence">Leave Of Absence</option>
                      <option value="SNC">SNC</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col>
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

              <Row>
              <Col>
              <Form.Group controlId="by">
                <Form.Label className="f-label">By</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.by}
                  onChange={handleChange}
                  placeholder="By"
                />
              </Form.Group>
              </Col>
              <Col>
              <Form.Group controlId="at">
                <Form.Label className="f-label">At</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.at}
                  onChange={handleChange}
                  placeholder="At"
                />
              </Form.Group>
              </Col>
              </Row>

              <Button variant="primary" type="submit" className="mt-3 me-2">
                Save
              </Button>
              <Button
                variant="secondary"
                onClick={handleCloseAddModal}
                className="mt-3 ml-2"
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

        <Table striped bordered hover responsive className="mt-5">
          <thead>
            <tr>
              <th>Status</th>
              <th>Meeting Type</th>
              <th>Template Name</th>
              <th>Template Type</th>
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
                <td>{row.templateType}</td>
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
