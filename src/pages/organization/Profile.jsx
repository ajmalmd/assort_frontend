import { useNavigate } from "react-router";
import OrganizationProfilePage from "./OrganizationProfilePage";
import MemberProfilePage from "./MemberProfilePage";
import DotsBg from "@/assets/images/DotsBg.png";
import { ArrowLeft } from "lucide-react";
import { useAuthState } from "@/redux/hooks";

const Profile = () => {
  const { activeOrganization } = useAuthState();
  const navigate = useNavigate();

  const role = activeOrganization?.role;
  const MEMBER_ROLES = ["ADMIN", "PROJECT_MANAGER", "MEMBER"];

  const PageContent =
    role === "OWNER"
      ? OrganizationProfilePage
      : MEMBER_ROLES.includes(role)
        ? MemberProfilePage
        : null;

  return (
    <div
      className="min-h-screen bg-repeat bg-gray-400"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${DotsBg})`,
      }}
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className=" mx-auto px-4 lg:px-8 py-4 flex items-center text-gray-700 gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>Profile</div>
        </div>
      </div>
      {PageContent ? (
        <PageContent />
      ) : (
        <div className="text-center py-10 text-gray-500">
          No profile available
        </div>
      )}
    </div>
  );
};

export default Profile;
