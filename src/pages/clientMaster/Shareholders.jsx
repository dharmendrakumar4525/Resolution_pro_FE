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

export default function Shareholders() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("refreshToken");
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${apiURL}/shareholder-data?company_id=${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setRows(data.results);
        console.log(data.results);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDeleteClick = async (row) => {
    try {
      await fetch(`${apiURL}/shareholder-data/${row?.id}`, {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setRows((prevRows) => prevRows.filter((item) => item.id !== row?.id));

      toast.success("Shareholder deleted successfully");
    } catch (error) {
      toast.error("Failed to delete shareholder");
    }
  };

  const addShareholder = () => {
    navigate("/shareholder-form", { state: { clientId: `${id}` } });
  };
  const editShareholder = (row) => {
    navigate(`/shareholder-form/${row?.id}`, { state: { clientId: `${id}` } });
  };

  return (
    <>
      <Container fluid className="styled-table pt-3 mt-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Shareholders</h4>
          <Button
            variant="primary"
            className="btn-box"
            onClick={addShareholder}
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
                  <th>Type</th>
                  <th>Holding Percentage</th>
                  <th>Beneficial Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row?.id}>
                    <td>{row?.name}</td>
                    <td>{row?.email}</td>
                    <td>{row?.type || "-"}</td>
                    <td>{row?.holding_percent || "-"}</td>
                    <td>{row?.beneficial_name}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        onClick={() => editShareholder(row)}
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
        <ToastContainer autoClose={1000} />
      </Container>
    </>
  );
}
