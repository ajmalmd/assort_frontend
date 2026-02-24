import { Navigate, Outlet } from "react-router";
import { useEffect, useState } from "react";
import { getAccessToken, getAdminStatus } from "@/api/authStore";
import { tryRefresh } from "@/api/authService";

const ProtectedPlatformRoute = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken();
      const isAdmin = getAdminStatus();

      if (token && isAdmin) {
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      // Try refresh if no access token
      const refreshed = await tryRefresh();
      setIsAuthenticated(refreshed);
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) return null; // or loading spinner

  if (!isAuthenticated) {
    return <Navigate to="/platform/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedPlatformRoute;
