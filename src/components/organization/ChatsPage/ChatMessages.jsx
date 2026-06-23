import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { formatEnum } from "@/appFunctions";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import { useNavigate } from "react-router";
import Messages from "../Messages";
import { useRoomSocket } from "@/websocket/useRoomSocket";

export default function ChatMessages({
  currentChat,
  setDetailCon,
  setSelectedChat,
}) {
  const [messages, setMessages] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const messagesRef = useRef(null);
  const loadingRef = useRef(false);
  const messagesLoadedRef = useRef(false);

  const navigate = useNavigate();

  const messageURL = currentChat?.id
    ? `${APP_POINTS.CHAT}rooms/${currentChat.id}/messages/`
    : null;

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

      const olderMessages = [...res.data.messages].reverse();

      setMessages((prev) => [...olderMessages, ...prev]);

      setNextCursor(res.data.next_cursor);

      requestAnimationFrame(() => {
        const newHeight = container.scrollHeight;

        container.scrollTop += newHeight - previousHeight;
      });
    } finally {
      loadingRef.current = false;
      setLoadingOlder(false);
    }
  }, [messageURL, nextCursor]);

  const pendingSeenRef = useRef(false);

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
  }, []);

  const roomSocket = useRoomSocket(currentChat?.id, {
    onOpen: () => {
      if (pendingSeenRef.current) {
        markSeen();
      }
    },

    onMessage: (message) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === message.id);

        if (exists) {
          return prev;
        }

        return [...prev, message];
      });

      requestAnimationFrame(() => {
        const container = messagesRef.current;

        if (container) {
          container.scrollTop = container.scrollHeight;
        }

        markSeen();
      });
    },

    onSeen: (data) => {
      console.log("SEEN", data);
    },
  });

  useEffect(() => {
    setMessages([]);
    setNextCursor(null);

    messagesLoadedRef.current = false;
  }, [currentChat?.id]);

  useEffect(() => {
    const container = messagesRef.current;

    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop < 100 && nextCursor && !loadingRef.current) {
        loadOlderMessages();
      }
    };

    container.addEventListener("scroll", handleScroll);

    return () => container.removeEventListener("scroll", handleScroll);
  }, [loadOlderMessages, nextCursor]);

  useEffect(() => {
    if (!currentChat?.id || !messageURL) return;

    const controller = new AbortController();

    const fetchMessages = async () => {
      try {
        const res = await assort_api.get(messageURL, {
          signal: controller.signal,
        });

        const orderedMessages = [...res.data.messages].reverse();

        setMessages(orderedMessages);
        setNextCursor(res.data.next_cursor);

        messagesLoadedRef.current = true;

        requestAnimationFrame(() => {
          const container = messagesRef.current;

          if (container) {
            container.scrollTop = container.scrollHeight;
          }

          markSeen();
        });
      } catch (error) {
        if (error.name !== "CanceledError" && error.name !== "AbortError") {
          console.error(error);
        }
      }
    };

    fetchMessages();

    return () => {
      controller.abort();
    };
  }, [currentChat?.id, messageURL, markSeen]);

  const sendMessage = async ({ text, attachments = [], reply_to = null }) => {
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

    if (
      !roomSocket.current ||
      roomSocket.current.readyState !== WebSocket.OPEN
    ) {
      console.warn("Room socket not connected");
      return;
    }

    roomSocket.current.send(
      JSON.stringify({
        type: "send_message",
        text,
        reply_to,
      }),
    );
  };

  if (!currentChat?.id) return null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border bg-card p-4 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            onClick={() => setSelectedChat({})}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div
            onClick={() =>
              currentChat.type === "GROUP"
                ? setDetailCon(true)
                : currentChat.type === "PROJECT"
                  ? navigate(`/app/project/${currentChat.project}`)
                  : setDetailCon(true)
            }
          >
            <p className="font-semibold">{currentChat.title}</p>

            <p className="text-xs text-muted-foreground">
              {currentChat.type === "DIRECT"
                ? formatEnum(currentChat.status)
                : currentChat.type}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <Messages
          messages={messages}
          hasMore={!!nextCursor}
          loadingOlder={loadingOlder}
          messagesRef={messagesRef}
          sendMessage={sendMessage}
        />
      </div>
    </div>
  );
}
