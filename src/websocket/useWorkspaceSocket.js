import { useEffect, useRef } from "react";

import { buildSocketUrl, SOCKET_PATHS } from "./websocketConfig";

import { registerSocket, unregisterSocket } from "./websocketManager";

export function useWorkspaceSocket(enabled, handlers = {}) {
  const socketRef = useRef(null);
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let shouldReconnect = true;
    let reconnectTimeout = null;

    const connect = () => {
      if (!shouldReconnect) {
        return;
      }

      const currentSocket = socketRef.current;

      if (
        currentSocket?.readyState === WebSocket.OPEN ||
        currentSocket?.readyState === WebSocket.CONNECTING
      ) {
        return;
      }

      const socket = new WebSocket(buildSocketUrl(SOCKET_PATHS.workspace()));

      socketRef.current = socket;
      registerSocket(socket);

      socket.onopen = () => {
        if (socketRef.current !== socket) {
          return;
        }

        reconnectTimeout = null;

        handlersRef.current.onConnected?.();
      };

      socket.onmessage = (event) => {
        let message;

        try {
          message = JSON.parse(event.data);
        } catch (error) {
          console.error("Invalid workspace socket message:", error);

          return;
        }

        const { type, data } = message;

        switch (type) {
          case "incoming_call":
            handlersRef.current.onIncomingCall?.({
              data,
            });
            break;

          case "incoming_call_waiting":
            handlersRef.current.onCallWaiting?.({
              data,
            });
            break;

          case "call_accepted_elsewhere":
            handlersRef.current.onCallAcceptedElsewhere?.({ data });
            break;

          case "call_ended":
            handlersRef.current.onCallEnded?.({
              data,
            });
            break;

          case "workspace_summary":
            handlersRef.current.onWorkspaceSummary?.({ data });
            break;

          case "workspace_summary_updated":
            handlersRef.current.onSummaryUpdated?.({ data });
            break;

          default:
            break;
        }
      };

      socket.onclose = () => {
        unregisterSocket(socket);

        if (socketRef.current !== socket) {
          return;
        }

        socketRef.current = null;

        if (!shouldReconnect) {
          return;
        }

        handlersRef.current.onDisconnected?.();

        reconnectTimeout = setTimeout(connect, 3000);
      };

      socket.onerror = (error) => {
        handlersRef.current.onError?.(error);
      };
    };

    connect();

    return () => {
      shouldReconnect = false;

      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }

      const socket = socketRef.current;
      socketRef.current = null;

      if (!socket) {
        return;
      }

      unregisterSocket(socket);

      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close(1000, "Workspace cleanup");
      }
    };
  }, [enabled]);

  return socketRef;
}
