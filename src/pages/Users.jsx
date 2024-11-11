import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Form,
  Modal,
  Container,
  Alert,
  Spinner,
  Pagination,
} from "react-bootstrap";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiURL } from "../API/api";
import { useAuth } from "../context/AuthContext";
import Select from "react-select";

export default function CustomerMaintenance() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [roleList, setRoleList] = useState([]);
  const { rolePermissions } = useAuth();
  const token = 'localStorage.getItem("refreshToken")';

  useEffect(() => {
    axios
      .get(`${apiURL}/role?page=${page}`)
      .then((response) => {
        setRoleList(response.data.results);
        setTotalPages(response.data.totalPages);
      })
      .catch((error) => {
        console.error("Error fetching roles:", error);
      });
  }, [page]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiURL}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setRows(data.results);
      } catch (error) {
        toast.error("Error fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "",
    });
    setEditingRow(null);
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => setOpenAddModal(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleEditClick = (row) => {
    setEditingRow(row);
    setFormData({
      name: row?.name,
      email: row?.email,
      password: row?.password,
      role: row?.role?.role,
    });
    setOpenAddModal(true);
  };

  const handleDeleteClick = async (row) => {
    try {
      const response = await fetch(`${apiURL}/users/${row?.id}`, {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      setRows((prevRows) => prevRows.filter((item) => item.id !== row?.id));
      if (rows.length === 1 && page > 1) {
        setPage(page - 1);
      }
      toast.success("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item. Please try again.");
      // alert("Failed to delete item. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonLoading(true);
    try {
      if (editingRow) {
        await fetch(`${apiURL}/users/${editingRow.id}`, {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        });

        const response = await fetch(`${apiURL}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          const errorMessage = await response
            .json()
            .then(
              (data) =>
                data.message || "Failed to update user. Please try again."
            );
          toast.error(errorMessage);
          return;
        }
        const data = await response.json();
        setRows(data.results);

        // Update localStorage user data if the edited user is the logged-in user
        const localStorageUser = JSON.parse(localStorage.getItem("user"));
        if (localStorageUser && localStorageUser.id === editingRow.id) {
          const updatedUser = { ...localStorageUser, ...formData };
          console.log(updatedUser, "dsdsds");

          localStorage.setItem("user", JSON.stringify(updatedUser));
        }

        toast.success("User edited successfully");
      } else {
        const response = await fetch(`${apiURL}/users`, {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorMessage = await response
            .json()
            .then(
              (data) => data.message || "Failed to add user. Please try again."
            );
          toast.error(errorMessage);
          return;
        }
        const newResponse = await fetch(`${apiURL}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await newResponse.json();
        setRows(data.results);

        toast.success("User added successfully");
      }

      handleCloseAddModal();
    } catch (error) {
      toast.error("Failed to add/edit item. Please try again.");
    } finally {
      setButtonLoading(false);
    }
  };
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const roleOptions = roleList.map((role) => ({
    value: role.id,
    label: role.role,
  }));
  const userPermissions =
    rolePermissions.find((perm) => perm.moduleName === "Users")?.childList ||
    [];

  const hasPermission = (action) =>
    userPermissions.some((perm) => perm.value === action && perm.isSelected);
  return (
    <>
      <Container fluid className="styled-table pt-3 mt-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Users</h4>
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
        {error && (
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        )}

        <Modal show={openAddModal} onHide={handleCloseAddModal} className="p-6">
          <Modal.Header closeButton>
            <Modal.Title>{editingRow ? "Edit User" : "Add User"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="name" className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter Name"
                  disabled={!!editingRow}
                />
              </Form.Group>

              <Form.Group controlId="email" className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter Email"
                  disabled={!!editingRow}
                />
              </Form.Group>

              <Form.Group controlId="role" className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Control
                  as="select"
                  name="role"
                  value={formData.role.id}
                  onChange={handleChange}
                >
                  <option value="">Select Role</option>
                  {roleList.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.role}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="password" className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter Password"
                />
              </Form.Group>

              <Button
                variant="primary"
                onClick={handleCloseAddModal}
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
                  <th>Email</th>
                  {/* <th>Email Verified</th> */}
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row?.id}>
                    <td>{row?.name}</td>
                    <td>{row?.email}</td>
                    {/* <td>{row?.isEmailVerified ? "Yes" : "No"}</td> */}
                    <td>{row?.role?.role}</td>
                    <td>
                      {hasPermission("edit") && (
                        <Button
                          variant="outline-primary"
                          onClick={() => handleEditClick(row)}
                          className="me-2"
                        >
                          <FaEdit />
                        </Button>
                      )}
                      {hasPermission("delete") && (
                        <Button
                          variant="outline-danger"
                          onClick={() => handleDeleteClick(row)}
                        >
                          <FaTrash />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination className="mt-4 custom-pagination">
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
