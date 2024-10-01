import React, { useEffect, useState } from "react";
import { Button, Form, Modal, Table, Container,Col,Row } from "react-bootstrap";
import { apiURL } from "../API/api";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from 'react-router-dom';

export default function CustomerMaintenance() {
  const [rows, setRows] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [managers, setManagers] = useState([]);
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
    alloted_manager: "",
  });

  const userRole = JSON.parse(localStorage.getItem("user"))?.role;
  const userManagerName = JSON.parse(localStorage.getItem("user"))?.name;
  const userManagerId = JSON.parse(localStorage.getItem("user"))?.id;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiURL}/customer-maintenance`);
        const data = await response.json();
        setRows(data.results);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await fetch(`${apiURL}/users?role=manager`);
        const data = await response.json();
        setManagers(data.results);
        console.log(data.results, "ndsasja");
      } catch (error) {
        console.error("Error fetching managers:", error);
      }
    };
    fetchManagers();
  }, []);

  const handleDeleteClick = async (row) => {
    try {
      const response = await fetch(`${apiURL}/customer-maintenance/${row.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      setRows((prevRows) => prevRows.filter((item) => item.id !== row.id));

      alert("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleCheckboxChange = (e) => {
    const { id, checked } = e.target;
    setFormData({ ...formData, [id]: checked });
  };

  const handleOpenAddModal = () => {
    setFormData({
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
      alloted_manager: userRole === "manager" ? userManagerId : "",
    });
    setEditingRow(null);
    setOpenAddModal(true);
  };

  const handleEditClick = (row) => {
    setEditingRow(row);
    setOpenAddModal(true);
    setFormData({
      name: row.name,
      state: row.state,
      country: row.country,
      cin: row.cin,
      pan: row.pan,
      gstin: row.gstin,
      o: row.o,
      c: row.c,
      v: row.v,
      ro: row.ro,
      revision: row.revision,
      alloted_manager: row.alloted_manager || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRow) {
        await fetch(`${apiURL}/customer-maintenance/${editingRow.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === editingRow.id ? { ...row, ...formData } : row
          )
        );
        toast.success("Maintainance edited successfully");
      } else {
        const response = await fetch(`${apiURL}/customer-maintenance`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          toast.error("Failed to add item");
        }
        toast.success("Maintainance added successfully");

        const data = await response.json();
        setRows((prevRows) => [...prevRows, data]);
      }

      setOpenAddModal(false);
      setFormData({
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
        alloted_manager: "",
      });
    } catch (error) {
      toast.error("Failed to add/edit item. Please try again.");
    }
  };

  const handleViewDirectors = (id) => {
    navigate(`/directors/${id}`);
  };

  return (
    <>
      <Container className="styled-table pt-3 mt-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Customer Maintenance</h4>
          <Button
            variant="primary"
            className="btn-box"
            onClick={handleOpenAddModal}
          >
            <FaPlus style={{ marginRight: "8px" }} /> Add
          </Button>
        </div>

        <Modal show={openAddModal} onHide={() => setOpenAddModal(false)} className="p-2">
          <Modal.Header closeButton>
            <Modal.Title>
              {editingRow ? "Edit Customer" : "Add Customer"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="name" className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter Name"
                />
              </Form.Group>
              <Row className="mb-3">
              <Form.Group as={Col} controlId="state" >
                <Form.Label>State</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Enter State"
                />
              </Form.Group>

              <Form.Group as={Col} controlId="country" >
                <Form.Label>Country</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Enter Country"
                />
              </Form.Group>
              </Row>
              <Row className="mb-3">
              <Form.Group as={Col} controlId="cin" >
                <Form.Label>CIN</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.cin}
                  onChange={handleChange}
                  placeholder="Enter CIN"
                />
              </Form.Group>

              <Form.Group as={Col} controlId="pan" >
                <Form.Label>PAN</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.pan}
                  onChange={handleChange}
                  placeholder="Enter PAN"
                />
              </Form.Group>
              </Row >

              <Form.Group controlId="gstin" className="mb-3">
                <Form.Label>GSTIN</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.gstin}
                  onChange={handleChange}
                  placeholder="Enter GSTIN"
                />
              </Form.Group>

              <Form.Group controlId="revision" className="mb-3">
                <Form.Label>Revision</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.revision}
                  onChange={handleChange}
                  placeholder="Enter Revision"
                />
              </Form.Group>
              <Form.Group controlId="alloted_manager" className="mb-3">
                <Form.Label>Manager</Form.Label>
                {userRole === "manager" ? (
                  <Form.Control
                    type="text"
                    value={userManagerName}
                    readOnly
                    // placeholder = {userManagerName}
                  />
                ) : (
                  <Form.Control
                    as="select"
                    value={formData.alloted_manager}
                    onChange={handleChange}
                  >
                    <option value="">Select Manager</option>
                    {managers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.name}
                      </option>
                    ))}
                  </Form.Control>
                )}
              </Form.Group>
<Row className="mb-4">
              <Form.Group as={Col} controlId="o" className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="O"
                  checked={formData.o}
                  onChange={handleCheckboxChange}
                />
              </Form.Group>

              <Form.Group as={Col} controlId="c" className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="C"
                  checked={formData.c}
                  onChange={handleCheckboxChange}
                />
              </Form.Group>

              <Form.Group as={Col} controlId="v" className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="V"
                  checked={formData.v}
                  onChange={handleCheckboxChange}
                />
              </Form.Group>

              <Form.Group as={Col} controlId="ro" className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="RO"
                  checked={formData.ro}
                  onChange={handleCheckboxChange}
                />
              </Form.Group>
              </Row>
              <Button type="submit" variant="primary" className="me-2">
                Save
              </Button>
              <Button
                variant="secondary"
                onClick={() => setOpenAddModal(false)}
                className="ml-2"
              >
                Cancel
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        <div className="table-responsive mt-5">
          <Table striped bordered hover align="center">
            <thead>
              <tr>
                <th>Name</th>
                <th>State</th>
                <th>Country</th>
                <th>CIN</th>
                <th>PAN</th>
                <th>GSTIN</th>
                <th>O?</th>
                <th>C?</th>
                <th>V?</th>
                <th>RO?</th>
                <th>Revision</th>
                <th>Alloted Manager</th>
                <th>Directors</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.state}</td>
                  <td>{row.country}</td>
                  <td>{row.cin}</td>
                  <td>{row.pan}</td>
                  <td>{row.gstin}</td>
                  <td>{row.o ? "Yes" : "No"}</td>
                  <td>{row.c ? "Yes" : "No"}</td>
                  <td>{row.v ? "Yes" : "No"}</td>
                  <td>{row.ro ? "Yes" : "No"}</td>
                  <td className="text-center">{row.revision}</td>
                  <td className="text-center">
                    {row.alloted_manager?.name || "-"}
                  </td>
                  <button onClick={() => handleViewDirectors(row.id)}>View Directors</button>
                  <td>
                    <Button
                      variant="outline-secondary"
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
      </Container>
      <ToastContainer />
    </>
  );
}
