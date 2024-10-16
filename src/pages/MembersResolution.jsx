import React, { useEffect, useState } from "react";
import { apiURL } from "../API/api";
import {
  Button,
  Table,
  Modal,
  Form,
  Row,
  Col,
  Container,
  Spinner,
} from "react-bootstrap";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MembersResolution = () => {
  const [isDocOpen, setIsDocOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [templateNames, setTemplateNames] = useState([]);
  const [resolutionType, setResolutionType] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResolution, setSelectedResolution] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [templateList, setTemplateList] = useState([]);
  const [editingRow, setEditingRow] = useState(null);

  const [formData, setFormData] = useState({
    status: "created",
    description: "",
    itemFile: "https://example.com/files/resolution.pdf",
    itemVariable: "Variable content",
    clientName: "",
    resolutionItem: "",
    isFinancialSequence: false,
    issueDate: "",
    passedDate: "",
    issueFrom: "",
    emailTo: "director@example.com",
    emailAt: "direct@example.com",
    dueDate: "",
    resolutionNo: "",
    decisionType: "",
    committeeType: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiURL}/resolutions`);
        const data = await response.json();
        setRows(data.data.results);
        const responseMeetingAgendaTemplate = await fetch(
          `${apiURL}/meeting-agenda-template`
        );
        const dataMeetingAgendaTemplate =
          await responseMeetingAgendaTemplate.json();
        setTemplateList(dataMeetingAgendaTemplate.results);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch(`${apiURL}/customer-maintenance`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setCompanies(data.docs);
      } catch (error) {
        toast.error(`Error fetching companies: ${error.message}`);
      }
    };

    fetchCompanies();
  }, []);

  const handleChange = (e) => {
    const { id, name, value } = e.target;
    setFormData({ ...formData, [id || name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Log formData before submission to verify its contents
    console.log(formData);
  
    // Create a copy of formData to modify conditionally
    const resolutionData = { ...formData };
  

   
   
  
    try {
      const response = await fetch(`${apiURL}/resolutions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resolutionData), // Send modified data
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error message:", errorData);
        throw new Error("Failed to add resolution");
      }
  
      toast.success("Resolution added successfully");
  
      // Fetch updated resolutions and update the table
      const fetchUpdatedResolutions = async () => {
        const refreshedResponse = await fetch(`${apiURL}/resolutions`);
        const refreshedData = await refreshedResponse.json();
  
        setRows(refreshedData.data.results);
        console.log(refreshedData.data.results);
      };
      await fetchUpdatedResolutions();
  
      handleClose();
      resetForm(); 
    } catch (error) {
      toast.error("Failed to add resolution. Please try again.");
    }
  };
  

  const resetForm = () => {
    setFormData({
      status: "created",
      description: "",
      itemFile: "https://example.com/files/resolution.pdf",
      itemVariable: "Variable content",
      clientName: "",
      resolutionItem: "",
      isFinancialSequence: false,
      issueDate: "",
      passedDate: "",
      issueFrom: "",
      emailTo: "director@example.com",
      emailAt: "direct@example.com",
      dueDate: "",
      resolutionNo: "",
      decisionType: "",
      committeeType: "", 
    });
  };

  const handleOpen = () => {
    setEditingRow(null)
    setOpen(true);
    resetForm();
  };

  const handleClose = () => {
    setOpen(false);
  };

  const showResolutionDetails = (resolution) => {
    setSelectedResolution(resolution);
  };

  const backToList = () => {
    setSelectedResolution(null);
  };
  const handleEditClick = (row) => {
    setEditingRow(row);
    setFormData({
      clientName: row.clientName.name,
      status: row.status,
      description: row.description,
      itemFile: row.itemFile || "https://example.com/files/resolution.pdf",
      itemVariable: row.itemVariable || "Variable content",
      resolutionItem: row.resolutionItem.fileName || "",
      isFinancialSequence: row.isFinancialSequence || false,
      issueDate: row.issueDate || "",
      passedDate: row.passedDate || "",
      issueFrom: row.issueFrom || "",
      emailTo: row.emailTo || "director@example.com",
      emailAt: row.emailAt || "direct@example.com",
      dueDate: row.dueDate || "",
      resolutionNo: row.resolutionNo || "",
      decisionType: row.decisionType || "",
      committeeType: row.committeeType || "",
    });
    setOpen(true);
  };

  const handleDeleteClick = async (row) => {
    try {
      const response = await fetch(`${apiURL}/resolutions/${row.id}`, {
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

  return (
    <>
      <Container className="styled-table pt-3 mt-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Members Resolution</h4>
          <Button variant="primary" className="btn-box" onClick={handleOpen}>
            <FaPlus style={{ marginRight: "8px" }} /> Add
          </Button>
        </div>

        <Modal show={open} onHide={handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>{editingRow ? "Edit Member Resolution" : "Add Member Resolution"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
             

              
                <>
                  <Row>
                    <Col>
                      <Form.Group controlId="clientName" className="mb-3">
                        <Form.Label>Client Name</Form.Label>
                        <Form.Control
                          as="select"
                          name="clientName"
                          value={formData.clientName}
                          onChange={handleChange}
                        >
                          <option value="">Select client name</option>
                          {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                              {company.name}
                            </option>
                          ))}
                        </Form.Control>
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group controlId="committeeType" className="mb-3">
                        <Form.Label>Committee Type</Form.Label>
                        <Form.Control
                          as="select"
                          name="committeeType"
                          value={formData.committeeType}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select committee type</option>
                          <option value="CSR">CSR</option>
                          <option value="Audit">Audit</option>
                        </Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col>
                      <Form.Group controlId="description" className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="Enter description"
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group controlId="resolutionItem" className="mb-3">
                        <Form.Label>Template Name</Form.Label>
                        <Form.Control
                          as="select"
                          name="resolutionItem"
                          value={formData.resolutionItem}
                          onChange={handleChange}
                          disabled={loading}
                        >
                          <option value="">Select template name</option>
                          {templateList.map((template) => (
                            <option key={template.id} value={template.id}>
                              {template.templateName}
                            </option>
                          ))}
                        </Form.Control>
                        {loading && <Spinner animation="border" size="sm" />}{" "}
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group controlId="issueDate" className="mb-3">
                        <Form.Label>Issue Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={formData.issueDate}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="passedDate" className="mb-3">
                        <Form.Label>Passed Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={formData.passedDate}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Group controlId="dueDate" className="mb-3">
                        <Form.Label>Due Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={formData.dueDate}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group controlId="issueFrom" className="mb-3">
                        <Form.Label>Issue From</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.issueFrom}
                          onChange={handleChange}
                          placeholder="Enter issue source"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Group controlId="resolutionNo" className="mb-3">
                        <Form.Label>Resolution No.</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.resolutionNo}
                          onChange={handleChange}
                          placeholder="Enter resolution number"
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group controlId="decisionType" className="mb-3">
                        <Form.Label>Decision Type</Form.Label>
                        <Form.Control
                          as="select"
                          name="decisionType"
                          value={formData.decisionType}
                          onChange={handleChange}
                        >
                          <option value="">Select Decision Type</option>
                          <option value="unanimously">Unanimously</option>
                          <option value="majority">Majority</option>
                        </Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Group controlId="itemFile" className="mb-3">
                        <Form.Label>Item File</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.itemFile}
                          onChange={handleChange}
                          placeholder="Enter file URL"
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group controlId="itemVariable" className="mb-3">
                        <Form.Label>Item Variable</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.itemVariable}
                          onChange={handleChange}
                          placeholder="Enter item variable content"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </>
            

              <Button type="submit" variant="primary" className="me-2">
                Save
              </Button>
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        {selectedResolution ? (
          <>
            <Button
              variant="primary"
              className="mb-3 mt-4"
              onClick={backToList}
            >
              Back to List
            </Button>

            <div className="bg-light p-4 rounded">
              <h5>Details for: {selectedResolution.clientName.name}</h5>
              <p>
                <strong>Resolution Item:</strong>{" "}
                {selectedResolution.resolutionItem.fileName}
              </p>
              <p>
                <strong>Issue Date:</strong> {selectedResolution.issueDate}
              </p>
              <p>
                <strong>Email To:</strong> {selectedResolution.emailTo}
              </p>
              <p>
                <strong>Due Date:</strong> {selectedResolution.dueDate}
              </p>
              <p>
                <strong>Resolution No:</strong>{" "}
                {selectedResolution.resolutionNo}
              </p>
            </div>
          </>
        ) : loading ? (
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
                  <th>Client Name</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Issue From</th>
                  <th>Issue Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={index}
                    onClick={() => showResolutionDetails(row)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{row.clientName.name}</td>
                    <td>{row.type}</td>
                    <td>{row.description}</td>
                    <td>{row.status}</td>
                    <td>{row.issueFrom}</td>
                    <td>{row.issueDate}</td>
                    <td>
                      <Button
                      variant="outline-secondary"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click
                        handleEditClick(row);
                      }}
                      className="me-2"
                    >
                      <FaEdit />
                    </Button>
                      <Button
                        variant="outline-danger"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          handleDeleteClick(row);
                        }}
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
};

export default MembersResolution;
