import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiURL } from "../API/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const checkAuthentication = () => {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        setIsAuthenticated(true);
        navigate("/");
      } else {
        setIsAuthenticated(false);
        navigate("/login");
      }
    };

    checkAuthentication();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${apiURL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        const { tokens, user } = data;

        // Store tokens and user details in local storage
        localStorage.setItem("accessToken", tokens.access.token);
        localStorage.setItem("refreshToken", tokens.refresh.token);
        localStorage.setItem("user", JSON.stringify(user));

        setIsAuthenticated(true);
        toast.success("Login successful!");
        navigate("/");
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred. Please try again.");
    }
  };

  // const logout = async () => {
  //   const refreshToken = localStorage.getItem("refreshToken");
  //   try {
  //     const res = await fetch(`${apiURL}auth/logout`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ refreshToken }),
  //     });
  //     console.log("Res", res);
  //     if (res.ok) {
  //       localStorage.removeItem("accessToken");
  //       localStorage.removeItem("refreshToken");
  //       localStorage.removeItem("user");
  //       localStorage.removeItem("openTabs");
  //       setIsAuthenticated(false);
  //       toast.info("Logged out successfully.");
  //       navigate("/login");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const logout = async () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("openTabs");
    setIsAuthenticated(false);
    toast.info("Logged out successfully.");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
      <ToastContainer />
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
