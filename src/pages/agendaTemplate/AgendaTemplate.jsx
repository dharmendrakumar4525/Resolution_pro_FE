import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

export default function AgendaTemplate() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [agendaList, setAgendaList] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [refresh, setRefresh] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [formData, setFormData] = useState({
    meetingType: "",
    templateName: "",
    fileName: "",
    resolutionUrl: "",
    title: "",
    status: "",
    by: user.id,
  });
  const [filterSearch, setFilterSearch] = useState({
    agenda_name: "",
    meetingType: "",
  });
  const { rolePermissions } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("refreshToken");
  const location = useLocation();

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        let url = `${apiURL}/agenda`;

        if (filterSearch.meetingType) {
          url += `?meetingType=${filterSearch.meetingType}`;
        }
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        console.log(data, "daata");
        const pageSize = 10;
        const filteredData = data.results.filter((row) => {
          if (user.role === "672c47cb38903b464c9d2923") {
            return (
              row?.status === "usable" ||
              (row?.status === "draft" && row?.createdBy?.id === user.id)
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
  }, [
    page,
    user.role,
    user.id,
    refresh,
    filterStatus,
    filterSearch.meetingType,
  ]);
  useEffect(() => {
    const fetchAgendaFilterData = async () => {
      setLoading(true);
      try {
        const url = `${apiURL}/agenda`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setAgendaList(data.results);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgendaFilterData();
  }, []);

  useEffect(() => {
    if (location?.state?.page) {
      setPage(location?.state.page);
    }
  }, [location?.state]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "filterStatus") {
      setFilterStatus(value);
    }
    setPage(1);
  };
  const handleViewTemplate = (row, e) => {
    e.stopPropagation();
    navigate(`/agenda-generate/${row?.id}`, {
      state: {
        fileName: row?.fileName,
        resolutionUrl: row?.resolutionUrl,
        statementUrl: row?.statementUrl,
        momUrl: row?.momUrl,
        meetingType: row?.meetingType,
        agendaPage: page,
      },
    });
  };
  const handleViewResolutionTemplate = (row, e) => {
    e.stopPropagation();
    navigate(`/resolution-generate/${row?.id}`, { state: row?.resolutionUrl });
  };
  const handleViewStatementTemplate = (row, e) => {
    e.stopPropagation();
    navigate(`/statement-generate/${row?.id}`, { state: row?.statementUrl });
  };

  const handleOpenAddModal = () => {
    setEditingRow(null);
    setFormData({
      meetingType: "",
      templateName: "",
      fileName: "",
      by: user.id,
      resolutionUrl: "",
      title: "",
    });
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => setOpenAddModal(false);

  const handleDeleteClick = async (row) => {
    try {
      const response = await fetch(`${apiURL}/agenda/${row?.id}`, {
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
        setRefresh((prev) => !prev); // Refresh data to reflect changes
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
    setEditingRow(row);
    setOpenAddModal(true);
    setFormData({
      meetingType: row?.meetingType,
      templateName: row?.templateName,
      fileName: row?.fileName,
      status: row?.status,
      resolutionUrl: row?.resolutionUrl,
      title: row?.title,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.meetingType || !formData.templateName) {
      toast.error("Please fill out all fields before submitting.");
      return;
    }

    setButtonLoading(true);
    try {
      let response;
      const requestData = new FormData();

      requestData.append("meetingType", formData.meetingType);
      requestData.append("templateName", formData.templateName);
      requestData.append("title", formData.title);

      if (editingRow) {
        requestData.append("status", formData.status);
        response = await fetch(`${apiURL}/agenda/${editingRow?.id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: requestData,
        });
      } else {
        requestData.append("createdBy", formData.by);
        if (formData.fileName == "") {
          response = await fetch(`${apiURL}/agenda`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: requestData,
          });
        } else {
          requestData.append("file", formData.fileName);
          response = await fetch(`${apiURL}/agenda`, {
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
      setRefresh((prev) => !prev);
      toast.success(
        `Agenda template ${editingRow ? "edited" : "added"} successfully`
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
  const userPermissions =
    rolePermissions.find((perm) => perm.moduleName === "Agenda_Template")
      ?.childList || [];

  const hasPermission = (action) =>
    userPermissions.some((perm) => perm.value === action && perm.isSelected);
  console.log(rows, "rows");

  const agendaOptions = agendaList?.map((agenda) => ({
    value: agenda.id,
    label: agenda.templateName,
  }));
  const meetingTypes = [
    { value: "board_meeting", label: "Board Meeting" },
    { value: "committee_meeting", label: "Committee Meeting" },
    { value: "shareholder_meeting", label: "Shareholder Meeting" },
  ];
  const handleFilterNameChange = async ({ target }) => {
    if (!target) return;
    const { id, value } = target || {};

    setFilterSearch((prevData) => ({ ...prevData, [id]: value }));

    if (id === "agenda_name" && value) {
      const token = localStorage.getItem("refreshToken");

      try {
        const response = await fetch(`${apiURL}/agenda/${value}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        // console.log(data);
        setRows([data]);
      } catch (error) {
        console.error("Error fetching agenda:", error);
      }
    } else {
      setRefresh((prev) => !prev);
    }
  };
  return (
    <>
      <Container fluid className="styled-table pt-3 mt-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Agenda Template</h4>
          <Select
            options={agendaOptions}
            isClearable
            value={agendaOptions.find(
              (option) => option.value === filterSearch.agenda_name
            )}
            onChange={(selectedOption) =>
              handleFilterNameChange({
                target: {
                  id: "agenda_name",
                  value: selectedOption ? selectedOption.value : "",
                },
              })
            }
            placeholder="Search Agenda"
            styles={{
              container: (base) => ({
                ...base,
                width: "300px",
              }),
            }}
          />
          <Select
            options={meetingTypes}
            isClearable
            value={meetingTypes.find(
              (option) => option.value === filterSearch.meetingType
            )}
            onChange={(selectedOption) =>
              handleFilterNameChange({
                target: {
                  id: "meetingType",
                  value: selectedOption ? selectedOption.value : "",
                },
              })
            }
            placeholder="Select Meeting Type"
            styles={{
              container: (base) => ({
                ...base,
                width: "300px",
              }),
            }}
          />
          {user.role === "672c47c238903b464c9d2920" && (
            <Form className="d-flex">
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

        <Modal show={openAddModal} onHide={handleCloseAddModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingRow ? "Edit" : "Add"} Agenda Template
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="templateName">
                    <Form.Label className="f-label">
                      Template Name<sup>*</sup>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.templateName}
                      onChange={handleChange}
                      placeholder="Enter Template Name"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
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

                <Col md={6}>
                  <Form.Group controlId="meetingType">
                    <Form.Label className="f-label">
                      Meeting Type<sup>*</sup>
                    </Form.Label>
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
                      <option value="shareholder_meeting">
                        Shareholder Meeting
                      </option>
                    </Form.Control>
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
          <>
            <Table bordered hover responsive className="Master-table mt-5">
              <thead className="Master-Thead">
                <tr>
                  <th
                    style={{
                      width: "20%",
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                      whiteSpace: "normal",
                    }}
                  >
                    Name
                  </th>
                  <th
                    style={{
                      width: "30%",
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                      whiteSpace: "normal",
                    }}
                  >
                    Title
                  </th>

                  <th>Meeting Type</th>
                  <th>Template</th>
                  {/* <th>Resolution Template</th>
                  <th>Statement Template</th> */}
                  <th>Status</th>
                  <th>By</th>
                  {/* <th>Creation date</th> */}

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
                    <td
                      style={{
                        width: "20%",
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        whiteSpace: "normal",
                      }}
                    >
                      {row?.templateName}
                    </td>
                    <td
                      style={{
                        width: "30%",
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        whiteSpace: "normal",
                      }}
                    >
                      {row?.title}
                    </td>
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
                    {/* <td>
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
                      <button
                        disabled={row.meetingType !== "shareholder_meeting"}
                        className="director-btn"
                        onClick={(e) => handleViewStatementTemplate(row, e)}
                      >
                        <FaFileWord
                          style={{ height: "40px", alignContent: "center" }}
                        />
                      </button>
                    </td> */}
                    <td>{row?.status}</td>
                    <td>{row?.createdBy?.name}</td>
                    {/* <td>{new Date(row?.createdAt).toLocaleDateString()}</td> */}
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
