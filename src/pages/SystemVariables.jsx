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

import { apiURL } from "../API/api";
import { FaEdit, FaTrash, FaPlus, FaFileWord } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext";

export default function SystemVariables() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [templateNames, setTemplateNames] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [formData, setFormData] = useState({
    name: "",
    mca_name: "",
    formula: "",
  });
  const { rolePermissions } = useAuth();
  const token = localStorage.getItem("refreshToken");
  const resetFormData = () => {
    setFormData({
      name: "",
      mca_name: "",
      formula: "",
    });
  };

  const handleOpenAddModal = () => {
    resetFormData();
    setEditingRow(null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    resetFormData();
  };

  const handleEditClick = (row) => {
    setEditingRow(row);
    setOpenModal(true);
    const selectedIds = row?.groupItems
      ?.map((item) => {
        const template = templateNames.find(
          (template) => template.templateName === item.templateName
        );
        return template ? template.id : null;
      })
      .filter((id) => id !== null);
    setFormData({
      name: row?.name,
      mca_name: row?.mca_name,
      formula: row?.formula,
    });
  };

  useEffect(() => {
    const fetchData = async (pageNo) => {
      try {
        const response = await fetch(
          `${apiURL}/system-variable?page=${pageNo}&limit=10`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setTotalPages(data.totalPages);

        setRows(data.results);
        console.log(data, "mkkl");
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData(page);
  }, [page, refresh, token]);

  const handleDeleteClick = async (row) => {
    try {
      const response = await fetch(`${apiURL}/system-variable/${row?.id}`, {
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
      toast.success("Variable deleted successfully");
    } catch (error) {
      console.error("Error deleting Variable:", error);
      toast.error("Failed to delete Variable. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { id, name, value } = e.target;
    setFormData({ ...formData, [id || name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData, "sasa");
    setButtonLoading(true);
    if (!formData.name || !formData.mca_name) {
      toast.error("Please fill out name || mca_name field before submitting.");
      return;
    }
    try {
      if (editingRow) {
        const response = await fetch(
          `${apiURL}/system-variable/${editingRow?.id}`,
          {
            method: "PATCH",

            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },

            body: JSON.stringify(formData),
          }
        );
        setRefresh(!refresh);

        toast.success("template edited successfully");
      } else {
        const response = await fetch(`${apiURL}/system-variable`, {
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
              (data) =>
                data.message ||
                "Failed to add system variable. Please try again."
            );
          toast.error(errorMessage);
          return;
        }
        setRefresh(!refresh);
        toast.success("System variable added successfully");
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error adding/editing item:", error);
      toast.error("Failed to add/edit item. Please try again.");
    } finally {
      setButtonLoading(false);
    }
  };
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const userPermissions =
    rolePermissions.find((perm) => perm.moduleName === "Template_group")
      ?.childList || [];

  const hasPermission = (action) =>
    userPermissions.some((perm) => perm.value === action && perm.isSelected);

  return (
    <>
      <Container fluid className="styled-table pt-3 mt-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">System Variables</h4>
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

        <Modal show={openModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingRow ? "Edit Variable" : "Add Variable"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="name">
                <Form.Label>Variable Name</Form.Label>
                <FormControl
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter Variable Name"
                />
              </Form.Group>

              <Form.Group controlId="mca_name" className="mt-2">
                <Form.Label>MCA Name</Form.Label>
                <Form.Control
                  name="mca_name"
                  value={formData.mca_name}
                  onChange={handleChange}
                  placeholder="Enter MCA Name"
                />
              </Form.Group>

              <Form.Group controlId="formula" className="mt-2">
                <Form.Label>Formula</Form.Label>
                <Form.Control
                  name="formula"
                  value={formData.formula}
                  onChange={handleChange}
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
                  <th>Variable Name</th>
                  <th>Mca Name</th>
                  <th>Formula</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows?.map((row) => (
                  <tr key={row?.id}>
                    <td>{row?.name}</td>
                    <td>{row?.mca_name}</td>
                    <td>{row?.formula || "---"}</td>
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
