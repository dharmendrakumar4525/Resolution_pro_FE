// CustomerMaintenanceForm.js

import React, { useEffect, useState } from "react";
import { Form, Button, Row, Col, Container, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { apiURL } from "../API/api";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
export default function CustomerMaintenanceForm() {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const [managers, setManagers] = useState([]);
  const [validated, setValidated] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const token = localStorage.getItem("refreshToken");
  const [formData, setFormData] = useState({
    name: "",
    state: "",
    country: "",
    cin: "",
    pan: "",
    gstin: "",
    revision: "",
    o: false,
    c: false,
    v: false,
    ro: false,
    alloted_manager: { name: "", id: "" },
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
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await fetch(
          `${apiURL}/users?role=672c47cb38903b464c9d2923`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setManagers(data.results);
      } catch (error) {
        console.error("Error fetching managers:", error);
      }
    };
    fetchManagers();
  }, []);
  // Fetch customer data if editing
  useEffect(() => {
    if (customerId) {
      const fetchCustomerData = async () => {
        try {
          const response = await fetch(
            `${apiURL}/customer-maintenance/${customerId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          const data = await response.json();
          const sanitizedData = removeIds(data);
          setFormData((prevData) => ({
            ...prevData,
            ...sanitizedData,
            alloted_manager: {
              ...prevData.alloted_manager,
              id: sanitizedData.alloted_manager?.role || "",
              name: sanitizedData.alloted_manager?.name || "",
            },
          }));
          console.log(sanitizedData, "logg");
          console.log(formData, "loggy");
        } catch (error) {
          console.error("Error fetching customer data:", error);
          toast.error("Failed to load customer data");
        }
      };
      fetchCustomerData();
    }
  }, [customerId]);
  const removeIds = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(removeIds);
    } else if (obj !== null && typeof obj === "object") {
      return Object.fromEntries(
        Object.entries(obj)
          .filter(([key]) => key !== "id" && key !== "_id")
          .map(([key, value]) => [key, removeIds(value)])
      );
    }
    return obj;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleLocationChange = (index, field, value) => {
    setFormData((prevData) => {
      const updatedLocations = [...prevData.locations];
      updatedLocations[index] = { ...updatedLocations[index], [field]: value };
      return { ...prevData, locations: updatedLocations };
    });
  };

  const handleLocationCheckboxChange = (index, field) => {
    setFormData((prevData) => {
      const updatedLocations = [...prevData.locations];
      updatedLocations[index] = {
        ...updatedLocations[index],
        [field]: !updatedLocations[index][field],
      };
      return { ...prevData, locations: updatedLocations };
    });
  };
  const handleCheckboxChange = (e) => {
    const { id, checked } = e.target;
    setFormData({ ...formData, [id]: checked });
  };
  const addLocation = () => {
    setFormData((prevData) => ({
      ...prevData,
      locations: [
        ...prevData.locations,
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
    }));
  };

  const removeLocation = (index) => {
    if (formData.locations.length > 1) {
      setFormData((prevData) => ({
        ...prevData,
        locations: prevData.locations.filter((_, i) => i !== index),
      }));
    } else {
      toast.error("Please fill atleast 1 location");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonLoading(true);
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
    } else {
      try {
        const token = localStorage.getItem("refreshToken");
        const method = customerId ? "PATCH" : "POST";
        const endpoint = customerId
          ? `${apiURL}/customer-maintenance/${customerId}`
          : `${apiURL}/customer-maintenance`;
        const response = await fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorMessage = await response
            .json()
            .then((data) => data.message || "Failed to save customer data");
          toast.error(errorMessage);
          return;
        }

        toast.success(
          `Customer ${customerId ? "updated" : "added"} successfully`
        );
        navigate("/client-records");
      } catch (error) {
        console.error("Error saving customer data:", error);
        toast.error("Failed to save customer data");
      } finally {
        setButtonLoading(false); // Hide button spinner
      }
    }
    setValidated(true);
  };

  return (
    <Container>
      <div className="customer-form-container mt-4">
        <h4>{customerId ? "Edit Customer" : "Add Customer"}</h4>
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
                  required
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="state">
                <Form.Label>State</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Enter State"
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="country">
                <Form.Label>Country</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Enter Country"
                  required
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="cin">
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
              <Form.Group controlId="pan">
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
                  type="number"
                  value={formData.revision}
                  onChange={handleChange}
                  placeholder="Enter Revision"
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="alloted_manager">
                <Form.Label>Manager</Form.Label>
                <Form.Control
                  as="select"
                  value={formData.alloted_manager.id}
                  onChange={(e) =>
                    handleChange({
                      target: { id: "alloted_manager", value: e.target.value },
                    })
                  }
                >
                  <option value="">Select Manager</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-4" style={{ width: "80%" }}>
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
                      onChange={(e) =>
                        handleLocationChange(
                          index,
                          "locationId",
                          e.target.value
                        )
                      }
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
                      onChange={(e) =>
                        handleLocationChange(
                          index,
                          "locationName",
                          e.target.value
                        )
                      }
                      placeholder="Enter Location Name"
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId={`addressLine1-${index}`}>
                    <Form.Label>Address Line 1</Form.Label>
                    <Form.Control
                      type="text"
                      name="addressLine1"
                      value={location.addressLine1}
                      onChange={(e) =>
                        handleLocationChange(
                          index,
                          "addressLine1",
                          e.target.value
                        )
                      }
                      placeholder="Enter Address Line 1"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <Form.Group controlId={`addressLine2-${index}`}>
                    <Form.Label>Address Line 2</Form.Label>
                    <Form.Control
                      type="text"
                      name="addressLine2"
                      value={location.addressLine2}
                      onChange={(e) =>
                        handleLocationChange(
                          index,
                          "addressLine2",
                          e.target.value
                        )
                      }
                      placeholder="Enter Address Line 2"
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId={`postalCode-${index}`}>
                    <Form.Label>Postal Code</Form.Label>
                    <Form.Control
                      type="number"
                      name="postalCode"
                      value={location.postalCode}
                      onChange={(e) =>
                        handleLocationChange(
                          index,
                          "postalCode",
                          e.target.value
                        )
                      }
                      placeholder="Enter Postal Code"
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId={`country-${index}`}>
                    <Form.Label>Country</Form.Label>
                    <Form.Control
                      type="text"
                      name="country"
                      value={location.country}
                      onChange={(e) =>
                        handleLocationChange(index, "country", e.target.value)
                      }
                      placeholder="Enter Country"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <Form.Group controlId={`state-${index}`}>
                    <Form.Label>State</Form.Label>
                    <Form.Control
                      type="text"
                      name="state"
                      value={location.state}
                      onChange={(e) =>
                        handleLocationChange(index, "state", e.target.value)
                      }
                      placeholder="Enter State"
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId={`salesTaxType-${index}`}>
                    <Form.Label>Sales Tax Type</Form.Label>
                    <Form.Control
                      type="text"
                      name="salesTaxType"
                      value={location.salesTaxType}
                      onChange={(e) =>
                        handleLocationChange(
                          index,
                          "salesTaxType",
                          e.target.value
                        )
                      }
                      placeholder="Enter Sales Tax Type"
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId={`gst-${index}`}>
                    <Form.Label>GST</Form.Label>
                    <Form.Control
                      type="number"
                      name="gst"
                      value={location.gst}
                      onChange={(e) =>
                        handleLocationChange(index, "gst", e.target.value)
                      }
                      placeholder="Enter GST"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <Form.Group>
                    <Form.Check
                      type="checkbox"
                      label="Registered Location"
                      checked={location.registeredOffice}
                      onChange={() =>
                        handleLocationCheckboxChange(index, "registeredOffice")
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Button
                className="d-flex align-items-center gap-2"
                variant="outline-danger"
                onClick={() => removeLocation(index)}
              >
                <FaTrash /> Location
              </Button>
            </div>
          ))}
          <Button
            variant="primary"
            onClick={addLocation}
            className="d-flex align-items-center gap-2"
          >
            <FaPlus
            // style={{ marginRight: "8px" }}
            />
            Location
          </Button>
          <Button variant="success" type="submit" className="ms-3 float-end">
            {buttonLoading ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              <>{customerId ? "Update Customer" : "Save"}</>
            )}
          </Button>
        </Form>
      </div>
      <ToastContainer autoClose={3000} />
    </Container>
  );
}
