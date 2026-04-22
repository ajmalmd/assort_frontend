import { useState, useEffect } from "react";
import { AlertTriangle, Upload } from "lucide-react";
import { formatEnum, getInitials } from "@/appFunctions";
import assort_api from "@/api/axios";
import { APP_POINTS, MEDIA_URL } from "@/api/apiConfig";
import toast from "react-hot-toast";
import { logout } from "@/api/utility";

const OrganizationProfilePage = () => {
  const [profile, setProfile] = useState({
    title: "",
    email: "",
    logo: null,
    city: "",
    country: "",
  });

  const [statistics, setStatistics] = useState({
    members_count: 0,
  });

  const [subscription, setSubscription] = useState({
    current_plan: "",
    end_date: "",
    billing_cycle: "",
    members_limit: 0,
    plan_cost: 0,
    start_date: "",
    status: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchData = async () => {
    try {
      const response = await assort_api.get(
        APP_POINTS.ORGANIZATIONS + "profile/",
      );

      const data = response.data;
      setProfile(data.organization);
      setStatistics(data.statistics);
      setSubscription(data.subscription);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleSaveChanges = async () => {
    try {
      const formData = new FormData();

      formData.append("title", profile.title);
      formData.append("email", profile.email);
      formData.append("city", profile.city);
      formData.append("country", profile.country);

      // Handle logo cases
      if (profile.logo === null) {
        formData.append("logo", ""); // triggers removal
      } else if (profile.logo instanceof File) {
        formData.append("logo", profile.logo);
      }

      await assort_api.patch(
        APP_POINTS.ORGANIZATIONS + "update-profile/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.log(error);
      toast.error("Couldn't update profile");
    }
  };

  const handleDelete = async () => {
    try {
      try {
        await assort_api.delete(
          APP_POINTS.ORGANIZATIONS + "delete-organization/",
        );
      } catch (err) {
        console.log("Delete error:", err);
        toast.error("Couldn't delete organization");
      }
      await logout();
    } catch (error) {
      console.log("Logout error", error);
    }
  };
  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Organization Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Organization Information
          </h2>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Edit
            </button>
          )}
        </div>

        {/* Logo */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Organization Logo
          </label>

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg bg-gray-300 flex items-center justify-center overflow-hidden">
              {profile.logo ? (
                <img
                  src={
                    typeof profile.logo === "string"
                      ? MEDIA_URL + profile.logo
                      : URL.createObjectURL(profile.logo)
                  }
                  alt="logo"
                  className="w-full h-full object-fill"
                />
              ) : (
                <span className="text-2xl font-semibold text-gray-700">
                  {getInitials(profile.title)}
                </span>
              )}
            </div>

            {isEditing && (
              <div className="flex flex-col gap-2">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Upload size={16} />
                  Change Logo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleChange("logo", e.target.files[0])}
                  />
                </label>

                {profile.logo && (
                  <button
                    onClick={() => handleChange("logo", null)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Organization Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name
            </label>
            <input
              type="text"
              value={profile.title}
              disabled={!isEditing}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Acme Corporation"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              value={profile.email}
              disabled={!isEditing}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="contact@company.com"
            />
          </div>

          {/* City and Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={profile.city}
                disabled={!isEditing}
                onChange={(e) => handleChange("city", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="New York"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                value={profile.country}
                disabled={!isEditing}
                onChange={(e) => handleChange("country", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="United States"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="flex gap-2 justify-end mt-8">
            <button
              onClick={() => {
                setIsEditing(false);
                fetchData();
              }}
              className="px-6 py-2 bg-gray-100 text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Organization Statistics */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Organization Statistics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-3xl font-bold text-gray-900">
              {statistics.members_count}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total Members</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-600 mt-1">Projects</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-600 mt-1">Departments</p>
          </div>
        </div>
      </div>

      {/* Subscription Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Subscription Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Current Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Current Plan
            </label>
            <div className="flex items-center gap-3">
              <p className="text-lg font-semibold text-gray-900">
                {subscription.current_plan}
              </p>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                {subscription.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-4">Members Limit</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {statistics.members_count}/{subscription.members_limit}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {Number(subscription.members_limit) -
                Number(statistics.members_count)}{" "}
              slots available
            </p>
          </div>

          {/* Billing Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Billing Cycle
            </label>
            <p className="text-lg font-semibold text-gray-900">
              {formatEnum(subscription.billing_cycle)}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Ends on {subscription.end_date}
            </p>
            <p className="text-sm font-medium text-gray-700 mt-4">
              Monthly Cost
            </p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {subscription.plan_cost}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {/* <div className="flex gap-4 mt-8">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            View Plans
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Manage Billing
          </button>
        </div> */}
      </div>

      {/* Delete Organization */}
      <div className="bg-white rounded-lg border border-red-200 p-8">
        <div className="flex items-start gap-4">
          <AlertTriangle
            size={24}
            className="text-red-600 flex-shrink-0 mt-1"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Delete?</h3>
            <p className="text-sm text-gray-700 mb-6">
              Deleting your organization is permanent and cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Organization
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Organization
              </h3>
              <p className="text-sm text-gray-700 mb-6">
                Are you sure you want to delete {profile.title}? This action
                cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationProfilePage;
