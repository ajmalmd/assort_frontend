import { useAuthState } from "@/redux/hooks";
import { useEffect, useRef } from "react";

import { buildSocketUrl, SOCKET_PATHS } from "./websocketConfig";
import { registerSocket, unregisterSocket } from "./websocketManager";

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
    let shouldReconnect = true;

    const connect = () => {
      const socket = new WebSocket(
        buildSocketUrl(SOCKET_PATHS.notification(), activeOrganization.id),
      );

      registerSocket(socket);

      socketRef.current = socket;

      socket.onopen = () => {
        handlersRef.current.onConnected?.();
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case "notification_created":
              handlersRef.current.onNotificationCreated?.(data);
              break;

            case "notification_deleted":
              handlersRef.current.onNotificationDeleted?.(data);
              break;

            case "notification_summary":
              handlersRef.current.onNotificationSummaryUpdated?.(data);
              break;

            default:
              break;
          }
        } catch (err) {
          console.error("Invalid websocket message", err);
        }
      };

      socket.onclose = (event) => {
        handlersRef.current.onDisconnected?.();
        
        unregisterSocket(socket);

        if (event.code === 4001) {
          return;
        }

        if (shouldReconnect) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };

      socket.onerror = (error) => {
        console.error("Notification socket error", error);
      };
    };

    connect();

    return () => {
      shouldReconnect = false;
      clearTimeout(reconnectTimeout);

      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [activeOrganization?.id]);

  return socketRef;
}
