import React, { useEffect, useState } from "react";
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
import { apiURL } from "../API/api";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { useAuth } from "../context/AuthContext";

export default function CustomerMaintenance() {
  const [rows, setRows] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    state: "",
    country: "",
    cin: "",
    pan: "",
    gstin: "",
    o: false,
    c: false,
    v: false,
    ro: false,
    revision: "",
    alloted_manager: {
      // Reset `alloted_manager` to its proper structure
      role: "manager",
      isEmailVerified: false,
      name: "",
      email: "",
      id: "",
    },
    locations: [
      {
        locationId: "",
        locationName: "",
        addressLine1: "",
        addressLine2: "",
        postalCode: "",
        country: "",
        state: "",
        salesTaxType: "",
        gst: "",
        registeredOffice: false,
      },
    ],
  });
  const { rolePermissions } = useAuth();

  const userRole = JSON.parse(localStorage.getItem("user"))?.role;
  const userManagerName = JSON.parse(localStorage.getItem("user"))?.name;
  const userManagerId = JSON.parse(localStorage.getItem("user"))?.id;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiURL}/customer-maintenance`);
        const data = await response.json();
        setRows(data.docs);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await fetch(
          `${apiURL}/users?role=6708f0e613afb8a51ad85e3e`
        );
        const data = await response.json();
        setManagers(data.results);
      } catch (error) {
        console.error("Error fetching managers:", error);
      }
    };
    fetchManagers();
  }, []);
  const handleLocationChange = (e, index) => {
    const { name, value } = e.target;
    const updatedLocations = [...formData.locations];
    updatedLocations[index] = { ...updatedLocations[index], [name]: value };
    setFormData({ ...formData, locations: updatedLocations });
  };
  const addLocation = () => {
    setFormData({
      ...formData,
      locations: [
        ...formData.locations,
        {
          locationId: "",
          locationName: "",
          addressLine1: "",
          addressLine2: "",
          postalCode: "",
          country: "",
          state: "",
          salesTaxType: "",
          gst: "",
          registeredOffice: false,
        },
      ],
    });
  };
  const handleLocationCheckboxChange = (index, field) => (event) => {
    const newLocations = [...formData.locations];
    newLocations[index][field] = event.target.checked;
    setFormData({
      ...formData,
      locations: newLocations,
    });
  };

  const removeLocation = (index) => {
    const updatedLocations = formData.locations.filter(
      (location, i) => i !== index
    );
    setFormData({ ...formData, locations: updatedLocations });
  };

  const handleDeleteClick = async (row, e) => {
    e.stopPropagation();
    try {
      const response = await fetch(
        `${apiURL}/customer-maintenance/${row._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      const newResponse = await fetch(`${apiURL}/customer-maintenance`);
      const data = await newResponse.json();
      setRows(data.docs);

      alert("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleCheckboxChange = (e) => {
    const { id, checked } = e.target;
    setFormData({ ...formData, [id]: checked });
  };

  const handleOpenAddModal = () => {
    setFormData({
      name: "",
      state: "",
      country: "",
      cin: "",
      pan: "",
      gstin: "",
      o: false,
      c: false,
      v: false,
      ro: false,
      revision: "",
      alloted_manager: userRole === "manager" ? userManagerId : "",
      locations: [
        {
          locationId: "",
          locationName: "",
          addressLine1: "",
          addressLine2: "",
          postalCode: "",
          country: "",
          state: "",
          salesTaxType: "",
          gst: "",
          registeredOffice: false,
        },
      ],
    });
    setEditingRow(null);
    setOpenAddModal(true);
  };

  const handleEditClick = (row, e) => {
    e.stopPropagation();
    setEditingRow(row);
    setOpenAddModal(true);
    setFormData({
      name: row.name,
      state: row.state,
      country: row.country,
      cin: row.cin,
      pan: row.pan,
      gstin: row.gstin,
      o: row.o,
      c: row.c,
      v: row.v,
      ro: row.ro,
      revision: row.revision,
      alloted_manager: row.alloted_manager.id || "",
      locations:
        row.locations && row.locations.length > 0
          ? row.locations
          : [
              {
                locationId: "",
                locationName: "",
                addressLine1: "",
                addressLine2: "",
                postalCode: "",
                country: "",
                state: "",
                salesTaxType: "",
                gst: "",
                registeredOffice: false,
              },
            ],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const sanitizedFormData = {
        ...formData,
        locations: formData.locations.map((location) => {
          const { _id, ...rest } = location;
          return rest;
        }),
      };

      if (editingRow) {
        // PATCH request for editing an existing row
        const response = await fetch(
          `${apiURL}/customer-maintenance/${editingRow._id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(sanitizedFormData),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to edit item");
        }

        // Update local rows with edited data
        const newResponse = await fetch(`${apiURL}/customer-maintenance`);
        const data = await newResponse.json();
        setRows(data.docs);
        toast.success("Maintenance edited successfully");
        setOpenAddModal(false);
      } else {
        // POST request for adding a new row
        const response = await fetch(`${apiURL}/customer-maintenance`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        toast.success("Maintenance added successfully");
        setOpenAddModal(false);
        // Fetch updated maintenance list
        const fetchUpdatedMaintenance = async () => {
          const refreshedResponse = await fetch(
            `${apiURL}/customer-maintenance`
          );
          const refreshedData = await refreshedResponse.json();
          setRows(refreshedData.data.results);
        };
        await fetchUpdatedMaintenance();
      }

      setFormData({
        name: "",
        state: "",
        country: "",
        cin: "",
        pan: "",
        gstin: "",
        o: false,
        c: false,
        v: false,
        ro: false,
        revision: "",
        alloted_manager: {
          // Reset `alloted_manager` to its proper structure
          role: "manager",
          isEmailVerified: false,
          name: "",
          email: "",
          id: "",
        },
        locations: [
          {
            locationName: "",
            addressLine1: "",
            addressLine2: "",
            postalCode: "",
            country: "",
            state: "",
            salesTaxType: "",
            gst: "",
            registeredOffice: false,
          },
        ],
      });
    } catch (error) {
      console.error("Failed to add/edit item. Please try again.");
    }
  };

  const handleViewDirectors = (row, e) => {
    e.stopPropagation();
    navigate(`/directors/${row._id}`);
  };

  const handleRowClick = (row) => {
    navigate(`/customer-maintenance-detail/${row.id}`, { state: { row } });
  };
  const userPermissions =
    rolePermissions.find((perm) => perm.moduleName === "Customer_Maintenance")
      ?.childList || [];
  const hasPermission = (action) =>
    userPermissions.some((perm) => perm.value === action && perm.isSelected);
  return (
    <>
      <Container fluid className="styled-table pt-3 mt-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Client Records</h4>
          {hasPermission("add") && (
            <Button
              variant="primary"
              className="btn-box"
              onClick={handleOpenAddModal}
            >
              <FaPlus style={{ marginRight: "8px" }} /> Add
            </Button>
          )}
        </div>

        <Modal
          show={openAddModal}
          onHide={() => setOpenAddModal(false)}
          className="p-2"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {editingRow ? "Edit Customer" : "Add Customer"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Col>
                  <Form.Group controlId="name">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter Name"
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group as={Col} controlId="state">
                    <Form.Label>State</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Enter State"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <Form.Group as={Col} controlId="country">
                    <Form.Label>Country</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="Enter Country"
                    />
                  </Form.Group>
                </Col>

                <Col>
                  <Form.Group as={Col} controlId="cin">
                    <Form.Label>CIN</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.cin}
                      onChange={handleChange}
                      placeholder="Enter CIN"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <Form.Group as={Col} controlId="pan">
                    <Form.Label>PAN</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.pan}
                      onChange={handleChange}
                      placeholder="Enter PAN"
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId="gstin">
                    <Form.Label>GSTIN</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.gstin}
                      onChange={handleChange}
                      placeholder="Enter GSTIN"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <Form.Group controlId="revision">
                    <Form.Label>Revision</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.revision}
                      onChange={handleChange}
                      placeholder="Enter Revision"
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId="alloted_manager">
                    <Form.Label>Manager</Form.Label>
                    {userRole === "manager" ? (
                      <Form.Control
                        type="text"
                        value={userManagerName}
                        readOnly
                        // placeholder = {userManagerName}
                      />
                    ) : (
                      <Form.Control
                        as="select"
                        value={formData.alloted_manager.name}
                        onChange={handleChange}
                      >
                        <option value="">Select Manager</option>
                        {managers.map((manager) => (
                          <option key={manager.id} value={manager.id}>
                            {manager.name}
                          </option>
                        ))}
                      </Form.Control>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-4">
                <Form.Group as={Col} controlId="o">
                  <Form.Check
                    type="checkbox"
                    label="O"
                    checked={formData.o}
                    onChange={handleCheckboxChange}
                  />
                </Form.Group>

                <Form.Group as={Col} controlId="c">
                  <Form.Check
                    type="checkbox"
                    label="C"
                    checked={formData.c}
                    onChange={handleCheckboxChange}
                  />
                </Form.Group>

                <Form.Group as={Col} controlId="v">
                  <Form.Check
                    type="checkbox"
                    label="V"
                    checked={formData.v}
                    onChange={handleCheckboxChange}
                  />
                </Form.Group>

                <Form.Group as={Col} controlId="ro">
                  <Form.Check
                    type="checkbox"
                    label="RO"
                    checked={formData.ro}
                    onChange={handleCheckboxChange}
                  />
                </Form.Group>
              </Row>
              <h5 className="mt-4">Locations</h5>
              {formData.locations.map((location, index) => (
                <div key={index} className="location-block mb-4">
                  <Row className="mb-3">
                    <Col>
                      <Form.Group controlId={`locationId-${index}`}>
                        <Form.Label>Location ID</Form.Label>
                        <Form.Control
                          type="text"
                          name="locationId"
                          value={location.locationId}
                          onChange={(e) => handleLocationChange(e, index)}
                          placeholder="Enter Location Id"
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group controlId={`locationName-${index}`}>
                        <Form.Label>Location Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="locationName"
                          value={location.locationName}
                          onChange={(e) => handleLocationChange(e, index)}
                          placeholder="Enter Location Name"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col>
                      <Form.Group controlId={`addressLine1-${index}`}>
                        <Form.Label>Address Line 1</Form.Label>
                        <Form.Control
                          type="text"
                          name="addressLine1"
                          value={location.addressLine1}
                          onChange={(e) => handleLocationChange(e, index)}
                          placeholder="Enter Address Line 1"
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group controlId={`addressLine2-${index}`}>
                        <Form.Label>Address Line 2</Form.Label>
                        <Form.Control
                          type="text"
                          name="addressLine2"
                          value={location.addressLine2}
                          onChange={(e) => handleLocationChange(e, index)}
                          placeholder="Enter Address Line 2"
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group controlId={`postalCode-${index}`}>
                        <Form.Label>Postal Code</Form.Label>
                        <Form.Control
                          type="text"
                          name="postalCode"
                          value={location.postalCode}
                          onChange={(e) => handleLocationChange(e, index)}
                          placeholder="Enter Postal Code"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col>
                      <Form.Group controlId={`country-${index}`}>
                        <Form.Label>Country</Form.Label>
                        <Form.Control
                          type="text"
                          name="country"
                          value={location.country}
                          onChange={(e) => handleLocationChange(e, index)}
                          placeholder="Enter Country"
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group controlId={`state-${index}`}>
                        <Form.Label>State</Form.Label>
                        <Form.Control
                          type="text"
                          name="state"
                          value={location.state}
                          onChange={(e) => handleLocationChange(e, index)}
                          placeholder="Enter State"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col>
                      <Form.Group controlId={`salesTaxType-${index}`}>
                        <Form.Label>Sales Tax Type</Form.Label>
                        <Form.Control
                          type="text"
                          name="salesTaxType"
                          value={location.salesTaxType}
                          onChange={(e) => handleLocationChange(e, index)}
                          placeholder="Enter Sales Tax Type"
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group controlId={`gst-${index}`}>
                        <Form.Label>GST</Form.Label>
                        <Form.Control
                          type="text"
                          name="gst"
                          value={location.gst}
                          onChange={(e) => handleLocationChange(e, index)}
                          placeholder="Enter GST"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col>
                      <Form.Check
                        type="checkbox"
                        label="Registered Office"
                        checked={location.registeredOffice}
                        onChange={handleLocationCheckboxChange(
                          index,
                          "registeredOffice"
                        )}
                      />
                    </Col>
                  </Row>

                  <Button
                    variant="danger"
                    onClick={() => removeLocation(index)}
                    className="me-2"
                  >
                    Remove Location
                  </Button>
                  <Button
                    className="ml-2"
                    variant="secondary"
                    onClick={addLocation}
                  >
                    Add New Location
                  </Button>
                  <hr />
                </div>
              ))}

              <Button type="submit" variant="primary" className="me-2">
                Save
              </Button>
              <Button
                variant="secondary"
                onClick={() => setOpenAddModal(false)}
                className="ml-2"
              >
                Cancel
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
        ) : !hasPermission("view") ? (
          <div className="text-center mt-5">
            <h5>You do not have permission to view the data</h5>
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center mt-5">
            <h5>No data available</h5>
          </div>
        ) : (
          <div className="table-responsive mt-5">
            <Table striped bordered hover align="center">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>State</th>
                  <th>Country</th>
                  <th>CIN</th>
                  {/* <th>PAN</th> */}
                  <th>GSTIN</th>
                  {/* <th>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip id="tooltip-o">Ownership</Tooltip>}
                    >
                      <span>O?</span>
                    </OverlayTrigger>
                  </th>

                  <th>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip id="tooltip-c">Certified</Tooltip>}
                    >
                      <span>C?</span>
                    </OverlayTrigger>
                  </th>

                  <th>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip id="tooltip-v">Verified</Tooltip>}
                    >
                      <span>V?</span>
                    </OverlayTrigger>
                  </th>

                  <th>
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id="tooltip-ro">Registered Office</Tooltip>
                      }
                    >
                      <span>RO?</span>
                    </OverlayTrigger>
                  </th>

                  <th>Revision</th> */}
                  <th>Alloted Manager</th>
                  <th>Directors</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} onClick={() => handleRowClick(row)}>
                    <td>{row.name}</td>
                    <td>{row.state}</td>
                    <td>{row.country}</td>
                    <td>{row.cin}</td>
                    {/* <td>{row.pan}</td> */}
                    <td>{row.gstin}</td>
                    {/* <td>{row.o ? "Yes" : "No"}</td>
                    <td>{row.c ? "Yes" : "No"}</td>
                    <td>{row.v ? "Yes" : "No"}</td>
                    <td>{row.ro ? "Yes" : "No"}</td>
                    <td className="text-center">{row.revision}</td> */}
                    <td className="text-center">
                      {row.alloted_manager[0]?.name || "-"}
                    </td>
                    <td>
                      <button
                        className="director-btn"
                        onClick={(e) => handleViewDirectors(row, e)}
                      >
                        View Directors
                      </button>
                    </td>

                    <td>
                    {hasPermission("edit") && (
                      <Button
                        variant="outline-secondary"
                        onClick={(e) => handleEditClick(row, e)}
                        className="me-2"
                      >
                        <FaEdit />
                      </Button>
                    )}
                    {hasPermission("delete") && (
                      <Button
                        variant="outline-danger"
                        onClick={(e) => handleDeleteClick(row, e)}
                      >
                        <FaTrash />
                      </Button>
                    )}
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
