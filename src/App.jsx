import { BrowserRouter, Routes, Route } from "react-router";
import Landing from "./pages/Landing";
import CreateOrganizationPage from "./pages/auth/CreateOrganizationPage";
import OTPVerificationPage from "./pages/auth/OTPVerificationPage";
import SetPasswordPage from "./pages/auth/SetPasswordPage";
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";

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
        

      </Routes>
    </BrowserRouter>
  );
}

export default App;
