import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { apiURL } from "../API/api";

const ManagePermissions = () => {
  const [roles, setRoles] = useState([]);
  const [dashboardPermissions, setDashboardPermission] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState({});

  useEffect(() => {
    const fetchRolePermissionData = async () => {
      try {
        const response = await fetch(`${apiURL}/role`);
        const rolePermissionData = await response.json();
        setDashboardPermission(
          rolePermissionData.results[0].dashboard_permissions[0].ParentChildchecklist
        );
      } catch (error) {
        console.error("Error fetching role permission data:", error);
      }
    };
    fetchRolePermissionData();
  }, []);

  useEffect(() => {
    const fetchRoleData = async () => {
      try {
        const response = await fetch(`${apiURL}/role`);
        const rolePermissionData = await response.json();
        if (rolePermissionData && rolePermissionData.results) {
          const roleArray = rolePermissionData.results.map(
            (result) => result.role
          );
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
      updatedPermissions[moduleId][childId] = !updatedPermissions[moduleId][childId];
      return updatedPermissions;
    });
  };

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const permissionsToUpdate = dashboardPermissions.map((permission) => ({
      moduleName: permission.moduleName,
      isSelected: permission.isSelected,
      childList: permission.childList.map((child) => ({
        id: child.id,
        isSelected: selectedPermissions[permission.id]?.[child.id] || false,
      })),
    }));

    const data = {
      role: selectedRole,
      dashboard_permissions: permissionsToUpdate,
    };

    try {
      const response = await fetch(`${apiURL}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("Update result:", result);
      // Optionally, you can reset state or show a success message here
    } catch (error) {
      console.error("Error updating role permissions:", error);
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
                  <option key={index} value={role}>
                    {role}
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
                    selectedPermissions[permission.id]?.[module.id] || false
                  }
                  onChange={() => handleCheckboxChange(permission.id, module.id)}
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
