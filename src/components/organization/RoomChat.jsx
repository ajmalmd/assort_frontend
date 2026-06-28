import { useRoomChat } from "@/hooks/useRoomChat";
import MessageList from "./ChatRoom/MessageList";
import MessageInput from "./ChatRoom/MessageInput";

export default function RoomChat({ roomId, className = "", chatType }) {
  const { messages, hasMore, loadingOlder, messagesRef, sendMessage } =
    useRoomChat(roomId);

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

        <MessageInput sendMessage={sendMessage} />
      </div>
    </div>
  );
}
