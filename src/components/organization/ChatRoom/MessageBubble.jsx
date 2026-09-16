import { useState } from "react";
import { Eye, FileText, Download } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MEDIA_URL } from "@/api/apiConfig";

const formatMessageDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();

  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Today
  if (date.toDateString() === now.toDateString()) {
    return time;
  }

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${time}`;
  }

  // Current year
  if (date.getFullYear() === now.getFullYear()) {
    return `${date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    })}, ${time}`;
  }

  // Previous years
  return `${date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "2-digit",
  })}, ${time}`;
};

function AttachmentCard({ attachment }) {
  const [showPreview, setShowPreview] = useState(false);

  const fileUrl = MEDIA_URL + attachment.url;

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await fetch(fileUrl);

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = attachment.original_name || "download";

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Failed to download attachment:", error);
    }
  };

  if (attachment.type === "IMAGE") {
    return (
      <>
        <div className="group relative mt-2 overflow-hidden rounded-lg">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="block cursor-zoom-in"
            title="Preview image"
          >
            <img
              src={fileUrl}
              alt={attachment.original_name}
              loading="lazy"
              className="max-h-60 w-auto rounded-lg object-contain"
            />
          </button>

          <div
            className="
      absolute right-2 top-2
      flex items-center gap-1
      rounded-md bg-background/90 p-1
      opacity-0 shadow-sm backdrop-blur-sm
      transition-opacity
      group-hover:opacity-100
      focus-within:opacity-100
    "
          >
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              title="Preview image"
              className="
        flex h-8 w-8 items-center justify-center
        rounded-md text-foreground
        transition-colors hover:bg-muted
      "
            >
              <Eye className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleDownload}
              title="Download image"
              className="
                flex h-8 w-8 items-center justify-center rounded-md 
                text-foreground transition-colors hover:bg-muted
              "
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Image Preview */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-[95vw] overflow-hidden p-0 sm:max-w-5xl">
            <div className="flex items-center justify-between gap-4 border-b px-4 py-3">
              <p className="min-w-0 truncate pr-4 text-sm font-medium">
                {attachment.original_name}
              </p>

              <button
                type="button"
                onClick={handleDownload}
                className="
                  mr-6 flex shrink-0 items-center gap-2
                  rounded-md border px-3 py-2
                  text-sm font-medium
                  transition-colors hover:bg-muted
                "
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>

            <div
              className="
                flex max-h-[80vh] min-h-[300px]
                items-center justify-center
                overflow-auto bg-muted/30 p-4
              "
            >
              <img
                src={fileUrl}
                alt={attachment.original_name}
                className="max-h-[75vh] max-w-full object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="mt-2 flex min-w-0 items-center gap-3 rounded-lg border p-3">
      <FileText className="h-4 w-4 shrink-0" />

      <span className="block min-w-0 flex-1 truncate text-sm">
        {attachment.original_name}
      </span>

      <button
        type="button"
        onClick={handleDownload}
        title="Download file"
        className="
          flex h-7 w-7 shrink-0 items-center justify-center
          rounded-md transition-colors hover:bg-black/10
        "
      >
        <Download className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function MessageBubble({ message, isMine, senderName }) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isMine
            ? "bg-primary text-primary-foreground"
            : "bg-white shadow-sm border"
        }`}
      >
        {senderName && !isMine && (
          <p className="mb-1 text-xs font-semibold text-primary">
            {senderName}
          </p>
        )}

        {message.text && (
          <p className="whitespace-pre-wrap text-sm leading-6">
            {message.text}
          </p>
        )}

        {message.attachments?.map((attachment) => (
          <AttachmentCard key={attachment.id} attachment={attachment} />
        ))}

        <div className="mt-2 text-right text-[11px] opacity-70">
          {formatMessageDate(message.created_at)}
          {message.is_edited && " • Edited"}
        </div>
      </div>
    </div>
  );
}
