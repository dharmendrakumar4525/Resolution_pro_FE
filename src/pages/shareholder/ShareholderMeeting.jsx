import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiURL } from "../../API/api";
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
import { useAuth } from "../../context/AuthContext";
import Select from "react-select";

export default function ShareholderMeeting() {
  const [rows, setRows] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openAddModal, setOpenAddModal] = useState(false);
  const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => setOpenAddModal(false);
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [directorList, setDirectorList] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const token = localStorage.getItem("refreshToken");

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const { rolePermissions } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    client_name: "",
  });
  useEffect(() => {
    const fetchData = async (pageNo) => {
      try {
        const response = await fetch(
          `${apiURL}/shareholder-meeting?page=${pageNo}&limit=10`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setRows(data.results);
        console.log(data.results, "mukul");
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

    fetchClientList();
  }, []);
  const handleDeleteClick = async (row) => {
    try {
      const response = await fetch(`${apiURL}/shareholder-meeting/${row?.id}`, {
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
      toast.success("Meeting deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item. Please try again.");
    }
  };

  const handleRedirectEdit = (row) => {
    navigate(`/edit-shareholder-meet/${row?.id}`, { state: { row } });
  };
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const handleChange = async (selectedOption) => {
    setFormData((prevData) => ({
      ...prevData,
      client_name: selectedOption ? selectedOption.value : "",
    }));

    if (selectedOption && selectedOption.value !== "") {
      const token = localStorage.getItem("refreshToken");
      const response = await fetch(
        `${apiURL}/shareholder-meeting?page=${page}&limit=10&client_name=${selectedOption.value}`,
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
  const handleRedirectAddModal = () => {
    navigate("/add-shareholder-meet");
  };

  const handleRowClick = (row) => {
    navigate(`/shareholder-documents/${row?.id}`);
  };
  const userPermissions =
    rolePermissions.find((perm) => perm.moduleName === "Shareholder_Meeting")
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
          <h4 className="h4-heading-style">Shareholder Meeting</h4>
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
                  <th>Client Name</th>
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
                      <td>{row?.client_name?.company_name}</td>
                      <td>{row?.shareholder_meeting_type}</td>
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
