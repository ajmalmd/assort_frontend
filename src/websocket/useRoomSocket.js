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
    if (!roomId || !activeOrganization?.id) return;

    let active = true;
    let reconnectTimeout;

    const connect = () => {
      if (!active) return;

      const socket = new WebSocket(
        buildSocketUrl(SOCKET_PATHS.room(roomId), activeOrganization.id),
      );

      socketRef.current = socket;

      socket.onopen = () => {
        handlersRef.current.onOpen?.();
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        const payloadRoomId = data.room_id ?? data.data?.room_id;

        if (payloadRoomId && Number(payloadRoomId) !== Number(roomId)) return;

        handlersRef.current.onEvent?.(data); // 👈 unified event
      };

      socket.onerror = () => {
        handlersRef.current.onError?.();
      };

      socket.onclose = () => {
        if (!active) return;

        reconnectTimeout = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      active = false;
      clearTimeout(reconnectTimeout);
      socketRef.current?.close(1000, "room changed");
      socketRef.current = null;
    };
  }, [roomId, activeOrganization?.id]);

  return socketRef;
}
