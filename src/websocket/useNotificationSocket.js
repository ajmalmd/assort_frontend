import { useAuthState } from "@/redux/hooks";
import { useEffect, useRef } from "react";

import { buildSocketUrl, SOCKET_PATHS } from "./websocketConfig";

export function useNotificationSocket(handlers = {}) {
  const socketRef = useRef(null);
  const handlersRef = useRef(handlers);

  const { activeOrganization } = useAuthState();

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!activeOrganization?.id) return;

    let reconnectTimeout;

    const connect = () => {
      const socket = new WebSocket(
        buildSocketUrl(SOCKET_PATHS.notification(), activeOrganization.id),
      );

      socketRef.current = socket;

      socket.onopen = () => {
        handlersRef.current.onConnected?.();
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(data);

        switch (data.type) {
          case "notification.created":
            handlersRef.current.onNotificationCreated?.(data);
            break;

          case "notification.deleted":
            handlersRef.current.onNotificationDeleted?.(data);
            break;

          case "notification.summary":
            handlersRef.current.onNotificationSummaryUpdated?.(data);
            break;

          default:
            break;
        }
      };

      socket.onclose = () => {
        handlersRef.current.onDisconnected?.();

        reconnectTimeout = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);

      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [activeOrganization?.id]);

  return socketRef;
}
