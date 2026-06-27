import { useState, useEffect, useRef, useCallback } from "react";
import Messages from "../Messages";
import { APP_POINTS } from "@/api/apiConfig";
import assort_api from "@/api/axios";
import { Button } from "../../ui/button";

export function ProjectChatTab({
  roomId,
  projectId,
  hasProjectRight,
  onRoomCreated,
}) {
  const [messages, setMessages] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const messagesRef = useRef(null);
  const loadingRef = useRef(false);

  const messageURL = roomId
    ? `${APP_POINTS.CHAT}rooms/${roomId}/messages/`
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
    if (!roomId || !messageURL) return;

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
  }, [roomId]);

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

  const createChat = async () => {
    try {
      const res = await assort_api.post(
        `${APP_POINTS.CHAT}projects/${projectId}/`,
      );

      onRoomCreated?.(res.data.room_id);
    } catch (error) {
      console.error(error);
    }
  };

  if (!roomId)
    return (
      <div className="flex items-center justify-center">
        <div className="max-w-md text-center pt-6">
          <h3>Chat not created</h3>
          {hasProjectRight && (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                Create a dedicated chat room to discuss tasks, share updates,
                and collaborate with your team.
              </p>
              <Button className="mt-6" onClick={createChat}>
                Create Chat Room
              </Button>
            </>
          )}
        </div>
      </div>
    );

  return (
    <div className="h-[calc(100vh-220px)]">
      {messages ? (
        <Messages
          messages={messages}
          hasMore={!!nextCursor}
          loadingOlder={loadingOlder}
          messagesRef={messagesRef}
          sendMessage={sendMessage}
        />
      ) : (
        <div className="text-center">Chat is empty</div>
      )}
    </div>
  );
}
