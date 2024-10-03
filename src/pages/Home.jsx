import React, { useState,useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Modal } from "react-bootstrap";
import { apiURL } from "../API/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const themeColors = {
  primary: "#2e3650",
  secondary: "#6c757d",
  background: "#f8f9fa",
  textPrimary: "#343a40",
  textSecondary: "#495057",
};

const Home = () => {
 
  const [file, setFile] = useState(null);
  const [resolutionData, setResolutionData] = useState({
    number: "",
    issueDate: "",
    status: "",
  });

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [selectedManager, setSelectedManager] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");

  // Modal state
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openUploadModal, setOpenUploadModal] = useState(false);

  const handleCreateResolution = (event) => {
    event.preventDefault();
    console.log("Resolution Created:", resolutionData);
    setOpenCreateModal(false);
  };

  const handleUploadFile = () => {
    console.log("File Uploaded:", file);
    setOpenUploadModal(false);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };



  return (
    <Container fluid className="mt-5">
      <h2 className="text-center mb-4" style={{ fontWeight: 700, color: themeColors.textPrimary }}>
        Dashboard
      </h2>

      {/* Filter Section */}
      <Row className="mb-4">
        {user.role === "admin" && (
          <Col md={6}>
            <Form.Group controlId="managerFilter">
              <Form.Label>Select Manager</Form.Label>
              <Form.Select
                value={selectedManager}
                onChange={(e) => setSelectedManager(e.target.value)}
              >
                <option value="">Select Manager</option>
                <option value="Manager1">Manager 1</option>
                <option value="Manager2">Manager 2</option>
              </Form.Select>
            </Form.Group>
          </Col>
        )}

        <Col md={6}>
          <Form.Group controlId="companyFilter">
            <Form.Label>Select Company</Form.Label>
            <Form.Select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              <option value="">Select Company</option>
              <option value="Company1">Company 1</option>
              <option value="Company2">Company 2</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Cards Section */}
      <Row className="g-4">
        <Col xs={12} md={6} lg={3}>
          <Card style={{ backgroundColor: themeColors.background }}>
            <Card.Header className="text-white" style={{ backgroundColor: themeColors.primary }}>
              <h5 className="mb-0">Total Resolutions</h5>
            </Card.Header>
            <Card.Body>
              <h4>30</h4> {/* Replace with dynamic count */}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={3}>
          <Card style={{ backgroundColor: themeColors.background }}>
            <Card.Header className="text-white" style={{ backgroundColor: themeColors.primary }}>
              <h5 className="mb-0">Draft Resolutions</h5>
            </Card.Header>
            <Card.Body>
              <h4>5</h4> {/* Replace with dynamic count */}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={3}>
          <Card style={{ backgroundColor: themeColors.background }}>
            <Card.Header className="text-white" style={{ backgroundColor: themeColors.primary }}>
              <h5 className="mb-0">In Process</h5>
            </Card.Header>
            <Card.Body>
              <h4>10</h4> {/* Replace with dynamic count */}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={3}>
          <Card style={{ backgroundColor: themeColors.background }}>
            <Card.Header className="text-white" style={{ backgroundColor: themeColors.primary }}>
              <h5 className="mb-0">Completed Resolutions</h5>
            </Card.Header>
            <Card.Body>
              <h4>15</h4> {/* Replace with dynamic count */}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Create Resolution Modal */}
      <Modal show={openCreateModal} onHide={() => setOpenCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Resolution</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateResolution}>
            <Form.Group className="mb-3">
              <Form.Label>Resolution Number</Form.Label>
              <Form.Control
                type="text"
                value={resolutionData.number}
                onChange={(e) => setResolutionData({ ...resolutionData, number: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Issue Date</Form.Label>
              <Form.Control
                type="date"
                value={resolutionData.issueDate}
                onChange={(e) => setResolutionData({ ...resolutionData, issueDate: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={resolutionData.status}
                onChange={(e) => setResolutionData({ ...resolutionData, status: e.target.value })}
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
              </Form.Select>
            </Form.Group>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setOpenCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Upload Documents Modal */}
      <Modal show={openUploadModal} onHide={() => setOpenUploadModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Upload Documents</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Upload File</Form.Label>
            <Form.Control type="file" onChange={handleFileChange} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setOpenUploadModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUploadFile}>
            Upload
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Home;
