import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router";

import assort_api from "./api/axios";
import { APP_POINTS } from "./api/apiConfig";
import {
  clearAccessToken,
  getActiveOrgId,
  setAccessToken,
} from "./api/authStore";

import { getPostLoginRoute } from "./utils/authRedirect";
import { useAppDispatch } from "./redux/hooks";
import { setLoginData, setActiveOrganization } from "./redux/slices/authSlice";

import Landing from "./pages/Landing";
import LogoutPage from "./pages/auth/LogoutPage";

import PublicOnlyRoute from "./components/public/PublicOnlyRoute";
import LoginPage from "./pages/auth/LoginPage";
import AdminLoginPage from "./pages/platform/AdminLoginPage";
import CreateOrganizationPage from "./pages/auth/CreateOrganizationPage";
import OTPVerificationPage from "./pages/auth/OTPVerificationPage";
import SetPasswordPage from "./pages/auth/SetPasswordPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";

import AcceptInvitationPage from "./pages/onboarding/AcceptInvitationPage";
import SignupPage from "./pages/onboarding/SignupPage";

import ProtectedPlatformRoute from "./components/platform/ProtectedPlatformRoute";
import PlatformLayout from "./components/platform/PlatformLayout";
import AdminDashboardPage from "./pages/platform/AdminDashboardPage";
import AdminUserListPage from "./pages/platform/AdminUserListPage";
import UserDetailPage from "./pages/platform/UserDetailPage";
import AdminOrganizationListPage from "./pages/platform/AdminOrganizationListPage";
import OrganizationDetailPage from "./pages/platform/OrganizationDetailPage";
import AdminSubscriptionListPage from "./pages/platform/AdminSubscriptionListPage";
import AdminTicketsPage from "./pages/platform/AdminTicketsPage";

import ProtectedOrganizationRoute from "./components/organization/ProtectedOrganizationRoute";

import CompleteProfilePage from "./pages/onboarding/CompleteProfilePage";
import { SubscriptionRoute } from "./components/organization/SubscriptionRoute";
import SwitchOrganizationPage from "./pages/organization/SwitchOrganizationPage";
import Profile from "./pages/organization/Profile";

import OrganizationLayout from "./components/organization/OrganizationLayout";
import Dashboard from "./pages/organization/Dashboard";
import MembersPage from "./pages/organization/MembersPage";
import MemberDetailPage from "./pages/organization/MemberDetailPage";
import DepartmentsPage from "./pages/organization/DepartmentsPage";
import DepartmentDetailPage from "./pages/organization/DepartmentDetailPage";
import ProjectsPage from "./pages/organization/ProjectsPage";
import ProjectDetailPage from "./pages/organization/ProjectDetailPage";
import ProjectTaskDetailPage from "./pages/organization/ProjectTaskDetailPage";
import ProjectJobDetailPage from "./pages/organization/ProjectJobDetailPage";
import JobsPage from "./pages/organization/JobsPage";
import TimesheetPage from "./pages/organization/TimesheetPage";
import ChatsPage from "./pages/organization/ChatsPage";
import TimesheetDetailPage from "./pages/organization/TimesheetDetailPage";

function AppRoutes() {
  const navigate = useNavigate();

  const [authReady, setAuthReady] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await assort_api.post(APP_POINTS.REFRESH_TOKEN);
        const { access, is_admin, user, organizations } = response.data;

        setAccessToken(access, is_admin);

        dispatch(
          setLoginData({
            user,
            organizations: organizations || [],
          }),
        );

        // determine active org FIRST
        let activeOrg = null;
        if (!is_admin) {
          if (organizations.length === 1) {
            activeOrg = organizations[0];
          } else if (organizations.length > 1) {
            const activeOrgId = getActiveOrgId();

            activeOrg = organizations.find(
              (org) => org.id === Number(activeOrgId),
            );
          }

          if (activeOrg) {
            dispatch(setActiveOrganization(activeOrg));
          }

          if (window.location.pathname === "/login") {
            const route = getPostLoginRoute(organizations);
            navigate(route, { replace: true });
          }
        }
      } catch (err) {
        console.log(err);
        clearAccessToken();
      } finally {
        setAuthReady(true);
      }
    };

    initializeAuth();
  }, []);

  if (!authReady) return null;

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/logout" element={<LogoutPage />} />
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
        <Route path="/onboarding/profile" element={<CompleteProfilePage />} />
        <Route
          path="/onboarding/subscription"
          element={<SubscriptionRoute />}
        />
        <Route path="/workspaces" element={<SwitchOrganizationPage />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/app" element={<OrganizationLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="member/:id" element={<MemberDetailPage />} />
          <Route path="departments" element={<DepartmentsPage />} />
          <Route path="department/:id" element={<DepartmentDetailPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="project/:projectId" element={<ProjectDetailPage />} />
          <Route
            path="project/task/:taskId"
            element={<ProjectTaskDetailPage />}
          />
          <Route path="project/job/:jobId" element={<ProjectJobDetailPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="timesheet" element={<TimesheetPage />} />
          <Route
            path="timesheet/work-log/:date"
            element={<TimesheetDetailPage />}
          />
          <Route path="chats" element={<ChatsPage />} />
        </Route>
      </Route>

      {/* Platform Pages */}
      <Route element={<ProtectedPlatformRoute />}>
        <Route path="/platform" element={<PlatformLayout />}>
          {/* Default page */}
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUserListPage />} />
          <Route path="user/:id" element={<UserDetailPage />} />
          <Route path="organizations" element={<AdminOrganizationListPage />} />
          <Route path="organization/:id" element={<OrganizationDetailPage />} />
          <Route path="tickets" element={<AdminTicketsPage />} />
          <Route
            path="subscription-plans"
            element={<AdminSubscriptionListPage />}
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;
