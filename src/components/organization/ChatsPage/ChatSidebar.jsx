import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Plus,
  Video,
  Clock,
  PhoneIncoming,
  PhoneOutgoing,
} from "lucide-react";

import { NewChatModal } from "./NewChatModal";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import { useChatListSocket } from "@/websocket/useChatListSocket";

const mockCalls = [
  {
    chat_room_id: 101,
    room_type: "DIRECT",
    title: "John Doe",
    image: null,
    last_call: {
      id: 501,
      started_at: "2026-08-06T10:30:15Z",
      duration: 320,
      direction: "OUTGOING",
      is_call_active: false,
    },
  },
  {
    chat_room_id: 102,
    room_type: "GROUP",
    title: "Project Alpha",
    image: null,
    last_call: {
      id: 502,
      started_at: "2026-08-06T15:45:00Z",
      duration: 0,
      direction: "INCOMING",
      is_call_active: true,
    },
  },
  {
    chat_room_id: 103,
    room_type: "DIRECT",
    title: "Alice",
    image: null,
    last_call: null,
  },
];

export default function ChatSidebar({
  selectedRoom,
  setSelectedRoom,
  activeTab,
  setActiveTab,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [calls, setCalls] = useState([]);
  const [lastMeeting, setLastMeeting] = useState({
    id: 502,
    started_at: "2026-08-06T15:45:00Z",
    duration: 0,
    is_call_active: true,
  });
  const formatSidebarDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();

    // Today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    // Any other date
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString([], { month: "short" });
    const year = String(date.getFullYear()).slice(-2);

    return `${day} ${month} ${year}`;
  };

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await assort_api.get(APP_POINTS.CHAT + "rooms/");
        setChats(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchChats();
  }, []);

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

  const filteredcallRooms = mockCalls.filter((call) =>
    call.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const addChat = (chat) => {
    setChats((prev) => [chat, ...prev]);
    setSelectedRoom(chat);
  };

  return (
    <>
      <div
        className={`
          ${selectedRoom?.id ? "hidden md:flex" : "flex"}
          w-full md:w-80
          flex-col
          border-r
          border-border
          bg-card
          h-full
          overflow-hidden
        `}
      >
        <div className="border-b border-border p-4 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Chats</h2>

            <Button
              size="sm"
              className="gap-2"
              onClick={() => setNewChatModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              New
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                activeTab === "messages" ? "Search chats..." : "Search calls..."
              }
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex gap-2 border-b border-border p-2 shrink-0">
          <Button
            size="sm"
            className="flex-1"
            variant={activeTab === "messages" ? "default" : "ghost"}
            onClick={() => setActiveTab("messages")}
          >
            Messages
          </Button>

          <Button
            size="sm"
            className="flex-1 gap-2"
            variant={activeTab === "calls" ? "default" : "ghost"}
            onClick={() => setActiveTab("calls")}
          >
            <Video className="h-4 w-4" />
            Calls
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "messages" ? (
            filteredChats.map((chat) => (
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
                      <p className="truncate text-sm font-medium">
                        {chat.title}
                      </p>

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
            ))
          ) : (
            <>
              <button
                // onClick={() => setSelectedRoom(call)}
                className={`w-full border-b border-border px-4 py-3 flex items-center gap-3 transition-colors hover:bg-accent/50`}
                //   ${
                //   selectedRoom?.chat_room_id === room.chat_room_id
                //     ? "bg-accent text-accent-foreground"
                //     : "hover:bg-accent/50"
                // }
              >
                {/* <div className="shrink-0">
                  <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    Meetings
                  </div>
                </div> */}
                <div className="flex-1 min-w-0 flex justify-between gap-3">
                  <div className="min-w-0 ml-12 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-lg font-bold">Meetings</p>
                    </div>

                    {lastMeeting ? (
                      lastMeeting.is_call_active ? (
                        <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                          <Video className="h-3 w-3" />
                          <span>Ongoing meeting</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {Math.floor(lastMeeting.duration / 60)}m{" "}
                            {lastMeeting.duration % 60}s
                          </span>
                        </div>
                      )
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">
                        No calls yet
                      </p>
                    )}
                  </div>
                </div>
              </button>

              {/* call rooms */}
              {filteredcallRooms.map((room) => (
                <button
                  key={room.chat_room_id}
                  // onClick={() => setSelectedRoom(call)}
                  className={`w-full border-b border-border px-4 py-3 flex items-center gap-3 transition-colors ${
                    selectedRoom?.chat_room_id === room.chat_room_id
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <div className="shrink-0">
                    {room.image ? (
                      <img
                        src={room.image}
                        alt={room.title}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                        {room.title.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">
                          {room.title}
                        </p>
                      </div>

                      {room.last_call ? (
                        room.last_call.is_call_active ? (
                          <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                            <Video className="h-3 w-3" />
                            <span>Ongoing call</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            {room.last_call.direction === "OUTGOING" ? (
                              <>
                                <PhoneOutgoing className="h-3.5 w-3.5 text-green-600" />
                                <span>Outgoing</span>
                              </>
                            ) : (
                              <>
                                <PhoneIncoming className="h-3.5 w-3.5 text-sky-600" />
                                <span>Incoming</span>
                              </>
                            )}

                            <span>•</span>

                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {Math.floor(room.last_call.duration / 60)}m{" "}
                              {room.last_call.duration % 60}s
                            </span>
                          </div>
                        )
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">
                          No calls yet
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      {room.last_call && (
                        <p className="text-xs text-muted-foreground">
                          {formatSidebarDate(room.last_call.started_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      <NewChatModal
        open={newChatModalOpen}
        onOpenChange={setNewChatModalOpen}
        createdChat={addChat}
      />
    </>
  );
}
