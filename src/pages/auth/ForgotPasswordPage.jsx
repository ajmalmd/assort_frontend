import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Mail } from "lucide-react";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import { useAuthFlow } from "@/hooks/useAuthFlow";
import AuthLayout from "@/components/common/AuthLayout";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { startFlow } = useAuthFlow();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      await assort_api.post(APP_POINTS.AUTH + "forgot/", {
        email: normalizedEmail,
      });

      startFlow({
        email: normalizedEmail,
        type: "forgot-password",
      });

      navigate("/verify-otp", { state: { type: "forgot-password" } });
    } catch (error) {
      if (!error.response) {
        setError("Network error. Please try again.");
      } else {
        const { status, data } = error.response;

        if (status === 429) {
          setError(data.message);
          return;
        }

        setError(data.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-3xl font-normal text-gray-900 mb-2">
            Forgot Password
          </h1>
          <p className="text-gray-600">Enter your email to get OTP</p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-700 text-sm">
              OTP sent successfully! Redirecting...
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>

            <div className="relative">
              <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400" />

              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                disabled={loading}
              />
            </div>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
          >
            {loading ? "Sending..." : "SEND OTP"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Know your password?{" "}
            <Link
              to="/login"
              className="text-gray-900 font-semibold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
