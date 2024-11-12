import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Form,
  Table,
  InputGroup,
  FormControl,
  Row,
  Col,
  Container,
  Spinner,
  Pagination,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import { apiURL } from "../API/api";
import { FaEdit, FaTrash, FaPlus, FaFileWord } from "react-icons/fa";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext";
import Select from "react-select";

export default function TemplateGroup() {
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
    meetingType: "",
    groupName: "",
    createdBy: "",
    groupItems: [],
  });
  const { rolePermissions } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("refreshToken");
  const resetFormData = () => {
    setFormData({
      meetingType: "",
      groupName: "",
      groupItems: [],
      createdBy: user.id,
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
      .map((item) => {
        const template = templateNames.find(
          (template) => template.templateName === item.templateName
        );
        return template ? template.id : null;
      })
      .filter((id) => id !== null);
    setFormData({
      meetingType: row?.meetingType,
      groupName: row?.groupName,
      groupItems: selectedIds,
    });
  };

  const options = templateNames.map((item) => ({
    value: item.id,
    label: item.templateName,
  }));
  const handleSelectChange = (selectedOptions) => {
    // Extract only the selected values (IDs)
    const selectedValues = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];
    setFormData({ ...formData, groupItems: selectedValues });
  };

  useEffect(() => {
    const fetchData = async (pageNo) => {
      try {
        const response = await fetch(
          `${apiURL}/template-group?page=${pageNo}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setTotalPages(data.totalPages);

        const responseMeetingAgendaTemplate = await fetch(
          `${apiURL}/meeting-agenda-template`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const dataMeetingAgendaTemplate =
          await responseMeetingAgendaTemplate.json();
        const usableAgendas = dataMeetingAgendaTemplate.results.filter(
          (item) => item.status === "usable"
        );

        setTemplateNames(usableAgendas);
        console.log(dataMeetingAgendaTemplate, "ds");
        const updatedRows = data.results.map((item) => ({
          ...item,
          numberOfTemplate: item.groupItems.length,
        }));

        setRows(updatedRows);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData(page);
  }, [page, refresh]);

  const handleDeleteClick = async (row) => {
    try {
      const response = await fetch(`${apiURL}/template-group/${row?.id}`, {
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
      toast.success("Template deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { id, name, value } = e.target;
    setFormData({ ...formData, [id || name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonLoading(true);
    if (
      !formData.groupName ||
      !formData.meetingType ||
      formData.groupItems.length === 0
    ) {
      toast.error("Please fill out all required fields before submitting.");
      return;
    }
    try {
      if (editingRow) {
        const response = await fetch(
          `${apiURL}/template-group/${editingRow?.id}`,
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
        const response = await fetch(`${apiURL}/template-group`, {
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
                "Failed to add template-group. Please try again."
            );
          toast.error(errorMessage);
          return;
        }
        setRefresh(!refresh);
        toast.success("template added successfully");
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error adding/editing item:", error);
      toast.error("Failed to add/edit item. Please try again.");
    } finally {
      setButtonLoading(false);
    }
  };
  const handleViewTemplateName = (row, e) => {
    e.stopPropagation();
    navigate(`/template-group-meetings/${row?.id}`, { state: row });
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
          <h4 className="h4-heading-style">Template Group</h4>
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
            <Modal.Title>{editingRow ? "Edit Group" : "Add Group"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="groupName">
                <Form.Label>Group Name</Form.Label>
                <FormControl
                  value={formData.groupName}
                  onChange={handleChange}
                  placeholder="Enter Group Name"
                />
              </Form.Group>

              <Form.Group controlId="meetingType" className="mt-2">
                <Form.Label>Meeting Type</Form.Label>
                <Form.Control
                  as="select"
                  value={formData.meetingType}
                  onChange={handleChange}
                >
                  <option value="">Select Meeting Type</option>
                  <option value="board_meeting">Board Meeting</option>
                  <option value="committee_meeting">Committee Meeting</option>
                  <option value="annual_general_meeting">
                    Annual General Meeting
                  </option>
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="groupItems" className="mt-2">
                <Form.Label>Group Items</Form.Label>
                <Select
                  options={options}
                  isMulti
                  value={options.filter((option) =>
                    formData.groupItems.includes(option.value)
                  )}
                  onChange={handleSelectChange}
                  placeholder="Select templates"
                  className="basic-multi-select"
                  classNamePrefix="select"
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
                  <th>Group Name</th>
                  <th>Meeting Type</th>
                  <th>View Templates</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row?.id}>
                    <td>{row?.groupName || "No Group Name"}</td>
                    <td>{row?.meetingType}</td>
                    <td>
                      <button
                        className="director-btn"
                        onClick={(e) => handleViewTemplateName(row, e)}
                      >
                        <FaFileWord
                          style={{ height: "40px", alignContent: "center" }}
                        />
                      </button>
                    </td>
                    <td>{row?.createdBy?.name || "Unknown"}</td>
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
