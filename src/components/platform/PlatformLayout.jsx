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
  "/platform/organization": "Organization Details",
  "/platform/user": "User Details",
};

const PlatformLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { pathname } = useLocation();

  const title =
    TITLE_MAP[pathname] ||
    Object.entries(TITLE_MAP)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([path]) => pathname.startsWith(path + "/"))?.[1] ||
    "Platform";

  return (
    <div className="min-h-screen flex bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-card focus:p-3 focus:text-primary"
      >
        Skip to content
      </a>
      {/* Sidebar */}
      <PlatformSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
      />

      {/* Main Content */}
      <div
        className={`min-w-0 flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <PlatformTopBar
          title={title}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onFoldClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
        />

        <main
          id="main-content"
          tabIndex={-1}
          className="pt-20 px-4 lg:px-8 pb-8"
        >
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PlatformLayout;
