import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatEnum, hasProjectRight } from "@/appFunctions";
import { Edit } from "lucide-react";

export default function ProjectInfoCard({
  activeOrganization,
  project,
  setEditProjectModalOpen,
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-2xl font-medium mb-2">
              {project.title}
            </CardTitle>
          </div>
          <div className="flex items-start gap-2">
            <Badge>{formatEnum(project.status)}</Badge>

            {hasProjectRight(activeOrganization.role) && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditProjectModalOpen(true)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground font-mono whitespace-pre-line">
          {project.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Project Manager</p>
            <p className="text-sm font-medium">
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
            <div className="w-full bg-muted rounded-full h-3">
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
