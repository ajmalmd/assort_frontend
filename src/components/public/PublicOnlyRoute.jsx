import { Navigate, Outlet } from "react-router";
import { getAccessToken, getAdminStatus } from "@/api/authStore";

const PublicOnlyRoute = () => {
  const token = getAccessToken();
  const isAdmin = getAdminStatus();

  if (!token) {
    return <Outlet />;
  }

  return <Navigate to={isAdmin ? "/platform" : "/app"} replace />;
};

export default PublicOnlyRoute;
