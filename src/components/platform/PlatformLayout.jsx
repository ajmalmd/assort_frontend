import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import { PlatformSidebar } from "./PlatformSidebar";
import { PlatformTopBar } from "./PlatformTopBar";

const TITLE_MAP = {
  "/platform": "Dashboard",
  "/platform/users": "Users",
  "/platform/organizations": "Organizations",
  "/platform/tickets": "Tickets",
  "/platform/subscription-plans": "Subscription Plans",
};

const PlatformLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { pathname } = useLocation();

  const title =
    TITLE_MAP[pathname] ||
    Object.entries(TITLE_MAP).find(([path]) =>
      pathname.startsWith(path + "/")
    )?.[1] ||
    "Platform";

  return (
    <div className="flex">
      <PlatformSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-48"
        }`}
      >
        <PlatformTopBar
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

export default PlatformLayout;
