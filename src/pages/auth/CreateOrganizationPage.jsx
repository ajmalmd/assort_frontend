import AuthLayout from "@/components/common/AuthLayout";
import { useState } from "react";
import { useNavigate } from "react-router";

const CreateOrganizationPage = () => {
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Replace with real API call
      console.log("Create organization:", { title, email });

      // Simulated API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      localStorage.setItem("otp_sent_time", Date.now().toString());
      // Navigate properly using React Router
      navigate("/verify-otp");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-normal text-gray-900 mb-2">
            Create Organization
          </h2>
          {/* <p className="text-sm text-gray-600">
            Start by setting up your workspace.
          </p> */}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Organization Title */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Organization Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder=""
              required
              className="w-full px-4 py-3 bg-gray-100 text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 border border-gray-200"
            />
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
              required
              className="w-full px-4 py-3 bg-gray-100 text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 border border-gray-200"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-700 text-white font-medium py-3 rounded-lg transition-colors mt-6"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}

export default CreateOrganizationPage