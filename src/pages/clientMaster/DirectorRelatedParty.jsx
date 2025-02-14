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

export default function DirectorRelatedParty() {
  const [rows, setRows] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    related_party_name: "",
    forms_to_be_collected: "",
    type_of_related_party: "",
    registration_number: "",
    related_party_address: "",
    nature_of_interest: "",
    date_of_interest_arose_or_appointment: "",
    date_of_interest_changed_resigned_or_cessation: "",
    number_of_securities: "",
    mode_of_holding: "",
    nominal_value_of_securities: "",
    consideration_paid: "",
    shareholding_percentage: "",
  });

  const token = localStorage.getItem("refreshToken");
  const { id } = useParams();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${apiURL}/director-related-party?director_id=${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setRows(data.results);
        console.log(data.results, "setRows");
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refresh]);
  const handleOpenAddModal = () => {
    setFormData({
      director_id: id,
      related_party_name: "",
      forms_to_be_collected: "",
      type_of_related_party: "",
      registration_number: "",
      related_party_address: "",
      nature_of_interest: "",
      date_of_interest_arose_or_appointment: "",
      date_of_interest_changed_resigned_or_cessation: "",
      number_of_securities: "",
      mode_of_holding: "",
      nominal_value_of_securities: "",
      consideration_paid: "",
      shareholding_percentage: "",
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
        console.log(editingRow, "editingRow");
        await fetch(`${apiURL}/director-related-party/${editingRow?.id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        });
        setRefresh((prev) => !prev);

        toast.success("Related Party updated successfully");
      } else {
        const response = await fetch(`${apiURL}/director-related-party`, {
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
        setRefresh((prev) => !prev);

        toast.success("Related Party added successfully");
      }
      setOpenAddModal(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setButtonLoading(false); // Hide button spinner
    }
  };

  const handleDeleteClick = async (row) => {
    try {
      const response = await fetch(
        `${apiURL}/director-related-party/${row?.id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        const errorMessage = await response.json();
        toast.error(errorMessage.message);
        setButtonLoading(false);

        return;
      }

      setRefresh((prev) => !prev);

      toast.success("Associate deleted successfully");
    } catch (error) {
      toast.error("Failed to delete shareholder");
    }
  };

  const handleEditClick = (row) => {
    setEditingRow(row);
    setFormData({
      related_party_name: row?.related_party_name || "",
      forms_to_be_collected: row?.forms_to_be_collected || "",
      type_of_related_party: row?.type_of_related_party || "",
      registration_number: row?.registration_number || "",
      related_party_address: row?.related_party_address || "",
      nature_of_interest: row?.nature_of_interest || "",
      date_of_interest_arose_or_appointment:
        row?.date_of_interest_arose_or_appointment?.split("T")[0] || "",
      date_of_interest_changed_resigned_or_cessation:
        row?.date_of_interest_changed_resigned_or_cessation?.split("T")[0] ||
        "",
      number_of_securities: row?.number_of_securities || "",
      mode_of_holding: row?.mode_of_holding || "",
      nominal_value_of_securities: row?.nominal_value_of_securities || "",
      consideration_paid: row?.consideration_paid || "",
      shareholding_percentage: row?.shareholding_percentage || "",
    });
    setOpenAddModal(true);
  };

  return (
    <>
      <Container fluid className="styled-table pt-3 mt-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Related Parties</h4>
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
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {editingRow ? "Edit Related Party" : "Add Related Party"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6} className="mt-2">
                  <Form.Group controlId="related_party_name" className="mb-3">
                    <Form.Label>
                      Name<sup>*</sup>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.related_party_name}
                      onChange={handleChange}
                      placeholder="Enter Related Party Name"
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6} className="mt-2">
                  <Form.Group
                    controlId="forms_to_be_collected"
                    className="mb-3"
                  >
                    <Form.Label>Forms to be Collected</Form.Label>
                    <Form.Select
                      value={formData.forms_to_be_collected}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>
                        Select Form
                      </option>
                      <option value="MBP-1">MBP-1</option>
                      <option value="both MBP-1 and DIR-8">
                        Both MBP-1 and DIR-8
                      </option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6} className="mt-2">
                  <Form.Group
                    controlId="type_of_related_party"
                    className="mb-3"
                  >
                    <Form.Label>Type</Form.Label>
                    <Form.Select
                      value={formData.type_of_related_party}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>
                        Select Type
                      </option>
                      <option value="Holding Company">Holding Company</option>
                      <option value="Subsidiary Company">
                        Subsidiary Company
                      </option>
                      <option value="Subsidiary of Holding Company">
                        Subsidiary of Holding Company
                      </option>
                      <option value="Associate Company">
                        Associate Company
                      </option>
                      <option value="Others">Others</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6} className="mt-2">
                  <Form.Group controlId="registration_number" className="mb-3">
                    <Form.Label>Registration Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.registration_number}
                      onChange={handleChange}
                      placeholder="Enter Registration Number"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} className="mt-2">
                  <Form.Group
                    controlId="related_party_address"
                    className="mb-3"
                  >
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.related_party_address}
                      onChange={handleChange}
                      placeholder="Enter Address"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} className="mt-2">
                  <Form.Group controlId="nature_of_interest" className="mb-3">
                    <Form.Label>Nature of Interest</Form.Label>
                    <Form.Select
                      value={formData.nature_of_interest}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>
                        Select Interest
                      </option>
                      <option value="Director">Director</option>
                      <option value="Whole-Time Director">
                        Whole-Time Director
                      </option>
                      <option value="Managing Director">
                        Managing Director
                      </option>
                      <option value="Shareholder">Shareholder</option>
                      <option value="Partner">Partner</option>
                      <option value="Member">Member</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6} className="mt-2">
                  <Form.Group
                    controlId="date_of_interest_arose_or_appointment"
                    className="mb-3"
                  >
                    <Form.Label>
                      Date of Interest Arose / Appointment
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.date_of_interest_arose_or_appointment}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={6} className="mt-2">
                  <Form.Group
                    controlId="date_of_interest_changed_resigned_or_cessation"
                    className="mb-3"
                  >
                    <Form.Label>
                      Date of Interest Changed / Resigned / Cessation
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={
                        formData.date_of_interest_changed_resigned_or_cessation
                      }
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={6} className="mt-2">
                  <Form.Group controlId="number_of_securities" className="mb-3">
                    <Form.Label>Number of Securities</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.number_of_securities}
                      onChange={handleChange}
                      placeholder="Enter Number of Securities"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} className="mt-2">
                  <Form.Group controlId="mode_of_holding" className="mb-3">
                    <Form.Label>Mode of Holding</Form.Label>
                    <Form.Select
                      value={formData.mode_of_holding}
                      onChange={handleChange}
                    >
                      <option value="" disabled>
                        Select Mode
                      </option>
                      <option value="Physical">Physical</option>
                      <option value="Demat">Demat</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6} className="mt-2">
                  <Form.Group
                    controlId="nominal_value_of_securities"
                    className="mb-3"
                  >
                    <Form.Label>Nominal Value of Securities</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.nominal_value_of_securities}
                      onChange={handleChange}
                      placeholder="Enter Nominal Value"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} className="mt-2">
                  <Form.Group controlId="consideration_paid" className="mb-3">
                    <Form.Label>Consideration Paid</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.consideration_paid}
                      onChange={handleChange}
                      placeholder="Enter Consideration Paid"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} className="mt-2">
                  <Form.Group
                    controlId="shareholding_percentage"
                    className="mb-3"
                  >
                    <Form.Label>Shareholding Percentage</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.shareholding_percentage}
                      onChange={handleChange}
                      placeholder="Enter Shareholding Percentage"
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
        ) : rows?.length === 0 ? (
          <div className="text-center mt-5">
            <h5>No data available</h5>
          </div>
        ) : (
          <div className="table-responsive mt-5">
            <Table bordered hover className="Master-table">
              <thead className="Master-Thead">
                <tr>
                  <th>Name</th>
                  <th>Mode of Holding</th>
                  <th>Registeration Number</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows?.map((row) => (
                  <tr key={row?.id}>
                    <td>{row?.related_party_name}</td>
                    <td>{row?.mode_of_holding || "-"}</td>
                    <td>{row?.registration_number || "-"}</td>
                    <td>{row?.type_of_related_party || "-"}</td>
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
