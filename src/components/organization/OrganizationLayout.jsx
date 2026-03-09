import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import { OrganizationSidebar } from "./OrganizationSidebar";
import { OrganizationTopBar } from "./OrganizationTopBar";
import DotsBg from "@/assets/images/DotsBg.png";

const TITLE_MAP = {
  "/app": "Dashboard",
  "/app/members": "Members",
  "/app/departments": "Departments",
  "/app/projects": "Projects",
  "/app/roles": "Roles",
  "/app/chats": "Chats",
  "/app/jobs": "Jobs",
  "/app/timesheet": "Timesheet",
};

const OrganizationLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { pathname } = useLocation();

  const title =
    TITLE_MAP[pathname] ||
    Object.entries(TITLE_MAP).find(([path]) =>
      pathname.startsWith(path + "/"),
    )?.[1] ||
    "Organization";

  return (
    <div
      className="min-h-screen flex bg-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${DotsBg})`,
      }}
    >
      <OrganizationSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-48"
        }`}
      >
        <OrganizationTopBar
          title={title}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onFoldClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
        />

        <main className="pt-20 pb-8 px-4 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default OrganizationLayout;
