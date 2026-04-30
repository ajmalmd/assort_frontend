import { Badge } from "@/components/ui/badge";

export function TaskInfoSection({ task, formatEnum }) {
  return (
    <div className="border-t pt-6">
      <h3 className="font-semibold text-sm text-muted-foreground mb-3">
        Task Information
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <InfoItem label="Project" value={task?.project?.title} />
        <InfoItem
          label="Project Manager"
          value={task?.project?.project_manager}
        />
        <InfoItem label="Phase" value={task?.phase?.title} />
        <InfoItem label="Task Lead" value={task?.lead?.full_name} />
        <InfoItem label="Deadline" value={task?.deadline} />
        <div>
          <p className="text-xs text-muted-foreground mb-1">Status</p>
          <Badge>{formatEnum(task?.status)}</Badge>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
