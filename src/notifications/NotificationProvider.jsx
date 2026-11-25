import { useCallback, useEffect, useMemo, useState } from "react";

import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";

import { useAuthState } from "@/redux/hooks";

import { NotificationContext } from "./NotificationContext";
import { useNotificationSocket } from "@/websocket/useNotificationSocket";

export default function NotificationProvider({ children }) {
  const { activeOrganization } = useAuthState();

  const organizationId = activeOrganization?.id;

  const [notifications, setNotifications] = useState([]);

  const [summary, setSummary] = useState({
    organization_unread: 0,
    total_unread: 0,
  });

  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!organizationId) return;

    const response = await assort_api.get(APP_POINTS.NOTIFICATIONS);

    setNotifications(response.data);
  }, [organizationId]);

  const fetchSummary = useCallback(async () => {
    if (!organizationId) return;

    const response = await assort_api.get(
      `${APP_POINTS.NOTIFICATIONS}summary/`,
    );

    const organization = response.data.organizations.find(
      (org) => org.organization_id === organizationId,
    );

    setSummary({
      organization_unread: organization?.unread || 0,
      total_unread: response.data.total_unread,
    });
  }, [organizationId]);

  const initialize = useCallback(async () => {
    if (!organizationId) return;

    setLoading(true);

    try {
      await Promise.all([fetchNotifications(), fetchSummary()]);
    } finally {
      setLoading(false);
    }
  }, [organizationId, fetchNotifications, fetchSummary]);

  // Initialize only when organization changes
  useEffect(() => {
    if (!organizationId) {
      setNotifications([]);
      setSummary({
        organization_unread: 0,
        total_unread: 0,
      });
      return;
    }

    setNotifications([]);
    setSummary({
      organization_unread: 0,
      total_unread: 0,
    });

    initialize();
  }, [organizationId, initialize]);

  useNotificationSocket({
    onConnected: () => {
      setConnected(true);
    },

    onDisconnected: () => {
      setConnected(false);
    },

    onNotificationCreated: ({ notification }) => {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notification.id)) {
          return prev;
        }

        return [notification, ...prev];
      });
    },

    onNotificationDeleted: ({ notification_id }) => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification_id));
    },

    onNotificationSummaryUpdated: ({ summary }) => {
      setSummary(summary);
    },
  });

  const markRead = async (notificationId) => {
    await assort_api.patch(
      `${APP_POINTS.NOTIFICATIONS}${notificationId}/read/`,
    );

    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, is_read: true }
          : notification,
      ),
    );
  };

  const markAllRead = async () => {
    await assort_api.patch(`${APP_POINTS.NOTIFICATIONS}read-all/`);

    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        is_read: true,
      })),
    );
  };

  const deleteNotification = async (notificationId) => {
    await assort_api.delete(`${APP_POINTS.NOTIFICATIONS}${notificationId}/`);
  };

  const clearReadNotifications = async () => {
    await assort_api.delete(`${APP_POINTS.NOTIFICATIONS}clear/`);

    setNotifications((prev) => prev.filter((n) => !n.is_read));
  };

  const value = useMemo(
    () => ({
      notifications,
      summary,
      connected,
      loading,
      fetchNotifications,
      fetchSummary,
      markRead,
      markAllRead,
      deleteNotification,
      clearReadNotifications,
    }),
    [
      notifications,
      summary,
      connected,
      loading,
      fetchNotifications,
      fetchSummary,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
