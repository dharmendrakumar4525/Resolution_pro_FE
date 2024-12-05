import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Modal,
  Form,
  Table,
  Container,
  Spinner,
  Pagination,
} from "react-bootstrap";
import { FaEdit, FaTrash, FaPlus, FaUser } from "react-icons/fa";
import { apiURL } from "../API/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext";

export default function CommitteeMembers() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [clientList, setClientList] = useState([]);
  const [committeeList, setCommitteeList] = useState([]);
  const [directorList, setDirectorList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    clientName: "",
    committee: "",
    isEmail: false,
    committeeMembers: [],
  });
  const { rolePermissions } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("refreshToken");

  useEffect(() => {
    const fetchData = async (pageNo) => {
      try {
        const response = await fetch(
          `${apiURL}/committee-member?page=${pageNo}&limit=10`,
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
  }, [page]);
  useEffect(() => {
    const fetchData = async () => {
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
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchCommitteeData = async () => {
      try {
        const response = await fetch(`${apiURL}/committee-master`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setCommitteeList(data.results);
      } catch (error) {
        console.error("Error fetching committee data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCommitteeData();
  }, []);

  const fetchDirectors = async (clientId) => {
    try {
      const response = await fetch(
        `${apiURL}/director-data/directors/${clientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setDirectorList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching director data:", error);
    }
  };
  const handleAdd = () => navigate("/committee-members/add-form");
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "clientName" && value) {
      await fetchDirectors(value);
    }
  };

  const handleViewMembers = (row, e) => {
    e.stopPropagation();
    navigate(`/view-members/${row?.id}`, { state: row });
  };

  const handleEditClick = (row) => {
    navigate(`/committee-members/edit-form/${row?.id}`);
  };

  const handleDeleteClick = async (row) => {
    try {
      const response = await fetch(`${apiURL}/committee-member/${row?.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to delete item");

      setRows((prevRows) => prevRows.filter((item) => item.id !== row?.id));
      if (rows.length === 1 && page > 1) {
        setPage(page - 1);
      }
      toast.success("Committee member deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item. Please try again.");
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const columns = [
    { header: "Client Name", field: "client_name" },
    { header: "Committee", field: "committee" },
    { header: "View Members", field: "committee_members.length" },
    { header: "Email Notifications", field: "is_email" },
    { header: "Actions", field: "action" },
  ];
  const userPermissions =
    rolePermissions.find((perm) => perm.moduleName === "Committee_Members")
      ?.childList || [];
  const hasPermission = (action) =>
    userPermissions.some((perm) => perm.value === action && perm.isSelected);

  return (
    <>
      <Container fluid className="styled-table pt-3 mt-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Committee Members</h4>
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
        ) : rows.length === 0 ? (
          <div className="text-center mt-5">
            <h5>No data available</h5>
          </div>
        ) : (
          <>
            <Table bordered hover className="Master-table mt-5">
              <thead className="Master-Thead">
                <tr>
                  {columns.map((column) => (
                    <th key={column.header}>{column.header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row?.id}>
                    <td>{row?.client_name?.company_name}</td>
                    <td>{row?.committee.name}</td>
                    <td>
                      <button
                        style={{ height: "100%" }}
                        className="director-btn"
                        onClick={(e) => handleViewMembers(row, e)}
                      >
                        <FaUser />
                      </button>
                    </td>
                    <td>{row?.is_email ? "Yes" : "No"}</td>
                    <td>
                      {hasPermission("edit") && (
                        <Button
                          variant="outline-primary"
                          className=" me-2"
                          onClick={() => handleEditClick(row)}
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
