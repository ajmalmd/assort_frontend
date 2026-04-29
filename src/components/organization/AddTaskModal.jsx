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

export function AddTaskModal({
  open,
  onOpenChange,
  project,
  phase,
  addedTaskDetails,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    lead_id: "",
  });

  useEffect(() => {
    if (open) {
      const fetchProjectMembers = async () => {
        try {
          const res = await assort_api.get(
            `${APP_POINTS.PROJECTS + project.id}/members/`,
          );
          setMembers(res.data || []);
        } catch (err) {
          console.error("Failed to fetch members:", err);
        }
      };
      fetchProjectMembers();
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await assort_api.post(
        `${APP_POINTS.PROJECTS}phase/${phase.id}/add-task/`,
        formData,
      );
      addedTaskDetails({
        phaseId: phase.id,
        taskDetails: {
          id: res.data?.id,
          title: formData.title,
          deadline: formData.deadline,
          lead: members.find((mem) => mem.id === Number(formData.lead_id)),
          jobs_completed: 0,
          total_jobs: 0,
          jobs: [],
          has_access: true,
        },
      });

      toast.success("Task Added");
      setIsLoading(false);
      onOpenChange(false);
      setFormData({
        title: "",
        deadline: "",
        description: "",
        lead_id: "",
      });
    } catch (error) {
      console.error(error);
      const message = error?.response?.data?.message || "couldn't add task";
      toast.error(message);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to the phase "{phase?.title}".
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Task Title</Label>
            <Input
              id="task-title"
              name="title"
              placeholder="Task title..."
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <textarea
              id="task-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the task goals and scope..."
              className="w-full p-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-deadline">Deadline</Label>
            <Input
              id="task-deadline"
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={handleChange}
              max={phase?.deadline || project?.deadline || undefined}
              min={today_localdate}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Task Lead</Label>

            <div className="h-48 border rounded-lg overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-3 space-y-2">
                  {members?.length > 0 ? (
                    members.map((member) => {
                      const isSelected = String(member.id) === formData.lead_id;

                      return (
                        <div
                          key={member.id}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              lead_id: String(member.id),
                            }))
                          }
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition
                  ${
                    isSelected
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted/50"
                  }`}
                        >
                          {/* Radio-style indicator */}
                          <div
                            className={`h-4 w-4 rounded-full border flex items-center justify-center
                    ${
                      isSelected ? "border-primary" : "border-muted-foreground"
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

          <DialogFooter className="pt-4">
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
                !formData.lead_id
              }
            >
              {isLoading ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
