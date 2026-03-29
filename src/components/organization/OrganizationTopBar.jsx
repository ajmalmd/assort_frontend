import React from "react";
import { Bell, Menu, PanelRight, PanelLeft } from "lucide-react";
import { ProfileMenu } from "./ProfileMenu";
import { useAuth } from "@/context/authContext";

export function OrganizationTopBar({
  title,
  onMenuClick,
  onFoldClick,
  sidebarCollapsed = false,
}) {
  const { user, organizations } = useAuth();
  return (
    <div
      className={`
    fixed top-0 right-0 h-16 bg-white border-b border-gray-200 
    flex items-center justify-between px-4 lg:px-8 z-30 
    transition-all duration-300
    z-[60]

    left-0 
    ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-48"}
  `}
    >
      <div className="flex items-center gap-2 lg:gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu size={20} className="text-gray-700" />
        </button>

        <button
          onClick={onFoldClick}
          className="hidden lg:flex lg:p-2 lg:hover:bg-gray-100 lg:rounded-lg lg:transition-colors"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <PanelRight size={20} className="text-gray-700" />
          ) : (
            <PanelLeft size={20} className="text-gray-700" />
          )}
        </button>

        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
          <Bell size={20} className="text-gray-700" />
          {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
        </button>
        <ProfileMenu user={user} canSwitch={organizations.length > 1} />
      </div>
    </div>
  );
}
