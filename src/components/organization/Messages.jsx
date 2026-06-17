import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, ImageIcon, Paperclip, Send } from "lucide-react";

const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

function AttachmentCard({ attachment }) {
  if (attachment.type === "IMAGE") {
    return (
      <img
        src={attachment.url}
        alt={attachment.original_name}
        className="mt-2 rounded-lg max-h-60"
      />
    );
  }

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noreferrer"
      className="mt-2 flex items-center gap-2 rounded-lg border p-3"
    >
      <FileText className="h-4 w-4" />
      <span>{attachment.original_name}</span>
      <Download className="ml-auto h-4 w-4" />
    </a>
  );
}

export default function Messages({
  messages,
  hasMore,
  loadingOlder,
  messagesRef,
  sendMessage,
}) {
  const [messageInput, setMessageInput] = useState("");

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    await sendMessage({
      text: messageInput,
    });

    setMessageInput("");
  };

  return (
    <div className="flex h-full flex-col">
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
            <div
              key={message.id}
              className={`flex ${
                message.is_mine ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.is_mine
                    ? "bg-primary text-primary-foreground"
                    : "bg-white"
                }`}
              >
                {message.text && (
                  <p className="whitespace-pre-wrap text-sm">{message.text}</p>
                )}

                {message.attachments?.map((attachment) => (
                  <AttachmentCard key={attachment.id} attachment={attachment} />
                ))}

                <div className="mt-2 text-xs opacity-70">
                  {formatTime(message.created_at)}
                  {message.is_edited && " (edited)"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost">
            <Paperclip className="h-4 w-4" />
          </Button>

          <textarea
            rows={1}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 resize-none rounded-md border p-2"
          />

          <Button size="icon" onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
