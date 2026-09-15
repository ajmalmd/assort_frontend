import { useMemo, useState } from "react";
import {
  Search,
  CircleAlert,
  Clock3,
  CircleCheck,
  CircleX,
} from "lucide-react";

import { Input } from "@/components/ui/input";

const TICKET_STATUS = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
};

const tickets = [
  {
    id: 1,
    title: "Login page not responding",
    description:
      "Users are unable to access the login page. Getting a 500 error.",
    creator: "John Doe",
    organization: "Acme Corporation",
    createdAt: "2024-02-25",
    status: TICKET_STATUS.OPEN,
  },
  {
    id: 2,
    title: "Dashboard performance issue",
    description: "Dashboard loading time is slow, taking more than 5 seconds.",
    creator: "Jane Smith",
    organization: "Tech Innovations Ltd",
    createdAt: "2024-02-24",
    status: TICKET_STATUS.IN_PROGRESS,
  },
  {
    id: 3,
    title: "Export feature not working",
    description:
      "Unable to export data in CSV format. Feature throws an error.",
    creator: "Mike Johnson",
    organization: "Global Solutions GmbH",
    createdAt: "2024-02-23",
    status: TICKET_STATUS.IN_PROGRESS,
  },
  {
    id: 4,
    title: "Notification email not received",
    description: "Users not receiving notification emails for project updates.",
    creator: "Sarah Wilson",
    organization: "Creative Agency Co",
    createdAt: "2024-02-22",
    status: TICKET_STATUS.RESOLVED,
  },
  {
    id: 5,
    title: "UI inconsistency in sidebar",
    description:
      "Sidebar styling is different on different pages. Need to standardize.",
    creator: "Tom Brown",
    organization: "Acme Corporation",
    createdAt: "2024-02-21",
    status: TICKET_STATUS.CLOSED,
  },
];

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

const AdminTicketsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const getStatusCount = (status) => {
    if (status === "ALL") {
      return tickets.length;
    }

    return tickets.filter((ticket) => ticket.status === status).length;
  };

  const filteredTickets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesStatus =
        activeFilter === "ALL" || ticket.status === activeFilter;

      const matchesSearch =
        !query ||
        ticket.title.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query) ||
        ticket.creator.toLowerCase().includes(query) ||
        ticket.organization.toLowerCase().includes(query) ||
        String(ticket.id).includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  return (
    <div className="p-2">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          placeholder="Search tickets by issue, description, or creator..."
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
              {filter.label} ({getStatusCount(filter.value)})
            </button>
          );
        })}
      </div>

      {/* Ticket list */}
      <div className="mt-4 space-y-2">
        {filteredTickets.map((ticket) => {
          const config = statusConfig[ticket.status];
          const StatusIcon = config.icon;

          return (
            <div
              key={ticket.id}
              className="rounded-lg border bg-white px-4 py-4 transition-colors hover:bg-slate-50/50"
            >
              <div className="flex gap-3">
                {/* Status icon */}
                <div className="pt-0.5">
                  <StatusIcon
                    className={`h-4 w-4 ${config.iconClass}`}
                    strokeWidth={2}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  {/* Title + ID */}
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold text-slate-800">
                      {ticket.title}
                    </h3>

                    <span className="shrink-0 text-xs text-muted-foreground">
                      ID: {ticket.id}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="mt-1 text-sm text-muted-foreground">
                    {ticket.description}
                  </p>

                  {/* Footer */}
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
                      <span>
                        Created by:{" "}
                        <span className="text-slate-600">{ticket.creator}</span>
                      </span>

                      <span>
                        Organization:{" "}
                        <span className="text-slate-600">
                          {ticket.organization}
                        </span>
                      </span>

                      <span>
                        Created:{" "}
                        <span className="text-slate-600">
                          {ticket.createdAt}
                        </span>
                      </span>
                    </div>

                    {/* Status */}
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${config.badgeClass}`}
                    >
                      {config.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTickets.length === 0 && (
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
    </div>
  );
};

export default AdminTicketsPage;
