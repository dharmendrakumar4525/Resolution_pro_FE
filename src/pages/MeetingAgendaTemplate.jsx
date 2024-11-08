import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiURL } from "../API/api";
import {
  Button,
  Form,
  Row,
  Col,
  Modal,
  Table,
  Container,
  Spinner,
  Pagination,
} from "react-bootstrap";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaEye,
  FaPencilAlt,
  FaFileWord,
} from "react-icons/fa";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext";

export default function MeetingAgendaTemplate() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(true);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [formData, setFormData] = useState({
    meetingType: "",
    templateName: "",
    fileName: "",
    by: user.id,
  });
  const { rolePermissions } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiURL}/meeting-agenda-template`);
        const data = await response.json();
        const pageSize = 10;
        const filteredData = data.results.filter((row) => {
          if (user.role === "672c47c238903b464c9d2920") {
            return true;
          } else if (user.role === "672c47cb38903b464c9d2923") {
            return (
              row?.status === "usable" ||
              (row?.status === "draft" && row?.by === user.id)
            );
          } else {
            return row?.status === "usable";
          }
        });

        setRows(filteredData.slice((page - 1) * pageSize, page * pageSize));
        setTotalPages(Math.ceil(filteredData.length / pageSize));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [page, user.role, user.id, refresh]);

  // useEffect(() => {
  //   const fetchData = async (pageNo) => {
  //     try {
  //       const response = await fetch(
  //         `${apiURL}/meeting-agenda-template?page=${pageNo}`
  //       );
  //       const data = await response.json();
  //       setRows(data.results);
  //       console.log(data.results);
  //       setTotalPages(data.totalPages);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchData(page);
  // }, [page]);
  const handleViewTemplate = (row, e) => {
    e.stopPropagation();
    navigate(`/template-generate/${row?.id}`);
  };

  const handleOpenAddModal = () => {
    setEditingRow(null);
    setFormData({
      meetingType: "",
      templateName: "",
      fileName: "",
      by: user.id,
    });
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => setOpenAddModal(false);

  const handleDeleteClick = async (row) => {
    try {
      const response = await fetch(
        `${apiURL}/meeting-agenda-template/${row?.id}`,
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

      setRows((prevRows) => prevRows.filter((item) => item.id !== row?.id));
      if (rows.length === 1 && page > 1) {
        setPage(page - 1);
      }

      if (rows.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        setRefresh(!refresh); // Refresh data to reflect changes
      }
      toast.success("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.success("Failed to delete item. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleEditClick = (row) => {
    console.log(row, "muk");
    setEditingRow(row);
    setOpenAddModal(true);
    setFormData({
      meetingType: row?.meetingType,
      templateName: row?.templateName,
      fileName: row?.fileName,
      status: row?.status,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.meetingType || !formData.templateName || !formData.fileName) {
      toast.error("Please fill out all fields before submitting.");
      return;
    }
    try {
      let response;
      if (editingRow) {
        response = await fetch(
          `${apiURL}/meeting-agenda-template/${editingRow?.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );
        setRefresh(!refresh);
        toast.success("Meeting Agenda template edited successfully");
      } else {
        response = await fetch(`${apiURL}/meeting-agenda-template`, {
          method: "POST",
          headers: {
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
                "Failed to add agenda template. Please try again."
            );
          toast.error(errorMessage);
          return;
        }
        setRefresh(!refresh);

        handleCloseAddModal();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const userPermissions =
    rolePermissions.find(
      (perm) => perm.moduleName === "Meeting_agenda_template"
    )?.childList || [];

  const hasPermission = (action) =>
    userPermissions.some((perm) => perm.value === action && perm.isSelected);

  return (
    <>
      <Container fluid className="styled-table pt-3 mt-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Meeting Agenda Template</h4>
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

        <Modal show={openAddModal} onHide={handleCloseAddModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingRow ? "Edit" : "Add"} Meeting Agenda
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="meetingType">
                    <Form.Label className="f-label">Meeting Type</Form.Label>
                    <Form.Control
                      as="select"
                      value={formData.meetingType}
                      onChange={handleChange}
                    >
                      <option value="">Select Meeting Type</option>
                      <option value="board_meeting">Board Meeting</option>
                      <option value="committee_meeting">
                        Committee Meeting
                      </option>
                      <option value="annual_general_meeting">
                        Annual General Meeting
                      </option>
                    </Form.Control>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="fileName">
                    <Form.Label className="f-label">File Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.fileName}
                      onChange={handleChange}
                      placeholder="Enter File Name"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="templateName">
                    <Form.Label className="f-label">Template Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.templateName}
                      onChange={handleChange}
                      placeholder="Enter Template Name"
                    />
                  </Form.Group>
                </Col>
                {editingRow && user?.role === "672c47c238903b464c9d2920" && (
                  <Col md={6}>
                    <Form.Group controlId="status">
                      <Form.Label className="f-label">Status</Form.Label>
                      <Form.Control
                        as="select"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="">Select Status</option>
                        <option value="draft">Draft</option>
                        <option value="usable">Usable</option>
                        <option value="rejected">Rejected</option>
                      </Form.Control>
                    </Form.Group>
                  </Col>
                )}
              </Row>

              <Button
                variant="primary"
                onClick={handleCloseAddModal}
                className="me-2"
              >
                Cancel
              </Button>
              <Button type="submit" variant="secondary" className="ml-2">
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
          <>
            <Table bordered hover responsive className="Master-table mt-5">
              <thead className="Master-Thead">
                <tr>
                  <th>Template Name</th>
                  <th>Meeting Type</th>
                  <th>File</th>
                  <th>Status</th>
                  <th>By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row?.id}>
                    {/* <td>
        {row?.status === "draft" ? (
          <button className="director-btn d-flex align-items-center gap-2" >
                 <FaPencilAlt /> Draft
          </button>
        ) : (
          row?.status
        )}
      </td> */}
                    <td>{row?.templateName}</td>
                    <td>{row?.meetingType}</td>
                    <td>
                      <button
                        className="director-btn"
                        onClick={(e) => handleViewTemplate(row, e)}
                      >
                        <FaFileWord
                          style={{ height: "40px", alignContent: "center" }}
                        />
                      </button>
                    </td>
                    <td>{row?.status}</td>
                    {/* <td><a href={row?.fileName}>{row?.fileName}</a></td> */}
                    <td>{row?.by?.name}</td>
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
          </>
        )}
      </Container>
      <ToastContainer />
    </>
  );
}
