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

  const isActive = (to) => {
    if (to === "/platform") {
      return pathname === "/platform" || pathname === "/platform/";
    }

    return pathname.startsWith(to);
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
    fixed left-0 top-0 h-screen bg-gray-50 border-r border-gray-200 
    flex flex-col z-50 
    transition-[width,transform] duration-300 ease-in-out

    w-64 lg:w-auto

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
              <h1 className="text-xl font-bold text-gray-900">Assort</h1>
            ) : (
              <img
                src={Logo}
                alt="Assort Logo"
                className="h-8 w-auto rounded-sm"
              />
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

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "gap-3"
            } px-4 py-3 rounded-lg hover:bg-gray-100 cursor-pointer`}
          >
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-semibold text-gray-700">
              A
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Admin User
                </p>
                <p className="text-xs text-gray-500 truncate">
                  admin@assort.app
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <NavLink
            to="/auth/login"
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "gap-3"
            } px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors`}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut size={20} />
            {!isCollapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </NavLink>
        </div>
      </aside>
    </>
  );
}
