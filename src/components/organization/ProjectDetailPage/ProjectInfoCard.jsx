import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatEnum, hasProjectRight } from "@/appFunctions";
import { Edit } from "lucide-react";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import toast from "react-hot-toast";

export default function ProjectInfoCard({
  activeOrganization,
  project,
  setEditProjectModalOpen,
  updateStatus,
}) {
  const changeStatus = async () => {
    try {
      const newStatus = ["PLANNED", "COMPLETED"].includes(project.status)
        ? "IN_PROGRESS"
        : project.status == "IN_PROGRESS"
          ? "COMPLETED"
          : "";

      await assort_api.patch(
        `${APP_POINTS.PROJECTS}${project.id}/update-status/`,
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
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl sm:text-2xl font-medium mb-2 break-words">
              {project.title}
            </CardTitle>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <Badge className="w-fit">{formatEnum(project.status)}</Badge>

            {hasProjectRight(activeOrganization.role) && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  onClick={changeStatus}
                  className="w-full sm:w-auto"
                >
                  {["PLANNED", "COMPLETED"].includes(project.status)
                    ? "Mark as Progressing"
                    : project.status == "IN_PROGRESS"
                      ? "Mark as Completed"
                      : ""}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditProjectModalOpen(true)}
                  className="gap-2 w-full sm:w-auto"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground font-mono whitespace-pre-line break-words">
          {project.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Project Manager</p>
            <p className="text-sm font-medium break-words">
              {project.project_manager.full_name}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Deadline</p>
            <p className="text-sm font-medium">{project.deadline || "--"}</p>
          </div>

          {hasProjectRight(activeOrganization.role) && (
            <div>
              <p className="text-xs text-muted-foreground">Members</p>
              <p className="text-sm font-medium">{project.members_count}</p>
            </div>
          )}
        </div>

        {hasProjectRight(activeOrganization.role) && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Overall Progress</span>

              <span className="text-muted-foreground">{project.progress}%</span>
            </div>

            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="bg-primary h-3 rounded-full transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
