import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthState } from "@/redux/hooks";

const VALID_SUBSCRIPTIONS = ["ACTIVE", "TRIAL"];

const ProtectedOrganizationRoute = () => {
  const { user, organizations, activeOrganization } = useAuthState();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (location.pathname === "/workspaces") {
    return <Outlet />;
  }

  // Multi-org but none selected → force workspace selection
  if (organizations.length > 1 && !activeOrganization) {
    return <Navigate to="/workspaces" replace />;
  }

  const org = activeOrganization || organizations[0];

  // OWNER onboarding enforcement
  if (org.role === "OWNER") {
    if (!org.is_profile_completed) {
      if (location.pathname !== "/onboarding/profile") {
        return <Navigate to="/onboarding/profile" replace />;
      }
    } else if (!VALID_SUBSCRIPTIONS.includes(org.subscription_status)) {
      if (location.pathname !== "/onboarding/subscription") {
        return <Navigate to="/onboarding/subscription" replace />;
      }
    }
  }

  return <Outlet />;
};

export default ProtectedOrganizationRoute;
