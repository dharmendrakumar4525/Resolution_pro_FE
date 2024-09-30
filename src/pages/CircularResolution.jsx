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
} from "react-bootstrap";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CircularResolution = () => {
  const [isDocOpen, setIsDocOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [templateNames, setTemplateNames] = useState([]);
  const [resolutionType, setResolutionType] = useState("");
  const [circularResolutions, setCircularResolutions] = useState([]);
  const [selectedResolution, setSelectedResolution] = useState(null); // Track the selected resolution for detail view

  const [formData, setFormData] = useState({
    status: "",
    type: "",
    description: "",
    committeeType: "",
    clientName: "",
    resolutionItem: "",
    itemFile: "",
    issueDate: "",
    passedDate: "",
    issueFrom: "",
    emailTo: "",
    dueDate: "",
    resolutionNo: "",
    decisionType: "",
    by: "",
    at: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiURL}/resolutions`);
        const data = await response.json();
        setCircularResolutions(data.data.results);

        const responseMeetingAgendaTemplate = await fetch(
          `${apiURL}/meeting-agenda-template`
        );
        const dataMeetingAgendaTemplate =
          await responseMeetingAgendaTemplate.json();
        const templateNames = dataMeetingAgendaTemplate.results.map(
          (item) => item.templateName
        );
        setTemplateNames(templateNames);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { id, name, value } = e.target;
    setFormData({ ...formData, [id || name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiURL}/resolutions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to add item");
      }
      toast.success("Resolution added successfully");
      const data = await response.json();
      setCircularResolutions((prevRows) => [...prevRows, data]);

      handleClose();
      resetForm();
    } catch (error) {
      toast.error("Failed to add resolution. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      status: "",
      type: "",
      description: "",
      committeeType: "",
      clientName: "",
      resolutionItem: "",
      itemFile: "",
      issueDate: "",
      passedDate: "",
      issueFrom: "",
      emailTo: "",
      dueDate: "",
      resolutionNo: "",
      decisionType: "",
      by: "",
      at: "",
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
          <h4 className="h4-heading-style">Circular Resolution</h4>
          <Button variant="primary" className="btn-box" onClick={handleOpen}>
            <FaPlus style={{ marginRight: "8px" }} /> Add
          </Button>
        </div>

        <Modal show={open} onHide={handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Add Circular Resolution</Modal.Title>
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
                  <Form.Group controlId="status" className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.status}
                      onChange={handleChange}
                      placeholder="Enter status"
                    />
                  </Form.Group>

                  <Form.Group controlId="clientName" className="mb-3">
                    <Form.Label>Client Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.clientName}
                      onChange={handleChange}
                      placeholder="Enter client name"
                    />
                  </Form.Group>

                  <Form.Group controlId="description" className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter description"
                    />
                  </Form.Group>

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

                  <Form.Group controlId="issueFrom" className="mb-3">
                    <Form.Label>Issue From</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.issueFrom}
                      onChange={handleChange}
                      placeholder="Enter issue source"
                    />
                  </Form.Group>
                </>
              )}

              {resolutionType === "committee" && (
                <>
                  <Form.Group controlId="committeeType" className="mb-3">
                    <Form.Label>Committee Type</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.committeeType}
                      onChange={handleChange}
                      placeholder="Enter committee type"
                    />
                  </Form.Group>

                  <Form.Group controlId="status" className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.status}
                      onChange={handleChange}
                      placeholder="Enter status"
                    />
                  </Form.Group>

                  <Form.Group controlId="clientName" className="mb-3">
                    <Form.Label>Client Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.clientName}
                      onChange={handleChange}
                      placeholder="Enter client name"
                    />
                  </Form.Group>

                  <Form.Group controlId="emailTo" className="mb-3">
                    <Form.Label>Email To</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.emailTo}
                      onChange={handleChange}
                      placeholder="Enter recipient email"
                    />
                  </Form.Group>
                </>
              )}

              <Button type="submit" variant="primary" className="me-2">
                Save
              </Button>
              <Button
                variant="secondary"
                onClick={handleClose}
                className="ml-2"
              >
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
                {circularResolutions.map((row, index) => (
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

export default CircularResolution;
