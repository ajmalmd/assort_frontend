import { CalendarDays, CheckCircle2, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatEnum } from "@/appFunctions";

const ProjectCard = ({ project }) => {
  const {
    title,
    status,
    deadline,
    project_manager,
    members_count,
    tasks,
    progress,
  } = project;

  const hasProgress =
    progress !== undefined &&
    progress !== null &&
    tasks !== undefined &&
    tasks !== null;

  const formattedDeadline = deadline
    ? new Date(deadline).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "No deadline";

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{title}</h3>

          <p className="mt-1 text-xs text-muted-foreground">
            {formatEnum(status)}
          </p>
        </div>

        {hasProgress && (
          <span className="shrink-0 text-sm font-semibold">{progress}%</span>
        )}
      </div>

      {hasProgress && (
        <>
          <div className="mt-4">
            <Progress value={progress} />
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tasks</span>

            <span>
              {tasks.completed ?? 0} / {tasks.total ?? 0}
            </span>
          </div>
        </>
      )}

      <div
        className={`space-y-2 ${hasProgress ? "mt-4 border-t pt-4" : "mt-4"}`}
      >
        <div className="flex items-center gap-2 text-sm">
          <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />

          <span className="text-muted-foreground">{formattedDeadline}</span>
        </div>

        {members_count !== undefined && members_count !== null && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 shrink-0 text-muted-foreground" />

            <span className="text-muted-foreground">
              {members_count} members
            </span>
          </div>
        )}

        {project_manager && (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-muted-foreground" />

            <span className="truncate text-muted-foreground">
              {project_manager.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
