import { Navigate, Outlet } from "react-router";
import { getAccessToken, getAdminStatus } from "@/api/authStore";

const ProtectedPlatformRoute = () => {
  const token = getAccessToken();
  const isAdmin = getAdminStatus();

  if (!token || !isAdmin) {
    return <Navigate to="/platform/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedPlatformRoute;
