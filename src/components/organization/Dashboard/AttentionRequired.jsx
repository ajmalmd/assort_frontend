import {
  TriangleAlert,
  CalendarX,
  ListTodo,
  BriefcaseBusiness,
  UserX,
  Clock,
} from "lucide-react";

const attentionConfig = {
  overdue_projects: {
    label: "Overdue Projects",
    icon: CalendarX,
  },

  overdue_tasks: {
    label: "Overdue Tasks",
    icon: ListTodo,
  },

  overdue_jobs: {
    label: "Overdue Jobs",
    icon: BriefcaseBusiness,
  },

  projects_without_manager: {
    label: "Projects Without Manager",
    icon: UserX,
  },

  unassigned_jobs: {
    label: "Unassigned Jobs",
    icon: UserX,
  },

  pending_timesheets: {
    label: "Pending Timesheets",
    icon: Clock,
  },

  rejected_timesheets: {
    label: "Rejected Timesheets",
    icon: TriangleAlert,
  },
};

const AttentionRequired = ({ data = {} }) => {
  const items = Object.entries(data)
    .filter(([key]) => attentionConfig[key])
    .map(([key, value]) => ({
      key,
      value,
      ...attentionConfig[key],
    }));

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <TriangleAlert className="h-5 w-5" />

          <h2 className="font-semibold">Attention Required</h2>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          Items that may need your attention
        </p>
      </div>

      <div className="space-y-3">
        {items.map(({ key, label, value, icon: Icon }) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4 text-muted-foreground" />

              <span className="text-sm">{label}</span>
            </div>

            <span className="font-semibold">{value ?? 0}</span>
          </div>
        ))}

        {items.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nothing requires attention.
          </p>
        )}
      </div>
    </div>
  );
};

export default AttentionRequired;
