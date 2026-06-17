import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Video } from "lucide-react";
import { formatEnum } from "@/appFunctions";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import { useNavigate } from "react-router";
import Messages from "../Messages";

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

    const fetchMessages = async () => {
      const res = await assort_api.get(messageURL);

      const orderedMessages = [...res.data.messages].reverse();

      setMessages(orderedMessages);
      setNextCursor(res.data.next_cursor);

      requestAnimationFrame(() => {
        const container = messagesRef.current;

        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    };

    fetchMessages();
  }, [currentChat?.id]);

  const sendMessage = async (payload) => {
    const res = await assort_api.post(messageURL, payload);

    setMessages((prev) => [...prev, res.data]);

    requestAnimationFrame(() => {
      const container = messagesRef.current;

      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });

    return res.data;
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
