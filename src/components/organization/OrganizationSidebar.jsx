import { NavLink, useLocation } from "react-router";
import {
  LayoutDashboard,
  Briefcase,
  SquareCheckBig,
  Clock4,
  MessageSquare,
  Layers,
  Shield,
  Users,
  X,
} from "lucide-react";
import { useAuthState } from "@/redux/hooks";

const ROLE_MENU = {
  OWNER: [
    { label: "Dashboard", icon: LayoutDashboard, to: "/app" },
    { label: "Members", icon: Users, to: "/app/members" },
    { label: "Departments", icon: Layers, to: "/app/departments" },
    { label: "Projects", icon: Briefcase, to: "/app/projects" },
    { label: "Chats", icon: MessageSquare, to: "/app/chats" },
  ],
  ADMIN: [
    { label: "Dashboard", icon: LayoutDashboard, to: "/app" },
    { label: "Members", icon: Users, to: "/app/members" },
    { label: "Departments", icon: Layers, to: "/app/departments" },
    { label: "Projects", icon: Briefcase, to: "/app/projects" },
    { label: "Chats", icon: MessageSquare, to: "/app/chats" },
  ],
  PROJECT_MANAGER: [
    { label: "Dashboard", icon: LayoutDashboard, to: "/app" },
    { label: "Projects", icon: Briefcase, to: "/app/projects" },
    { label: "Chats", icon: MessageSquare, to: "/app/chats" },
  ],
  MEMBER: [
    { label: "Dashboard", icon: LayoutDashboard, to: "/app" },
    { label: "Projects", icon: Briefcase, to: "/app/projects" },
    { label: "Jobs", icon: SquareCheckBig, to: "/app/jobs" },
    { label: "Timesheet", icon: Clock4, to: "/app/timesheet" },
    { label: "Chats", icon: MessageSquare, to: "/app/chats" },
  ],
};

export function OrganizationSidebar({
  isOpen,
  onClose,
  isCollapsed = false,
  disabled = false,
}) {
  const { pathname } = useLocation();

  const { activeOrganization } = useAuthState();
  const activeRole = activeOrganization.role;
  const menuItems = ROLE_MENU[activeRole] || [];

  const isActive = (to) => {
    if (to === "/app") {
      return pathname === "/app" || pathname === "/app/";
    }

    return pathname.startsWith(to);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={!disabled ? onClose : undefined}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
    fixed left-0 top-0 h-screen bg-gray-50 border-r border-gray-200 
    flex flex-col z-20
    transition-[width,transform] duration-300 ease-in-out

    ${isOpen ? "translate-x-0" : "-translate-x-full"} 
    lg:translate-x-0

    ${isCollapsed ? "lg:w-20" : "lg:w-48"}
  `}
      >
        {/* Logo & Close Button */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          {/* Left Spacer (only for alignment when collapsed) */}
          <div className="flex-1 flex justify-center lg:justify-start">
            {!isCollapsed ? (
              <h1 className="text-xl font-bold text-gray-900 truncate">
                {activeOrganization.title}
              </h1>
            ) : (
              <div className="w-8 h-8 rounded bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center font-semibold text-lg">
                {activeOrganization.title.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Close Button (Mobile Only) */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <X size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(({ label, icon: Icon, to }) => {
            const active = isActive(to);

            return (
              <NavLink
                key={to}
                to={disabled ? "#" : to}
                onClick={(e) => {
                  if (disabled) {
                    e.preventDefault();
                    return;
                  }
                  onClose();
                }}
                className={`flex items-center ${
                  isCollapsed ? "justify-center" : "gap-3"
                } px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                title={isCollapsed ? label : undefined}
              >
                <Icon size={20} />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>
        {!isCollapsed && (
          <h1 className="text-xl font-semibold text-gray-900 flex p-3 truncate">
            Assort
          </h1>
        )}
      </aside>
    </>
  );
}
