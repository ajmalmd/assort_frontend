import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { OrganizationSidebar } from "./OrganizationSidebar";
import { OrganizationTopBar } from "./OrganizationTopBar";
import { SubscriptionModal } from "./SubscriptionModal";
import { useAuthState } from "@/redux/hooks";

const TITLE_MAP = {
  "/app": "Dashboard",
  "/app/members": "Members",
  "/app/member": "Member Details",
  "/app/departments": "Departments",
  "/app/department": "Department Details",
  "/app/projects": "Projects",
  "/app/project": "Project Details",
  "/app/project/task": "Task Details",
  "/app/project/job": "Job Details",
  "/app/chats": "Chats",
  "/app/jobs": "My work",
  "/app/timesheet": "Timesheet",
  "/app/timesheet/work-log": "Day - Work Log",
};

const OrganizationLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const { pathname } = useLocation();
  const { activeOrganization } = useAuthState();

  // Show modal if OWNER and subscription is EXPIRED or NONE
  useEffect(() => {
    if (
      activeOrganization?.role === "OWNER" &&
      ["NONE", "EXPIRED"].includes(activeOrganization?.subscription_status)
    ) {
      setShowSubscriptionModal(true);
    } else {
      setShowSubscriptionModal(false);
    }
  }, [activeOrganization]);

  const isSubscriptionBlocked =
    activeOrganization?.role === "OWNER" &&
    ["NONE", "EXPIRED"].includes(activeOrganization?.subscription_status);

  const title =
    TITLE_MAP[pathname] ||
    Object.entries(TITLE_MAP)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([path]) => pathname.startsWith(path + "/"))?.[1] ||
    "Organization";
  return (
    <>
      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        title={
          activeOrganization?.subscription_status === "EXPIRED"
            ? "Subscription Expired"
            : "Choose Your Plan"
        }
        description={
          activeOrganization?.subscription_status === "EXPIRED"
            ? "Your subscription has expired. Please renew to continue using all features."
            : "Select a subscription or start a free trial."
        }
      />

      <div className="min-h-screen w-full overflow-x-hidden bg-background">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-card focus:p-3 focus:text-primary">Skip to content</a>
        {/* Sidebar */}
        <OrganizationSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          disabled={isSubscriptionBlocked}
        />

        {/* Main Content */}
        <div
          className={`min-w-0 flex-1 transition-all duration-300 ${
            sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
          }`}
        >
          {/* Top Bar */}
          <OrganizationTopBar
            title={title}
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            onFoldClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            sidebarCollapsed={sidebarCollapsed}
          />

          {/* Page Content */}
          <main id="main-content" tabIndex={-1}
            className="min-h-dvh w-full overflow-x-hidden pt-20 pb-8 px-4 lg:px-8 bg-background"
          >
            <div className="mx-auto w-full max-w-[1600px]"><Outlet /></div>
          </main>
        </div>
      </div>
    </>
  );
};

export default OrganizationLayout;
