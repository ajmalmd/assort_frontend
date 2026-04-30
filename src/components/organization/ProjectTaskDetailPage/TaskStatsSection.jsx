import { Clock } from "lucide-react";

export function TaskStatsSection({ task }) {
  return (
    <div className="border-t pt-6 grid grid-cols-3 gap-4">
      <StatBox
        label="Completed Jobs"
        value={`${task?.jobs_completed || 0}/${task?.total_jobs || 0}`}
      />

      <StatBox
        label="Worked Hours"
        value={`${task?.worked_hours}h`}
        icon={<Clock className="w-5 h-5 text-primary" />}
      />

      <StatBox
        label="Estimated Hours"
        value={`${task?.estimated_hours}h`}
        icon={<Clock className="w-5 h-5 text-primary" />}
      />
    </div>
  );
}

function StatBox({ label, value, icon }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
        {icon || (
          <span className="text-lg font-bold text-primary">{value}</span>
        )}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
