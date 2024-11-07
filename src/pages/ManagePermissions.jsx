import React, { useState, useEffect } from "react";
import { apiURL } from "../API/api";
import { toast, ToastContainer } from "react-toastify";
import {
  Button,
  Form,
  Modal,
  Table,
  Container,
  InputGroup,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";

const ManagePermissions = () => {
  const [roles, setRoles] = useState([]);
  const [dashboardPermissions, setDashboardPermission] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState({});

  useEffect(() => {
    const fetchRoleData = async () => {
      try {
        const response = await fetch(`${apiURL}/role`);
        const rolePermissionData = await response.json();
        if (rolePermissionData && rolePermissionData.results) {
          const roleArray = rolePermissionData.results.map((result) => ({
            role: result.role,
            id: result.id,
          }));
          setRoles(roleArray);
          const adminRole = roleArray.find(
            (role) => role.id === "672c47c238903b464c9d2920"
          );
          if (adminRole) {
            setSelectedRole(adminRole.id);
          }
        }
      } catch (error) {
        console.error("Error fetching role data:", error);
      }
    };
    fetchRoleData();
  }, []);

  const handleCheckboxChange = (moduleId, childId) => {
    setSelectedPermissions((prevState) => {
      const updatedPermissions = { ...prevState };
      if (!updatedPermissions[moduleId]) {
        updatedPermissions[moduleId] = {};
      }
      updatedPermissions[moduleId][childId] =
        !updatedPermissions[moduleId][childId];
      return updatedPermissions;
    });
  };

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };
  useEffect(() => {
    const fetchRolePermissionData = async () => {
      try {
        const response = await fetch(`${apiURL}/role/${selectedRole}`);
        const rolePermissionData = await response.json();

        const initialSelectedPermissions =
          rolePermissionData.dashboard_permissions[0].ParentChildchecklist.reduce(
            (acc, permission) => {
              acc[permission.id] = permission.childList.reduce(
                (childAcc, child) => {
                  childAcc[child.id] = child.isSelected;
                  return childAcc;
                },
                {}
              );
              return acc;
            },
            {}
          );

        setSelectedPermissions(initialSelectedPermissions); // Initialize with current selections
        setDashboardPermission(
          rolePermissionData.dashboard_permissions[0].ParentChildchecklist
        );
      } catch (error) {
        console.error("Error fetching role permission data:", error);
      }
    };
    if (selectedRole) {
      fetchRolePermissionData();
    }
  }, [selectedRole]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const permissionsToUpdate = dashboardPermissions.map((permission) => ({
      id: permission.id,
      moduleName: permission.moduleName,
      isSelected: permission.isSelected,
      isClosed: permission.isClosed,
      childList: permission.childList.map((child) => ({
        id: child.id,
        parent_id: child.parent_id,
        value: child.value,
        isSelected:
          selectedPermissions[permission.id]?.[child.id] ?? child.isSelected, // Preserve existing selections
      })),
    }));

    const data = {
      dashboard_permissions: [
        {
          isAllSelected: false,
          isAllCollapsed: false,
          ParentChildchecklist: permissionsToUpdate,
        },
      ],
    };

    try {
      const response = await fetch(`${apiURL}/role/${selectedRole}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error updating role permissions");
      }

      toast.success("Permissions updated successfully");
      window.location.reload();
    } catch (error) {
      toast.error(`Error updating role permissions: ${error.message}`);
    }
  };

  return (
    <div>
      <Container fluid className="styled-table pt-3 mt-4 pb-3">
        <ToastContainer autoClose={2000} />
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Manage Permissions</h4>
        </div>

        <form onSubmit={handleSubmit} className="mt-5">
          <div>
            <ul className="select-role">
              {roles.length > 0 ? (
                <Form.Control
                  as="select"
                  value={selectedRole}
                  onChange={handleRoleChange}
                  style={{ width: "400px" }}
                >
                  <option value="" disabled>
                    Select a role
                  </option>
                  {roles.map((role, index) => (
                    <option key={index} value={role.id}>
                      {role.role}
                    </option>
                  ))}
                </Form.Control>
              ) : (
                <p>No roles found.</p>
              )}
            </ul>
          </div>
          <Row>
            {dashboardPermissions.map((permission, index) => (
              <Col
                key={index}
                xs={12}
                xl={8}
                className="mb-3 mt-2"
                // style={{ marginLeft: "40px" }}
              >
                <h3>
                  {permission.moduleName
                    .toLowerCase()
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}{" "}
                </h3>
                <Row>
                  {permission.childList.map((module) => (
                    <Col
                      xs={12}
                      sm={6}
                      md={4}
                      lg={3}
                      key={module.id}
                      className="mb-2"
                    >
                      <div className="d-flex align-items-center">
                        <InputGroup.Checkbox
                          checked={
                            selectedPermissions[permission.id]?.[module.id] ??
                            module.isSelected
                          }
                          onChange={() =>
                            handleCheckboxChange(permission.id, module.id)
                          }
                        />
                        <span style={{ marginLeft: "10px" }}>
                          {module.value}
                        </span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Col>
            ))}
          </Row>

          <Button type="submit">Update Role Permissions</Button>
        </form>
      </Container>
    </div>
  );
};

export default ManagePermissions;
