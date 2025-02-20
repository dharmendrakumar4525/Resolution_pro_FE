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
  const [userList, setUserList] = useState([]);
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
  const [searchFilter, setSearchFilter] = useState({
    user_name: "",
  });
  const [roleList, setRoleList] = useState([]);
  const { rolePermissions } = useAuth();
  const [refresh, setRefresh] = useState(false);
  const token = localStorage.getItem("refreshToken");

  useEffect(() => {
    axios
      .get(`${apiURL}/role`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        setRoleList(response.data.results);
      })
      .catch((error) => {
        console.error("Error fetching roles:", error);
      });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiURL}/users?page=${page}&limit=10`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setRows(data.results);

        setTotalPages(data.totalPages);
      } catch (error) {
        toast.error("Error fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, refresh]);
  useEffect(() => {
    const fetchClientList = async () => {
      try {
        const response = await fetch(`${apiURL}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setUserList(data.results);
        console.log(data.results, "jkl");
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

    fetchClientList();
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
  const handleFilterChange = async (selectedOption) => {
    setSearchFilter((prevData) => ({
      ...prevData,
      user_name: selectedOption ? selectedOption.value : "",
    }));

    if (selectedOption && selectedOption.value !== "") {
      const token = localStorage.getItem("refreshToken");
      const response = await fetch(
        `${apiURL}/users?page=${page}&limit=10&name=${selectedOption.label}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setRows(data.results);
      setTotalPages(data.totalPages);
    } else {
      setRefresh((prev) => !prev);
    }
  };
  const handleEditClick = (row) => {
    setEditingRow(row);
    setFormData({
      name: row?.name,
      email: row?.email,
      password: row?.password,
      role: row?.role?.id || "",
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

      if (response.ok) {
        toast.success("Item deleted successfully");
        setRefresh((prev) => !prev);
      } else {
        toast.error("System is unable to delete record");
      }
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
        const response = await fetch(`${apiURL}/users/${editingRow.id}`, {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        });

        if (response.ok) {
          toast.success("User edited successfully");
          setRefresh((prev) => !prev);
          setOpenAddModal(false);

          const localStorageUser = JSON.parse(localStorage.getItem("user"));
          if (localStorageUser && localStorageUser.id === editingRow.id) {
            const updatedUser = { ...localStorageUser, ...formData };

            localStorage.setItem("user", JSON.stringify(updatedUser));
          }
          return;
        } else {
          const errorMessage = await response
            .json()
            .then(
              (data) =>
                data.message || "Failed to update user. Please try again."
            );
          toast.error(errorMessage);
          return;
        }
      } else {
        const response = await fetch(`${apiURL}/users`, {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        });

        if (response.ok) {
          setRefresh((prev) => !prev);
          setOpenAddModal(false);
          toast.success("User added successfully");
        } else {
          const errorMessage = await response
            .json()
            .then(
              (data) => data.message || "Failed to add user. Please try again."
            );
          toast.error(errorMessage);
          return;
        }
      }
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
  const userOptions = userList?.map((user) => ({
    value: user.id,
    label: user.name,
  }));
  return (
    <>
      <Container fluid className="styled-table pt-3 mt-4 pb-3">
        <ToastContainer />

        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Users</h4>
          <Select
            options={userOptions}
            value={userOptions.find(
              (option) => option.value === searchFilter.user_name
            )}
            onChange={handleFilterChange}
            isClearable
            placeholder="Search User"
            styles={{
              control: (base) => ({
                ...base,
                width: "250px",
              }),
            }}
          />
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

        <Modal show={openAddModal} onHide={handleCloseAddModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>{editingRow ? "Edit User" : "Add User"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="name" className="mb-3">
                <Form.Label>
                  Name<sup>*</sup>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter Name"
                />
              </Form.Group>

              <Form.Group controlId="email" className="mb-3">
                <Form.Label>
                  Email<sup>*</sup>
                </Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter Email"
                />
              </Form.Group>

              <Form.Group controlId="role" className="mb-3">
                <Form.Label>
                  Role<sup>*</sup>
                </Form.Label>
                <Form.Control
                  as="select"
                  name="role"
                  value={formData?.role}
                  onChange={handleChange}
                >
                  <option value="">Select Role</option>
                  {roleList?.map((role) => {
                    if (role?.id === "674ec68ffa5589405df5dc84") {
                      return null;
                    }
                    return (
                      <option key={role.id} value={role.id}>
                        {role.role}
                      </option>
                    );
                  })}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="password" className="mb-3">
                {!editingRow ? (
                  <Form.Label>
                    Password<sup>*</sup>
                  </Form.Label>
                ) : (
                  <Form.Label>Password</Form.Label>
                )}

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
                {rows.map((row) => {
                  if (row?.role?.id === "674ec68ffa5589405df5dc84") {
                    return null;
                  }
                  return (
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
                  );
                })}
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
    </>
  );
}
