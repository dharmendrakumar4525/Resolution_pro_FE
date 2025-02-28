import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Modal,
  Table,
  Container,
  Col,
  Row,
  Spinner,
  Pagination,
  Tooltip,
} from "react-bootstrap";
import { apiURL } from "../../API/api";
import { FaEdit, FaTrash, FaPlus, FaUser } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { useAuth } from "../../context/AuthContext";
import { Refresh } from "@mui/icons-material";
import Select from "react-select";

export default function CustomerMaintenance() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [companyList, setCompanyList] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    state: "",
    country: "",
    cin: "",
    pan: "",
    gstin: "",
    o: false,
    c: false,
    v: false,
    ro: false,
    revision: "",
    alloted_manager: {
      // Reset `alloted_manager` to its proper structure
      role: "manager",
      isEmailVerified: false,
      name: "",
      email: "",
      id: "",
    },
    locations: [
      {
        locationId: "",
        locationName: "",
        addressLine1: "",
        addressLine2: "",
        postalCode: "",
        country: "",
        state: "",
        salesTaxType: "",
        gst: "",
        registeredOffice: false,
      },
    ],
  });
  const { rolePermissions } = useAuth();

  const userRole = JSON.parse(localStorage.getItem("user"))?.role;
  const userManagerName = JSON.parse(localStorage.getItem("user"))?.name;
  const userManagerId = JSON.parse(localStorage.getItem("user"))?.id;
  const navigate = useNavigate();
  const token = localStorage.getItem("refreshToken");
  useEffect(() => {
    const fetchData = async (pageNo) => {
      setLoading(true);
      try {
        const url =
          userRole === "672c47cb38903b464c9d2923"
            ? `${apiURL}/customer-maintenance?alloted_manager=${userManagerId}&page=${pageNo}&limit=10`
            : `${apiURL}/customer-maintenance?page=${pageNo}&limit=10`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setRows(data.docs);
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
    const fetchData = async () => {
      setLoading(true);
      try {
        const url = `${apiURL}/customer-maintenance`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setCompanyList(data.docs);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await fetch(
          `${apiURL}/users?role=672c47cb38903b464c9d2923`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setManagers(data.results);
      } catch (error) {
        console.error("Error fetching managers:", error);
      }
    };
    fetchManagers();
  }, []);

  const handleDeleteClick = async (row, e) => {
    e.stopPropagation();
    try {
      const response = await fetch(
        `${apiURL}/customer-maintenance/${row?._id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }
      setRefresh((prev) => !prev);

      toast.success("Item deleted successfully");
    } catch (error) {
      toast.error("Failed to delete item. Please try again.");
    }
  };

  const handleAdd = () => navigate("/client-records-form");

  const handleEdit = (customerId, e) => {
    e.stopPropagation();
    navigate(`/client-records-form/${customerId}`);
  };

  const handleViewDirectors = (row, e) => {
    e.stopPropagation();
    navigate(`/directors/${row?._id}`);
  };
  const handleViewShareholders = (row, e) => {
    e.stopPropagation();
    navigate(`/shareholders/${row?._id}`);
  };
  const handleViewAssociates = (row, e) => {
    e.stopPropagation();
    navigate(`/associates/${row?._id}`);
  };
  const handleViewSubsidiary = (row, e) => {
    e.stopPropagation();
    navigate(`/subsidiaries/${row?._id}`);
  };

  const handleRowClick = (row) => {
    navigate(`/client-records-detail/${row?._id}`, { state: { row } });
  };
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const handleChange = async (e) => {
    const { id, value } = e.target;
    console.log(e.target, "dsd");
    setFormData((prevData) => ({ ...prevData, [id]: value }));
    if (id === "alloted_manager" && !value == "") {
      setFormData((prevData) => ({ ...prevData, name: " " }));
      const token = localStorage.getItem("refreshToken");
      const response = await fetch(
        `${apiURL}/customer-maintenance?alloted_manager=${value}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setRows(data.docs);
    } else if (id == "name" && !value == "") {
      const token = localStorage.getItem("refreshToken");
      const response = await fetch(
        `${apiURL}/customer-maintenance?company_name=${value}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setRows(data.docs);
    } else {
      setRefresh((prev) => !prev);
    }
  };
  const userPermissions =
    rolePermissions.find((perm) => perm.moduleName === "Client_Record")
      ?.childList || [];
  const hasPermission = (action) =>
    userPermissions.some((perm) => perm.value === action && perm.isSelected);
  const companyOptions = companyList?.map((client) => ({
    value: client.company_name,
    label: client.company_name,
  }));
  const managerOptions = managers.map((manager) => ({
    value: manager.id,
    label: manager.name,
  }));
  return (
    <>
      <Container fluid className="styled-table pt-3 mt-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Client Records</h4>
          <Select
            options={companyOptions}
            isClearable
            value={companyOptions.find(
              (option) => option.value === formData.name
            )}
            onChange={(selectedOption) =>
              handleChange({
                target: { id: "name", value: selectedOption?.value },
              })
            }
            placeholder="Select Company Name"
            styles={{
              container: (base) => ({
                ...base,
                width: "300px",
                marginLeft: "60px",
              }),
            }}
          />

          <div>
            {userRole === "672c47c238903b464c9d2920" && (
              <Select
                isClearable
                options={managerOptions}
                value={managerOptions.find(
                  (option) => option.value === formData.alloted_manager
                )}
                onChange={(selectedOption) =>
                  handleChange({
                    target: {
                      id: "alloted_manager",
                      value: selectedOption?.value,
                    },
                  })
                }
                placeholder="Select Client Manager"
                styles={{
                  container: (base) => ({
                    ...base,
                    width: "300px",
                    marginLeft: "20px",
                  }),
                }}
              />
            )}
          </div>
          {hasPermission("add") && (
            <Button variant="primary" className="btn-box" onClick={handleAdd}>
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
          <div className="table-responsive mt-5">
            <Table bordered hover className="Master-table">
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
                    Company Name
                  </th>

                  <th>Client Manager</th>
                  {/* <th>Secretary </th> */}
                  {/* <th style={{ width: "150px" }}>Auditor</th> */}
                  <th>Directors</th>
                  <th>Shareholders</th>
                  <th>Associates</th>
                  <th>Subsidiaries</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows?.map((row) => (
                  <OverlayTrigger
                    key={row?.id}
                    placement="top"
                    overlay={<Tooltip>Click to view</Tooltip>}
                  >
                    <tr key={row?.id} onClick={() => handleRowClick(row)}>
                      <td
                        style={{
                          width: "20%",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        {row?.company_name}
                      </td>

                      <td className="">
                        {row?.alloted_manager[0]?.name || "-"}
                      </td>
                      {/* <td>{row?.secretary_detail?.name || "-"}</td>
                      <td>{row?.auditor_detail?.name || "-"}</td> */}
                      <td>
                        <button
                          style={{ height: "100%" }}
                          className="director-btn"
                          onClick={(e) => handleViewDirectors(row, e)}
                        >
                          <FaUser />
                        </button>
                      </td>
                      <td>
                        <button
                          style={{ height: "100%" }}
                          className="director-btn"
                          onClick={(e) => handleViewShareholders(row, e)}
                        >
                          <FaUser />
                        </button>
                      </td>
                      <td>
                        <button
                          style={{ height: "100%" }}
                          className="director-btn"
                          onClick={(e) => handleViewAssociates(row, e)}
                        >
                          <FaUser />
                        </button>
                      </td>
                      <td>
                        <button
                          style={{ height: "100%" }}
                          className="director-btn"
                          onClick={(e) => handleViewSubsidiary(row, e)}
                        >
                          <FaUser />
                        </button>
                      </td>

                      <td>
                        {hasPermission("edit") && (
                          <Button
                            variant="outline-primary"
                            onClick={(e) => handleEdit(row?._id, e)}
                            className="me-2"
                          >
                            <FaEdit />
                          </Button>
                        )}
                        {hasPermission("delete") && (
                          <Button
                            variant="outline-danger"
                            onClick={(e) => handleDeleteClick(row, e)}
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
          </div>
        )}
      </Container>
      <ToastContainer />
    </>
  );
}
