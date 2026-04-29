import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import toast from "react-hot-toast";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import { today_localdate } from "@/appFunctions";

export function EditTaskModal({
  open,
  onOpenChange,
  task,
  maxDeadline,
  updatedTaskDetails,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    lead: "",
  });

  useEffect(() => {
    if (open && task) {
      const fetchMembers = async () => {
        try {
          const res = await assort_api.get(
            `${APP_POINTS.PROJECTS + task.projectId}/members/`,
          );
          const availableMembers = res.data?.filter(
            (mem) => !task.jobMembers?.includes(mem.id),
          );

          setMembers(availableMembers || []);
        } catch (err) {
          console.error("Failed to fetch members:", err);
        }
      };

      setFormData({
        title: task.title || "",
        description: task.description || "",
        deadline: task.deadline || "",
        lead: String(task.lead || ""),
      });

      fetchMembers();
    }
  }, [open, task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await assort_api.patch(
        `${APP_POINTS.PROJECTS}task/${task.id}/update/`,
        formData,
      );

      updatedTaskDetails({
        ...formData,
        lead: members.find((mem) => mem.id === Number(formData.lead)),
      });

      toast.success("Task updated");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      const message = error?.response?.data?.message || "Couldn't update task";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>Update task details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label>Task Title</Label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label>Deadline</Label>
            <Input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              min={today_localdate}
              max={maxDeadline || undefined}
              required
            />
          </div>

          {/* Lead selection */}
          <div className="space-y-2">
            <Label>Task Lead</Label>

            <div className="h-48 border rounded-lg overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-3 space-y-2">
                  {members.length > 0 ? (
                    members.map((member) => {
                      const isSelected = String(member.id) === formData.lead;

                      return (
                        <div
                          key={member.id}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              lead: String(member.id),
                            }))
                          }
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition
                          ${
                            isSelected
                              ? "bg-primary/10 border-primary"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <div
                            className={`h-4 w-4 rounded-full border flex items-center justify-center
                            ${
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

          <DialogFooter>
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
                !formData.lead
              }
            >
              {isLoading ? "Updating..." : "Update Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
