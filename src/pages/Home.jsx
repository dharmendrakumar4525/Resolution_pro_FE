import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Modal, Table} from "react-bootstrap";
import { apiURL } from "../API/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";


const themeColors = {
  primary: "#2e3650",
  secondary: "#6c757d",
  background: "#f8f9fa",
  textPrimary: "#343a40",
  textSecondary: "#495057",
};

const Home = () => {
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

  // New state to track selected resolution type
  const [selectedResolutionType, setSelectedResolutionType] = useState("");


  // Fetch resolutions for admin if no manager or company is selected
// useEffect(() => {

//   if (!selectedManager && !selectedCompany && user.role === "admin") {
//     const fetchAdminResolutions = async () => {
//       try {
//         const response = await fetch(`${apiURL}/resolutions/dashboard/${user.id}`);
//         const data = await response.json();
//         const companyResolutions = data.data.resolutiondata[selectedCompany] || [];

//         console.log(data.data.resolutiondata,"hello");
        
//         // Assuming data comes in similar structure as before
//         const adminResolutions = data.data.resolutiondata || [];

//         setResolutions(adminResolutions);

//         // Count resolutions by status
//         const draftResolutions = companyResolutions.filter(res => res.status.toLowerCase() === "created").length;
//         const completedResolutions = companyResolutions.filter(res => res.status.toLowerCase() === "completed").length;
//         const inProcessResolutions = companyResolutions.filter(res => res.status.toLowerCase() === "review").length;
//         const totalCount = draftResolutions + completedResolutions + inProcessResolutions;

//         setDraftCount(draftResolutions);
//         setCompletedCount(completedResolutions);
//         setInProcessCount(inProcessResolutions);
//         setTotalResolutions(totalCount);
//       } catch (error) {
//         toast.error("Error fetching resolutions for admin");
//       }
//     };

//     fetchAdminResolutions();
//   }
// }, [selectedManager, selectedCompany, user.role, user.id]);


  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await fetch(`${apiURL}/users`);
        const data = await response.json();
        const managerList = data.results.filter(user => user.role.role === "manager");
        setManagers(managerList);
      } catch (error) {
        toast.error("Error fetching data");
      }
    };
    fetchManagers();
  }, []);

  useEffect(() => {
    if (selectedManager) {
      const fetchCompanies = async () => {
        try {
          const response = await fetch(`${apiURL}/customer-maintenance`);
          const data = await response.json();
          const filteredCompanies = data.results.filter(
            company => company.alloted_manager?.id === selectedManager
          );
          setCompanies(filteredCompanies);
        } catch (error) {
          toast.error(`Error fetching companies: ${error.message}`);
        }
      };
      fetchCompanies();
    }
  }, [selectedManager]);

  useEffect(() => {
    if (selectedManager && selectedCompany) {
      const fetchResolutions = async () => {
        try {
          const response = await fetch(`${apiURL}/resolutions/dashboard/${selectedManager}`);
          const data = await response.json();
          const companyResolutions = data.data.resolutiondata[selectedCompany] || [];

          setResolutions(companyResolutions);

          const draftResolutions = companyResolutions.filter(res => res.status.toLowerCase() === "created").length;
          const completedResolutions = companyResolutions.filter(res => res.status.toLowerCase() === "completed").length;
          const inProcessResolutions = companyResolutions.filter(res => res.status.toLowerCase() === "review").length;
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

  useEffect(() => {
    const fetchResolutions = async () => {
      try {
        let response;
        let data;
        let companyResolutions = [];
  
        // Check if manager and company are selected
        if (selectedManager && selectedCompany) {
          // Fetch resolutions for selected manager and company
          response = await fetch(`${apiURL}/resolutions/dashboard/${selectedManager}`);
          data = await response.json();
          companyResolutions = data.data.resolutiondata[selectedCompany] || [];
        } else if (user.role === "admin") {
          // Fetch all resolutions for admin if no manager and company are selected
          response = await fetch(`${apiURL}/resolutions/dashboard/${user.id}`);
          data = await response.json();
          companyResolutions = data.data.resolutiondata[selectedCompany] || [];
          // For admin, use the resolutions of all companies
          companyResolutions = data.data.resolutiondata || [];
        }
  
        // Set the resolutions
        setResolutions(companyResolutions);
  
        // Count resolutions by status
        const draftResolutions = companyResolutions.filter(res => res.status.toLowerCase() === "created").length;
        const completedResolutions = companyResolutions.filter(res => res.status.toLowerCase() === "completed").length;
        const inProcessResolutions = companyResolutions.filter(res => res.status.toLowerCase() === "review").length;
        const totalCount = draftResolutions + completedResolutions + inProcessResolutions;
  
        setDraftCount(draftResolutions);
        setCompletedCount(completedResolutions);
        setInProcessCount(inProcessResolutions);
        setTotalResolutions(totalCount);
      } catch (error) {
        toast.error("Error fetching resolutions");
      }
    };
  
    // Call fetchResolutions when page loads, or when selectedManager, selectedCompany, or user.role changes
    fetchResolutions();
  }, [selectedManager, selectedCompany, user.role, user.id]);

   // Filter resolutions based on selected type
   const filteredResolutions = resolutions.filter(res => {
    if (selectedResolutionType === "created") return res.status.toLowerCase() === "created";
    if (selectedResolutionType === "completed") return res.status.toLowerCase() === "completed";
    if (selectedResolutionType === "review") return res.status.toLowerCase() === "review";
    if (selectedResolutionType === "total") return true; // Return all resolutions for "Total Resolutions"
    return false;
  });

  return (
    <Container fluid className="mt-5">
      <h2 className="text-center mb-4" style={{ fontWeight: 700, color: themeColors.textPrimary }}>
        Dashboard
      </h2>

      <Row className="mb-4">
        {user.role === "670cbe9a5a015431b1d2d513" && (
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
              disabled={!selectedManager}
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

      <Row className="g-4">
        <Col xs={12} md={6} lg={3}>
          <Card
            style={{ backgroundColor: themeColors.background, cursor: 'pointer' }}
            onClick={() => setSelectedResolutionType("created")}
          >
            <Card.Header className="text-white" style={{ backgroundColor: themeColors.primary }}>
              <h5 className="mb-0">Draft</h5>
            </Card.Header>
            <Card.Body>
              <h4>{draftCount}</h4>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={3}>
          <Card
            style={{ backgroundColor: themeColors.background, cursor: 'pointer' }}
            onClick={() => setSelectedResolutionType("review")}
          >
            <Card.Header className="text-white" style={{ backgroundColor: themeColors.primary }}>
              <h5 className="mb-0">In Review</h5>
            </Card.Header>
            <Card.Body>
              <h4>{inProcessCount}</h4>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={3}>
          <Card
            style={{ backgroundColor: themeColors.background, cursor: 'pointer' }}
            onClick={() => setSelectedResolutionType("completed")}
          >
            <Card.Header className="text-white" style={{ backgroundColor: themeColors.primary }}>
              <h5 className="mb-0">Pending for Signature</h5>
            </Card.Header>
            <Card.Body>
              <h4>{completedCount}</h4>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={3}>
          <Card
            style={{ backgroundColor: themeColors.background, cursor: 'pointer' }}
            onClick={() => setSelectedResolutionType("total")}
          >
            <Card.Header className="text-white" style={{ backgroundColor: themeColors.primary }}>
              <h5 className="mb-0">Completed</h5>
            </Card.Header>
            <Card.Body>
              <h4>{totalResolutions}</h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Resolution Table */}
      {selectedResolutionType && (
        <Row className="mt-4">
          <Col>
            <h3>{selectedResolutionType.charAt(0).toUpperCase() + selectedResolutionType.slice(1)} Resolutions</h3>
            <Table bordered hover className="Master-table">
            <thead className="Master-Thead">
                <tr>
                  {/* <th>Resolution Number</th> */}
                  <th>Status</th>
                  <th>Type</th>
                  <th>Client Name</th>
                  <th>Description</th>
                  <th>Issue Date</th>
                  <th>Issue From</th>
                  <th>Actions</th>
                  {/* <th>By</th>
                  <th>At</th> */}
                </tr>
              </thead>
              <tbody>
                {filteredResolutions.map((res, index) => (
                  <tr key={index}>
                    {/* <td>{res.number}</td> */}
                    
                    <td>{res.status}</td>
                    <td>{res.type}</td>
                    <td>{res.clientName}</td>
                    <td>{res.description}</td>
                    <td>{res.issueDate}</td>
                    <td>{res.issueFrom}</td>
                    <td>
                    <Button
                      variant="outline-secondary"
                      // onClick={() => handleEditClick(row)}
                      className="me-2"
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      // onClick={() => handleDeleteClick(row)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                    <td>{res.by}</td>
                    <td>{res.at}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Home;

