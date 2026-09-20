import { Badge } from "./badge";
import { formatEnum } from "@/appFunctions";
import { cn } from "@/lib/utils";

const tones = {
  PLANNED: "border-slate-200 bg-slate-100 text-slate-700",
  IN_PROGRESS: "border-sky-200 bg-sky-50 text-sky-800",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  ON_HOLD: "border-amber-200 bg-amber-50 text-amber-800",
};

export function StatusBadge({ status, className }) {
  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5", tones[status], className)}
    >
      <span
        aria-hidden="true"
        className="size-1.5 shrink-0 rounded-full bg-current"
      />
      {status ? formatEnum(status) : "Not set"}
    </Badge>
  );
}
