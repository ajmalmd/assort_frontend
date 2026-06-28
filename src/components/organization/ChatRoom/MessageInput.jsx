import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Paperclip, Send, X } from "lucide-react";

export default function MessageInput({sendMessage}) {
  const [messageInput, setMessageInput] = useState("");
  const [attachments, setAttachments] = useState([]);

  const removeAttachment = (indexToRemove) => {
    setAttachments((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleAttachmentSelect = (e) => {
    const newFiles = Array.from(e.target.files || []);

    setAttachments((prev) => {
      const existingKeys = new Set(
        prev.map((file) => `${file.name}-${file.size}-${file.lastModified}`),
      );

      const uniqueFiles = newFiles.filter((file) => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;

        return !existingKeys.has(key);
      });

      return [...prev, ...uniqueFiles];
    });

    e.target.value = "";
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() && attachments.length === 0) {
      return;
    }

    await sendMessage({
      text: messageInput,
      attachments,
    });

    setMessageInput("");
    setAttachments([]);
  };
  return (
    <div className="shrink-0 border-t border-border bg-card p-4">
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((file, index) => {
            const isImage = file.type.startsWith("image/");

            return (
              <div
                key={`${file.name}-${index}`}
                className="
            flex items-center gap-2
            rounded-lg border bg-muted/50
            px-3 py-2
            max-w-[260px]
          "
              >
                {isImage ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <FileText className="h-4 w-4" />
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>

                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 shrink-0"
                  onClick={() => removeAttachment(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" asChild>
          <label htmlFor="chat-attachments" className="cursor-pointer">
            <Paperclip className="h-4 w-4" />
          </label>
        </Button>
        <input
          hidden
          multiple
          type="file"
          id="chat-attachments"
          onChange={handleAttachmentSelect}
        />

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
  );
}
