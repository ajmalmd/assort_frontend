import { ListTodo, CalendarDays } from "lucide-react";
import { formatEnum } from "@/appFunctions";

const MyTasks = ({ tasks = [] }) => {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <ListTodo className="h-5 w-5" />

          <h2 className="font-semibold">My Tasks</h2>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          Tasks you're currently leading
        </p>
      </div>

      {tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.map((task) => {
            const deadline = task.deadline
              ? new Date(task.deadline).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "No deadline";

            return (
              <div key={task.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-medium">
                      {task.title}
                    </h3>

                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {task.project?.title}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatEnum(task.status)}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {deadline}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No active tasks.
        </p>
      )}
    </div>
  );
};

export default MyTasks;
