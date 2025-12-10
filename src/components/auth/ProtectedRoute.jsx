// src/components/auth/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export function ProtectedRoute({ children, allowedRoles }) {
  const { accessToken, user } = useAuthStore();
  const location = useLocation();

  // 1) Not logged in at all → go to login
  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 2) If roles are specified, enforce them
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      // In future, you might want a dedicated /unauthorized page.
      return <Navigate to="/login" replace />;
    }
  }

  // 3) All good
  return children;
}
