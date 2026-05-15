import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { APP_POINTS } from "@/api/apiConfig";
import assort_api from "@/api/axios";
import AuthLayout from "@/components/common/AuthLayout";
import {
  getAccessToken,
  getAdminStatus,
  setAccessToken,
} from "@/api/authStore";
import { getPostLoginRoute } from "@/utils/authRedirect";
import { useAppDispatch, useAuthState } from "@/redux/hooks";
import { setLoginData } from "@/redux/slices/authSlice";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const token = getAccessToken();
  const isAdmin = getAdminStatus();
  const { organizations } = useAuthState();
  const dispatch = useAppDispatch();
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite_token");

  if (token) {
    if (isAdmin) {
      return <Navigate to="/platform" replace />;
    }

    if (organizations && organizations.length > 0) {
      const route = getPostLoginRoute(organizations);
      return <Navigate to={route} replace />;
    }

    return null;
  }

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
      const response = await assort_api.post(APP_POINTS.AUTH + "login/", {
        email: normalizedEmail,
        password,
      });

      // store token
      if (response.status === 200) {
        const { access, user, organizations } = response.data;
        const is_admin = false;

        setAccessToken(access, is_admin);

        // store data in redux state
        dispatch(setLoginData({ user, organizations }));

        if (inviteToken) {
          window.location.replace(`/accept-invite/${inviteToken}`);
          return;
        }
        const route = getPostLoginRoute(organizations);
        navigate(route, { replace: true });
      }
    } catch (error) {
      if (!error.response) {
        setError("Network error.");
      } else {
        setError(
          error.response.data.message ||
            "Something went wrong. Please try again.",
        );
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
            Welcome back
          </h2>
          <p className="text-gray-600 text-sm">
            Enter your credentials to access your account
          </p>
        </div>

        <form onSubmit={handleSubmit} autoComplete="on" className="space-y-5">
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
                name="email"
                autoComplete="username"
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
                name="password"
                autoComplete="current-password"
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

          {/* Forgot Password */}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-gray-900 hover:underline"
            >
              Forgot Password?
            </Link>
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

        {/* Create Org */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-gray-600 text-sm text-center">
            Do you want to manage your projects?{" "}
            <Link
              to="/create-organization"
              className="font-semibold text-gray-900 hover:underline"
            >
              Create Organization
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
