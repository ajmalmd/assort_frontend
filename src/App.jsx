import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router";

import assort_api from "./api/axios";
import { APP_POINTS } from "./api/apiConfig";
import {
  clearAccessToken,
  getActiveOrgId,
  setAccessToken,
} from "./api/authStore";
import { useAuth } from "./context/authContext";
import { Toaster } from "react-hot-toast";

import Landing from "./pages/Landing";

import PublicOnlyRoute from "./components/public/PublicOnlyRoute";
import LoginPage from "./pages/auth/LoginPage";
import AdminLoginPage from "./pages/platform/AdminLoginPage";
import CreateOrganizationPage from "./pages/auth/CreateOrganizationPage";
import OTPVerificationPage from "./pages/auth/OTPVerificationPage";
import SetPasswordPage from "./pages/auth/SetPasswordPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";

import AcceptInvitationPage from "./pages/onboarding/AcceptInvitationPage";
import SignupPage from "./pages/onboarding/SignupPage";

import CompleteProfilePage from "./pages/onboarding/CompleteProfilePage";
import { SubscriptionRoute } from "./components/organization/SubscriptionRoute";

import ProtectedPlatformRoute from "./components/platform/ProtectedPlatformRoute";
import PlatformLayout from "./components/platform/PlatformLayout";
import AdminDashboard from "./pages/platform/AdminDashboard";
import AdminUserListPage from "./pages/platform/AdminUserListPage";
import AdminOrganizationListPage from "./pages/platform/AdminOrganizationListPage";
import AdminSubscriptionListPage from "./pages/platform/AdminSubscriptionListPage";
import AdminTicketsPage from "./pages/platform/AdminTicketsPage";

import ProtectedOrganizationRoute from "./components/organization/ProtectedOrganizationRoute";
import OrganizationLayout from "./components/organization/OrganizationLayout";
import OrgDashboard from "./pages/organization/OrgDashboard";
import MembersPage from "./pages/organization/MembersPage";
import MemberViewPage from "./pages/organization/MemberViewPage";
import DepartmentsPage from "./pages/organization/DepartmentsPage";
import ProjectsPage from "./pages/organization/ProjectsPage";
import RolesPage from "./pages/organization/RolesPage";
import JobsPage from "./pages/organization/JobsPage";
import TimesheetPage from "./pages/organization/TimesheetPage";
import ChatsPage from "./pages/organization/ChatsPage";
import SwitchOrganizationPage from "./pages/organization/SwitchOrganizationPage";

function App() {
  const [authReady, setAuthReady] = useState(false);
  const { setLoginData, activeOrganization, setActiveOrganization } = useAuth();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await assort_api.post(APP_POINTS.REFRESH_TOKEN);
        const { access, is_admin, user, organizations } = response.data;
        setAccessToken(access, is_admin);
        setLoginData({
          user,
          organizations: organizations ? organizations : [],
        });

        //handle users having multiple organizations
        const activeOrgId = getActiveOrgId();
        if (activeOrgId && !activeOrganization && organizations.length > 1) {
          setActiveOrganization(
            organizations.find((org) => org.id === Number(activeOrgId)),
          );
        }
      } catch {
        clearAccessToken();
      } finally {
        setAuthReady(true);
      }
    };

    initializeAuth();
  }, []);

  if (!authReady) return null;
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/accept-invite/:inviteToken"
            element={<AcceptInvitationPage />}
          />
          <Route path="/signup" element={<SignupPage />} />

          {/* Public only routes */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/platform/login" element={<AdminLoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/create-organization"
              element={<CreateOrganizationPage />}
            />
            <Route path="/verify-otp" element={<OTPVerificationPage />} />
            <Route path="/set-password" element={<SetPasswordPage />} />
          </Route>

          {/* Organization Pages */}
          <Route element={<ProtectedOrganizationRoute />}>
            <Route
              path="/onboarding/profile"
              element={<CompleteProfilePage />}
            />
            <Route
              path="/onboarding/subscription"
              element={<SubscriptionRoute />}
            />
            <Route path="/workspaces" element={<SwitchOrganizationPage />} />
            <Route path="/app" element={<OrganizationLayout />}>
              <Route index element={<OrgDashboard />} />
              <Route path="members" element={<MembersPage />} />
              <Route path="members/:id" element={<MemberViewPage />} />
              <Route path="departments" element={<DepartmentsPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="roles" element={<RolesPage />} />
              <Route path="jobs" element={<JobsPage />} />
              <Route path="timesheet" element={<TimesheetPage />} />
              <Route path="chats" element={<ChatsPage />} />
            </Route>
          </Route>

          {/* Platform Pages */}
          <Route element={<ProtectedPlatformRoute />}>
            <Route path="/platform" element={<PlatformLayout />}>
              {/* Default page */}
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUserListPage />} />
              <Route
                path="organizations"
                element={<AdminOrganizationListPage />}
              />
              <Route path="tickets" element={<AdminTicketsPage />} />
              <Route
                path="subscription-plans"
                element={<AdminSubscriptionListPage />}
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
