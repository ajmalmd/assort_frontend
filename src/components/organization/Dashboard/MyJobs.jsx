import { BriefcaseBusiness, CalendarDays, Clock3 } from "lucide-react";
import { formatEnum } from "@/appFunctions";

const MyJobs = ({ jobs = [] }) => {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <BriefcaseBusiness className="h-5 w-5" />

          <h2 className="font-semibold">My Jobs</h2>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          Jobs currently assigned to you
        </p>
      </div>

      {jobs.length > 0 ? (
        <div className="space-y-3">
          {jobs.map((job) => {
            const deadline = job.deadline
              ? new Date(job.deadline).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "No deadline";

            return (
              <div key={job.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-medium">
                      {job.title}
                    </h3>

                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {job.project?.title}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatEnum(job.status)}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {deadline}
                  </div>

                  {job.estimated_hours !== null &&
                    job.estimated_hours !== undefined && (
                      <div className="flex items-center gap-2">
                        <Clock3 className="h-3.5 w-3.5" />
                        {job.estimated_hours}h
                      </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No active jobs.
        </p>
      )}
    </div>
  );
};

export default MyJobs;
