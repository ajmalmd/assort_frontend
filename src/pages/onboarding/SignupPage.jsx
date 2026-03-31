import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { setAccessToken } from "@/api/authStore";
import { useAuth } from "@/context/authContext";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import DotsBg from "@/assets/images/DotsBg.png";
import { Eye, EyeOff } from "lucide-react";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const { setLoginData } = useAuth();

  const inviteToken = location.state?.inviteToken;
  const email = location.state?.email;
  const full_name = location.state?.full_name;

  useEffect(() => {
    if (!inviteToken || !email) {
      navigate("/", { replace: true });
    }
    if (full_name) {
      setName(full_name);
    }
  }, [inviteToken, email, full_name, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await assort_api.post(APP_POINTS.AUTH + "signup/", {
        token: inviteToken,
        password: password,
        confirm_password: confirmPassword,
        full_name: name,
      });

      const { access, user, organizations } = response.data;

      setAccessToken(access, false);

      setLoginData({
        user,
        organizations,
      });

      if (organizations.length > 1) {
        navigate("/workspaces");
      } else {
        navigate("/app");
      }
    } catch (err) {
      if (!err.response) {
        setError("Network error");
      } else {
        setError(err.response.data.error || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex bg-repeat py-12 px-4 sm:px-6 lg:px-8 justify-center items-center"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${DotsBg})`,
      }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <div className="max-w-md mx-auto w-full space-y-6 bg-white">
          <div>
            <h2 className="text-2xl font-normal text-gray-900">Set Password</h2>
            <p className="text-sm text-gray-600 mt-1">
              Complete your account to accept the invitation
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="w-full px-4 py-3 bg-gray-100 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 border border-gray-200"
              />
            </div>

            {email && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 text-gray-600 rounded-lg border border-gray-200"
                />
              </div>
            )}

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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-700 text-white font-medium py-3 rounded-lg transition-colors mt-6"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
