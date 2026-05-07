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
import { GripVertical } from "lucide-react";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import toast from "react-hot-toast";

export function ReorderTasksModal({
  open,
  onOpenChange,
  tasks,
  phaseId,
  onTasksReorder,
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [localTasks, setLocalTasks] = useState(tasks);

  useEffect(() => {
    setLocalTasks(tasks || []);
  }, [tasks, open]);

  const handleOpenChange = (newOpen) => {
    if (!newOpen) setLocalTasks(tasks || []);
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

    const newTasks = [...localTasks];
    const [removed] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(dropIndex, 0, removed);

    setLocalTasks(newTasks);
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
        `${APP_POINTS.PROJECTS}phase/${phaseId}/reorder-tasks/`,
        { ordered_task_ids: localTasks.map((task) => task.id) },
      );

      toast.success("Tasks reorder successful");
      onTasksReorder?.({ phaseId, tasks: localTasks });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      const message = error?.response?.data?.message || "Couldn't reorder task";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:w-full p-4 sm:p-6 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Tasks Order</DialogTitle>

          <DialogDescription>
            Drag and drop tasks to reorder them. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 overflow-y-auto max-h-[75vh] pr-1 min-h-0 flex-1">
          {localTasks?.length > 0 ? (
            localTasks.map((task, index) => (
              <div
                key={task.id}
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
                  <p className="font-medium text-sm truncate">{task.title}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No tasks found
            </p>
          )}
        </div>

        <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
