import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { OrganizationSidebar } from "./OrganizationSidebar";
import { OrganizationTopBar } from "./OrganizationTopBar";
import DotsBg from "@/assets/images/DotsBg.png";
import { useAuth } from "@/context/authContext";
import { SubscriptionModal } from "./SubscriptionModal";

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

const DYNAMIC_TITLES = [
  { match: (p) => p.startsWith("/app/members/"), title: "Member Details" },
];

const OrganizationLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const { pathname } = useLocation();
  const { activeOrganization } = useAuth();

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

  const dynamicMatch = DYNAMIC_TITLES.find((r) => r.match(pathname));

  const title =
    TITLE_MAP[pathname] ||
    dynamicMatch?.title ||
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

      <div
        className="min-h-screen flex bg-repeat bg-gray-400"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${DotsBg})`,
        }}
      >
        {/* Sidebar */}
        <OrganizationSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          disabled={isSubscriptionBlocked}
        />

        {/* Main Content */}
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? "lg:ml-20" : "lg:ml-48"
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
          <main className="pt-20 pb-8 px-4 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default OrganizationLayout;
