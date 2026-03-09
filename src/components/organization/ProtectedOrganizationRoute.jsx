import { Navigate, Outlet } from "react-router";
import {
  clearAccessToken,
  getAccessToken,
  getAdminStatus,
} from "@/api/authStore";

const ProtectedOrganizationRoute = () => {
  const token = getAccessToken();
  const isAdmin = getAdminStatus();

  if (token && isAdmin) return <Navigate to="/platform" replace />;
  if (!token) {
    clearAccessToken();
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedOrganizationRoute;
