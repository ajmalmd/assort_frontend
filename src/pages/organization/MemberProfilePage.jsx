import { useState, useEffect } from "react";
import { Calendar, Upload } from "lucide-react";
import { getInitials } from "@/appFunctions";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";

const MemberProfilePage = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    profilePhoto: null,
    city: "",
    country: "",
    dateOfBirth: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  // Fetch Profile API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await assort_api.get(
          APP_POINTS.ORGANIZATIONS + "profile",
        );

        if (response.data.role === "OWNER") return;

        const user = response.data.user || {};

        setProfile((prev) => ({
          ...prev,
          name: user.full_name ?? prev.name,
          email: user.email ?? prev.email,
          profilePhoto: user.profile_pic ?? prev.profilePhoto,
          city: user.city ?? prev.city,
          country: user.country ?? prev.country,
          dateOfBirth: user.date_of_birth ?? prev.dateOfBirth, // keep ISO
        }));
      } catch (error) {
        console.error("Profile fetch error:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {};

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        {/* Personal Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Personal Information
          </h2>

          {/* Profile Photo */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Profile Photo
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg bg-gray-300 flex items-center justify-center overflow-hidden">
                {profile.profilePhoto ? (
                  <img
                    src={profile.profilePhoto}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-semibold text-gray-700">
                    {getInitials(profile.name)}
                  </span>
                )}
              </div>

              <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Upload size={16} />
                Change Photo
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="e.g., John Doe"
              />
            </div>

            {/* Email (readonly recommended) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-2 border border-gray-200 bg-gray-100 rounded-lg cursor-not-allowed"
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
                  placeholder="City"
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
                  placeholder="Country"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={profile.dateOfBirth || ""}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                {/* <Calendar
                  size={20}
                  className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"
                /> */}
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
      </div>
    </div>
  );
};

export default MemberProfilePage;
