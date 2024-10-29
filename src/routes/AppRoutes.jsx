import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import TemplateGroup from "../pages/TemplateGroup";
import Meeting from "../pages/Meeting";
import LoginPage from "../pages/Login";
import Users from "../pages/Users";
import ErrorPage from "../pages/ErrorPage";
import OtpPage from "../pages/OtpPage";
import { useAuth } from "../context/AuthContext";
import CustomerMaintenance from "../pages/CustomerMaintenance";
import Directors from "../pages/Directors";
import MeetingAgendaTemplate from "../pages/MeetingAgendaTemplate";
import CommitteeMembers from "../pages/CommitteeMembers";
import Committee from "../pages/Committee";
import Preloader from "../components/Preloader";
import Sidebar from "../components/Sidebar";
import MembersResolution from "../pages/MembersResolution";
import BoardResolution from "../pages/BoardResolution";
import CustomerMaintenanceDetail from "../pages/CustomerMaintenanceDetails";
import ManagePermissions from "../pages/ManagePermissions";
import RoleMaster from "../pages/RoleMaster";
import WordGenerator from "../pages/WordGenerator";
import DocumentEditor from "../pages/DocumentEditor";
import TemplateEditor from "../pages/TemplateEditor";
import TemplateGenerator from "../pages/TemplateGenerator";
import TestFile from "../pages/TestFile";
import AddCommitteeMember from "../pages/AddCommitteeMember";
import EditCommitteeMember from "../pages/EditCommitteeMember";

const RouteWithSidebar = ({ element }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const localStorageIsSettingsVisible = () => {
    return localStorage.getItem("settingsVisible") === "false" ? false : true;
  };

  const [showSettings, setShowSettings] = useState(
    localStorageIsSettingsVisible
  );

  const toggleSettings = () => {
    setShowSettings(!showSettings);
    localStorage.setItem("settingsVisible", !showSettings);
  };

  return (
    <>
      <Preloader show={!loaded} />
      <Sidebar />
      <main className="content">{element}</main>
    </>
  );
};

const AppRoutes = () => {
  const { isAuthenticated, isVerified } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={!isVerified ? <LoginPage /> : <Navigate to="/" />}
      />
      <Route
        path="/otp"
        element={!isAuthenticated ? <OtpPage /> : <Navigate to="/" />}
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<Home />} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/committee"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<Committee />} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/roles"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<RoleMaster />} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/members-resolution"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<MembersResolution />} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/board-resolution"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<BoardResolution />} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/wordgenerator"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<WordGenerator />} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/template-generate/:id"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<TemplateGenerator />} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/template-edit/:id"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<TemplateEditor />} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/doc-editor"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<DocumentEditor />} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/template-group"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<TemplateGroup />} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/meeting-template"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<Meeting />} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/meeting-agenda-template"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<MeetingAgendaTemplate />} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/committee-members"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<CommitteeMembers />} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
       <Route
        path="/committee-members/add-form"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<AddCommitteeMember />} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/committee-members/edit-form/:id"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<EditCommitteeMember />} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/users"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<Users />} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/customer-maintenance"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<CustomerMaintenance />} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/customer-maintenance-detail/:id"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<CustomerMaintenanceDetail />} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/directors/:id"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<Directors />} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
     
      
      <Route
        path="/role"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<ManagePermissions />} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/test"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<TestFile/>} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Fallback for undefined routes */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
};

export default AppRoutes;
