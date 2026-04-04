import { useState, useEffect } from "react";
import { MinusSquareIcon } from "lucide-react";
import Select from "react-select";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import toast from "react-hot-toast";

const ROLES = [
  { label: "Admin", value: "ADMIN" },
  { label: "Project Manager", value: "PROJECT_MANAGER" },
  { label: "Member", value: "MEMBER" },
];

export function InviteMemberModal({ isOpen, onClose, onSendInvitation }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department_id: null, // backend expects integer ID
    role: "MEMBER",
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await assort_api.get(
          APP_POINTS.ORGANIZATIONS + "departments/",
        );
        if (response.data) setDepartments(response.data);
      } catch (error) {
        console.error("Failed to fetch departments", error);
      }
    };
    fetchDepartments();
  }, []);

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!formData.role) newErrors.role = "Please select a role";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset form
  const resetForm = () => {
    setFormData({ name: "", email: "", department_id: null, role: "MEMBER" });
    setErrors({});
  };

  // Close modal
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Submit form to API
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = { ...formData };
      const response = await assort_api.post(
        APP_POINTS.INVITATIONS + "create/",
        payload,
      );
      toast.success("Invitation sent");

      onSendInvitation(formData); // callback to parent
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to send invitation:", error.response || error);
      toast.error(
        error.response.data.message
          ? error.response.data.message
          : "Failed to send invitation",
      );

      // Show backend validation errors if any
      if (error.response?.data) {
        const backendErrors = {};
        for (const key in error.response.data) {
          backendErrors[key] = error.response.data[key][0];
        }
        setErrors(backendErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-lg shadow-lg z-50 mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-normal text-gray-900">
              Invite Member
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Send an invitation to a new member to join your organization.
            </p>
          </div>
          <button
            onClick={() => onClose()}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MinusSquareIcon size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Name
            </label>
            <input
              type="text"
              placeholder="e.g., John Doe"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="e.g., john@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={`w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Department */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Department (Optional)
              </label>
              <Select
                options={departments.map((d) => ({
                  label: d.name,
                  value: d.id,
                }))}
                value={
                  formData.department_id
                    ? {
                        label: departments.find(
                          (d) => d.id === formData.department_id,
                        )?.name,
                        value: formData.department_id,
                      }
                    : null
                }
                onChange={(option) =>
                  setFormData({
                    ...formData,
                    department_id: option ? option.value : null,
                  })
                }
                className="w-full"
                classNamePrefix="custom-select"
                isClearable
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Role
              </label>
              <Select
                options={ROLES}
                value={ROLES.find((o) => o.value === formData.role)}
                onChange={(option) =>
                  setFormData({ ...formData, role: option.value })
                }
                className="w-full"
                classNamePrefix="custom-select"
              />
              {errors.role && (
                <p className="text-red-600 text-sm mt-1">{errors.role}</p>
              )}
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Sending..." : "Send Invitation"}
          </button>
        </div>
      </div>
    </>
  );
}
