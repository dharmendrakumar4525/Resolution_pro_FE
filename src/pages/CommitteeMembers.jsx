import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Form,
  Table,
  Container,
  Spinner,
} from "react-bootstrap";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { apiURL } from "../API/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext";

export default function CommitteeMembers() {
  const [rows, setRows] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [committeeList, setCommitteeList] = useState([]);
  const [directorList, setDirectorList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    clientName: "",
    committee: "",
    isEmail: false,
    committeeMembers: [],
  });
  const { rolePermissions } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiURL}/committee-member`);
        const data = await response.json();
        setRows(data.results);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiURL}/customer-maintenance`);

        const data = await response.json();
        setClientList(data.docs);
        console.log(data, "mukul");
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
      const response = await fetch(`${apiURL}/director-data`);
      const data = await response.json();
      console.log(data, "Deew-1");
      setDirectorList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching director data:", error);
    }
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "clientName" && value) {
      await fetchDirectors(value);
    }
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...formData.committeeMembers];
    updatedMembers[index][field] = value;
    setFormData({ ...formData, committeeMembers: updatedMembers });
  };

  const addMember = () => {
    setFormData({
      ...formData,
      committeeMembers: [
        ...formData.committeeMembers,
        { name: "", from: "", to: "", email: "" },
      ],
    });
  };

  const removeMember = (index) => {
    const updatedMembers = [...formData.committeeMembers];
    updatedMembers.splice(index, 1);
    setFormData({ ...formData, committeeMembers: updatedMembers });
  };

  const handleEditClick = (row) => {
    setEditingRow(row);
    setFormData({
      clientName: row.client_name?.id,
      committee: row.committee.id,
      isEmail: row.isEmail,
      committeeMembers: row.committeeMembers || [],
    });

    setOpenModal(true);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        client_name: formData.clientName,
        committee: formData.committee,
        is_email: formData.isEmail,
        committee_members: formData.committeeMembers,
      };

      if (editingRow) {
        await fetch(`${apiURL}/committee-member/${editingRow.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === editingRow.id ? { ...row, ...formData } : row
          )
        );
        toast.success("Committee member updated successfully");
      } else {
        const response = await fetch(`${apiURL}/committee-member`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        setRows((prevRows) => [...prevRows, data]);
        toast.success("Committee member added successfully");
      }

      handleCloseModal();
    } catch (error) {
      toast.error("Failed to add/edit item. Please try again.");
    }
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
          <Button
            variant="primary"
            className="btn-box"
            onClick={handleOpenModal}
          >
            <FaPlus style={{ marginRight: "8px" }} /> Add
          </Button>
          )}
        </div>

        <Modal show={openModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingRow ? "Edit Committee Member" : "Add Committee Member"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="clientName">
                <Form.Label>Client Name</Form.Label>
                <Form.Control
                  as="select"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                >
                  <option value="">Select Client</option>
                  {clientList.map((client) => (
                    <option key={client.id} value={client._id}>
                      {client.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="committee">
                <Form.Label>Committee</Form.Label>
                <Form.Control
                  as="select"
                  name="committee"
                  value={formData.committee}
                  onChange={handleChange}
                >
                  <option value="">Select Committee</option>
                  {committeeList.map((committee) => (
                    <option key={committee.id} value={committee.id}>
                      {committee.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="isEmail">
                <Form.Label>Email Notifications</Form.Label>
                <Form.Check
                  type="checkbox"
                  label="Send Email Notifications"
                  checked={formData.isEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, isEmail: e.target.checked })
                  }
                />
              </Form.Group>

              {formData.committeeMembers.map((member, index) => (
                <div key={index}>
                  <h6>Committee Member {index + 1}</h6>
                  <Form.Group>
                    <Form.Label>Director</Form.Label>
                    <Form.Control
                      as="select"
                      value={member.name}
                      onChange={(e) =>
                        handleMemberChange(index, "name", e.target.value)
                      }
                    >
                      <option value="">Select Director</option>
                      {directorList.map((director) => (
                        <option key={director.id} value={director.id}>
                          {director.name}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>

                  <Form.Group>
                    <Form.Label>From Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={member.from}
                      onChange={(e) =>
                        handleMemberChange(index, "from", e.target.value)
                      }
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label>To Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={member.to}
                      onChange={(e) =>
                        handleMemberChange(index, "to", e.target.value)
                      }
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={member.email}
                      onChange={(e) =>
                        handleMemberChange(index, "email", e.target.value)
                      }
                    />
                  </Form.Group>

                  <Button
                    variant="danger"
                    className="mb-3"
                    onClick={() => removeMember(index)}
                  >
                    Remove Member
                  </Button>
                  <hr />
                </div>
              ))}

              <Button onClick={addMember} variant="primary" className="mb-3">
                Add Committee Member
              </Button>

              <Button variant="primary" type="submit">
                Save
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

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
      </Container>
      <ToastContainer />
    </>
  );
}
