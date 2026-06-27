import { useEffect, useRef } from "react";
import { useAuthState } from "@/redux/hooks";
import { buildSocketUrl, SOCKET_PATHS } from "./websocketConfig";

export function useRoomSocket(roomId, handlers = {}) {
  const socketRef = useRef(null);
  const handlersRef = useRef(handlers);

  const { activeOrganization } = useAuthState();

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!roomId || !activeOrganization?.id) {
      return;
    }

    let active = true;
    let reconnectTimeout;

    const connect = () => {
      if (!active) return;

      const socket = new WebSocket(
        buildSocketUrl(SOCKET_PATHS.room(roomId), activeOrganization.id),
      );

      socketRef.current = socket;

      socket.onopen = () => {
        if (!active) return;

        // console.log("ROOM SOCKET OPEN", roomId);

        handlersRef.current.onOpen?.();
      };

      socket.onmessage = (event) => {
        if (!active) return;

        const data = JSON.parse(event.data);

        console.log("ROOM EVENT", roomId, data.type, data);

        const payloadRoomId =
          data.room_id ?? data.data?.room_id ?? data.data?.room;

        if (payloadRoomId && Number(payloadRoomId) !== Number(roomId)) {
          return;
        }

        switch (data.type) {
          case "message":
            handlersRef.current.onMessage?.(data.data);
            break;

          case "typing":
            handlersRef.current.onTyping?.(data);
            break;

          case "seen":
            handlersRef.current.onSeen?.(data);
            break;

          default:
            break;
        }
      };

      socket.onerror = (error) => {
        if (!active) return;

        console.error("ROOM SOCKET ERROR", roomId, error);
      };

      socket.onclose = () => {
        // console.log("ROOM SOCKET CLOSED", roomId);

        if (!active) return;

        reconnectTimeout = setTimeout(() => {
          connect();
        }, 3000);
      };
    };

    connect();

    return () => {
      // console.log("CLEANUP ROOM", roomId);
      active = false;

      clearTimeout(reconnectTimeout);

      if (socketRef.current) {
        socketRef.current.onopen = null;
        socketRef.current.onmessage = null;
        socketRef.current.onerror = null;
        socketRef.current.onclose = null;

        socketRef.current.close(1000, "room changed");
      }

      socketRef.current = null;
    };
  }, [roomId, activeOrganization?.id]);

  return socketRef;
}
