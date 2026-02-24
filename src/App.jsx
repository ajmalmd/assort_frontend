import { BrowserRouter, Routes, Route } from "react-router";
import Landing from "./pages/Landing";
import CreateOrganizationPage from "./pages/auth/CreateOrganizationPage";
import OTPVerificationPage from "./pages/auth/OTPVerificationPage";
import SetPasswordPage from "./pages/auth/SetPasswordPage";
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";

import AdminLoginPage from "./pages/platform/AdminLoginPage";
import ProtectedPlatformRoute from "./components/platform/ProtectedPlatformRoute";
import PlatformLayout from "./components/platform/PlatformLayout";
import AdminDashboard from "./pages/platform/AdminDashboard";
import AdminUserListPage from "./pages/platform/AdminUserListPage";
import AdminOrganizationListPage from "./pages/platform/AdminOrganizationListPage";
import AdminSubscriptionListPage from "./pages/platform/AdminSubscriptionListPage";
import AdminTicketsPage from "./pages/platform/AdminTicketsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        {/* Auth and create organization*/}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/create-organization" element={<CreateOrganizationPage />} />
        <Route path="/verify-otp" element={<OTPVerificationPage />} />
        <Route path="/set-password" element={<SetPasswordPage />} />

        {/* Platform Pages */}
        <Route path="/platform/login" element={<AdminLoginPage />} />
        <Route element={<ProtectedPlatformRoute />}>
          <Route path="/platform" element={<PlatformLayout />}>
            {/* Default page */}
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUserListPage />} />
            <Route path="organizations" element={<AdminOrganizationListPage />} />
            <Route path="tickets" element={<AdminTicketsPage />} />
            <Route path="subscription-plans" element={<AdminSubscriptionListPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
