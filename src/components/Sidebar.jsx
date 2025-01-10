import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faTable,
  faTimes,
  faUser,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import { Nav, Navbar, Button, Accordion, Badge } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";

export default function Sidebar() {
  const location = useLocation();
  const { pathname } = location;

  const [show, setShow] = useState(false);
  const [activeKey, setActiveKey] = useState("");
  const showClass = show ? "show" : "";
  const { rolePermissions } = useAuth();
  console.log(rolePermissions, "rolePermi");
  const handleToggleSidebar = () => setShow(!show);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const handleAccordionChange = (eventKey) => {
    setActiveKey(activeKey === eventKey ? "" : eventKey); // Toggle accordion open/close
  };

  const CollapsableNavItem = ({ eventKey, title, icon, children }) => {
    return (
      <Accordion activeKey={activeKey} onSelect={handleAccordionChange}>
        <Accordion.Item eventKey={eventKey}>
          <Accordion.Header onClick={() => handleAccordionChange(eventKey)}>
            <FontAwesomeIcon icon={icon} className="me-2" />
            {title}
          </Accordion.Header>
          <Accordion.Body>
            <Nav className="flex-column">{children}</Nav>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    );
  };

  const NavItem = ({ title, link, icon, badgeText, badgeBg = "primary" }) => {
    const isActive = pathname === link;
    return (
      <Nav.Item className={isActive ? "active" : ""}>
        <NavLink to={link} className="nav-link d-flex justify-content-between">
          <span>
            <FontAwesomeIcon icon={icon} className="me-2" />
            {title}
          </span>
          {badgeText && (
            <Badge bg={badgeBg} className="ms-2">
              {badgeText}
            </Badge>
          )}
        </NavLink>
      </Nav.Item>
    );
  };

  const getUserPermissions = (moduleName) => {
    return (
      rolePermissions.find((perm) => perm.moduleName === moduleName)
        ?.childList || []
    );
  };

  const hasPermission = (moduleName, action) => {
    const userPermissions = getUserPermissions(moduleName);
    return userPermissions.some(
      (perm) => perm.value === action && perm.isSelected
    );
  };

  return (
    <>
      <Navbar
        expand={false}
        variant="dark"
        className="d-md-none bg-primary text-white p-3"
      >
        <Navbar.Brand as={NavLink} to="/">
          Resolution Pro
        </Navbar.Brand>
        <Button
          variant="light"
          onClick={handleToggleSidebar}
          aria-controls="sidebar"
          aria-expanded={show}
        >
          <FontAwesomeIcon icon={faTimes} />
        </Button>
      </Navbar>

      <div
        className={`sidebar d-md-block bg-primary text-white p-3 ${showClass}`}
        style={{ minHeight: "100vh" }}
      >
        <div className="sidebar-inner">
          <Nav className="flex-column">
            <NavLink to="/" className="nav-link mb-3 text-white">
              <h4 className="Project-Heading">Resolution Pro</h4>
            </NavLink>

            <CollapsableNavItem
              eventKey="meeting-master/"
              title="Meetings"
              icon={faTable}
            >
              {hasPermission("Board_Meeting", "view") && (
                <NavItem title="Board Meeting" link="/meeting" />
              )}
              {hasPermission("Committee_Meeting", "view") && (
                <NavItem title="Committee Meeting" link="/committee-meeting" />
              )}
              {hasPermission("Shareholder_Meeting", "view") && (
                <NavItem
                  title="Shareholder Meeting"
                  link="/shareholder-meeting"
                />
              )}
            </CollapsableNavItem>
            {user?.role == "672c47c238903b464c9d2920" ||
            user?.role == "672c47cb38903b464c9d2923" ? (
              <CollapsableNavItem
                eventKey="approval/"
                title="Pending Approval"
                icon={faPenToSquare}
              >
                {/* {hasPermission("Members_resolution", "view") && ( */}
                <NavItem title="Approval" link="/approval-docs" />
                <NavItem title="Revise" link="/revise-docs" />
                {/* )} */}
              </CollapsableNavItem>
            ) : (
              ""
            )}

            <CollapsableNavItem
              eventKey="examples/"
              title="Master"
              icon={faFileAlt}
            >
              {hasPermission("Client_Record", "view") && (
                <NavItem title="Client Records" link="/client-records" />
              )}
              {hasPermission("Committee", "view") && (
                <NavItem title="Committee" link="/committee" />
              )}
              {hasPermission("Committee_Members", "view") && (
                <NavItem title="Committee Members" link="/committee-members" />
              )}
              {hasPermission("Document_Template", "view") && (
                <NavItem title="Document Template" link="/document-template" />
              )}
              {hasPermission("Agenda_Template", "view") && (
                <NavItem title="Agenda Template" link="/agenda-template" />
              )}
              {/* {hasPermission("Document_Template", "view") && ( */}
              <NavItem
                title="Circular Resolution"
                link="/circular-resolution"
              />
              {/* )} */}
              {/* {hasPermission("Template_group", "view") && ( */}
              <NavItem title="System Variables" link="/system-variables" />
              {/* )}  */}
              {/* <NavItem title="Meeting Template" link="/meeting-template" /> */}
            </CollapsableNavItem>
            <CollapsableNavItem eventKey="users/" title="Users" icon={faUser}>
              {hasPermission("Roles", "view") && (
                <NavItem title="Roles" link="/roles" />
              )}
              {hasPermission("Users", "view") && (
                <NavItem title="Users" link="/users" />
              )}
              {hasPermission("Permissions", "view") && (
                <NavItem title="Manage Permission" link="/role" />
              )}
            </CollapsableNavItem>
          </Nav>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
