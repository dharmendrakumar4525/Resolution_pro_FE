import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Form,
  Modal,
  Table,
  Container,
  Col,
  Row,
  Spinner,
} from "react-bootstrap";
import { apiURL } from "../../API/api";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Directors() {
  const [rows, setRows] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company_id: "",
    name: "",
    present_address: "",
    permanent_address: "",
    date_of_appointment: "",
    date_of_cessation: "",
    date_of_regularisation_AGM: "",
    designation: "",
    designation_change_date: "",
    remuneration_details: "",
    WTD_tenure: {
      from: "",
      to: "",
    },
    MD_tenure: {
      from: "",
      to: "",
    },
    DSC_expiry_date: "",
    BM_due_date: "",
    KYC_filling_date: "",
    related_party_name: "",
    related_party_address: "",
    "din/pan": "",
    email: "",
    is_manual: true, // Default value
  });

  const token = localStorage.getItem("refreshToken");
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${apiURL}/director-data/directors/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setRows(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleOpenAddModal = () => {
    setFormData({
      company_id: `${id}`,
      name: "",
      present_address: "",
      permanent_address: "",
      date_of_appointment: "",
      date_of_cessation: "",
      date_of_regularisation_AGM: "",
      designation: "",
      designation_change_date: "",
      remuneration_details: "",
      WTD_tenure: {
        from: "",
        to: "",
      },
      MD_tenure: {
        from: "",
        to: "",
      },
      DSC_expiry_date: "",
      BM_due_date: "",
      KYC_filling_date: "",
      related_party_name: "",
      related_party_address: "",
      "din/pan": "",
      email: "",
      is_manual: true,
    });

    setEditingRow(null);
    setOpenAddModal(true);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;

    if (id.includes(".")) {
      const [parent, child] = id.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [id]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonLoading(true);
    try {
      if (editingRow) {
        await fetch(`${apiURL}/director-data/${editingRow?.id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        });
        setRows((prevRows) =>
          prevRows.map((row) =>
            row?.id === editingRow?.id ? { ...row, ...formData } : row
          )
        );
        toast.success("Director updated successfully");
      } else {
        const response = await fetch(`${apiURL}/director-data`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Failed to add director");
        }
        const data = await response.json();
        setRows((prevRows) => [...prevRows, data]);
        toast.success("Director added successfully");
      }
      setOpenAddModal(false);
      setFormData({
        company_id: `${id}`,
        name: "",
        present_address: "",
        permanent_address: "",
        date_of_appointment: "",
        date_of_cessation: "",
        date_of_regularisation_AGM: "",
        designation: "",
        designation_change_date: "",
        remuneration_details: "",
        WTD_tenure: {
          from: "",
          to: "",
        },
        MD_tenure: {
          from: "",
          to: "",
        },
        DSC_expiry_date: "",
        BM_due_date: "",
        KYC_filling_date: "",
        related_party_name: "",
        related_party_address: "",
        "din/pan": "",
        email: "",
        is_manual: true,
      });
    } catch (error) {
      toast.error("Failed to add/update director. Please try again.");
    } finally {
      setButtonLoading(false); // Hide button spinner
    }
  };

  const handleDeleteClick = async (row) => {
    try {
      await fetch(`${apiURL}/director-data/${row?.id}`, {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setRows((prevRows) => prevRows.filter((item) => item.id !== row?.id));

      toast.success("Director deleted successfully");
    } catch (error) {
      toast.error("Failed to delete director");
    }
  };

  const handleEditClick = (row) => {
    navigate(`/director-form/${row.id}`, { state: { clientId: `${id}` } });
  };

  return (
    <>
      <Container fluid className="styled-table pt-3 mt-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Directors</h4>
          <Button
            variant="primary"
            className="btn-box"
            onClick={() =>
              navigate("/director-form", { state: { clientId: `${id}` } })
            }
          >
            <FaPlus style={{ marginRight: "8px" }} /> Add
          </Button>
        </div>

        {loading ? (
          <div className="text-center mt-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
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
                  <th>Name</th>
                  <th>Email</th>
                  <th>Designation</th>
                  <th>Start Date</th>
                  <th>DIN/PAN</th>
                  <th>End Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row?.id}>
                    <td>{row?.name}</td>
                    <td>{row?.email}</td>
                    <td>{row?.designation}</td>
                    <td>{row?.begin_date}</td>
                    <td>{row["din/pan"]}</td>
                    <td>{row?.end_date || "-"}</td>
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
          </div>
        )}
        <Button variant="primary" onClick={() => navigate(-1)} className="mt-3">
          Go Back
        </Button>
      </Container>
      <ToastContainer />
    </>
  );
}
