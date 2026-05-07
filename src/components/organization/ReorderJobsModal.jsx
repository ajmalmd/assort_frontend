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

export function ReorderJobsModal({
  open,
  onOpenChange,
  jobs,
  taskId,
  onJobsReorder,
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [localJobs, setLocalJobs] = useState(jobs);

  useEffect(() => {
    setLocalJobs(jobs || []);
  }, [jobs, open]);

  const handleOpenChange = (newOpen) => {
    if (!newOpen) setLocalJobs(jobs || []);
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

    const newJobs = [...localJobs];
    const [removed] = newJobs.splice(draggedIndex, 1);
    newJobs.splice(dropIndex, 0, removed);

    setLocalJobs(newJobs);
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
        `${APP_POINTS.PROJECTS}task/${taskId}/reorder-jobs/`,
        { ordered_job_ids: localJobs.map((job) => job.id) },
      );

      toast.success("Jobs reorder successful");
      onJobsReorder?.(localJobs);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      const message =
        error?.response?.data?.message || "Couldn't reorder jobs";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="w-[95vw] max-w-md sm:w-full p-4 sm:p-6 max-h-[90vh] overflow-hidden flex flex-col"
      >
        <DialogHeader>
          <DialogTitle>Edit Jobs Order</DialogTitle>
          <DialogDescription>
            Drag and drop jobs to reorder them. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 overflow-y-auto max-h-[75vh] pr-1 min-h-0 flex-1">
          {localJobs?.length > 0 ? (
            localJobs.map((job, index) => (
              <div
                key={job.id}
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
                  <p className="font-medium text-sm truncate">
                    {job.title}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No jobs found
            </p>
          )}
        </div>

        <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}