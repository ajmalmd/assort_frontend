import { useCallback, useEffect, useRef } from "react";

import { buildSocketUrl, SOCKET_PATHS } from "./websocketConfig";
import { registerSocket, unregisterSocket } from "./websocketManager";

export function useCallSessionSocket(sessionId, enabled, handlers = {}) {
  const socketRef = useRef(null);
  const handlersRef = useRef(handlers);

  // True only when we intentionally want this socket to close.
  const intentionalCloseRef = useRef(false);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const send = useCallback((payload) => {
    const socket = socketRef.current;

    if (!socket) {
      console.warn("Call socket is not initialized.");

      return false;
    }

    if (socket.readyState !== WebSocket.OPEN) {
      console.warn("Call socket is not connected.");

      return false;
    }

    socket.send(JSON.stringify(payload));

    return true;
  }, []);

  /*
   * Close the current socket intentionally.
   *
   * This prevents onclose from reconnecting.
   */
  const closeIntentionally = useCallback(() => {
    intentionalCloseRef.current = true;

    const socket = socketRef.current;

    if (!socket) {
      return;
    }

    socketRef.current = null;

    unregisterSocket(socket);

    if (
      socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING
    ) {
      socket.close(1000, "Intentional call close");
    }
  }, []);

  useEffect(() => {
    if (!enabled || !sessionId) {
      return;
    }

    let shouldReconnect = true;
    let reconnectTimeout = null;

    // New call/session lifecycle.
    intentionalCloseRef.current = false;

    const connect = () => {
      if (!shouldReconnect || intentionalCloseRef.current) {
        return;
      }

      const socket = new WebSocket(
        buildSocketUrl(SOCKET_PATHS.call(sessionId)),
      );

      registerSocket(socket);

      socketRef.current = socket;

      socket.onopen = () => {
        console.log("Call session socket connected:", sessionId);

        handlersRef.current.onConnected?.();
      };

      socket.onmessage = (event) => {
        let message;

        try {
          message = JSON.parse(event.data);
        } catch (error) {
          console.error("Invalid call socket message:", error);

          return;
        }

        const { type, data } = message;

        switch (type) {
          case "call_connected":
            handlersRef.current.onConnected?.(data);
            break;

          case "call_presence_state":
            handlersRef.current.onPresenceState?.(data);
            break;

          case "participant_joined":
            handlersRef.current.onParticipantJoined?.(data);
            break;

          case "participant_ready":
            handlersRef.current.onParticipantReady?.(data);
            break;

          case "participant_left":
            handlersRef.current.onParticipantLeft?.(data);
            break;

          case "participant_media_updated":
            handlersRef.current.onMediaUpdated?.(data);
            break;

          case "call_host_changed":
            handlersRef.current.onHostChanged?.(data);
            break;

          case "call_ended":
            handlersRef.current.onCallEnded?.(data);
            break;

          case "webrtc_offer":
            handlersRef.current.onOffer?.(data);
            break;

          case "webrtc_answer":
            handlersRef.current.onAnswer?.(data);
            break;

          case "webrtc_ice_candidate":
            handlersRef.current.onIceCandidate?.(data);
            break;

          case "error":
            handlersRef.current.onError?.(message);
            break;

          default:
            console.warn("Unknown call event:", message);
        }
      };

      socket.onclose = () => {
        unregisterSocket(socket);

        /*
         * Ignore this close if it wasn't the current socket.
         */
        if (socketRef.current !== socket) {
          return;
        }

        socketRef.current = null;

        /*
         * Intentional close:
         * don't notify as unexpected and don't reconnect.
         */
        if (intentionalCloseRef.current || !shouldReconnect) {
          return;
        }

        handlersRef.current.onDisconnected?.();

        reconnectTimeout = setTimeout(() => {
          if (!shouldReconnect || intentionalCloseRef.current) {
            return;
          }

          connect();
        }, 3000);
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

      intentionalCloseRef.current = true;

      const socket = socketRef.current;

      if (!socket) {
        return;
      }

      socketRef.current = null;

      unregisterSocket(socket);

      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close(1000, "Call session cleanup");
      }
    };
  }, [enabled, sessionId]);

  return {
    socketRef,
    send,
    closeIntentionally,
  };
}
