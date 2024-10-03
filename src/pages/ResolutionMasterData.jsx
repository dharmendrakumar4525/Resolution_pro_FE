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
import { FaPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResolutionMasterData = () => {
  const [isDocOpen, setIsDocOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [templateNames, setTemplateNames] = useState([]);
  const [resolutionType, setResolutionType] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResolution, setSelectedResolution] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [templateList, setTemplateList] = useState([]);

  const [formData, setFormData] = useState({
    type: "",
   status: "created", 
    description: "",
    itemFile: "https://example.com/files/resolution.pdf", // Updated default file
    itemVariable: "Variable content", // Updated default content
    clientName: "", // This should be an empty string, not an array
    resolutionItem: "", // This should be an empty string, not an array
    isFinancialSequence: false,
    issueDate: "",
    passedDate: "",
    issueFrom: "",
    emailTo: "director@example.com", // Updated default email
    emailAt: "direct@example.com", // Updated default email
    dueDate: "",
    resolutionNo: "", // Added missing field
    decisionType: "", // Added missing field
    committeeType: "", // Added committeeType
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
        setCompanies(data.results);
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

    // If the type is not 'committee', remove committeeType
    if (resolutionData.type !== "committee") {
      delete resolutionData.committeeType;
    }

    // Ensure required fields are provided
    if (
      !resolutionData.type ||
      !resolutionData.resolutionItem ||
      !resolutionData.issueDate ||
      !resolutionData.issueFrom ||
      !resolutionData.dueDate ||
      !resolutionData.decisionType ||
      !resolutionData.emailTo ||
      !resolutionData.emailAt ||
      !resolutionData.resolutionNo ||
      !resolutionData.itemFile ||
      !resolutionData.itemVariable ||
      !resolutionData.clientName
    ) {
      toast.error("All required fields must be filled.");
      return;
    }

    try {
      const response = await fetch(`${apiURL}/resolutions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resolutionData), // Send modified data
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error message:", errorData);
        throw new Error("Failed to add item");
      }

      toast.success("Resolution added successfully");
      const data = await response.json();
      setRows((prevRows) => [...prevRows, data]);
      handleClose();
      resetForm();
    } catch (error) {
      toast.error("Failed to add resolution. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      type: "",
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
      committeeType: "", // Resetting committeeType
    });
  };

  const handleOpen = () => {
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

  return (
    <>
      <Container className="styled-table pt-3 mt-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Resolution Master Data</h4>
          <Button variant="primary" className="btn-box" onClick={handleOpen}>
            <FaPlus style={{ marginRight: "8px" }} /> Add
          </Button>
        </div>

        <Modal show={open} onHide={handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Add Resolution Master Data</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="type" className="mb-3">
                <Form.Label>Resolution Type</Form.Label>
                <Form.Control
                  as="select"
                  value={formData.type}
                  onChange={(e) => {
                    handleChange(e);
                    setResolutionType(e.target.value);
                  }}
                >
                  <option value="">Select Type</option>
                  <option value="board">Board Resolution</option>
                  <option value="committee">Committee Resolution</option>
                </Form.Control>
              </Form.Group>

              {resolutionType === "board" && (
                <>
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
              )}

              {resolutionType === "committee" && (
                <>
                <Row>
                <Col>
                  <Form.Group controlId="committeeType" className="mb-3">
                    <Form.Label>Committee Type</Form.Label>
                    <Form.Control
                      as="select"
                      name="committeeType"
                      value={formData.committeeType}
                      onChange={handleChange}
                    >
                      <option value="">Select Committee Type</option>
                      <option value="CSR">CSR</option>
                      <option value="Audit">Audit</option>
                    </Form.Control>
                  </Form.Group>
                  </Col>
                  <Col>
                  <Form.Group controlId="emailTo" className="mb-3">
                    <Form.Label>Email To</Form.Label>
                    <Form.Control
                      type="email"
                      value={formData.emailTo}
                      onChange={handleChange}
                      placeholder="Enter recipient email"
                    />
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
              )}

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
              <h5>Details for: {selectedResolution.clientName}</h5>
              <p>
                <strong>Resolution Item:</strong>{" "}
                {selectedResolution.resolutionItem}
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
                  <th>Status</th>
                  <th>Type</th>
                  <th>Client Name</th>
                  <th>Description</th>
                  <th>Issue From</th>
                  <th>Issue Date</th>
                  <th>By</th>
                  <th>At</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={index}
                    onClick={() => showResolutionDetails(row)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{row.status}</td>
                    <td>{row.type}</td>
                    <td>{row.clientName}</td>
                    <td>{row.description}</td>
                    <td>{row.issueFrom}</td>
                    <td>{row.issueDate}</td>
                    <td>{row.by}</td>
                    <td>{row.at}</td>
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

export default ResolutionMasterData;
