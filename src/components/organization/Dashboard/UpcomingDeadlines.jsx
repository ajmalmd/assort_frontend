import {
  CalendarClock,
  FolderKanban,
  ListTodo,
  BriefcaseBusiness,
} from "lucide-react";

const typeConfig = {
  PROJECT: {
    icon: FolderKanban,
    label: "Project",
  },
  TASK: {
    icon: ListTodo,
    label: "Task",
  },
  JOB: {
    icon: BriefcaseBusiness,
    label: "Job",
  },
};

const UpcomingDeadlines = ({
  deadlines = [],
  title = "Upcoming Deadlines",
}) => {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5" />

          <h2 className="font-semibold">{title}</h2>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          Work approaching its deadline
        </p>
      </div>

      {deadlines.length > 0 ? (
        <div className="space-y-3">
          {deadlines.map((item) => {
            const config = typeConfig[item.type];
            const Icon = config?.icon ?? CalendarClock;

            const formattedDeadline = item.deadline
              ? new Date(item.deadline).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "No deadline";

            return (
              <div
                key={`${item.type}-${item.id}`}
                className="flex items-start justify-between gap-4 rounded-lg border p-3"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-muted p-2">
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {item.title}
                      </p>

                      {config?.label && (
                        <span className="text-xs text-muted-foreground">
                          {config.label}
                        </span>
                      )}
                    </div>

                    {item.project_title && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {item.project_title}
                      </p>
                    )}
                  </div>
                </div>

                <span className="shrink-0 text-xs text-muted-foreground">
                  {formattedDeadline}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-32 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            No upcoming deadlines.
          </p>
        </div>
      )}
    </div>
  );
};

export default UpcomingDeadlines;
