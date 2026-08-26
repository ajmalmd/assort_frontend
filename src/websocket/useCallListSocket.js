import { useEffect, useRef } from "react";
import { useAuthState } from "@/redux/hooks";
import { buildSocketUrl, SOCKET_PATHS } from "./websocketConfig";
import { registerSocket, unregisterSocket } from "./websocketManager";

export function useCallListSocket(handlers = {}) {
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
        buildSocketUrl(SOCKET_PATHS.callList(), activeOrganization.id),
      );

      registerSocket(socket);

      socketRef.current = socket;

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "call_started":
            handlersRef.current.onCallStarted?.(data.data);
            break;

          case "call_ended":
            handlersRef.current.onCallEnded?.(data.data);
            break;
        }
      };

      socket.onclose = () => {
        reconnectTimeout = setTimeout(connect, 3000);
        unregisterSocket(socket);
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
