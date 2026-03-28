import { Navigate, Outlet, useLocation } from "react-router";
import { getAccessToken, clearAccessToken } from "@/api/authStore";
import { useAuth } from "@/context/authContext";

const ProtectedOrganizationRoute = () => {
  const token = getAccessToken();
  const { activeOrganization } = useAuth();
  const { pathname } = useLocation();

  if (!token) {
    clearAccessToken();
    return <Navigate to="/login" replace />;
  }

  if (!activeOrganization) {
    return null;
  }

  const isOnboardingRoute = pathname.startsWith("/onboarding");

  if (!activeOrganization.is_profile_completed) {
    if (pathname !== "/onboarding/profile") {
      return <Navigate to="/onboarding/profile" replace />;
    }
    return <Outlet />;
  }

  if (
    activeOrganization.role === "OWNER" &&
    activeOrganization.subscription_status === "NONE"
  ) {
    if (pathname !== "/onboarding/subscription") {
      return <Navigate to="/onboarding/subscription" replace />;
    }
    return <Outlet />;
  }

  // =========================
  // PREVENT ACCESSING ONBOARDING AFTER COMPLETION
  // =========================
  if (isOnboardingRoute) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
};

export default ProtectedOrganizationRoute;
