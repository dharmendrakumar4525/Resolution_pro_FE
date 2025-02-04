import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Form,
  Modal,
  Table,
  Container,
  Col,
  Row,
  Spinner,
} from "react-bootstrap";
import { apiURL } from "../../API/api";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Shareholders() {
  const [rows, setRows] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company_id: "",
    name: "",
    email: "",
    type: "",
    address: "",
    no_of_shares: "",
    holding_percent: "",
    beneficial_name: "",
    SBO_name: "",
    SBO_address: "",
    dematerialised: false,
  });
  const token = localStorage.getItem("refreshToken");
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${apiURL}/shareholder-data?company_id=${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setRows(data.results);
        console.log(data.results);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);
  const handleOpenAddModal = () => {
    setFormData({
      company_id: `${id}`,
      name: "",
      email: "",
      type: "",
      address: "",
      no_of_shares: "",
      holding_percent: "",
      beneficial_name: "",
      SBO_name: "",
      SBO_address: "",
      dematerialised: false,
    });
    setEditingRow(null);
    setOpenAddModal(true);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };
  const handleCheckboxChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonLoading(true);
    try {
      if (editingRow) {
        await fetch(`${apiURL}/shareholder-data/${editingRow?.id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        });
        setRows((prevRows) =>
          prevRows.map((row) =>
            row?.id === editingRow?.id ? { ...row, ...formData } : row
          )
        );
        toast.success("Shareholder updated successfully");
      } else {
        const response = await fetch(`${apiURL}/shareholder-data`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorMessage = await response.json();
          toast.error(errorMessage.message);
          setButtonLoading(false);

          return;
        }
        const data = await response.json();

        setRows((prevRows) => [...prevRows, data]);
        toast.success("Shareholder added successfully");
      }
      setOpenAddModal(false);
      setFormData({
        company_id: `${id}`,
        name: "",
        email: "",
        type: "",
        address: "",
        no_of_shares: "",
        holding_percent: "",
        beneficial_name: "",
        SBO_name: "",
        SBO_address: "",
        dematerialised: false,
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setButtonLoading(false); // Hide button spinner
    }
  };

  const handleDeleteClick = async (row) => {
    try {
      await fetch(`${apiURL}/shareholder-data/${row?.id}`, {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setRows((prevRows) => prevRows.filter((item) => item.id !== row?.id));

      toast.success("Shareholder deleted successfully");
    } catch (error) {
      toast.error("Failed to delete shareholder");
    }
  };

  const handleEditClick = (row) => {
    setEditingRow(row);
    setFormData({
      company_id: row?.company_id || "",
      name: row?.name || "",
      email: row?.email || "",
      type: row?.type || "",
      address: row?.address || "",
      no_of_shares: row?.no_of_shares || "",
      holding_percent: row?.holding_percent || "",
      beneficial_name: row?.beneficial_name || "",
      SBO_name: row?.SBO_name || "",
      SBO_address: row?.SBO_address || "",
      dematerialised: row?.dematerialised || false,
    });
    setOpenAddModal(true);
  };

  return (
    <>
      <Container fluid className="styled-table pt-3 mt-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Shareholders</h4>
          <Button
            variant="primary"
            className="btn-box"
            onClick={handleOpenAddModal}
          >
            <FaPlus style={{ marginRight: "8px" }} /> Add
          </Button>
        </div>

        <Modal
          show={openAddModal}
          onHide={() => setOpenAddModal(false)}
          className="p-2"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {editingRow ? "Edit Shareholder" : "Add Shareholder"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                {" "}
                <Col md={6} className="mt-2">
                  <Form.Group controlId="name" className="mb-3">
                    <Form.Label>
                      Name<sup>*</sup>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter Name"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mt-2">
                  <Form.Group controlId="email" className="mb-3">
                    <Form.Label>
                      Email<sup>*</sup>
                    </Form.Label>
                    <Form.Control
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter Email"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mt-2">
                  <Form.Group controlId="type" className="mb-3">
                    <Form.Label>
                      Type<sup>*</sup>
                    </Form.Label>
                    <Form.Select
                      value={formData.type}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>
                        Select Type
                      </option>
                      <option value="equity">Equity</option>
                      <option value="preference">Preference</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6} className="mt-2">
                  <Form.Group controlId="address" className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter Address"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mt-2">
                  <Form.Group controlId="no_of_shares" className="mb-3">
                    <Form.Label>Number of Shares</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.no_of_shares}
                      onChange={handleChange}
                      placeholder="Enter Number of Shares"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mt-2">
                  <Form.Group controlId="holding_percent" className="mb-3">
                    <Form.Label>Holding Percentage</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.holding_percent}
                      onChange={handleChange}
                      placeholder="Enter Holding Percentage"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mt-2">
                  <Form.Group controlId="beneficial_name" className="mb-3">
                    <Form.Label>Beneficial Owner Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.beneficial_name}
                      onChange={handleChange}
                      placeholder="Enter Beneficial Owner Name"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mt-2">
                  <Form.Group controlId="SBO_name" className="mb-3">
                    <Form.Label>SBO Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.SBO_name}
                      onChange={handleChange}
                      placeholder="Enter SBO Name"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mt-2">
                  <Form.Group controlId="SBO_address" className="mb-3">
                    <Form.Label>SBO Address</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.SBO_address}
                      onChange={handleChange}
                      placeholder="Enter SBO Address"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mt-5 ps-3">
                  <Form.Group controlId="dematerialised">
                    <Form.Check
                      type="checkbox"
                      id="dematerialised"
                      label="Dematerialised"
                      checked={formData.dematerialised}
                      onChange={handleCheckboxChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button
                variant="primary"
                onClick={() => setOpenAddModal(false)}
                className="me-2"
              >
                Cancel
              </Button>
              <Button type="submit" variant="secondary" className="ml-2">
                {buttonLoading ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : (
                  "Save"
                )}
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
            <Table bordered hover className="Master-table">
              <thead className="Master-Thead">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Holding Percentage</th>
                  <th>Beneficial Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row?.id}>
                    <td>{row?.name}</td>
                    <td>{row?.email}</td>
                    <td>{row?.type || "-"}</td>
                    <td>{row?.holding_percent || "-"}</td>
                    <td>{row?.beneficial_name}</td>
                    <td>
                      <Button
                        variant="outline-primary"
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
          </div>
        )}
        <Button variant="primary" onClick={() => navigate(-1)} className="mt-3">
          Go Back
        </Button>
        <ToastContainer autoClose={1000} />
      </Container>
    </>
  );
}
