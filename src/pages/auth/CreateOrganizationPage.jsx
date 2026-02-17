import AuthLayout from "@/components/common/AuthLayout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { APP_POINTS } from "@/api/apiConfig";
import { useAuthFlow } from "@/hooks/useAuthFlow";
import assort_api from "../../api/axios";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CreateOrganizationPage = () => {
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const { startFlow, clearFlow } = useAuthFlow();

  useEffect(() => {
    clearFlow();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    const trimmedTitle = title.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedTitle) {
      newErrors.title = "Organization name is required.";
    } else if (trimmedTitle.length < 3) {
      newErrors.title = "Organization name must be at least 3 characters.";
    } else if (trimmedTitle.length > 100) {
      newErrors.title = "Organization name is too long.";
    }

    if (!normalizedEmail) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(normalizedEmail)) {
      newErrors.email = "Enter a valid email address.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const trimmedTitle = title.trim();
    const normalizedEmail = email.trim().toLowerCase();

    setLoading(true);
    setErrors({});

    try {
      await assort_api.post(APP_POINTS.ORGANIZATIONS + "create/", {
        title: trimmedTitle,
        email: normalizedEmail,
      });

      startFlow({
        email: normalizedEmail,
        title: trimmedTitle,
        type: "organization",
      });

      navigate("/verify-otp", { state: { type: "organization" } });
    } catch (error) {
      if (!error.response) {
        setErrors({ general: "Network error. Please try again." });
      } else {
        const { status, data } = error.response;

        if (status === 429) {
          setErrors({ general: data.detail });
          return;
        }

        setErrors({
          general: data?.detail || "Something went wrong. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    title.trim().length >= 3 && emailRegex.test(email.trim().toLowerCase());

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-normal text-gray-900 mb-2">
            Create Organization
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* General Error */}
          {errors.general && (
            <div className="text-sm text-red-600">{errors.general}</div>
          )}

          {/* Organization Title */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Organization Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="w-full px-4 py-3 bg-gray-100 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 border border-gray-200"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Work Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full px-4 py-3 bg-gray-100 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 border border-gray-200"
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors mt-6"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default CreateOrganizationPage;
