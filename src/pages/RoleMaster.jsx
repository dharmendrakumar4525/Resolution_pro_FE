import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Form,
  Table,
  FormControl,
  Container,
  Spinner,
  Pagination,
} from "react-bootstrap";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

import { apiURL } from "../API/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext";

export default function RoleMaster() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [formData, setFormData] = useState({
    roleName: "",
  });
  const { rolePermissions } = useAuth();
  const token = localStorage.getItem("refreshToken");

  useEffect(() => {
    const fetchData = async (pageNo) => {
      try {
        const response = await fetch(`${apiURL}/role?page=${pageNo}&limit=10`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setRows(data.results);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData(page);
  }, [page]);

  const handleOpenModal = () => {
    setOpenModal(true);
    setFormData({ roleName: "" });
    setEditingRow(null);
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleEditClick = (row) => {
    const nonEditableIds = [
      "672c47cb38903b464c9d2923",
      "672c47c238903b464c9d2920",
      "6728ae3b6177fee637232a73",
    ];

    if (nonEditableIds.includes(row?.id)) {
      toast.warn("This role cannot be edited.");
      return;
    }

    setEditingRow(row);
    setOpenModal(true);
    setFormData({ roleName: row.role });
  };

  const handleDeleteClick = async (row) => {
    const nonEditableIds = [
      "672c47cb38903b464c9d2923",
      "672c47c238903b464c9d2920",
      "6728ae3b6177fee637232a73",
    ];

    if (nonEditableIds.includes(row?.id)) {
      toast.warn("This role cannot be deleted.");
      return;
    }
    try {
      const response = await fetch(`${apiURL}/role/${row.id}`, {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      setRows((prevRows) => prevRows.filter((item) => item.id !== row.id));
      if (rows.length === 1 && page > 1) {
        setPage(page - 1);
      }
      toast.success("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonLoading(true);
    try {
      if (editingRow) {
        await fetch(`${apiURL}/role/${editingRow.id}`, {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({ role: formData.roleName }),
        });
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === editingRow.id ? { ...row, role: formData.roleName } : row
          )
        );
        toast.success("Role Master edited successfully");
      } else {
        const response = await fetch(`${apiURL}/role`, {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({ role: formData.roleName }),
        });
        const data = await response.json();
        setRows((prevRows) => [...prevRows, data]);
        toast.success("Role added successfully");
      }
      handleCloseModal();
    } catch (error) {
      toast.error("Failed to add/edit item. Please try again.");
    } finally {
      setButtonLoading(false);
    }
  };
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const columns = [
    { header: "Role Master Name", field: "name" },
    { header: "Actions", field: "action" },
  ];

  const userPermissions =
    rolePermissions.find((perm) => perm.moduleName === "Roles")?.childList ||
    [];

  const hasPermission = (action) =>
    userPermissions.some((perm) => perm.value === action && perm.isSelected);

  return (
    <>
      <Container fluid className="styled-table pt-3 mt-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Role Master</h4>
          {hasPermission("add") && (
            <Button
              variant="primary"
              className="btn-box"
              onClick={handleOpenModal}
            >
              <FaPlus style={{ marginRight: "8px" }} /> Add
            </Button>
          )}
        </div>

        <Modal show={openModal} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingRow ? "Edit Role Master" : "Add Role Master"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="roleName">
                <Form.Label>
                  Role Master Name<sup>*</sup>
                </Form.Label>
                <FormControl
                  value={formData.roleName}
                  onChange={handleChange}
                  placeholder="Enter Role Master Name"
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="mt-3 me-2">
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
        ) : !hasPermission("view") ? ( // Check if user has 'view' permission
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
                  {columns.map((col, idx) => (
                    <th key={idx}>{col.header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  if (row?.id === "674ec68ffa5589405df5dc84") {
                    return null; // Skip rendering this row
                  }

                  return (
                    <tr key={row?.id}>
                      <td>{row?.role}</td>
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
