import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical } from "lucide-react";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import toast from "react-hot-toast";

export function ReorderPhasesModal({
  open,
  onOpenChange,
  phases,
  projectId,
  onPhaseReorder,
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [localPhases, setLocalPhases] = useState(phases);

  useEffect(() => {
    setLocalPhases(phases);
  }, [phases, open]);

  const handleOpenChange = (newOpen) => {
    if (!newOpen) setLocalPhases(phases);
    onOpenChange(newOpen);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newPhases = [...localPhases];
    const [removed] = newPhases.splice(draggedIndex, 1);
    newPhases.splice(dropIndex, 0, removed);

    setLocalPhases(newPhases);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSave = async () => {
    try {
      await assort_api.patch(
        `${APP_POINTS.PROJECTS + projectId}/reorder-phases/`,
        { ordered_phase_ids: localPhases.map((phase) => phase.id) },
      );
      toast.success("Phases reorder successful");
      onPhaseReorder(localPhases);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      const message =
        error?.response?.data?.message || "Couldn't reorder phase";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Phases Order</DialogTitle>

          <DialogDescription>
            Drag and drop phases to reorder them. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {localPhases.map((phase, index) => (
            <div
              key={phase.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-grab active:cursor-grabbing ${
                draggedIndex === index ? "opacity-50 bg-muted" : ""
              } ${
                dragOverIndex === index && draggedIndex !== index
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-muted-foreground/30"
              }`}
            >
              <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{phase.title}</p>
              </div>
              <Badge variant="outline" className="text-xs flex-shrink-0">
                {phase.status}
              </Badge>
            </div>
          ))}
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
