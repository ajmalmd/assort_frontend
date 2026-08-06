import { useState } from "react";
import ChatSidebar from "@/components/organization/ChatsPage/ChatSidebar";
import Chat from "@/components/organization/ChatsPage/Chat";
import CallHistory from "@/components/organization/ChatsPage/CallHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthState } from "@/redux/hooks";
import { isOrgOwnerorAdmin } from "@/appFunctions";

function MyChat() {
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

        {activeTab === "calls" && <CallHistory currentRoom={selectedRoom}/>}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { activeOrganization } = useAuthState();
  return isOrgOwnerorAdmin(activeOrganization.role) ? (
    <Tabs defaultValue="myChat" className="w-full">
      <TabsList className="grid grid-cols-2">
        <TabsTrigger value="myChat">My Chats</TabsTrigger>
        <TabsTrigger value="orgChat">Org Chats</TabsTrigger>
      </TabsList>

      <TabsContent value="myChat">
        <MyChat />
      </TabsContent>

      <TabsContent value="orgChat">
        <div>Manage Chat</div>
      </TabsContent>
    </Tabs>
  ) : (
    <MyChat />
  );
}
