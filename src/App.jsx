import { BrowserRouter, Routes, Route } from "react-router";
import Landing from "./pages/Landing";
import CreateOrganizationPage from "./pages/auth/CreateOrganizationPage";
import OTPVerificationPage from "./pages/auth/OTPVerificationPage";
import SetPasswordPage from "./pages/auth/SetPasswordPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/create-organization" element={<CreateOrganizationPage />} />
        <Route path="/verify-otp" element={<OTPVerificationPage />} />
        <Route path="/set-password" element={<SetPasswordPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
