import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { apiURL } from "../API/api";
import { toast, ToastContainer } from "react-toastify";

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
      console.log(selectedPermissions, "select", updatedPermissions);
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
        console.log(rolePermissionData, "111111");

        setDashboardPermission(
          rolePermissionData.dashboard_permissions[0].ParentChildchecklist
        );
        console.log(rolePermissionData, "qdqqw");
      } catch (error) {
        console.error("Error fetching role permission data:", error);
      }
    };
    fetchRolePermissionData();
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
        isSelected: selectedPermissions[permission.id]?.[child.id] || false, // Update the child selection
      })),
    }));

    const data = {
      dashboard_permissions: [
        {
          isAllCollapsed: false,
          isAllSelected: false,
          ParentChildchecklist: permissionsToUpdate, // Include the updated permissions
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
    } catch (error) {
      toast.error(`Error updating role permissions: ${error.message}`);
    }
  };

  return (
    <div>
      <Container fluid className="styled-table pt-3 mt-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mt-3 head-box">
          <h4 className="h4-heading-style">Manage Permissions</h4>
        </div>
      </Container>
      <form onSubmit={handleSubmit}>
        <div>
          <h2>Roles</h2>
          <ul>
            {roles.length > 0 ? (
              <select value={selectedRole} onChange={handleRoleChange}>
                <option value="" disabled>
                  Select a role
                </option>
                {roles.map((role, index) => (
                  <option key={index} value={role.id}>
                    {role.role}
                  </option>
                ))}
              </select>
            ) : (
              <p>No roles found.</p>
            )}
          </ul>
        </div>
        {dashboardPermissions.map((permission, index) => (
          <div key={index}>
            <h3>{permission.moduleName}</h3>
            {permission.childList.map((module) => (
              <div key={module.id}>
                <input
                  type="checkbox"
                  checked={
                    selectedPermissions[permission.id]?.[module.id] ??
                    module.isSelected
                  } // Use module.isSelected for initial state
                  onChange={() =>
                    handleCheckboxChange(permission.id, module.id)
                  }
                />
                <span> {module.value}</span>
              </div>
            ))}
          </div>
        ))}
        <button type="submit">Update Role Permissions</button>
      </form>
    </div>
  );
};

export default ManagePermissions;
