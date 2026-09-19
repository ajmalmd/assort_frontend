import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  CircleAlert,
  CircleCheck,
  CircleX,
  Clock3,
  Loader2,
  Send,
} from "lucide-react";

import DotsBg from "@/assets/images/DotsBg.png";

import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const statusConfig = {
  OPEN: {
    label: "Open",
    icon: CircleAlert,
    iconClass: "text-red-500",
    badgeClass: "bg-red-50 text-red-600",
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: Clock3,
    iconClass: "text-amber-500",
    badgeClass: "bg-amber-50 text-amber-600",
  },
  RESOLVED: {
    label: "Resolved",
    icon: CircleCheck,
    iconClass: "text-emerald-500",
    badgeClass: "bg-emerald-50 text-emerald-600",
  },
  CLOSED: {
    label: "Closed",
    icon: CircleX,
    iconClass: "text-slate-500",
    badgeClass: "bg-slate-100 text-slate-600",
  },
};

const formatDateTime = (dateString) => {
  if (!dateString) return "-";

  return new Date(dateString).toLocaleString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const TicketDetailPage = () => {
  const navigate = useNavigate();
  const { ticketId } = useParams();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [messageError, setMessageError] = useState("");

  const fetchTicket = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await assort_api.get(`${APP_POINTS.TICKETS}${ticketId}/`);

      setTicket(res.data);
    } catch (error) {
      console.error("Failed to fetch ticket:", error);

      setError("Unable to load ticket.");
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const handleSendMessage = async () => {
    const value = message.trim();

    if (!value || sending) return;

    try {
      setSending(true);
      setMessageError("");

      const res = await assort_api.post(
        `${APP_POINTS.TICKETS}${ticketId}/messages/`,
        {
          message: value,
        },
      );

      setTicket((current) => ({
        ...current,
        messages: [...(current.messages || []), res.data],
      }));

      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);

      setMessageError(
        error.response?.data?.detail || "Unable to send your response.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-repeat bg-gray-400"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${DotsBg})`,
      }}
    >
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex items-center gap-2 px-4 py-4 text-gray-700 lg:px-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="transition-colors hover:text-gray-900"
          >
            <ArrowLeft size={20} />
          </button>

          <span className="font-medium">Ticket Details</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && ticket && (
          <TicketContent
            ticket={ticket}
            message={message}
            setMessage={setMessage}
            sending={sending}
            messageError={messageError}
            onSend={handleSendMessage}
          />
        )}
      </div>
    </div>
  );
};

const TicketContent = ({
  ticket,
  message,
  setMessage,
  sending,
  messageError,
  onSend,
}) => {
  const config = statusConfig[ticket.status];

  const StatusIcon = config?.icon || CircleAlert;

  const canReply = ticket.status !== "CLOSED";

  return (
    <div className="space-y-4">
      {/* Ticket */}
      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-5">
          <div className="flex min-w-0 gap-3">
            <StatusIcon
              className={`mt-1 h-5 w-5 shrink-0 ${config?.iconClass}`}
            />

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold text-slate-900">
                  {ticket.title}
                </h1>

                <span className="text-xs text-muted-foreground">
                  #{ticket.id}
                </span>
              </div>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {ticket.description}
              </p>
            </div>
          </div>

          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${config?.badgeClass}`}
          >
            {config?.label}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t pt-4">
          <Info label="Category" value={ticket.category_display} />

          <Info label="Priority" value={ticket.priority_display} />

          <Info label="Created" value={formatDateTime(ticket.created_at)} />

          {ticket.resolved_at && (
            <Info label="Resolved" value={formatDateTime(ticket.resolved_at)} />
          )}
        </div>
      </div>

      {/* Conversation */}
      <div className="rounded-lg border bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold text-slate-900">Conversation</h2>

          <p className="mt-0.5 text-xs text-muted-foreground">
            Follow up with the platform support team.
          </p>
        </div>

        <div className="space-y-6 p-5">
          {ticket.messages?.length > 0 ? (
            ticket.messages.map((item) => (
              <Message key={item.id} message={item} />
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No responses yet.</p>

              <p className="mt-1 text-xs text-muted-foreground">
                The platform team will follow up here.
              </p>
            </div>
          )}
        </div>

        {/* Reply */}
        <div className="border-t p-5">
          {canReply ? (
            <>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a response..."
                rows={4}
                disabled={sending}
                className="resize-none"
              />

              {messageError && (
                <p className="mt-2 text-sm text-red-600">{messageError}</p>
              )}

              <div className="mt-3 flex justify-end">
                <Button
                  type="button"
                  onClick={onSend}
                  disabled={sending || !message.trim()}
                >
                  {sending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Send response
                </Button>
              </div>
            </>
          ) : (
            <div className="rounded-md bg-slate-50 px-4 py-3 text-center">
              <p className="text-sm text-slate-600">
                This ticket has been closed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>

    <p className="mt-0.5 text-sm font-medium text-slate-700">{value || "-"}</p>
  </div>
);

const Message = ({ message }) => (
  <div>
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-slate-800">
        {message.sender_name}
      </span>

      <span className="text-xs text-muted-foreground">
        {formatDateTime(message.created_at)}
      </span>
    </div>

    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">
      {message.message}
    </p>
  </div>
);

export default TicketDetailPage;
