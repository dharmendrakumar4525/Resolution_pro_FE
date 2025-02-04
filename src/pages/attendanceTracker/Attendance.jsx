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

export default function Attendance() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [clientList, setClientList] = useState([]);
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
        console.log(data.docs, "ds");
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

    fetchClientList();
  }, []);

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

  const handleRowClick = (row) => {
    navigate(`/attendance-insights/${row?._id}`, { state: { row } });
  };
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const clientOptions = clientList?.map((client) => ({
    value: client._id,
    label: client.company_name,
  }));
  const handleChange = async (selectedOption) => {
    setFormData({ ...formData, client_name: selectedOption.value || "" });

    if (selectedOption.value !== "") {
      const token = localStorage.getItem("refreshToken");
      const response = await fetch(
        `${apiURL}/customer-maintenance/${selectedOption.value}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      console.log(data, "mba");
      setRows([data]);
    } else {
      setRefresh((prev) => !prev);
    }
  };

  const userPermissions =
    rolePermissions.find((perm) => perm.moduleName === "Client_Record")
      ?.childList || [];
  const hasPermission = (action) =>
    userPermissions.some((perm) => perm.value === action && perm.isSelected);
  return (
    <>
      <Container fluid className="styled-table pt-3 mt-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Client Records Attendance</h4>
          <div>
            {userRole === "672c47c238903b464c9d2920" && (
              <>
                <Select
                  id="client-name-select"
                  options={clientOptions}
                  placeholder="Select Client"
                  onChange={handleChange}
                  isClearable
                />
              </>
            )}
          </div>
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
                  <th>Company Name</th>
                  <th>CIN</th>

                  <th>Client Manager</th>
                  <th>Secretary </th>
                  <th>Auditor</th>
                  <th>Directors</th>
                  <th>Shareholders</th>
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
                      <td>{row?.company_name}</td>
                      <td>{row?.cin}</td>

                      <td className="">
                        {row?.alloted_manager[0]?.name || "-"}
                      </td>
                      <td>{row?.secretary_detail?.name || "-"}</td>
                      <td>{row?.auditor_detail?.name || "-"}</td>
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
