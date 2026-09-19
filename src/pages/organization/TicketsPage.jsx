import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  CircleAlert,
  CircleCheck,
  CircleX,
  Clock3,
  Loader2,
  Plus,
  Search,
} from "lucide-react";

import DotsBg from "@/assets/images/DotsBg.png";

import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import RaiseTicketModal from "@/components/organization/RaiseTicketModal";

const TICKET_STATUS = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
};

const filters = [
  { label: "All", value: "ALL" },
  { label: "Open", value: TICKET_STATUS.OPEN },
  { label: "In Progress", value: TICKET_STATUS.IN_PROGRESS },
  { label: "Resolved", value: TICKET_STATUS.RESOLVED },
  { label: "Closed", value: TICKET_STATUS.CLOSED },
];

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

const formatDate = (dateString) => {
  if (!dateString) return "-";

  return new Date(dateString).toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const TicketsPage = () => {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const [raiseTicketOpen, setRaiseTicketOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await assort_api.get(APP_POINTS.TICKETS);

      setTickets(res.data);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      setError("Unable to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesStatus =
        activeFilter === "ALL" || ticket.status === activeFilter;

      const matchesSearch =
        !query ||
        ticket.title.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query) ||
        ticket.category_display?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [tickets, activeFilter, searchQuery]);

  const handleTicketCreated = (ticket) => {
    setTickets((current) => [ticket, ...current]);

    setRaiseTicketOpen(false);
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
            className="flex items-center font-medium transition-colors hover:text-gray-900"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="font-medium">Tickets</div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 lg:px-8">
        {/* Heading */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Support Tickets
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Raise and track support requests with the platform team.
            </p>
          </div>

          <Button onClick={() => setRaiseTicketOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Raise Ticket
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your tickets..."
            className="bg-white pl-9"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const active = activeFilter === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-slate-900 text-white"
                    : "border bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Tickets */}
        {!loading && !error && (
          <div className="space-y-3">
            {filteredTickets.map((ticket) => {
              const config = statusConfig[ticket.status];

              const StatusIcon = config?.icon || CircleAlert;

              return (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => navigate(`/ticket/${ticket.id}`)}
                  className="w-full rounded-lg border bg-white p-5 text-left shadow-sm transition-all hover:border-slate-300 hover:shadow"
                >
                  <div className="flex gap-3">
                    <StatusIcon
                      className={`mt-0.5 h-5 w-5 shrink-0 ${config?.iconClass}`}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="font-semibold text-slate-900">
                            {ticket.title}
                          </h2>

                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                            {ticket.description}
                          </p>
                        </div>

                        <span className="shrink-0 text-xs text-muted-foreground">
                          #{ticket.id}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                          <span>{ticket.category_display}</span>

                          <span>
                            Priority:{" "}
                            <span className="font-medium text-slate-600">
                              {ticket.priority_display}
                            </span>
                          </span>

                          <span>{formatDate(ticket.created_at)}</span>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            config?.badgeClass
                          }`}
                        >
                          {config?.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredTickets.length === 0 && (
              <div className="rounded-lg border border-dashed bg-white/70 py-14 text-center">
                <CircleAlert className="mx-auto h-8 w-8 text-slate-300" />

                <p className="mt-3 text-sm font-medium text-slate-700">
                  No tickets found
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Raise a ticket if you need help from the platform team.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <RaiseTicketModal
        open={raiseTicketOpen}
        onOpenChange={setRaiseTicketOpen}
        onCreated={handleTicketCreated}
      />
    </div>
  );
};

export default TicketsPage;
