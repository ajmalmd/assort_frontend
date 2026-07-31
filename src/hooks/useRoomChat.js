import { useState, useRef, useEffect, useCallback } from "react";
import { useRoomSocket } from "@/websocket/useRoomSocket";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";

export function chatEventRouter(event, handlers) {
  switch (event.type) {
    case "message":
      handlers.onMessage?.(event.data);
      break;

    case "member_status":
      handlers.onChangeStatus?.(event.member_id, event.status);
      break;

    case "typing":
      handlers.onTyping?.(event.member_id, event.is_typing);
      break;

    case "seen":
      handlers.onSeen?.({
        member_id: event.member_id,
        last_read_message_id: event.last_read_message_id,
      });

      break;

    default:
      break;
  }
}

export function useRoomChat(roomId) {
  const [messages, setMessages] = useState([]);
  const [memberStatus, setMemberStatus] = useState({});
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const messagesRef = useRef(null);
  const loadingRef = useRef(false);
  const pendingSeenRef = useRef(false);

  const messageURL = roomId
    ? `${APP_POINTS.CHAT}rooms/${roomId}/messages/`
    : null;

  /**
   * ---------------------------------------
   * Append Message (single mutation point)
   * ---------------------------------------
   */
  const appendMessage = useCallback((message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) {
        return prev;
      }

      return [...prev, message];
    });

    requestAnimationFrame(() => {
      const container = messagesRef.current;

      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
  }, []);

  /**
   * ---------------------------------------
   * Room Socket
   * ---------------------------------------
   */
  const roomSocket = useRoomSocket(roomId, {
    onOpen: () => {
      if (pendingSeenRef.current) {
        markSeen();
      }
    },

    onEvent: (event) =>
      chatEventRouter(event, {
        onMessage: (message) => {
          appendMessage(message);
          markSeen();
        },

        onChangeStatus: (member_id, status) => {
          setMemberStatus((prev) => ({
            ...prev,
            [member_id]: status,
          }));
        },

        onSeen: ({ member_id, last_read_message_id }) => {
          console.log("Seen by", member_id, last_read_message_id);
        },

        onTyping: (member_id, is_typing) => {
          console.log(member_id, is_typing);
        },
      }),
  });

  /**
   * ---------------------------------------
   * Mark Seen
   * ---------------------------------------
   */
  const markSeen = useCallback(() => {
    const socket = roomSocket.current;

    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "mark_seen",
        }),
      );

      pendingSeenRef.current = false;
    } else {
      pendingSeenRef.current = true;
    }
  }, [roomSocket]);

  /**
   * ---------------------------------------
   * Initial Fetch
   * ---------------------------------------
   */
  useEffect(() => {
    if (!roomId || !messageURL) return;

    setMessages([]);
    setNextCursor(null);

    const controller = new AbortController();

    const fetchMessages = async () => {
      try {
        const res = await assort_api.get(messageURL, {
          signal: controller.signal,
        });

        const ordered = [...res.data.messages].reverse();

        setMessages(ordered);
        setNextCursor(res.data.next_cursor);

        requestAnimationFrame(() => {
          const container = messagesRef.current;

          if (container) {
            container.scrollTop = container.scrollHeight;
          }

          markSeen();
        });
      } catch (error) {
        if (error.name !== "AbortError" && error.name !== "CanceledError") {
          console.error(error);
        }
      }
    };

    fetchMessages();

    return () => controller.abort();
  }, [roomId, messageURL, markSeen]);

  /**
   * ---------------------------------------
   * Load Older
   * ---------------------------------------
   */
  const loadOlderMessages = useCallback(async () => {
    if (!nextCursor || loadingRef.current) return;

    const container = messagesRef.current;

    if (!container) return;

    const previousHeight = container.scrollHeight;

    loadingRef.current = true;
    setLoadingOlder(true);

    try {
      const res = await assort_api.get(messageURL, {
        params: {
          cursor: nextCursor,
        },
      });

      const older = [...res.data.messages].reverse();

      setMessages((prev) => [...older, ...prev]);

      setNextCursor(res.data.next_cursor);

      requestAnimationFrame(() => {
        container.scrollTop += container.scrollHeight - previousHeight;
      });
    } finally {
      loadingRef.current = false;
      setLoadingOlder(false);
    }
  }, [messageURL, nextCursor]);

  /**
   * ---------------------------------------
   * Scroll Listener
   * ---------------------------------------
   */
  useEffect(() => {
    const container = messagesRef.current;

    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop < 100 && nextCursor && !loadingRef.current) {
        loadOlderMessages();
      }
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [loadOlderMessages, nextCursor]);

  /**
   * ---------------------------------------
   * Send Message
   * ---------------------------------------
   */
  const sendMessage = useCallback(
    async ({ text, attachments = [], reply_to = null }) => {
      if (!messageURL) return;

      if (attachments.length) {
        const formData = new FormData();

        formData.append("text", text || "");

        if (reply_to) {
          formData.append("reply_to", reply_to);
        }

        attachments.forEach((file) => {
          formData.append("attachments", file);
        });

        await assort_api.post(messageURL, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        return;
      }

      const socket = roomSocket.current;

      if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.warn("Room socket not connected");
        return;
      }

      socket.send(
        JSON.stringify({
          type: "send_message",
          text,
          reply_to,
        }),
      );
    },
    [messageURL, roomSocket],
  );

  return {
    messages,
    memberStatus,
    hasMore: !!nextCursor,
    loadingOlder,
    messagesRef,
    sendMessage,
    loadOlderMessages,
    markSeen,
  };
}
