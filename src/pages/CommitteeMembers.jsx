import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Form,
  Table,
  InputGroup,
  FormControl,
  Container,
} from "react-bootstrap";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { apiURL } from "../API/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CommitteeMembers() {
  const [rows, setRows] = useState([]);
  const [templateNames, setTemplateNames] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formData, setFormData] = useState({
    meetingType: "",
    groupName: "",
    createdBy: "",
    groupItems: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiURL}/template-group`);
        const data = await response.json();

        const responseMeetingAgendaTemplate = await fetch(
          `${apiURL}/meeting-agenda-template`
        );
        const dataMeetingAgendaTemplate =
          await responseMeetingAgendaTemplate.json();

        const templateNames = dataMeetingAgendaTemplate.results.map(
          (item) => item.templateName
        );
        setTemplateNames(templateNames);

        const updatedRows = data.results.map((item) => ({
          ...item,
          numberOfTemplate: item.groupItems.length,
        }));
        setRows(updatedRows);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleChange = (e) => {
    const { id, name, value } = e.target;
    setFormData({ ...formData, [id || name]: value });
  };

  const handleEditClick = (row) => {
    setEditingRow(row);
    setOpenModal(true);
    setFormData({
      meetingType: row.meetingType,
      groupName: row.groupName,
      createdBy: row.createdBy,
      groupItems: row.groupItems,
    });
  };

  const handleDeleteClick = async (row) => {
    try {
      const response = await fetch(`${apiURL}/template-group/${row.id}`, {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRow) {
        await fetch(`${apiURL}/template-group/${editingRow.id}`, {
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
        toast.success("Committe member edited successfully");
      } else {
        const response = await fetch(`${apiURL}/template-group`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        setRows((prevRows) => [...prevRows, data]);
      }
      handleCloseModal();
      toast.success("Committe member added successfully");
    } catch (error) {
      toast.error("Failed to add/edit item. Please try again.");
    }
  };

  const columns = [
    { header: "Client Name", field: "clientName" },
    { header: "Committee", field: "committee" },
    { header: "No. Of Members", field: "numberOfMembers" },
    { header: "Created By", field: "createdBy" },
    { header: "Actions", field: "action" },
  ];

  const sampleData = [
    {
      id: 1,
      clientName: "John Doe",
      committee: "Finance Committee",
      numberOfMembers: 5,
      createdBy: "Jane Smith",
    },
    {
      id: 2,
      clientName: "Jane Doe",
      committee: "Marketing Committee",
      numberOfMembers: 7,
      createdBy: "Bob Johnson",
    },
  ];

  return (
    <>
      <Container className="styled-table pt-3 mt-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Committee Members</h4>
          <Button
            variant="primary"
            className="btn-box"
            onClick={handleOpenModal}
          >
            <FaPlus style={{ marginRight: "8px" }} /> Add
          </Button>
        </div>

        <Modal show={openModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingRow ? "Edit Committee" : "Add Committee"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="clientName">
                <Form.Label>Client Name</Form.Label>
                <Form.Control
                  as="select"
                  value={formData.clientName}
                  onChange={handleChange}
                >
                  <option>Select Client</option>
                  <option value="Client 1">Client 1</option>
                  <option value="Client 2">Client 2</option>
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="committee">
                <Form.Label>Committee</Form.Label>
                <Form.Control
                  as="select"
                  value={formData.committee}
                  onChange={handleChange}
                >
                  <option>Select Committee</option>
                  <option value="CSR Committee">CSR Committee</option>
                  <option value="Audit Committee">Audit Committee</option>
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="groupItems">
                <Form.Label>Committee Members</Form.Label>
                <Form.Control
                  as="select"
                  multiple
                  value={formData.groupItems}
                  onChange={(e) => {
                    const selectedOptions = Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    );
                    setFormData({ ...formData, groupItems: selectedOptions });
                  }}
                >
                  {templateNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Button variant="primary" type="submit" className="mt-3 me-2">
                Save
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        <div className="table-responsive mt-5">
          <Table striped bordered hover>
            <thead>
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx}>{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleData.map((row) => (
                <tr key={row.id}>
                  <td>{row.clientName}</td>
                  <td>{row.committee}</td>
                  <td>{row.numberOfMembers}</td>
                  <td>{row.createdBy}</td>
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
