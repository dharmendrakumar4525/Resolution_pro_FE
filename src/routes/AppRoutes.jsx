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
import CustomerMaintenanceForm from "../pages/CustomerMaintenanceForm";
import MeetingTemplate from "../pages/MeetingTemplate";
import AddMeeting from "../pages/AddMeeting";
import EditMeeting from "../pages/EditMeeting";
import ViewCommitteeMember from "../pages/CommitteeMemberView";
import TemplateGroupMeetings from "../pages/TemplateGroupMeetings";
import TemplateViewer from "../pages/TemplateView";
import ClientRecord from "../pages/ClientRecord";
import SystemVariables from "../pages/SystemVariables";

const RouteWithSidebar = ({ element }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

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
        path="/system-variables"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<SystemVariables />} />
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
        path="/template-group-meetings/:id"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<TemplateGroupMeetings />} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/template-group-meeting-view/:id"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<TemplateViewer />} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/meeting"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<Meeting />} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/meeting/add-form"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<AddMeeting />} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/meeting/edit-form/:id"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<EditMeeting />} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/meeting-template/:id"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<MeetingTemplate />} />
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
        path="/view-members/:id"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<ViewCommitteeMember />} />
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
        path="/client-cin"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<ClientRecord />} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/client-records"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<CustomerMaintenance />} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/client-records-form"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<CustomerMaintenanceForm />} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/client-records-form/:customerId"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<CustomerMaintenanceForm />} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/client-records-detail/:id"
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
            <RouteWithSidebar element={<TestFile />} />
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
