import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Video } from "lucide-react";

import SidebarChatsTab from "./SidebarChatsTab";
import SidebarCallsTab from "./SidebarCallsTab";
import { NewChatModal } from "./NewChatModal";

import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";

export default function ChatSidebar({
  selectedRoom,
  setSelectedRoom,
  activeTab,
  setActiveTab,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [chats, setChats] = useState([]);

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
    if (activeTab !== "messages") return;

    const fetchChats = async () => {
      try {
        const res = await assort_api.get(APP_POINTS.CHAT + "rooms/");
        setChats(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchChats();
  }, [activeTab]);

  const addChat = (chat) => {
    setChats((prev) => {
      const exists = prev.some((c) => c.id === chat.id);
      if (exists) return prev;

      return [chat, ...prev];
    });
    setActiveTab("messages");
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
            onClick={() => {
              setActiveTab("messages");
              setSelectedRoom(null);
            }}
          >
            Messages
          </Button>

          <Button
            size="sm"
            className="flex-1 gap-2"
            variant={activeTab === "calls" ? "default" : "ghost"}
            onClick={() => {
              setActiveTab("calls");
              setSelectedRoom(null);
            }}
          >
            <Video className="h-4 w-4" />
            Calls
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "messages" ? (
            <SidebarChatsTab
              chats={chats}
              setChats={setChats}
              formatSidebarDate={formatSidebarDate}
              searchTerm={searchTerm}
              selectedRoom={selectedRoom}
              setSelectedRoom={setSelectedRoom}
            />
          ) : (
            <SidebarCallsTab
              formatSidebarDate={formatSidebarDate}
              searchTerm={searchTerm}
              selectedRoom={selectedRoom}
              setSelectedRoom={setSelectedRoom}
            />
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
