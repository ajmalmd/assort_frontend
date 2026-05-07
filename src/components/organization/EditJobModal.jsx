import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "../ui/badge";
import { today_localdate } from "@/appFunctions";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import toast from "react-hot-toast";

export function EditJobModal({ open, onOpenChange, job, updatedJobDetails }) {
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    estimated_hours: "",
    assigned_to: "",
  });

  const maxDeadline =
    job?.task?.deadline || job?.project?.deadline || undefined;

  useEffect(() => {
    if (!open || !job) return;

    const fetchProjectMembers = async () => {
      try {
        const res = await assort_api.get(
          `${APP_POINTS.PROJECTS + job.project.id}/members/`,
        );

        const availableMembers = (res?.data || []).filter(
          (mem) => mem.id !== job?.task?.lead?.id,
        );

        setMembers(availableMembers);
      } catch (err) {
        console.error("Failed to fetch members:", err);
      }
    };

    fetchProjectMembers();

    setFormData({
      title: job?.title || "",
      description: job?.description || "",
      deadline: job?.deadline || "",
      assigned_to: job?.assigned_to?.id || "",
      estimated_hours: job?.estimated_hours || "",
    });
  }, [open, job]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await assort_api.patch(
        `${APP_POINTS.PROJECTS}job/${job.id}/update/`,
        formData,
      );

      toast.success("Job updated");
      setIsLoading(false);
      onOpenChange(false);

      updatedJobDetails?.({
        ...job,
        ...formData,
        assigned_to: members.find(
          (mem) => mem.id === Number(formData.assigned_to),
        ),
      });
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      const message = error?.response?.data?.message || "Couldn't update job";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:w-full p-4 sm:p-6 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit</DialogTitle>
          <DialogDescription>Update job details</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 overflow-y-auto max-h-[75vh] pr-1 min-h-0 flex-1"
        >
          <div className="space-y-2">
            <Label htmlFor="job-title">Job Title</Label>
            <Input
              id="job-title"
              name="title"
              placeholder="Job title..."
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-description">Description</Label>
            <textarea
              id="job-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the job goals and scope..."
              className="w-full p-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-deadline">Deadline</Label>
            <Input
              id="job-deadline"
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={handleChange}
              min={today_localdate}
              max={maxDeadline || undefined}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-hours">Estimated Hours</Label>
            <Input
              id="job-hours"
              name="estimated_hours"
              type="number"
              placeholder="e.g., 8"
              value={formData.estimated_hours}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Assigned To</Label>

            <div className="h-40 sm:h-48 border rounded-lg overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-3 space-y-2">
                  {members?.length > 0 ? (
                    members.map((member) => {
                      const isSelected = member.id === formData.assigned_to;

                      return (
                        <div
                          key={member.id}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              assigned_to: member.id,
                            }))
                          }
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition ${
                            isSelected
                              ? "bg-primary/10 border-primary"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <div
                            className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? "border-primary"
                                : "border-muted-foreground"
                            }`}
                          >
                            {isSelected && (
                              <div className="h-2 w-2 rounded-full bg-primary" />
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-medium">
                              {member.full_name}
                            </p>
                            <Badge className="text-xs font-light">
                              {member.role}
                            </Badge>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No members found
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !formData.title ||
                !formData.deadline ||
                !formData.estimated_hours ||
                !formData.assigned_to
              }
            >
              {isLoading ? "Updating..." : "Update Job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
