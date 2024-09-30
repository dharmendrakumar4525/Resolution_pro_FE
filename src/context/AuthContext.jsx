import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiURL } from "../API/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false); // New state for OTP verification
  const [emailForOtp, setEmailForOtp] = useState("");
  const navigate = useNavigate();
  const navigate2 = useNavigate();

  useEffect(() => {
    const checkAuthentication = () => {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        setIsAuthenticated(true);
        setIsVerified(true);
        setOtpVerified(true);
      } else {
        setIsAuthenticated(false);
      }
    };
    checkAuthentication();
  }, [navigate]);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${apiURL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        setEmailForOtp(email);
        toast.info("Please enter the OTP sent to your email.");
        setIsVerified(true);
        navigate2("/otp");
        console.log("chll gyaaa");
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred. Please try again.");
    }
  };

  const verifyOtp = async (otp) => {
    try {
      const res = await fetch(`${apiURL}/auth/login/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        toast.success("OTP verified successfully!");
        navigate("/");
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred. Please try again.");
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
      }}
    >
      {children}
      <ToastContainer />
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
