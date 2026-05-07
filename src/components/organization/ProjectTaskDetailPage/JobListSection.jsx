import { useNavigate } from "react-router";

export function JobListSection({ jobs }) {
  const navigate = useNavigate();
  return (
    <div className="space-y-1 p-2 bg-gray-500/10 rounded-xl">
      <div className="font-normal py-2 pl-2 text-xl">Jobs</div>

      {jobs?.length === 0 && (
        <p className="text-sm text-muted-foreground text-center">No jobs yet</p>
      )}

      {jobs?.map((job) => (
        <JobItem
          key={job.id}
          job={job}
          onClick={() => navigate(`/app/project/job/${job.id}`)}
        />
      ))}
    </div>
  );
}

function JobItem({ job, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-3 bg-white/90 rounded-lg border border-border/40"
    >
      <div className="flex-1">
        <p className="text-sm font-medium">{job.title}</p>
        <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
          <span>Deadline: {job?.deadline}</span>
          <span>
            Hours: {job.worked_hours || 0}h / {job.estimated_hours || 0}h
          </span>
          <span>
            Assigned to: {job?.assigned_to?.full_name || "Unassigned"}
          </span>
        </div>
      </div>
    </div>
  );
}
