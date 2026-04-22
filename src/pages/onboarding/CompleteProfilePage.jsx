import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Upload, LogOut } from "lucide-react";
import DotsBg from "@/assets/images/DotsBg.png";
import { useAuth } from "@/context/authContext";
import { getInitials } from "@/appFunctions";
import { logout } from "@/api/utility";
import { APP_POINTS } from "@/api/apiConfig";
import assort_api from "@/api/axios";
import toast from "react-hot-toast";

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const { user, activeOrganization, setLoginData, organizations } = useAuth();

  const hasRedirected = useRef(false);

  const [formData, setFormData] = useState({
    email: "",
    city: "",
    country: "",
    logo: null,
  });

  const [isSaving, setIsSaving] = useState(false);

  // Sync formData when activeOrganization loads (async safe)
  useEffect(() => {
    if (!activeOrganization) return;

    setFormData({
      email: activeOrganization.email || "",
      city: activeOrganization.city || "",
      country: activeOrganization.country || "",
      logo: activeOrganization.logo || null,
    });
  }, [activeOrganization?.id]); // stable dependency

  // Redirect logic (no infinite loop)
  useEffect(() => {
    if (!activeOrganization || hasRedirected.current) return;

    if (!activeOrganization.is_profile_completed) return;

    if (activeOrganization.role !== "OWNER") {
      hasRedirected.current = true;
      navigate("/app", { replace: true });
      return;
    }

    if (["ACTIVE", "TRIAL"].includes(activeOrganization.subscription_status)) {
      hasRedirected.current = true;
      navigate("/app", { replace: true });
      return;
    }
  }, [
    activeOrganization?.id,
    activeOrganization?.role,
    activeOrganization?.subscription_status,
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => ({
        ...prev,
        logo: e.target?.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({
      ...prev,
      logo: null,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const form = new FormData();
    form.append("email", formData.email);
    form.append("city", formData.city);
    form.append("country", formData.country);

    if (formData.logo) {
      form.append("logo", formData.logo);
    }

    try {
      const response = await assort_api.patch(
        APP_POINTS.ORGANIZATIONS + "complete-profile/",
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response.status === 200) {
        const updatedOrg = response.data;

        setLoginData({
          user,
          organizations: organizations.map((org) =>
            org.id === updatedOrg.id
              ? { ...org, is_profile_completed: true }
              : org,
          ),
        });
      }

      navigate("/onboarding/subscription", { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => await logout(false);

  // Prevent render crash while loading
  if (!activeOrganization) return null;

  return (
    <div
      className="min-h-screen flex bg-repeat py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${DotsBg})`,
      }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              Organization Profile
            </h1>
            <p className="text-gray-600 mt-2">
              Let's set up your organization before you get started
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-100 border border-gray-300 rounded-lg bg-gray-800 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <form onSubmit={handleSave}>
            <div className="p-8 space-y-8">
              {/* Logo */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Organization Logo
                </label>

                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 relative">
                    {typeof formData.logo === "string" &&
                    formData.logo.length > 20 ? (
                      <img
                        src={formData.logo}
                        alt="Organization logo"
                        className="w-16 h-16 rounded-lg object-fill bg-gray-100"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-300 flex items-center justify-center">
                        <span className="text-lg font-semibold text-gray-700">
                          {getInitials(activeOrganization?.title || "")}
                        </span>
                      </div>
                    )}

                    {formData.logo && formData.logo.length > 20 && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-gray-100"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <Upload size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {formData.logo && formData.logo.length > 20
                        ? "Change Logo"
                        : "Add Logo"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name
                </label>
                <input
                  disabled
                  value={activeOrganization?.title || ""}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Email */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              {/* City + Country */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Country"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end px-8 py-6 border-t bg-gray-50">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg"
              >
                {isSaving ? "Saving..." : "Continue"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
