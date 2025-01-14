import React, { useContext, useState } from "react";
import { Dropdown, Badge, Nav, Button } from "@themesberg/react-bootstrap";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { TabContext } from "../context/TabContext";

const UserMenu = () => {
  const { logout } = useAuth();
  const { clearTabs } = useContext(TabContext);
  const [showDropdown, setShowDropdown] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const handleToggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogoutClick = () => {
    setShowDropdown(false);
    logout();
    clearTabs();
  };

  return (
    <Dropdown
      align="end"
      show={showDropdown}
      onToggle={handleToggleDropdown}
      className="user-menu-dropdown"
    >
      <Dropdown.Toggle
        as={Button}
        id="dropdown-basic"
        onClick={handleToggleDropdown}
        variant="link"
        className="d-flex align-items-center text-decoration-none"
      >
        <FaUserCircle size={40} className="me-2 text-white" />
        <span className="d-none d-sm-inline-block text-white">
          {user.name || "User"}
        </span>
      </Dropdown.Toggle>

      <Dropdown.Menu className="dropdown-menu-end mt-2 p-2 rounded shadow ">
        <Dropdown.Header>
          <strong>Hello, {user.name || "User"}!</strong>
        </Dropdown.Header>

        <Dropdown.ItemText>
          <small className="text-muted">
            {user.email || "user@example.com"}
          </small>
        </Dropdown.ItemText>
        <Dropdown.ItemText>-9:43</Dropdown.ItemText>
        <Dropdown.Divider />
        <Dropdown.Item onClick={handleLogoutClick}>
          <FaSignOutAlt className="me-2" /> Logout
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default UserMenu;
