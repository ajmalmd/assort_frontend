import {
  CircleDashed,
  CircleDot,
  CirclePause,
  CircleCheck,
} from "lucide-react";

const statusItems = [
  {
    key: "planned",
    label: "Planned",
    icon: CircleDashed,
  },
  {
    key: "in_progress",
    label: "In Progress",
    icon: CircleDot,
  },
  {
    key: "on_hold",
    label: "On Hold",
    icon: CirclePause,
  },
  {
    key: "completed",
    label: "Completed",
    icon: CircleCheck,
  },
];

const ProjectStatusCard = ({ data = {} }) => {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-5">
        <h2 className="font-semibold">Project Status</h2>

        <p className="text-sm text-muted-foreground">
          Current project distribution
        </p>
      </div>

      <div className="space-y-4">
        {statusItems.map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2">
                <Icon className="h-4 w-4" />
              </div>

              <span className="text-sm">{label}</span>
            </div>

            <span className="font-semibold">{data[key] ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectStatusCard;
