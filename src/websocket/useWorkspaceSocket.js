import { useEffect, useRef } from "react";

import { buildSocketUrl, SOCKET_PATHS } from "./websocketConfig";

export function useWorkspaceSocket(handlers = {}) {
  const socketRef = useRef(null);
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    let reconnectTimeout;
    let shouldReconnect = true;

    const connect = () => {
      const socket = new WebSocket(buildSocketUrl(SOCKET_PATHS.workspace()));

      socketRef.current = socket;

      socket.onopen = () => {
        handlersRef.current.onConnected?.();
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "incoming_call":
            handlersRef.current.onIncomingCall?.(data);
            break;

          case "workspace_summary":
            handlersRef.current.onWorkspaceSummary?.(data);
            break;

          default:
            break;
        }
      };

      socket.onclose = () => {
        handlersRef.current.onDisconnected?.();

        if (shouldReconnect) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };
    };

    connect();

    return () => {
      shouldReconnect = false;

      clearTimeout(reconnectTimeout);

      socketRef.current?.close();
    };
  }, []);

  return socketRef;
}
