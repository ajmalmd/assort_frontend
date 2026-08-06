import { useState, useEffect } from "react";
import { Video } from "lucide-react";

import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import { useChatListSocket } from "@/websocket/useChatListSocket";

export default function SidebarChatsTab({
  chats,
  setChats,
  searchTerm,
  formatSidebarDate,
  selectedRoom,
  setSelectedRoom,
}) {
  useChatListSocket({
    onRoomCreated: (room) => {
      setChats((prev) => {
        const exists = prev.some((chat) => chat.id === room.id);
        if (exists) return prev;

        return [room, ...prev];
      });
    },

    onRoomUpdated: (roomId, changes) => {
      setChats((prev) => {
        const updated = prev.map((chat) =>
          chat.id === roomId
            ? {
                ...chat,
                ...changes,
              }
            : chat,
        );

        // Move room to top when last message changes
        if (changes.last_message) {
          const room = updated.find((c) => c.id === roomId);
          return [room, ...updated.filter((c) => c.id !== roomId)];
        }

        return updated;
      });

      setSelectedRoom((prev) =>
        prev?.id === roomId
          ? {
              ...prev,
              ...changes,
            }
          : prev,
      );
    },
  });

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <>
      {filteredChats.map((chat) => (
        <button
          key={chat.id}
          onClick={() => {
            setSelectedRoom({
              ...chat,
              unread_count: 0,
            });

            setChats((prev) =>
              prev.map((c) =>
                c.id === chat.id
                  ? {
                      ...c,
                      unread_count: 0,
                    }
                  : c,
              ),
            );
          }}
          className={`w-full border-b border-border px-4 py-3 flex items-center gap-3 transition-colors ${
            selectedRoom?.id === chat.id
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent/50"
          }`}
        >
          <div className="shrink-0">
            {chat.image ? (
              <img
                src={chat.image}
                alt={chat.title}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                {chat.title.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 text-left flex justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 min-w-0">
                <p className="truncate text-sm font-medium">{chat.title}</p>

                {chat.active_call && (
                  <span className="flex items-center gap-1 text-xs text-green-600 shrink-0">
                    <Video className="h-3 w-3 fill-current" />
                    Live
                  </span>
                )}
              </div>

              <p className="truncate text-xs text-muted-foreground">
                {chat.last_message?.preview}
              </p>
            </div>

            <div className="flex flex-col items-end shrink-0">
              <p className="text-xs text-muted-foreground">
                {chat.last_message?.created_at
                  ? formatSidebarDate(chat.last_message.created_at)
                  : ""}
              </p>

              {!!chat.unread_count && (
                <div className="mt-1 min-w-[18px] h-[18px] rounded-full bg-black text-white text-[10px] flex items-center justify-center px-1">
                  {chat.unread_count}
                </div>
              )}
            </div>
          </div>
        </button>
      ))}
    </>
  );
}
