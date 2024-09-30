import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import CircularResolution from "../pages/CircularResolution";
import TemplateGroup from "../pages/TemplateGroup";
import Meeting from "../pages/Meeting";
import LoginPage from "../pages/Login";
import Users from "../pages/Users";
import ErrorPage from "../pages/ErrorPage";
import OtpPage from "../pages/OtpPage";
import { useAuth } from "../context/AuthContext";
import CustomerMaintenance from "../pages/CustomerMaintenance";
import MeetingAgendaTemplate from "../pages/MeetingAgendaTemplate";
import CommitteeMembers from "../pages/CommitteeMembers";
import Preloader from "../components/Preloader";
import Sidebar from "../components/Sidebar";

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
        path="/circular-resolution"
        element={
          isAuthenticated ? (
            <RouteWithSidebar element={<CircularResolution />} />
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

      {/* Fallback for undefined routes */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
};

export default AppRoutes;
