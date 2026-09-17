import { useRoomChat } from "@/hooks/useRoomChat";
import MessageList from "./ChatRoom/MessageList";
import MessageInput from "./ChatRoom/MessageInput";
import { useEffect } from "react";
import { useAuthState } from "@/redux/hooks";

export default function RoomChat({
  room,
  roomId,
  className = "",
  chatType,
  setSelectedRoom,
  renderHeader,
}) {
  const resolvedRoomId = room?.id ?? roomId;

  const {
    messages,
    memberStatus,
    typingMembers,
    hasMore,
    loadingOlder,
    messagesRef,
    sendMessage,
    sendTyping,
  } = useRoomChat(resolvedRoomId);

  const { activeOrganization } = useAuthState();

  // Member status update — direct chat only
  useEffect(() => {
    if (!room?.direct_key || !setSelectedRoom) return;

    const memberIds = room.direct_key.split("_").map(Number);

    const otherMemberId = memberIds.find(
      (id) => id !== activeOrganization?.membership_id,
    );

    if (!otherMemberId) return;

    const status = memberStatus[otherMemberId];

    if (!status) return;

    setSelectedRoom((prev) => ({
      ...prev,
      status,
    }));
  }, [
    room?.direct_key,
    memberStatus,
    activeOrganization?.membership_id,
    setSelectedRoom,
  ]);

  return (
    <div className={className}>
      <div className="flex h-full flex-col">
        {renderHeader?.(typingMembers)}

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
