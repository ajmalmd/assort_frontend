import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  CircleAlert,
  CircleCheck,
  CircleX,
  Clock3,
  Loader2,
  Lock,
  Send,
} from "lucide-react";

import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const TICKET_STATUS = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
};

const statusConfig = {
  [TICKET_STATUS.OPEN]: {
    label: "Open",
    icon: CircleAlert,
    iconClass: "text-red-500",
    badgeClass: "bg-red-50 text-red-600",
  },
  [TICKET_STATUS.IN_PROGRESS]: {
    label: "In Progress",
    icon: Clock3,
    iconClass: "text-amber-500",
    badgeClass: "bg-amber-50 text-amber-600",
  },
  [TICKET_STATUS.RESOLVED]: {
    label: "Resolved",
    icon: CircleCheck,
    iconClass: "text-emerald-500",
    badgeClass: "bg-emerald-50 text-emerald-600",
  },
  [TICKET_STATUS.CLOSED]: {
    label: "Closed",
    icon: CircleX,
    iconClass: "text-slate-500",
    badgeClass: "bg-slate-100 text-slate-600",
  },
};

const statusOptions = [
  TICKET_STATUS.OPEN,
  TICKET_STATUS.IN_PROGRESS,
  TICKET_STATUS.RESOLVED,
  TICKET_STATUS.CLOSED,
];

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

const AdminTicketDetailPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [message, setMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchTicket = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await assort_api.get(
        APP_POINTS.PLATFORM + `tickets/${ticketId}/`,
      );

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

      const res = await assort_api.post(
        APP_POINTS.PLATFORM + `tickets/${ticketId}/messages/`,
        {
          message: value,
          is_internal: isInternal,
        },
      );

      // Add the new message without refetching the whole ticket.
      setTicket((current) => ({
        ...current,
        messages: [...current.messages, res.data],
      }));

      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!ticket || newStatus === ticket.status || updatingStatus) {
      return;
    }

    try {
      setUpdatingStatus(true);

      const res = await assort_api.patch(
        APP_POINTS.PLATFORM + `tickets/${ticketId}/status/`,
        {
          status: newStatus,
        },
      );

      setTicket((current) => ({
        ...current,
        ...res.data,
      }));
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="p-2">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error || "Ticket not found."}</p>
        </div>
      </div>
    );
  }

  const config = statusConfig[ticket.status];
  const StatusIcon = config?.icon || CircleAlert;

  return (
    <div className="p-2">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tickets
      </button>

      {/* Ticket header */}
      <div className="rounded-lg border bg-white p-5">
        <div className="flex items-start justify-between gap-6">
          <div className="flex min-w-0 gap-3">
            <StatusIcon
              className={`mt-1 h-5 w-5 shrink-0 ${
                config?.iconClass || "text-slate-500"
              }`}
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

              <p className="mt-2 max-w-4xl whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {ticket.description}
              </p>
            </div>
          </div>

          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
              config?.badgeClass
            }`}
          >
            {config?.label}
          </span>
        </div>

        {/* Metadata */}
        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t pt-4 text-sm">
          <TicketInfo label="Created by" value={ticket.created_by} />

          <TicketInfo label="Organization" value={ticket.organization} />

          <TicketInfo label="Category" value={ticket.category_display} />

          <TicketInfo label="Priority" value={ticket.priority_display} />

          <TicketInfo
            label="Created"
            value={formatDateTime(ticket.created_at)}
          />
        </div>
      </div>

      {/* Status */}
      <div className="mt-4 rounded-lg border bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Ticket status
            </h2>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Update the current state of this support request.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => {
              const option = statusConfig[status];
              const active = ticket.status === status;

              return (
                <button
                  key={status}
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange(status)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "bg-slate-900 text-white"
                      : "border bg-white text-slate-600 hover:bg-slate-50"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Conversation */}
      <div className="mt-4 rounded-lg border bg-white">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold text-slate-900">Conversation</h2>
        </div>

        <div className="space-y-5 p-5">
          {ticket.messages?.length > 0 ? (
            ticket.messages.map((item) => (
              <TicketMessage key={item.id} message={item} />
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No follow-up messages yet.
              </p>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t p-5">
          <div className="mb-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsInternal(false)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                !isInternal
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              Reply
            </button>

            <button
              type="button"
              onClick={() => setIsInternal(true)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
                isInternal
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <Lock className="h-3 w-3" />
              Internal note
            </button>
          </div>

          {isInternal && (
            <div className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Internal notes are only visible to platform admins.
            </div>
          )}

          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              isInternal ? "Add an internal note..." : "Write a response..."
            }
            rows={4}
            className="resize-none"
          />

          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              disabled={!message.trim() || sending}
              onClick={handleSendMessage}
            >
              {sending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}

              {isInternal ? "Add note" : "Send response"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TicketInfo = ({ label, value }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>

    <p className="mt-0.5 font-medium text-slate-700">{value || "-"}</p>
  </div>
);

const TicketMessage = ({ message }) => {
  if (message.is_internal) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-amber-600" />

          <span className="text-sm font-medium text-amber-900">
            Internal note
          </span>

          <span className="text-xs text-amber-600">
            · {message.sender_name}
          </span>
        </div>

        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-amber-900">
          {message.message}
        </p>

        <p className="mt-2 text-xs text-amber-600">
          {formatDateTime(message.created_at)}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
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
};

export default AdminTicketDetailPage;
