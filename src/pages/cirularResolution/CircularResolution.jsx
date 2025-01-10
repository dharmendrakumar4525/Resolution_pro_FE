import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiURL } from "../../API/api";
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
import { useAuth } from "../../context/AuthContext";
import Select from "react-select";

export default function CircularResolution() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientList, setClientList] = useState([]);

  const [buttonLoading, setButtonLoading] = useState(false);
  const [refresh, setRefresh] = useState(true);
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [formData, setFormData] = useState({
    client_name: "",
    meeting_type: "",
    title: "",
    status: "draft",
    fileName: "",
    created_by: user.id,
    approval_by: null,
    approved_at: null,
    is_approved: false,
  });

  const { rolePermissions } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("refreshToken");

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiURL}/circular-resolution`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        console.log(data, "daata");
        const pageSize = 10;
        const filteredData = data.results.filter((row) => {
          if (user.role === "672c47c238903b464c9d2920") {
            return (
              (filterName === "" ||
                row?.templateName
                  ?.toLowerCase()
                  .includes(filterName.toLowerCase())) &&
              (filterStatus === "" || row?.status === filterStatus)
            );
          } else if (user.role === "672c47cb38903b464c9d2923") {
            return (
              row?.status === "usable" ||
              (row?.status === "draft" && row?.createdBy === user.id)
            );
          } else {
            return row?.status === "usable";
          }
        });

        setRows(filteredData.slice((page - 1) * pageSize, page * pageSize));
        console.log(filteredData, "data");
        setTotalPages(Math.ceil(filteredData.length / pageSize));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [page, user.role, user.id, refresh, filterName, filterStatus]);
  const fetchClientList = async () => {
    try {
      const response = await fetch(`${apiURL}/customer-maintenance`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setClientList(data.docs);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };
  useEffect(() => {
    fetchClientList();
  }, [token]);

  const clientOptions = clientList?.map((client) => ({
    value: client._id,
    label: client.company_name,
  }));

  const handleClientChange = (selectedOption) => {
    console.log(selectedOption, "selected");
    setFormData({ ...formData, client_name: selectedOption?.value || "" });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name == "filterName") {
      setFilterName(value);
    } else if (name === "filterStatus") {
      setFilterStatus(value);
    }
    setPage(1);
  };
  const handleViewResolutionTemplate = (row, e) => {
    e.stopPropagation();
    navigate(`/circular-resolution-generate/${row?.id}`, {
      state: row?.fileName,
    });
  };

  const handleOpenAddModal = () => {
    setEditingRow(null);
    setFormData({
      meeting_type: "",
      client_name: "",
      fileName: "",
      created_by: user.id,
      resolutionUrl: "",
      title: "",
    });
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => setOpenAddModal(false);

  const handleDeleteClick = async (row) => {
    try {
      const response = await fetch(`${apiURL}/circular-resolution/${row?.id}`, {
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
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        fileName: file,
      }));
    }
  };
  const handleEditClick = (row) => {
    console.log(row, "h1");
    setEditingRow(row);
    setOpenAddModal(true);
    setFormData({
      meeting_type: row?.meeting_type,
      fileName: row?.fileName,
      status: row?.status,
      title: row?.title,
      client_name: row?.client_name?.id,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setButtonLoading(true);
    try {
      let response;
      const requestData = new FormData();

      requestData.append("meeting_type", formData.meeting_type);
      requestData.append("title", formData.title);
      requestData.append("client_name", formData.client_name);

      if (editingRow) {
        requestData.append("status", formData.status);
        response = await fetch(
          `${apiURL}/circular-resolution/${editingRow?.id}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: requestData,
          }
        );
      } else {
        requestData.append("created_by", formData.created_by);
        if (formData.fileName == "") {
          response = await fetch(`${apiURL}/circular-resolution`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: requestData,
          });
        } else {
          requestData.append("fileName", formData.fileName);
          response = await fetch(`${apiURL}/circular-resolution`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: requestData,
          });
        }
      }

      if (!response.ok) {
        const errorMessage = await response
          .json()
          .then(
            (data) => data.message || "Operation failed. Please try again."
          );
        toast.error(errorMessage);
        handleCloseAddModal();

        return;
      }

      // Refresh and close modal on success
      setRefresh(!refresh);
      toast.success(
        `Circular Resolution template ${
          editingRow ? "edited" : "added"
        } successfully`
      );
      handleCloseAddModal();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setButtonLoading(false); // Hide button spinner
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  // const userPermissions =
  //   rolePermissions.find((perm) => perm.moduleName === "Agenda_Template")
  //     ?.childList || [];

  // const hasPermission = (action) =>
  //   userPermissions.some((perm) => perm.value === action && perm.isSelected);

  return (
    <>
      <Container fluid className="styled-table pt-3 mt-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Circular Resolution</h4>
          {user.role === "672c47c238903b464c9d2920" && ( // Render filter only for admin
            <Form className="d-flex">
              <Form.Control
                type="text"
                name="filterName"
                placeholder="Search Template"
                value={filterName}
                onChange={handleFilterChange}
                className="me-2"
              />
              <Form.Select
                name="filterStatus"
                value={filterStatus}
                onChange={handleFilterChange}
                className="me-2"
              >
                <option value="">All Statuses</option>
                <option value="usable">Usable</option>
                <option value="draft">Draft</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
            </Form>
          )}
          {/* {hasPermission("add") && ( */}
          <Button
            variant="primary"
            className="btn-box"
            onClick={handleOpenAddModal}
          >
            <FaPlus style={{ marginRight: "8px" }} /> Add
          </Button>
          {/* )} */}
        </div>

        <Modal show={openAddModal} onHide={handleCloseAddModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingRow ? "Edit" : "Add"} Circular Resolution
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Col>
                  <Form.Group controlId="title">
                    <Form.Label className="f-label">
                      Title<sup>*</sup>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter Title"
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId="client_name">
                    <Form.Label className="f-label">
                      Client Name<sup>*</sup>
                    </Form.Label>
                    <Select
                      id="client-name-select"
                      options={clientOptions}
                      placeholder="Select Client"
                      value={clientOptions.find(
                        (option) => option.value === formData?.client_name
                      )}
                      onChange={handleClientChange}
                      isClearable
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <Form.Group controlId="meetingType">
                    <Form.Label className="f-label">
                      Meeting Type<sup>*</sup>
                    </Form.Label>
                    <Form.Control
                      as="select"
                      value={formData.meeting_type}
                      onChange={handleChange}
                    >
                      <option value="">Select Meeting Type</option>
                      <option value="board_meeting">Board Meeting</option>
                      <option value="committee_meeting">
                        Committee Meeting
                      </option>
                      <option value="shareholder_meeting">
                        Shareholder Meeting
                      </option>
                    </Form.Control>
                  </Form.Group>
                </Col>

                {!editingRow ? (
                  <Col>
                    <Form.Group controlId="fileName">
                      <Form.Label className="f-label">
                        Upload Circular Resolution
                      </Form.Label>
                      <Form.Control
                        type="file"
                        onChange={(e) => handleFileChange(e)}
                        placeholder="Choose a file"
                      />
                    </Form.Group>
                  </Col>
                ) : (
                  <>
                    <Col>
                      <Form.Group controlId="fileName">
                        <Form.Label className="f-label">
                          Resolution File Url
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Choose a file"
                          value={formData.fileName}
                          readOnly
                        />
                      </Form.Group>
                    </Col>
                  </>
                )}
              </Row>
              {editingRow && user?.role === "672c47c238903b464c9d2920" && (
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="status">
                      <Form.Label className="f-label">
                        Status<sup>*</sup>
                      </Form.Label>
                      <Form.Control
                        as="select"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="">Select Status</option>
                        <option value="draft">Draft</option>
                        <option value="sent_for_approval">
                          Sent for Approval
                        </option>
                        <option value="rejected">Rejected</option>
                        <option value="approved">Approved</option>
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  {formData?.status === "approved" && (
                    <Col md={6}>
                      <Form.Group controlId="approved_at">
                        <Form.Label className="f-label">
                          Approved Date<sup>*</sup>
                        </Form.Label>
                        <Form.Control
                          type="date"
                          value={formData.approved_at || ""}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  )}
                </Row>
              )}

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
        ) : // : !hasPermission("view") ? (
        //   <div className="text-center mt-5">
        //     <h5>You do not have permission to view the data</h5>
        //   </div>
        // )
        rows.length === 0 ? (
          <div className="text-center mt-5">
            <h5>No data available</h5>
          </div>
        ) : (
          <>
            <Table bordered hover responsive className="Master-table mt-5">
              <thead className="Master-Thead">
                <tr>
                  <th>Title</th>
                  <th>Client Name</th>
                  <th>Meeting Type</th>
                  <th>Status</th>
                  <th>Resolution File</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows?.map((row, index) => (
                  <tr key={index}>
                    <td>{row?.title}</td>
                    <td>{row?.client_name?.company_name}</td>
                    <td>{row?.meeting_type?.replace(/_/g, " ")}</td>
                    <td>{row?.status}</td>
                    <td>
                      <button
                        className="director-btn"
                        onClick={(e) => handleViewResolutionTemplate(row, e)}
                      >
                        <FaFileWord
                          style={{ height: "40px", alignContent: "center" }}
                        />
                      </button>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        onClick={() => handleEditClick(row)}
                        className="me-2"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={() => handleDeleteClick(row)}
                      >
                        <FaTrash />
                      </Button>
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
