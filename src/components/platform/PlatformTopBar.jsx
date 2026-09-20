import React from "react";
import { Menu, PanelRight, PanelLeft } from "lucide-react";

export function PlatformTopBar({
  title,
  onMenuClick,
  onFoldClick,
  sidebarCollapsed = false,
}) {
  return (
    <div
      className={`
        fixed top-0 right-0 left-0 h-16 bg-white/95 backdrop-blur-md border-b border-border
        flex items-center justify-between px-4 lg:px-8 z-30
        transition-all duration-300
        ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"}
      `}
    >
      <div className="flex min-w-0 items-center gap-2 lg:gap-4">
        {/* Mobile menu toggle */}
        <button
          aria-label="Open navigation"
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu size={20} className="text-gray-700" />
        </button>

        {/* Desktop collapse/expand */}
        <button
          aria-label={
            sidebarCollapsed ? "Expand navigation" : "Collapse navigation"
          }
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

        <h2 className="truncate text-lg font-semibold text-foreground">
          {title}
        </h2>
      </div>

      <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
        Platform admin
      </span>
    </div>
  );
}
