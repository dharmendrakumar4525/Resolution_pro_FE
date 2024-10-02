import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Form,
  Table,
  InputGroup,
  FormControl,
  Row,
  Col,
  Container,
  Spinner,
} from "react-bootstrap";
import { apiURL } from "../API/api";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TemplateGroup() {
  const [rows, setRows] = useState([]);
  const [templateNames, setTemplateNames] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [formData, setFormData] = useState({
    meetingType: "",
    groupName: "",
    createdBy: "",
    groupItems: [],
  });

  const resetFormData = () => {
    setFormData({
      meetingType: "",
      groupName: "",
      createdBy: "",
      groupItems: [],
    });
  };

  

  const handleOpenAddModal = () => {
    resetFormData();
    setEditingRow(null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    resetFormData();
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
      }finally {
        setLoading(false); 
      }
    };

    fetchData();
  }, []);

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
      toast.success("Template deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { id, name, value } = e.target;
    setFormData({ ...formData, [id || name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRow) {
        const response = await fetch(
          `${apiURL}/template-group/${editingRow.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === editingRow.id ? { ...row, ...formData } : row
          )
        );
        toast.success("template edited successfully");
      } else {
        const response = await fetch(`${apiURL}/template-group`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          console.log("Failed to add template");
        }

        const data = await response.json();
        setRows((prevRows) => [...prevRows, data]);
      }
      toast.success("template added successfully");
      handleCloseModal();
    } catch (error) {
      console.error("Error adding/editing item:", error);
      alert("Failed to add/edit item. Please try again.");
    }
  };

  return (
    <>
      <Container className="styled-table pt-3 mt-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Template Group</h4>
          <Button
            variant="primary"
            className="btn-box"
            onClick={handleOpenAddModal}
          >
            <FaPlus style={{ marginRight: "8px" }} /> Add
          </Button>
        </div>

        <Modal show={openModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>{editingRow ? "Edit Group" : "Add Group"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="groupName">
                <Form.Label>Group Name</Form.Label>
                <FormControl
                  value={formData.groupName}
                  onChange={handleChange}
                  placeholder="Enter Group Name"
                />
              </Form.Group>

              <Form.Group controlId="createdBy" className="mt-2">
                <Form.Label>Created By</Form.Label>
                <FormControl
                  value={formData.createdBy}
                  onChange={handleChange}
                  placeholder="Created By"
                />
              </Form.Group>

              <Form.Group controlId="meetingType" className="mt-2">
                <Form.Label>Meeting Type</Form.Label>
                <Form.Control
                  as="select"
                  value={formData.meetingType}
                  onChange={handleChange}
                >
                  <option value="">Select Meeting Type</option>
                  <option value="Board Meeting">Board Meeting</option>
                  <option value="Committee Meeting">Committee Meeting</option>
                  <option value="Circular Resolution">
                    Circular Resolution
                  </option>
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="groupItems" className="mt-2">
                <Form.Label>Group Items</Form.Label>
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
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Meeting Type</th>
                <th>Group Name</th>
                <th>No. Of Template</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.meetingType}</td>
                  <td>{row.groupName}</td>
                  <td>{row.numberOfTemplate}</td>
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
        )}
      </Container>
      <ToastContainer />
    </>
  );
}
