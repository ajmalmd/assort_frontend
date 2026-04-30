import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

export function TaskHeaderCard({ task, canEdit, onEdit }) {
  return (
    <CardHeader>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <CardTitle className="text-2xl font-medium mb-2">
            {task?.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground font-mono whitespace-pre-line">
            {task?.description}
          </p>
        </div>

        {canEdit && (
          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        )}
      </div>
    </CardHeader>
  );
}
