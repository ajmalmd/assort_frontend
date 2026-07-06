import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, Trash2, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { useNotifications } from "@/notifications/useNotifications";

export function NotificationModal({ open, onOpenChange }) {
  const [activeTab, setActiveTab] = useState("unread");

  const {
    notifications,
    markRead,
    markAllRead,
    deleteNotification,
    clearReadNotifications,
  } = useNotifications();

  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.is_read),
    [notifications],
  );

  const readNotifications = useMemo(
    () => notifications.filter((n) => n.is_read),
    [notifications],
  );

  const displayedNotifications =
    activeTab === "unread" ? unreadNotifications : readNotifications;

  const getNotificationIcon = (type) => {
    const prefix = type.split("_")[0];

    switch (prefix) {
      case "job":
        return "💼";

      case "task":
        return "✓";

      case "log":
        return "📝";

      case "chat":
        return "💬";

      case "project":
        return "📁";

      default:
        return "📌";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80vh] max-w-2xl flex-col overflow-hidden p-0">
        {/* Header */}

        <div className="border-b px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <DialogTitle className="text-lg">Notifications</DialogTitle>
          </div>
        </div>

        {/* Tabs */}

        <div className="flex gap-1 border-b px-6 bg-muted/30 flex-shrink-0">
          <button
            onClick={() => setActiveTab("unread")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "unread"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Unread ({unreadNotifications.length})
          </button>

          <button
            onClick={() => setActiveTab("read")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "read"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Read ({readNotifications.length})
          </button>
        </div>

        {/* Actions */}

        {displayedNotifications.length > 0 && (
          <div className="flex justify-end gap-2 px-6 py-3 border-b bg-muted/20 flex-shrink-0">
            {activeTab === "unread" && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={markAllRead}
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </Button>
            )}

            {activeTab === "read" && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={clearReadNotifications}
              >
                <Trash2 className="h-4 w-4" />
                Clear all
              </Button>
            )}
          </div>
        )}

        {/* Notification List */}

        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full w-full">
            {displayedNotifications.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                <div className="text-center">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>No {activeTab} notifications</p>
                </div>
              </div>
            ) : (
              <div className="divide-y px-6">
                {displayedNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`py-4 hover:bg-muted/50 transition-colors border-l-4 pl-3 -ml-3 ${
                      !notification.is_read
                        ? "border-l-primary bg-muted/20"
                        : "border-l-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="text-xl mt-0.5 flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </span>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm">
                            {notification.title}
                          </h4>

                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {notification.body}
                          </p>

                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(
                              new Date(notification.created_at),
                              {
                                addSuffix: true,
                              },
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {activeTab === "unread" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => markRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-destructive"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
