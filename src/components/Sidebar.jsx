import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faTable,
  faSignOutAlt,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { Nav, Navbar, Button, Accordion, Badge } from "react-bootstrap";
import ProfilePicture from "../assets/img/team/profile-picture-3.jpg";

export default function Sidebar() {
  const location = useLocation();
  const { pathname } = location;

  const [show, setShow] = useState(false);
  const [activeKey, setActiveKey] = useState(""); // New state for active key
  const showClass = show ? "show" : "";

  const handleToggleSidebar = () => setShow(!show);

  const handleAccordionChange = (eventKey) => {
    setActiveKey(activeKey === eventKey ? "" : eventKey); // Toggle accordion open/close
  };

  const CollapsableNavItem = ({ eventKey, title, icon, children }) => {
    const defaultKey = pathname.includes(eventKey) ? eventKey : "";

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
              eventKey="tables/"
              title="Resolution"
              icon={faTable}
            >
              <NavItem
                title="Resolution Master Data"
                link="/circular-resolution"
              />
            </CollapsableNavItem>

            <CollapsableNavItem
              eventKey="examples/"
              title="Master"
              icon={faFileAlt}
            >
              <NavItem title="Template Group" link="/template-group" />
              <NavItem title="Meeting Template" link="/meeting-template" />
              <NavItem
                title="Meeting Agenda Template"
                link="/meeting-agenda-template"
              />
              <NavItem title="Committee Members" link="/committee-members" />
              <NavItem title="Users" link="/users" />
              <NavItem
                title="Customer Maintenance"
                link="/customer-maintenance"
              />
            </CollapsableNavItem>
          </Nav>
        </div>
      </div>
    </>
  );
}
