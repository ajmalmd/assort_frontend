import { useEffect, useRef } from "react";

import { buildSocketUrl, SOCKET_PATHS } from "./websocketConfig";
import { registerSocket, unregisterSocket } from "./websocketManager";
import { useAppDispatch } from "@/redux/hooks";
import { addWaitingCall } from "@/redux/slices/workspaceSlice";

export function useWorkspaceSocket(enabled, handlers = {}) {
  const socketRef = useRef(null);
  const handlersRef = useRef(handlers);

  const dispatch = useAppDispatch();

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let reconnectTimeout;
    let shouldReconnect = true;

    const connect = () => {
      const socket = new WebSocket(buildSocketUrl(SOCKET_PATHS.workspace()));

      registerSocket(socket);

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

          case "call_ended":
            handlersRef.current.onCallEnded?.(data);
            dispatch(removeWaitingCall(event.session_id));
            break;

          case "incoming_call_waiting":
            dispatch(addWaitingCall(event.data));
            break;

          case "workspace_summary":
            handlersRef.current.onWorkspaceSummary?.(data);
            break;

          case "workspace_summary_updated":
            handlersRef.current.onSummaryUpdated?.(data);
            break;

          default:
            break;
        }
      };

      socket.onclose = () => {
        handlersRef.current.onDisconnected?.();

        unregisterSocket(socket);

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
  }, [enabled]);

  return socketRef;
}
