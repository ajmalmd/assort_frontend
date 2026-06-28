import { FileText, Download } from "lucide-react";
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
  if (attachment.type === "IMAGE") {
    return (
      <a
        href={MEDIA_URL + attachment.url}
        target="_blank"
        rel="noreferrer"
        className="mt-2 flex items-center"
      >
        <img
          src={MEDIA_URL + attachment.url}
          alt={attachment.original_name}
          className=" rounded-lg max-h-60"
        />
      </a>
    );
  }

  return (
    <a
      href={MEDIA_URL + attachment.url}
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
