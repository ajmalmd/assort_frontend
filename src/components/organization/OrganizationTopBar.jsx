import { useState } from "react";
import { Bell, Menu, PanelLeft, PanelRight } from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

import { ProfileMenu } from "./ProfileMenu";
import { NotificationModal } from "./NotificationsModal";

import { useAuthState } from "@/redux/hooks";
import { useNotifications } from "@/notifications/useNotifications";

export function OrganizationTopBar({
  title,
  onMenuClick,
  onFoldClick,
  sidebarCollapsed = false,
}) {
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);

  const { user, organizations } = useAuthState();

  const { summary } = useNotifications();

  return (
    <div
      className={`
        fixed top-0 right-0 h-16 bg-white border-b border-gray-200
        flex items-center justify-between px-4 lg:px-8
        transition-all duration-300 z-[30]
        left-0
        ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-48"}
      `}
    >
      <div className="flex items-center gap-2 lg:gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu size={20} />
        </button>

        <button
          onClick={onFoldClick}
          className="hidden lg:flex p-2 hover:bg-gray-100 rounded-lg"
        >
          {sidebarCollapsed ? (
            <PanelRight size={20} />
          ) : (
            <PanelLeft size={20} />
          )}
        </button>

        <h2 className="text-xl font-semibold">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative inline-flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotificationModalOpen(true)}
          >
            <Bell size={20} />
          </Button>

          {summary?.organization_unread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {summary.organization_unread > 9
                ? "9+"
                : summary.organization_unread}
            </Badge>
          )}
        </div>

        <ProfileMenu
          user={user}
          canSwitch={organizations.length > 1}
          totalUnread={summary.total_unread - summary.organization_unread}
        />
      </div>

      <NotificationModal
        open={notificationModalOpen}
        onOpenChange={setNotificationModalOpen}
      />
    </div>
  );
}
