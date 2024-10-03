import React, { useState, useEffect } from "react";
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
  // const [rows, setRows] = useState([]);
  const [file, setFile] = useState(null);
  const [resolutions, setResolutions] = useState([]);
  const [resolutionData, setResolutionData] = useState({
    number: "",
    issueDate: "",
    status: "",
  });

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [managers, setManagers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedManager, setSelectedManager] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");

  const [draftCount, setDraftCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [inProcessCount, setInProcessCount] = useState(0);
  const [totalResolutions, setTotalResolutions] = useState(0);

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

  // Fetch managers from the users API
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await fetch(`${apiURL}/users`);
        const data = await response.json();

        // Filter users by role "manager"
        const managerList = data.results.filter(user => user.role === "manager");
       
        
        setManagers(managerList);
      } catch (error) {
        toast.error("Error fetching data");
      }
    };
    fetchManagers();
  }, []);



  // Fetch companies from the customer-maintenance API based on the selected manager
  useEffect(() => {
    console.log("Selected Manager ID:", selectedManager);
    if (selectedManager) {
      const fetchCompanies = async () => {
        try {
          const response = await fetch(`${apiURL}/customer-maintenance`);

          // Check if the response is successful (status code 200)
          if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          console.log("Customer Maintenance Data:", data);

          // Verify if the data has results and is an array
          if (Array.isArray(data.results)) {
            // Safely filter companies by the selected manager's ID
            const filteredCompanies = data.results.filter(
              company => company.alloted_manager?.id === selectedManager
            );

            setCompanies(filteredCompanies);
            console.log("Companies associated with selected manager:", filteredCompanies);
          } else {
            throw new Error("Invalid data format: expected 'results' to be an array.");
          }
          
        } catch (error) {
          console.error("Error fetching companies:", error.message);
          toast.error(`Error fetching companies: ${error.message}`);
        }
      };
      fetchCompanies();
    }
  }, [selectedManager]); // Re-fetch companies when the selected manager changes

  // Fetch resolutions for the selected company
  useEffect(() => {

    console.log(selectedManager,"Manager ");
    console.log(selectedCompany,"Company");
    
    
    if (selectedManager && selectedCompany) {
      const fetchResolutions = async () => {
        try {
          const response = await fetch(`${apiURL}/resolutions/dashboard/${selectedManager}`);
          const data = await response.json();
          const companyResolutions = data.data.resolutiondata[selectedCompany] || [];

          setResolutions(companyResolutions);

          // Count resolutions by status
          const draftResolutions = companyResolutions.filter(res => res.status.toLowerCase() === "draft").length;
          const completedResolutions = companyResolutions.filter(res => res.status.toLowerCase() === "completed").length;
          const inProcessResolutions = companyResolutions.filter(res => res.status.toLowerCase() === "inprocess").length;
          const totalCount = draftResolutions + completedResolutions + inProcessResolutions;


          setDraftCount(draftResolutions);
          setCompletedCount(completedResolutions);
          setInProcessCount(inProcessResolutions);
          setTotalResolutions(totalCount);

        } catch (error) {
          toast.error("Error fetching resolutions");
        }
      };
      fetchResolutions();
    }
  }, [selectedCompany, selectedManager]);




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
                {managers.map(manager => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name}
                  </option>
                ))}
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
              disabled={!selectedManager} // Disable company dropdown if no manager is selected
            >
              <option value="">Select Company</option>
              {companies.map(company => (
                <option key={company.id} value={company.name}>
                  {company.name}
                </option>
              ))}
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
            <h4>{totalResolutions}</h4>
            </Card.Body>
          </Card>
        </Col>


        <Col xs={12} md={6} lg={3}>
          <Card style={{ backgroundColor: themeColors.background }}>
            <Card.Header className="text-white" style={{ backgroundColor: themeColors.primary }}>
              <h5 className="mb-0">Draft Resolutions</h5>
            </Card.Header>
            <Card.Body>
              <h4>{draftCount}</h4>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={3}>
          <Card style={{ backgroundColor: themeColors.background }}>
            <Card.Header className="text-white" style={{ backgroundColor: themeColors.primary }}>
              <h5 className="mb-0">In Process Resolutions</h5>
            </Card.Header>
            <Card.Body>
              <h4>{inProcessCount}</h4>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={3}>
          <Card style={{ backgroundColor: themeColors.background }}>
            <Card.Header className="text-white" style={{ backgroundColor: themeColors.primary }}>
              <h5 className="mb-0">Completed Resolutions</h5>
            </Card.Header>
            <Card.Body>
              <h4>{completedCount}</h4>
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
