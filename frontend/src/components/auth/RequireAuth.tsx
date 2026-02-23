import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../../auth";

const RequireAuth: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { isAuthenticated } = useAuthContext();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
