import { useAuthState } from "@/redux/hooks";
import { useEffect, useRef } from "react";
import { buildSocketUrl, SOCKET_PATHS } from "./websocketConfig";

export function useChatListSocket(handlers = {}) {
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
        buildSocketUrl(SOCKET_PATHS.chatList(), activeOrganization.id),
      );

      socketRef.current = socket;

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "room_created":
            handlersRef.current.onRoomCreated?.(data.room);
            break;

          case "room_updated":
            handlersRef.current.onRoomUpdated?.(data.room);
            break;

          case "unread_updated":
            handlersRef.current.onUnreadUpdated?.(
              data.room_id,
              data.unread_count,
            );
            break;
        }
      };

      socket.onclose = () => {
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
