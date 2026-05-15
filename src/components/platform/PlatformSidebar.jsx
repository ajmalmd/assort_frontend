import { NavLink, useLocation } from "react-router";
import {
  LayoutDashboard,
  Building2,
  Ticket,
  Users,
  CreditCard,
  LogOut,
  X,
} from "lucide-react";
import Logo from "@/assets/images/Logo.png";
import { logout } from "@/api/utility";
import { useAuthState } from "@/redux/hooks";

const SIDEBAR_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/platform" },
  { label: "Organizations", icon: Building2, to: "/platform/organizations" },
  { label: "Users", icon: Users, to: "/platform/users" },
  { label: "Tickets", icon: Ticket, to: "/platform/tickets" },
  {
    label: "Subscription Plans",
    icon: CreditCard,
    to: "/platform/subscription-plans",
  },
];

export function PlatformSidebar({ isOpen, onClose, isCollapsed = false }) {
  const { pathname } = useLocation();
  const { user } = useAuthState();

  const isActive = (to) => {
    if (to === "/platform") {
      return pathname === "/platform" || pathname === "/platform/";
    }

    return pathname.startsWith(to);
  };

  const handleLogout = async () => {
    await logout(true);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 w-48 lg:w-auto bg-gray-50 border-r border-gray-200
          flex flex-col h-screen
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        `}
      >
        {/* Logo & Close */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex-1 flex justify-center lg:justify-start">
            {!isCollapsed ? (
              <h1 className="text-xl font-bold text-gray-900">Assort</h1>
            ) : (
              <img
                src={Logo}
                alt="Assort Logo"
                className="h-8 w-auto rounded-sm"
              />
            )}
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <X size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {SIDEBAR_ITEMS.map(({ label, icon: Icon, to }) => {
            const active = isActive(to);
            return (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={`flex items-center ${
                  isCollapsed ? "justify-center" : "gap-3"
                } px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
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

        {/* User & Logout */}
        <div className="border-t border-gray-200">
          <div
            className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} p-4`}
          >
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-semibold text-gray-700">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.full_name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "gap-3"
            } px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors w-full`}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut size={20} />
            {!isCollapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
