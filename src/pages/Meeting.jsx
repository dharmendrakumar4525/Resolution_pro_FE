import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiURL } from "../API/api";
import {
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Container,
  Spinner,
  Pagination,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { FaEdit, FaTrash, FaPlus, FaEye, FaFileWord } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext";
import Select from "react-select";
export default function Meeting() {
  const [rows, setRows] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openAddModal, setOpenAddModal] = useState(false);
  const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => setOpenAddModal(false);
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientList, setClientList] = useState([]);
  const [agendaList, setAgendaList] = useState([]);
  const [directorList, setDirectorList] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const token = localStorage.getItem("refreshToken");

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [formData, setFormData] = useState({
    title: "",
    client_name: "",
    description: "",
    meetingType: "",
    date: "",
    startTime: "",
    endTime: "",
    organizer: "",
    participants: [],
    agendaItems: [
      {
        templateName: "",
        meetingType: "",
        fileName: "",
      },
    ],
    location: "",
    status: "scheduled",
  });
  const { rolePermissions } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async (pageNo) => {
      try {
        const response = await fetch(
          `${apiURL}/meeting?page=${pageNo}&limit=10`,
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
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData(page);
  }, [page, refresh]);
  useEffect(() => {
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
    const fetchAgendaList = async () => {
      try {
        const response = await fetch(`${apiURL}/meeting-agenda-template`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setAgendaList(data.results);
        console.log(data.results, "agendaName");
      } catch (error) {
        console.error("Error fetching Agenda:", error);
      }
    };
    fetchClientList();
    fetchAgendaList();
  }, []);

  const handleDeleteClick = async (row) => {
    try {
      const response = await fetch(`${apiURL}/meeting/${row?.id}`, {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
        return;
      }

      setRefresh((prev) => !prev);
      toast.success("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item. Please try again.");
    }
  };

  const handleRedirectEdit = (row) => {
    navigate(`/meeting/edit-form/${row?.id}`, { state: { row } });
  };
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleEditClick = (row) => {
    console.log(row, "rowwww");
    setEditingRow(row);
    setOpenAddModal(true);
    setFormData({
      title: row?.title,
      client_name: row?.client_name?.id || "",
      description: row?.description,
      meetingType: row?.meetingType,
      date: new Date(row?.date).toLocaleDateString(),
      startTime: row?.startTime,
      endTime: row?.endTime,
      organizer: row?.organizer,
      participants: row?.participants.id || [],
      agendaItems: row?.agendaItems?.map((agendaItem) => ({
        templateName: agendaItem.templateName,
        meetingType: agendaItem.meetingType,
        fileName: agendaItem.fileName,
      })),
      location: row?.location,
      status: row?.status,
    });
  };

  const handleRedirectAddModal = () => {
    navigate("/meeting/add-form");
  };
  const handleViewDocument = (row, e) => {
    e.stopPropagation();
    navigate(`/directors/${row?._id}`);
  };
  const handleRowClick = (row) => {
    navigate(`/documents/${row?.id}`);
  };

  const handleChange = async (selectedOption) => {
    setFormData((prevData) => ({
      ...prevData,
      client_name: selectedOption ? selectedOption.value : "", // Handle case when selectedOption is null
    }));

    if (selectedOption && selectedOption.value !== "") {
      const token = localStorage.getItem("refreshToken");
      const response = await fetch(
        `${apiURL}/meeting?page=${page}&limit=10&client_name=${selectedOption.value}`,
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

  const userPermissions =
    rolePermissions.find((perm) => perm.moduleName === "Board_Meeting")
      ?.childList || [];
  const hasPermission = (action) =>
    userPermissions.some((perm) => perm.value === action && perm.isSelected);
  const clientOptions = clientList?.map((client) => ({
    value: client._id,
    label: client.company_name,
  }));

  return (
    <>
      <Container fluid className="styled-table pt-3 mt-4 pb-3">
        <ToastContainer />

        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Board Meeting</h4>
          <Select
            options={clientOptions}
            value={clientOptions.find(
              (option) => option.value === formData.client_name
            )}
            onChange={handleChange}
            isClearable
            placeholder="Select Company"
            styles={{
              control: (base) => ({
                ...base,
                width: "300px",
              }),
            }}
          />
          {hasPermission("add") && (
            <Button
              variant="primary"
              className="btn-box"
              onClick={handleRedirectAddModal}
            >
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
        ) : rows?.length === 0 ? (
          <div className="text-center mt-5">
            <h5>No data available</h5>
          </div>
        ) : (
          <>
            <Table bordered hover responsive className="Master-table mt-5">
              <thead className="Master-Thead">
                <tr>
                  <th>Meeting Name</th>
                  <th
                    style={{
                      width: "20%",
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                      whiteSpace: "normal",
                    }}
                  >
                    Client Name
                  </th>
                  <th>Meeting Type</th>
                  <th>Start Time</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows?.map((row, index) => (
                  <OverlayTrigger
                    key={row?.id}
                    placement="top"
                    overlay={<Tooltip>Click to view</Tooltip>}
                  >
                    <tr key={row?.id} onClick={() => handleRowClick(row)}>
                      <td>{row?.title}</td>
                      <td
                        style={{
                          width: "20%",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        {row?.client_name?.company_name}
                      </td>
                      <td>{row?.meetingType}</td>
                      <td style={{ textAlign: "center" }}>{row?.startTime}</td>
                      <td>{new Date(row?.date).toLocaleDateString()}</td>

                      <td>
                        {hasPermission("edit") && (
                          <Button
                            disabled={row?.approval_status == "approved"}
                            variant="outline-secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRedirectEdit(row);
                            }}
                            className="me-2"
                          >
                            <FaEdit />
                          </Button>
                        )}
                        {hasPermission("delete") && (
                          <Button
                            disabled={row?.approval_status == "approved"}
                            variant="outline-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(row);
                            }}
                          >
                            <FaTrash />
                          </Button>
                        )}
                      </td>
                    </tr>
                  </OverlayTrigger>
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
    </>
  );
}
