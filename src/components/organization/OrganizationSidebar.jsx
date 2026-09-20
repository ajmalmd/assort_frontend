import { useNavigationDrawer } from "@/hooks/useNavigationDrawer";
import { NavLink, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Briefcase,
  SquareCheckBig,
  Clock4,
  MessageSquare,
  Layers,
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
    { label: "My work", icon: SquareCheckBig, to: "/app/jobs" },
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
  const drawerRef = useNavigationDrawer(isOpen, onClose);
  const navigate = useNavigate();

  const { activeOrganization } = useAuthState();
  const activeRole = activeOrganization.role;
  const menuItems = ROLE_MENU[activeRole] || [];

  const isActive = (to) => {
    if (to === "/app") {
      return pathname === "/app" || pathname === "/app/";
    }

    const detailRoutes = {
      "/app/projects": "/app/project/",
      "/app/members": "/app/member/",
      "/app/departments": "/app/department/",
    };
    return (
      pathname.startsWith(to) ||
      Boolean(detailRoutes[to] && pathname.startsWith(detailRoutes[to]))
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={!disabled ? onClose : undefined}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={drawerRef}
        aria-label="Workspace navigation"
        className={`
          fixed left-0 top-0 h-dvh w-64 bg-sidebar border-r border-border
          flex flex-col z-50
          transition-[width,transform] duration-300 ease-in-out

          ${isOpen ? "visible translate-x-0" : "invisible -translate-x-full"} lg:visible
          lg:translate-x-0

          ${isCollapsed ? "lg:w-20" : "lg:w-64"}
        `}
      >
        {/* Logo & Close Button */}
        <div className="h-16 px-5 border-b border-border flex items-center justify-between">
          {/* Left Spacer (only for alignment when collapsed) */}
          <div className="flex-1 flex justify-center lg:justify-start">
            {!isCollapsed ? (
              <h1 className="text-xl font-bold text-foreground truncate">
                {activeOrganization.title}
              </h1>
            ) : (
              <div className="w-8 h-8 rounded bg-accent text-primary flex items-center justify-center font-semibold text-lg">
                {activeOrganization.title.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Close Button (Mobile Only) */}
          <button
            aria-label="Close navigation"
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <X size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Navigation */}
        <nav
          aria-label="Main navigation"
          className="flex-1 overflow-y-auto p-3 space-y-1"
        >
          {menuItems.map(({ label, icon: Icon, to }) => {
            const active = isActive(to);

            return (
              <NavLink
                key={to}
                aria-disabled={disabled}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                to={disabled ? "#" : to}
                onClick={(e) => {
                  if (disabled) {
                    e.preventDefault();
                    return;
                  }
                  onClose();
                }}
                className={`flex items-center ${
                  isCollapsed ? "gap-3 lg:justify-center" : "gap-3"
                } px-3 py-2.5 rounded-lg transition-colors ${
                  active
                    ? "bg-accent text-accent-foreground shadow-xs"
                    : "text-sidebar-foreground hover:bg-muted"
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                title={isCollapsed ? label : undefined}
              >
                <Icon size={20} />
                <span
                  className={`text-sm font-medium ${isCollapsed ? "lg:hidden" : ""}`}
                >
                  {label}
                </span>
              </NavLink>
            );
          })}
        </nav>
        {!isCollapsed && (
          <button
            type="button"
            aria-label="Assort home"
            onClick={() => navigate("/")}
          >
            <h1 className="text-xl font-semibold text-foreground flex p-3 truncate cursor-default">
              Assort
            </h1>
          </button>
        )}
      </aside>
    </>
  );
}
