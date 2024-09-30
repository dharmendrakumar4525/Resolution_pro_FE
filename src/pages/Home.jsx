import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Modal,
  Alert,
} from "react-bootstrap";

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

      <Row className="g-4">
        
        <Col xs={12} md={6} lg={4}>
          <Card style={{ backgroundColor: themeColors.background }}>
            <Card.Header className="text-white" style={{ backgroundColor: themeColors.primary }}>
              <h5 className="mb-0">Recent Resolutions</h5>
            </Card.Header>
            <Card.Body>
              
              {[
                {
                  id: 1,
                  number: "12345",
                  issueDate: "2024-08-20",
                  status: "Pending",
                },
                {
                  id: 2,
                  number: "12346",
                  issueDate: "2024-08-19",
                  status: "Completed",
                },
                {
                  id: 3,
                  number: "12347",
                  issueDate: "2024-08-18",
                  status: "In Progress",
                },
              ].map((resolution) => (
                <div key={resolution.id} className="mb-2">
                  <strong>Resolution #{resolution.number}</strong> - {resolution.issueDate} - Status: {resolution.status}
                  <hr />
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        
        <Col xs={12} md={6} lg={4}>
          <Card style={{ backgroundColor: themeColors.background }}>
            <Card.Header className="text-white" style={{ backgroundColor: themeColors.primary }}>
              <h5 className="mb-0">Key Metrics</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>Pending Resolutions:</strong> 5</p>
              <p><strong>Completed Resolutions:</strong> 15</p>
              <p><strong>In Progress Resolutions:</strong> 3</p>
            </Card.Body>
          </Card>
        </Col>

        
        <Col xs={12} md={6} lg={4}>
          <Card style={{ backgroundColor: themeColors.background }}>
            <Card.Header className="text-white" style={{ backgroundColor: themeColors.primary }}>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <Button variant="primary" className="mb-2 w-100" onClick={() => setOpenCreateModal(true)}>
                Create New Resolution
              </Button>
              <Button variant="outline-secondary" className="w-100" onClick={() => setOpenUploadModal(true)}>
                Upload Documents
              </Button>
            </Card.Body>
          </Card>
        </Col>

        
        <Col xs={12} md={6} lg={4}>
          <Card style={{ backgroundColor: themeColors.background }}>
            <Card.Header className="text-white" style={{ backgroundColor: themeColors.primary }}>
              <h5 className="mb-0">Recent Activity</h5>
            </Card.Header>
            <Card.Body>
              <p>Activity 1: Updated resolution #12345</p>
              <p>Activity 2: New resolution created #12346</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      
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
