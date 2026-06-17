import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Video, Clock, ArrowLeft } from "lucide-react";
import { NewChatModal } from "./NewChatModal";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";

const mockVideoCalls = [
  {
    id: "1",
    name: "Website Redesign Team Meeting",
    type: "group",
    duration: "45 mins",
    date: "Today",
    time: "2:30 PM",
    participants: 4,
    avatar: "W",
  },
];

export default function ChatSidebar({
  selectedChat,
  setSelectedChat,
  activeTab,
  setActiveTab,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [chats, setChats] = useState([]);

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

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredVideoCalls = mockVideoCalls.filter((call) =>
    call.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const addChat = (chat) => {
    setChats((prev) => [chat, ...prev]);
    setSelectedChat(chat);
  };

  return (
    <>
      <div
        className={`
          ${selectedChat?.id ? "hidden md:flex" : "flex"}
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
            variant={activeTab === "videocalls" ? "default" : "ghost"}
            onClick={() => setActiveTab("videocalls")}
          >
            <Video className="h-4 w-4" />
            Calls
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "messages"
            ? filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`w-full border-b border-border px-4 py-3 flex items-center gap-3 transition-colors ${
                    selectedChat?.id === chat.id
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <div className="relative shrink-0">
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

                    {!!chat.unread_count && (
                      <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center px-1">
                        {chat.unread_count}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between gap-2">
                      <p className="truncate text-sm font-medium">
                        {chat.title}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {chat.last_message?.created_at
                          ? new Date(
                              chat.last_message.created_at,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </p>
                    </div>

                    <p className="truncate text-xs text-muted-foreground">
                      {chat.last_message?.preview}
                    </p>
                  </div>
                </button>
              ))
            : filteredVideoCalls.map((call) => (
                <div key={call.id} className="px-4 py-3 border-b border-border">
                  {call.name}
                </div>
              ))}
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
