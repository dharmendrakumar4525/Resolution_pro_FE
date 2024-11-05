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
import { apiURL } from "../API/api";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext";

export default function TemplateGroup() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [templateNames, setTemplateNames] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [formData, setFormData] = useState({
    meetingType: "",
    groupName: "",
    createdBy: "",
    groupItems: [],
  });
  const { rolePermissions } = useAuth();

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
    // const fileNames = row.groupItems?.map(item => item.templateName) || [];
    const selectedIds = row.groupItems
      .map((item) => {
        const template = templateNames.find(
          (template) => template.templateName === item.templateName
        );
        return template ? template.id : null; // Return the id or null if not found
      })
      .filter((id) => id !== null);
    setFormData({
      meetingType: row.meetingType,
      groupName: row.groupName,
      groupItems: selectedIds,
    });
  };

  useEffect(() => {
    const fetchData = async (pageNo) => {
      try {
        const response = await fetch(`${apiURL}/template-group?page=${pageNo}`);
        const data = await response.json();

        const responseMeetingAgendaTemplate = await fetch(
          `${apiURL}/meeting-agenda-template`
        );
        const dataMeetingAgendaTemplate =
          await responseMeetingAgendaTemplate.json();

        setTemplateNames(dataMeetingAgendaTemplate.results);

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
  }, [page]);

  const handleDeleteClick = async (row) => {
    try {
      const response = await fetch(`${apiURL}/template-group/${row.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      setRows((prevRows) => prevRows.filter((item) => item.id !== row.id));
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
    try {
      if (editingRow) {
        const response = await fetch(
          `${apiURL}/template-group/${editingRow.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === editingRow.id ? { ...row, ...formData } : row
          )
        );
        toast.success("template edited successfully");
      } else {
        const response = await fetch(`${apiURL}/template-group`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          toast.error("Failed to add template");
        }

        toast.success("template added successfully");
        const data = await response.json();
        setRows((prevRows) => [...prevRows, data]);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error adding/editing item:", error);
      toast.error("Failed to add/edit item. Please try again.");
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
          <h4 className="h4-heading-style">Template Group</h4>
          <Button
            variant="primary"
            className="btn-box"
            onClick={handleOpenAddModal}
          >
            <FaPlus style={{ marginRight: "8px" }} /> Add
          </Button>
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
                <Form.Control
                  as="select"
                  multiple
                  value={formData.groupItems}
                  onChange={(e) => {
                    const selectedOptions = Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    );

                    // Check if any of the options are already selected, toggle them
                    const updatedGroupItems = formData.groupItems.includes(
                      selectedOptions[0]
                    )
                      ? formData.groupItems.filter(
                          (item) => item !== selectedOptions[0]
                        )
                      : [...formData.groupItems, selectedOptions[0]];

                    setFormData({ ...formData, groupItems: updatedGroupItems });
                  }}
                >
                  {templateNames.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.templateName}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Button variant="primary" type="submit" className="mt-3 me-2">
                Save
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
                  <th>No. Of Template</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row?.groupName || "No Group Name"}</td>
                    <td>{row?.meetingType}</td>
                    <td>{row?.numberOfTemplate}</td>
                    <td>{row?.createdBy?.name || "Unknown"}</td>
                    <td>
                      {hasPermission("edit") && (
                        <Button
                          variant="outline-secondary"
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
