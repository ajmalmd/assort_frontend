import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { formatEnum } from "@/appFunctions";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import toast from "react-hot-toast";

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
export default function JobInfoCard({
  job,
  updateStatus,
  canEdit,
  onEdit,
}) {
  const changeStatus = async () => {
    try {
      const newStatus = ["PLANNED", "COMPLETED"].includes(job.status)
        ? "IN_PROGRESS"
        : job.status == "IN_PROGRESS"
          ? "COMPLETED"
          : "";

      await assort_api.patch(
        `${APP_POINTS.PROJECTS}job/${job.id}/update-status/`,
        { status: newStatus },
      );
      updateStatus(newStatus);
      toast.success("Status changed successfully");
    } catch (error) {
      toast.error("Couldn't change the status");
    }
  };
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-2xl font-medium mb-2">
              {job?.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground font-mono whitespace-pre-line">
              {job?.description}
            </p>
          </div>

          {canEdit && (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                size="sm"
                onClick={changeStatus}
                className="w-full sm:w-auto"
              >
                {["PLANNED", "COMPLETED"].includes(job.status)
                  ? "Mark as Progressing"
                  : job.status == "IN_PROGRESS"
                    ? "Mark as Completed"
                    : ""}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onEdit}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="border-t pt-6">
          <h3 className="font-semibold text-sm text-muted-foreground mb-3">
            Job Information
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="Project" value={job?.project?.title} />
            <InfoItem
              label="Project Manager"
              value={job?.project?.project_manager}
            />
            <InfoItem label="Task" value={job?.task?.title} />
            <InfoItem label="Task Lead" value={job?.task?.lead.full_name} />
            <InfoItem label="Deadline" value={job?.deadline} />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <Badge>{formatEnum(job?.status)}</Badge>
            </div>
            <InfoItem label="Assignee" value={job?.assigned_to?.full_name} />
            <InfoItem
              label="Hours Worked / Estimated"
              value={`${job.worked_hours} / ${job.estimated_hours} hours`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
