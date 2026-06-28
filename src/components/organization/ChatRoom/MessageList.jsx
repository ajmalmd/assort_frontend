import { useAuthState } from "@/redux/hooks";
import MessageBubble from "./MessageBubble";

export default function MessageList({
  messages,
  hasMore,
  loadingOlder,
  messagesRef,
  chatType,
}) {
  const { activeOrganization } = useAuthState();

  return (
    <div ref={messagesRef} className="flex-1 overflow-y-auto p-4">
      {hasMore && (
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-muted px-3 py-1 text-xs">
            {loadingOlder ? "Loading..." : "Scroll up for older messages"}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isMine={activeOrganization.membership_id === message.sender_id}
            senderName={
              activeOrganization.membership_id !== message.sender_id &&
              chatType !== "DIRECT"
                ? message.sender_name
                : null
            }
          />
        ))}
      </div>
    </div>
  );
}
