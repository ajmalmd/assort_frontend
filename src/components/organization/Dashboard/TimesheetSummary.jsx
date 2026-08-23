import { Clock, CheckCircle2, XCircle, Timer } from "lucide-react";

const TimesheetSummary = ({ data = {}, role }) => {
  const isMember = role === "MEMBER";

  const items = isMember
    ? [
        {
          label: "Hours This Week",
          value: `${data.hours_this_week ?? 0}h`,
          icon: Timer,
        },
        {
          label: "Pending",
          value: data.pending ?? 0,
          icon: Clock,
        },
        {
          label: "Approved",
          value: data.approved ?? 0,
          icon: CheckCircle2,
        },
        {
          label: "Rejected",
          value: data.rejected ?? 0,
          icon: XCircle,
        },
      ]
    : [
        {
          label: "Pending Approval",
          value: data.pending_approval ?? 0,
          icon: Clock,
        },
      ];

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />

          <h2 className="font-semibold">Timesheets</h2>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          {isMember
            ? "Your logged work summary"
            : "Timesheets requiring review"}
        </p>
      </div>

      <div className={isMember ? "grid gap-3 sm:grid-cols-2" : "space-y-3"}>
        {items.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2">
                <Icon className="h-4 w-4" />
              </div>

              <span className="text-sm">{label}</span>
            </div>

            <span className="font-semibold">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimesheetSummary;
