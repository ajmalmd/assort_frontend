import { useState } from "react";
import ChatSidebar from "@/components/organization/ChatsPage/ChatSidebar";
import Chat from "@/components/organization/ChatsPage/Chat";
import CallDetails from "@/components/organization/ChatsPage/CallDetails";

export default function ChatsPage() {
  const [activeTab, setActiveTab] = useState("messages");
  const [selectedRoom, setSelectedRoom] = useState({});
  return (
    <div className="flex h-[calc(100dvh-7rem)] min-h-0 overflow-hidden border rounded-xl">
      <ChatSidebar
        selectedRoom={selectedRoom}
        setSelectedRoom={setSelectedRoom}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 min-w-0 overflow-hidden">
        {activeTab === "messages" && (
          <Chat currentRoom={selectedRoom} setSelectedRoom={setSelectedRoom} />
        )}

        {activeTab === "calls" && (
          <CallDetails
            currentRoom={selectedRoom}
            setSelectedRoom={setSelectedRoom}
          />
        )}
      </div>
    </div>
  );
}
