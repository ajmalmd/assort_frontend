import { useEffect, useRef, useCallback } from "react";

import { buildSocketUrl, SOCKET_PATHS } from "./websocketConfig";

import { registerSocket, unregisterSocket } from "./websocketManager";

export function useCallSessionSocket(sessionId, enabled, handlers = {}) {
  const socketRef = useRef(null);

  const handlersRef = useRef(handlers);

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

  useEffect(() => {
    if (!enabled || !sessionId) {
      return;
    }

    let shouldReconnect = true;
    let reconnectTimeout = null;

    const connect = () => {
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

        handlersRef.current.onDisconnected?.();

        if (shouldReconnect) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
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

      if (socket) {
        unregisterSocket(socket);

        socket.close();
      }

      socketRef.current = null;
    };
  }, [enabled, sessionId]);

  return {
    socketRef,
    send,
  };
}
