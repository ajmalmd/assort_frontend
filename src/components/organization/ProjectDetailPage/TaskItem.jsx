import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TaskItem({ task }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="space-y-2 bg-gray-500/10 rounded-lg p-3 hover:bg-gray-500/20">
      <div className="flex justify-between items-center">
        <div
          onClick={() => setExpanded((prev) => !prev)}
          className="flex items-center gap-2 w-full"
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <div className="flex-1 min-w-0 text-left cursor-pointer">
            <p className="font-medium text-sm hover:text-primary">
              {task.title}
            </p>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span>Lead: {task.lead?.full_name}</span>
              <span>Deadline: {task.deadline}</span>
              <span>
                Jobs: {task.jobs_completed || 0}/{task.total_jobs || 0}
              </span>
            </div>
          </div>
        </div>
        {task.has_access && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              navigate(`/app/project/task/${task.id}`);
            }}
          >
            View
          </Button>
        )}
      </div>

      {expanded && (
        <div className="pl-6 space-y-1">
          {task?.jobs?.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              No jobs yet
            </p>
          )}
          {/* Jobs */}
          {task?.jobs?.map((job) => (
            <button
              key={job.id}
              onClick={() => {
                job.has_access && navigate(`/app/project/job/${job.id}`);
              }}
              className="text-xs p-2 bg-white rounded w-full text-left hover:bg-muted transition-colors"
            >
              <p className="font-medium">{job.title}</p>
              <div className="flex items-center gap-3 mt-1 text-muted-foreground">
                <span>Assigned to: {job.assigned_to?.full_name}</span>
                <span>Deadline: {job.deadline}</span>
                <span>
                  Hours: {job.worked_hours}h / {job.estimated_hours}h
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
