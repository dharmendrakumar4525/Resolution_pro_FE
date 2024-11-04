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
  Pagination,
} from "react-bootstrap";
import { apiURL } from "../API/api";
import { FaEdit, FaTrash, FaPlus ,FaUser} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { useAuth } from "../context/AuthContext";

export default function CustomerMaintenance() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
    const fetchData = async (pageNo) => {
      try {
        const response = await fetch(
          `${apiURL}/customer-maintenance?page=${pageNo}`
        );
        const data = await response.json();
        setRows(data.docs);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData(page);
  }, [page]);
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

  const handleAdd = () => navigate("/customer-maintenance-form");
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
  const handleEdit = (customerId, e) => {
    e.stopPropagation();
    navigate(`/customer-maintenance-form/${customerId}`);
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
  const handlePageChange = (newPage) => {
    setPage(newPage);
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
            <Button variant="primary" className="btn-box" onClick={handleAdd}>
              <FaPlus style={{ marginRight: "8px" }} /> Add
            </Button>
          )}
        </div>

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
          <Table bordered hover className="Master-table">
          <thead className="Master-Thead">
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
                    <td className="">
                      {row.alloted_manager[0]?.name || "-"}
                    </td>
                    <td>
                      <button
                        className="director-btn"
                        onClick={(e) => handleViewDirectors(row, e)}
                      >
                      <FaUser/>  View Directors
                      </button>
                    </td>

                    <td>
                      {hasPermission("edit") && (
                        <Button
                          variant="outline-primary"
                          onClick={(e) => handleEdit(row._id, e)}
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
            <Pagination className="mt-4">
              <Pagination.Prev
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              />
              {Array.from({ length: totalPages }, (_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === page}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              />
            </Pagination>
          </div>
        )}
      </Container>
      <ToastContainer />
    </>
  );
}
