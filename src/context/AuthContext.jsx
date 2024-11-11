import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiURL } from "../API/api";
import { useLocation } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [emailForOtp, setEmailForOtp] = useState("");
  const [rolePermissions, setRolePermissions] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch user from localStorage if exists
  const user = JSON.parse(localStorage.getItem("user")) || {};

  // Check if the user is authenticated on component mount
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      setIsAuthenticated(true);
      setIsVerified(true);
      setOtpVerified(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Fetch user permissions based on their role
  useEffect(() => {
    const fetchUserPermissions = async () => {
      if (user.role) {
        try {
          const token = 'localStorage.getItem("refreshToken")';
          const response = await fetch(`${apiURL}/role`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          const rolePermissionData = await response.json();
          const permittedRole = rolePermissionData.results.find(
            (result) => result.id === user.role
          );

          if (permittedRole && permittedRole.dashboard_permissions.length > 0) {
            const permissions =
              permittedRole.dashboard_permissions[0].ParentChildchecklist;
            setRolePermissions(permissions);
          }
        } catch (error) {
          console.error("Error fetching role permissions:", error);
        }
      }
    };
    fetchUserPermissions();
  }, [user.role]);

  const login = async (email, password) => {
    const token = 'localStorage.getItem("refreshToken")';

    try {
      const res = await fetch(`${apiURL}/auth/login`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        setEmailForOtp(email);
        setIsVerified(true);
        toast.info("Please enter the OTP sent to your email.");
        navigate("/otp");
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("An error occurred during login. Please try again.");
    }
  };

  const verifyOtp = async (otp) => {
    const token = 'localStorage.getItem("refreshToken")';
    try {
      const res = await fetch(`${apiURL}/auth/login/verify-otp`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailForOtp, otp }),
      });

      if (res.ok) {
        const data = await res.json();
        const { tokens, user } = data;

        localStorage.setItem("accessToken", tokens.access.token);
        localStorage.setItem("refreshToken", tokens.refresh.token);
        localStorage.setItem("user", JSON.stringify(user));

        setIsAuthenticated(true);
        setOtpVerified(true);
        // toast.success("OTP verified successfully!");

        navigate("/");
      } else {
        const errorData = await res.json();
        if (location.pathname === `/otp`) {
          toast.error(errorData.message || "Wrong OTP. Please try again.");
        }
      }
    } catch (err) {
      console.error("OTP verification error:", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setIsVerified(false);
    setOtpVerified(false);
    toast.info("Logged out successfully.");
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        otpVerified,
        isVerified,
        login,
        logout,
        verifyOtp,
        rolePermissions,
      }}
    >
      {children}
      <ToastContainer autoClose={2000} />
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
