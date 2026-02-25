import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "@/components/common/AuthLayout";
import { useAuthFlow } from "@/hooks/useAuthFlow";
import { APP_POINTS } from "@/api/apiConfig";
import assort_api from "../../api/axios";

export default function SetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { requireStep, clearFlow } = useAuthFlow();

  const flow = requireStep("password");

  useEffect(() => {
    if (!flow) {
      navigate("/verify-otp", { replace: true });
    }
  }, []);

  /* ---------------------------
       URL
    ----------------------------*/
  const setPasswordUrl = useMemo(() => {
    if (!flow) return {};

    if (flow.type === "organization") {
      return APP_POINTS.ORGANIZATIONS + "set-password/";
    }

    if (flow.type === "forgot-password") {
      return APP_POINTS.AUTH + "set-password/";
    }

    return "";
  }, [flow]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const reqBody = {
      email: flow.email,
      verification_token: flow.verificationToken,
      password: password,
      confirm_password: confirmPassword,
    };
    if (flow.type === "organization") {
      reqBody.title = flow.title;
    }

    try {
      await assort_api.post(setPasswordUrl, reqBody);

      clearFlow();
      navigate("/");
    } catch (err) {
      if (!err.response) {
        setError("Network error. Please try again.");
      } else {
        const { status, data } = err.response;

        if (status === 429) {
          setError(data?.message);
          return;
        }

        if (data?.error_code === "TOKEN_EXPIRED") {
          navigate("/create-organization", { replace: true });
          return;
        }

        setError(data?.message || "An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-normal text-gray-900">Set Password</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 pr-12 bg-gray-100 text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 border border-gray-200"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                className="w-full px-4 py-3 pr-12 bg-gray-100 text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 border border-gray-200"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !password || !confirmPassword}
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-700 text-white font-medium py-3 rounded-lg transition-colors mt-6"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
