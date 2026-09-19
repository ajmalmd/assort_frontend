import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import {
  Search,
  CircleAlert,
  Clock3,
  CircleCheck,
  CircleX,
  Loader2,
} from "lucide-react";

import { Input } from "@/components/ui/input";

import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";

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

const formatDate = (dateString) => {
  if (!dateString) return "-";

  return new Date(dateString).toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const AdminTicketsPage = () => {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {};

        if (debouncedSearch) {
          params.search = debouncedSearch;
        }

        if (activeFilter !== "ALL") {
          params.status = activeFilter;
        }

        const res = await assort_api.get(APP_POINTS.PLATFORM + "tickets/", {
          params,
        });

        setTickets(res.data);
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
        setError("Unable to load tickets.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [debouncedSearch, activeFilter]);

  return (
    <div className="p-2">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          placeholder="Search tickets by issue, description, creator or organization..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 pl-9"
        />
      </div>

      {/* Status filters */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.value;

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Ticket list */}
      {!loading && !error && (
        <div className="mt-4 space-y-2">
          {tickets.map((ticket) => {
            const config = statusConfig[ticket.status];
            const StatusIcon = config?.icon || CircleAlert;

            return (
              <button
                key={ticket.id}
                type="button"
                onClick={() => navigate(`/platform/tickets/${ticket.id}`)}
                className="w-full rounded-lg border bg-white px-4 py-4 text-left transition-colors hover:bg-slate-50/50"
              >
                <div className="flex gap-3">
                  <div className="pt-0.5">
                    <StatusIcon
                      className={`h-4 w-4 ${
                        config?.iconClass || "text-slate-500"
                      }`}
                      strokeWidth={2}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Title */}
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-semibold text-slate-800">
                        {ticket.title}
                      </h3>

                      <span className="shrink-0 text-xs text-muted-foreground">
                        ID: {ticket.id}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {ticket.description}
                    </p>

                    {/* Metadata */}
                    <div className="mt-3 flex items-end justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
                        <span>
                          Created by:{" "}
                          <span className="text-slate-600">
                            {ticket.created_by}
                          </span>
                        </span>

                        <span>
                          Organization:{" "}
                          <span className="text-slate-600">
                            {ticket.organization}
                          </span>
                        </span>

                        <span>
                          Category:{" "}
                          <span className="text-slate-600">
                            {ticket.category_display}
                          </span>
                        </span>

                        <span>
                          Priority:{" "}
                          <span className="text-slate-600">
                            {ticket.priority_display}
                          </span>
                        </span>

                        <span>
                          Created:{" "}
                          <span className="text-slate-600">
                            {formatDate(ticket.created_at)}
                          </span>
                        </span>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                          config?.badgeClass || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {config?.label || ticket.status_display}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {tickets.length === 0 && (
            <div className="rounded-lg border border-dashed py-12 text-center">
              <p className="text-sm font-medium text-slate-700">
                No tickets found
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Try changing the search or status filter.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminTicketsPage;
