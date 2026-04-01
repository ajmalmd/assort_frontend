import { useState, useEffect } from "react";
import { AlertTriangle, Upload } from "lucide-react";
import { getInitials } from "@/appFunctions";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";

const OrganizationProfilePage = () => {
  const [profile, setProfile] = useState({
    logo: "",
    orgName: "",
    email: "",
    city: "",
    country: "",
    totalMembers: 0,
    activeProjects: 0,
    departments: 0,
    currentPlan: "",
    planStatus: "",
    billingCycle: "",
    endDate: "",
    membersCount: 0,
    membersLimit: 0,
    monthlyCost: "",
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await assort_api.get(
          APP_POINTS.ORGANIZATIONS + "profile",
        );

        const data = response.data;

        setProfile((prev) => {
          const org = data.organization || {};
          const stats = data.statistics || {};
          const sub = data.subscription || {};

          return {
            ...prev,

            // Organization Info
            logo: org.logo ?? prev.logo,
            orgName: org.title ?? prev.orgName,
            email: org.email ?? prev.email,
            city: org.city ?? prev.city,
            country: org.country ?? prev.country,

            // Stats
            totalMembers: stats.members_count ?? prev.totalMembers,

            // keep static values if API not available
            activeProjects: prev.activeProjects,
            departments: prev.departments,

            // Subscription
            currentPlan: sub.current_plan ?? prev.currentPlan,
            planStatus: sub.status ?? prev.planStatus,
            billingCycle: sub.billing_cycle ?? prev.billingCycle,
            endDate: sub.end_date ?? prev.endDate,

            membersLimit: sub.members_limit ? sub.members_limit : 0,

            monthlyCost: sub.plan_cost != null ? `₹${sub.plan_cost}` : "",
          };
        });
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleSaveChanges = () => {
    console.log("Organization profile saved:", profile);
  };
  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Organization Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Organization Information
        </h2>

        {/* Logo */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Organization Logo
          </label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg bg-gray-300 flex items-center justify-center">
              <span className="text-2xl font-semibold text-gray-700">
                {getInitials(profile.orgName)}
              </span>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Upload size={16} />
              Change Logo
            </button>
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
              value={profile.orgName}
              onChange={(e) => handleChange("orgName", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Acme Corporation"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
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
                onChange={(e) => handleChange("country", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="United States"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8">
          <button
            onClick={handleSaveChanges}
            className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Organization Statistics */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Organization Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-3xl font-bold text-gray-900">
              {profile.totalMembers}
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
                {profile.currentPlan}
              </p>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                {profile.planStatus}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-4">Members Limit</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {profile.totalMembers}/{profile.membersLimit}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {Number(profile.membersLimit) - Number(profile.totalMembers)}{" "}
              slots available
            </p>
          </div>

          {/* Billing Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Billing Cycle
            </label>
            <p className="text-lg font-semibold text-gray-900">
              {profile.billingCycle}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Ends on {profile.endDate}
            </p>
            <p className="text-sm font-medium text-gray-700 mt-4">
              Monthly Cost
            </p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {profile.monthlyCost}
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
                Are you sure you want to delete {profile.orgName}? This action
                cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
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
