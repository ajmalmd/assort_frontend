import { useAuth } from "@/context/authContext";
import { useNavigate } from "react-router";
import MemberProjectsPage from "./MemberProjectsPage";
import OrganizationProjectsPage from "./OrganizationProjectsPage";

const ProjectsPage = () => {
  const { activeOrganization } = useAuth();
  const navigate = useNavigate();

  const role = activeOrganization?.role;
  const MEMBER_ROLES = ["OWNER", "ADMIN", "PROJECT_MANAGER"];

  const PageContent =
    role === "MEMBER"
      ? MemberProjectsPage
      : MEMBER_ROLES.includes(role)
        ? OrganizationProjectsPage
        : null;
  return (
    <>
      {PageContent ? (
        <PageContent />
      ) : (
        <div className="text-center py-10 text-gray-500">
          No projects available
        </div>
      )}
    </>
  );
};

export default ProjectsPage;
