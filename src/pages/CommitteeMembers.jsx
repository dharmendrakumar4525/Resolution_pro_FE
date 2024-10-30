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
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
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

  useEffect(() => {
    const fetchData = async (pageNo) => {
      try {
        const response = await fetch(
          `${apiURL}/committee-member?page=${pageNo}`
        );
        const data = await response.json();
        setRows(data.results);
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
        const response = await fetch(`${apiURL}/customer-maintenance`);

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
        const response = await fetch(`${apiURL}/committee-master`);
        const data = await response.json();
        console.log(data.results, "Deew");
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
        `${apiURL}/director-data/directors/${clientId}`
      );
      const data = await response.json();
      console.log(data, "directorData");
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

  const removeMember = (index) => {
    const updatedMembers = [...formData.committeeMembers];
    updatedMembers.splice(index, 1);
    setFormData({ ...formData, committeeMembers: updatedMembers });
  };

  const handleEditClick = (row) => {
    navigate(`/committee-members/edit-form/${row.id}`);
  };

  const handleDeleteClick = async (row) => {
    try {
      const response = await fetch(`${apiURL}/committee-member/${row.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to delete item");

      setRows((prevRows) => prevRows.filter((item) => item.id !== row.id));
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
    { header: "No. Of Members", field: "committee_members.length" },
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

        <Table responsive hover className="mt-3">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.header}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && loading ? (
              <tr>
                <td colSpan={5} className="text-center">
                  <Spinner animation="border" />
                </td>
              </tr>
            ) : !hasPermission("view") ? (
              <div className="text-center mt-5">
                <h5>You do not have permission to view the data</h5>
              </div>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">
                  No data available
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.id}>
                  <td>{row.client_name?.name}</td>
                  <td>{row.committee.name}</td>
                  <td>{row.committee_members.length}</td>
                  <td>{row.is_email ? "Yes" : "No"}</td>
                  <td>
                    {hasPermission("edit") && (
                      <Button
                        variant="outline-primary"
                        className="mr-2"
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
              ))
            )}
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
      </Container>
      <ToastContainer />
    </>
  );
}
