import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import toast from "react-hot-toast";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";

export function TaskHeaderCard({ task, canEdit, onEdit, updateStatus }) {
  const changeStatus = async () => {
    try {
      const newStatus = ["PLANNED", "COMPLETED"].includes(task.status)
        ? "IN_PROGRESS"
        : task.status == "IN_PROGRESS"
          ? "COMPLETED"
          : "";

      await assort_api.patch(
        `${APP_POINTS.PROJECTS}task/${task.id}/update-status/`,
        { status: newStatus },
      );
      updateStatus(newStatus);
      toast.success("Status changed successfully");
    } catch (error) {
      toast.error("Couldn't change the status");
    }
  };
  return (
    <CardHeader>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <CardTitle className="text-2xl font-medium mb-2">
            {task?.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground font-mono whitespace-pre-line">
            {task?.description}
          </p>
        </div>

        {canEdit && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              onClick={changeStatus}
              className="w-full sm:w-auto"
            >
              {["PLANNED", "COMPLETED"].includes(task.status)
                ? "Mark as Progressing"
                : task.status == "IN_PROGRESS"
                  ? "Mark as Completed"
                  : ""}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={onEdit}
              className="gap-2 w-full sm:w-auto"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        )}
      </div>
    </CardHeader>
  );
}
