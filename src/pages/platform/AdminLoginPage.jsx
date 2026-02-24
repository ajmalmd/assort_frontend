import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import AuthLayout from "@/components/common/AuthLayout";
import { setAccessToken, clearAccessToken } from "@/api/authStore";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const validateForm = () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!emailRegex.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return false;
    }

    if (!password) {
      setError("Password is required.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const normalizedEmail = email.trim().toLowerCase();

    setLoading(true);
    setError("");

    try {
      const response = await assort_api.post(APP_POINTS.PLATFORM + "login/", {
        email: normalizedEmail,
        password,
      });

      // store token securely
      if (response.status === 200) {
        const { access, is_admin } = response.data;

        setAccessToken(access, is_admin);

        navigate("/platform", { replace: true });
      }
    } catch (error) {
      
      if (!error.response) {
        setError("Network error.");
      } else {
        setError(error.response.data.detail || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    emailRegex.test(email.trim().toLowerCase()) && password.length > 7;

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-normal text-gray-900 mb-2">
            Admin Login
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="text-sm text-red-600">{error}</div>}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 border border-gray-200"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3 bg-gray-50 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 border border-gray-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors mt-8"
          >
            {loading ? "Signing in..." : "SIGN IN"}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default AdminLoginPage;
