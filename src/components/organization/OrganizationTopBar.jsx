import { useState } from "react";
import { Bell, Menu, PanelRight, PanelLeft } from "lucide-react";
import { ProfileMenu } from "./ProfileMenu";
import { useAuthState } from "@/redux/hooks";
import { NotificationModal } from "./NotificationsModal";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useEffect } from "react";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";

export function OrganizationTopBar({
  title,
  onMenuClick,
  onFoldClick,
  sidebarCollapsed = false,
}) {
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const { user, organizations } = useAuthState();


  useEffect(() => {
    const fetchNotificationSummary = async () => {
      const res = await assort_api.get(`${APP_POINTS.NOTIFICATIONS}summary/`);
      setUnreadCount(res.data?.total_unread);
    };
    fetchNotificationSummary();
  }, []);

  return (
    <div
      className={`
    fixed top-0 right-0 h-16 bg-white border-b border-gray-200 
    flex items-center justify-between px-4 lg:px-8
    transition-all duration-300
    z-[30]

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
        <div className="relative inline-flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotificationModalOpen(true)}
          >
            <Bell size={20} className="text-gray-700" />
          </Button>
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs pointer-events-none"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </div>
        <ProfileMenu user={user} canSwitch={organizations.length > 1} />
      </div>
      <NotificationModal
        open={notificationModalOpen}
        onOpenChange={setNotificationModalOpen}
      />
    </div>
  );
}
