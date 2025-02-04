import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

export default function Directors() {
  const [rows, setRows] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_id: "",
    name: "",
    present_address: "",
    permanent_address: "",
    date_of_appointment: "",
    date_of_cessation: "",
    date_of_regularisation_AGM: "",
    designation: "",
    designation_change_date: "",
    remuneration_details: "",
    WTD_tenure: {
      from: "",
      to: "",
    },
    MD_tenure: {
      from: "",
      to: "",
    },
    DSC_expiry_date: "",
    BM_due_date: "",
    KYC_filling_date: "",
    related_party_name: "",
    related_party_address: "",
    "din/pan": "",
    email: "",
    is_manual: true, // Default value
  });

  const token = localStorage.getItem("refreshToken");
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${apiURL}/director-data/directors/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setRows(data);
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
      present_address: "",
      permanent_address: "",
      date_of_appointment: "",
      date_of_cessation: "",
      date_of_regularisation_AGM: "",
      designation: "",
      designation_change_date: "",
      remuneration_details: "",
      WTD_tenure: {
        from: "",
        to: "",
      },
      MD_tenure: {
        from: "",
        to: "",
      },
      DSC_expiry_date: "",
      BM_due_date: "",
      KYC_filling_date: "",
      related_party_name: "",
      related_party_address: "",
      "din/pan": "",
      email: "",
      is_manual: true,
    });

    setEditingRow(null);
    setOpenAddModal(true);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;

    if (id.includes(".")) {
      const [parent, child] = id.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [id]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonLoading(true);
    try {
      if (editingRow) {
        await fetch(`${apiURL}/director-data/${editingRow?.id}`, {
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
        toast.success("Director updated successfully");
      } else {
        const response = await fetch(`${apiURL}/director-data`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Failed to add director");
        }
        const data = await response.json();
        setRows((prevRows) => [...prevRows, data]);
        toast.success("Director added successfully");
      }
      setOpenAddModal(false);
      setFormData({
        company_id: `${id}`,
        name: "",
        present_address: "",
        permanent_address: "",
        date_of_appointment: "",
        date_of_cessation: "",
        date_of_regularisation_AGM: "",
        designation: "",
        designation_change_date: "",
        remuneration_details: "",
        WTD_tenure: {
          from: "",
          to: "",
        },
        MD_tenure: {
          from: "",
          to: "",
        },
        DSC_expiry_date: "",
        BM_due_date: "",
        KYC_filling_date: "",
        related_party_name: "",
        related_party_address: "",
        "din/pan": "",
        email: "",
        is_manual: true,
      });
    } catch (error) {
      toast.error("Failed to add/update director. Please try again.");
    } finally {
      setButtonLoading(false); // Hide button spinner
    }
  };

  const handleDeleteClick = async (row) => {
    try {
      await fetch(`${apiURL}/director-data/${row?.id}`, {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setRows((prevRows) => prevRows.filter((item) => item.id !== row?.id));

      toast.success("Director deleted successfully");
    } catch (error) {
      toast.error("Failed to delete director");
    }
  };

  const handleEditClick = (row) => {
    setEditingRow(row);
    setFormData({
      company_id: row?.company_id || `${id}`,
      name: row?.name || "",
      present_address: row?.present_address || "",
      permanent_address: row?.permanent_address || "",
      date_of_appointment: row?.date_of_appointment,
      date_of_cessation: row?.date_of_cessation || "",
      date_of_regularisation_AGM: row?.date_of_regularisation_AGM || "",
      designation: row?.designation || "",
      designation_change_date: row?.designation_change_date || "",
      remuneration_details: row?.remuneration_details || "",
      WTD_tenure: {
        from: row?.WTD_tenure?.from || "",
        to: row?.WTD_tenure?.to || "",
      },
      MD_tenure: {
        from: row?.MD_tenure?.from || "",
        to: row?.MD_tenure?.to || "",
      },
      DSC_expiry_date: row?.DSC_expiry_date || "",
      BM_due_date: row?.BM_due_date || "",
      KYC_filling_date: row?.KYC_filling_date || "",
      related_party_name: row?.related_party_name || "",
      related_party_address: row?.related_party_address || "",
      "din/pan": row?.["din/pan"] || "",
      email: row?.email || "",
      is_manual: row?.is_manual !== undefined ? row.is_manual : true,
    });
    setOpenAddModal(true);
  };

  return (
    <>
      <Modal
        show={openAddModal}
        onHide={() => setOpenAddModal(false)}
        className="p-2"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingRow ? "Edit Director" : "Add Director"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ width: "800px" }}>
          <Form onSubmit={handleSubmit}>
            {/* Name */}
            <Row className="mb-3">
              <Col>
                <Form.Group controlId="name" className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter Name"
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="present_address" className="mb-3">
                  <Form.Label>Present Address</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.present_address}
                    onChange={handleChange}
                    placeholder="Enter Present Address"
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="permanent_address" className="mb-3">
                  <Form.Label>Permanent Address</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.permanent_address}
                    onChange={handleChange}
                    placeholder="Enter Permanent Address"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Group controlId="date_of_appointment" className="mb-3">
                  <Form.Label>Date of Appointment</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData?.date_of_appointment?.split("T")[0]}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="date_of_cessation" className="mb-3">
                  <Form.Label>Date of Cessation</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData?.date_of_cessation?.split("T")[0]}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group
                  controlId="date_of_regularisation_AGM"
                  className="mb-3"
                >
                  <Form.Label>Date of Regularisation AGM</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.date_of_regularisation_AGM?.split("T")[0]}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Group controlId="designation" className="mb-3">
                  <Form.Label>Designation</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="Enter Designation"
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group
                  controlId="designation_change_date"
                  className="mb-3"
                >
                  <Form.Label>Designation Change Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.designation_change_date?.split("T")[0]}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="remuneration_details" className="mb-3">
                  <Form.Label>Remuneration Details</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.remuneration_details}
                    onChange={handleChange}
                    placeholder="Enter Remuneration Details"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Remuneration Details */}
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="remuneration_details" className="mb-3">
                  <Form.Label>Remuneration Details</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.remuneration_details}
                    onChange={handleChange}
                    placeholder="Enter Remuneration Details"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="WTD_tenure.from" className="mb-3">
                  <Form.Label>WTD Tenure (From)</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.WTD_tenure?.from?.split("T")[0] || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="WTD_tenure.to" className="mb-3">
                  <Form.Label>WTD Tenure (To)</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.WTD_tenure?.to?.split("T")[0] || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Row 2 */}
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="MD_tenure.from" className="mb-3">
                  <Form.Label>MD Tenure (From)</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.MD_tenure?.from?.split("T")[0] || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="MD_tenure.to" className="mb-3">
                  <Form.Label>MD Tenure (To)</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.MD_tenure?.to?.split("T")[0] || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="din/pan" className="mb-3">
                  <Form.Label>DIN/PAN</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData["din/pan"]}
                    onChange={handleChange}
                    placeholder="Enter DIN/PAN"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Row 3 */}
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="email" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter Email"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="DSC_expiry_date" className="mb-3">
                  <Form.Label>DSC Expiry Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData?.DSC_expiry_date?.split("T")[0]}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="BM_due_date" className="mb-3">
                  <Form.Label>BM Due Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData?.BM_due_date?.split("T")[0]}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Row 4 */}
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="KYC_filling_date" className="mb-3">
                  <Form.Label>KYC Filing Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData?.KYC_filling_date?.split("T")[0]}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="related_party_name" className="mb-3">
                  <Form.Label>Related Party Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.related_party_name}
                    onChange={handleChange}
                    placeholder="Enter Related Party Name"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="related_party_address" className="mb-3">
                  <Form.Label>Related Party Address</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.related_party_address}
                    onChange={handleChange}
                    placeholder="Enter Related Party Address"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Action Buttons */}
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
      <Container fluid className="styled-table pt-3 mt-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Directors</h4>
          <Button
            variant="primary"
            className="btn-box"
            onClick={handleOpenAddModal}
          >
            <FaPlus style={{ marginRight: "8px" }} /> Add
          </Button>
        </div>

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
                  <th>Designation</th>
                  <th>Start Date</th>
                  <th>DIN/PAN</th>
                  <th>End Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row?.id}>
                    <td>{row?.name}</td>
                    <td>{row?.email}</td>
                    <td>{row?.designation}</td>
                    <td>{row?.begin_date}</td>
                    <td>{row["din/pan"]}</td>
                    <td>{row?.end_date || "-"}</td>
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
      </Container>
      <ToastContainer />
    </>
  );
}
