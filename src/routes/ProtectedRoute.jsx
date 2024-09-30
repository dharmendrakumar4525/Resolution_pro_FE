import React, { useContext } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? element : <Navigate to="/otp" />;
};

export default ProtectedRoute;
