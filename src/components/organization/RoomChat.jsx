import { useRoomChat } from "@/hooks/useRoomChat";
import MessageList from "./ChatRoom/MessageList";
import MessageInput from "./ChatRoom/MessageInput";
import { useEffect } from "react";
import { useAuthState } from "@/redux/hooks";

export default function RoomChat({
  room,
  className = "",
  chatType,
  setSelectedRoom,
  onTypingChange,
}) {
  const {
    messages,
    memberStatus,
    typingMembers,
    hasMore,
    loadingOlder,
    messagesRef,
    sendMessage,
    sendTyping,
  } = useRoomChat(room.id);

  const { activeOrganization } = useAuthState();

  useEffect(() => {
    onTypingChange?.(typingMembers);
  }, [typingMembers, onTypingChange]);

  // member status update (direct chat only)
  useEffect(() => {
    if (!room?.direct_key) return;

    const memberIds = room.direct_key.split("_").map(Number);

    const otherMemberId = memberIds.find(
      (id) => id !== activeOrganization?.membership_id,
    );

    if (!otherMemberId) return;

    const status = memberStatus[otherMemberId];

    if (!status) return;

    setSelectedRoom((prev) => {
      return {
        ...prev,
        status,
      };
    });
  }, [memberStatus]);

  return (
    <div className={className}>
      <div className="flex h-full flex-col">
        <MessageList
          messages={messages}
          hasMore={hasMore}
          loadingOlder={loadingOlder}
          messagesRef={messagesRef}
          chatType={chatType}
        />

        <MessageInput sendMessage={sendMessage} sendTyping={sendTyping} />
      </div>
    </div>
  );
}
