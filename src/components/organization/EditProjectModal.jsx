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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import toast from "react-hot-toast";

export function EditProjectModal({ open, onOpenChange, project }) {
  const [isLoading, setIsLoading] = useState(false);
  const [managers, setManagers] = useState([]);
  const [formData, setFormData] = useState({
    title: project?.title || "",
    description: project?.description || "",
    project_manager: project?.project_manager?.id || "",
  });

  useEffect(() => {
    if (open && project) {
      setFormData({
        title: project.title || "",
        description: project.description || "",
        deadline: project.deadline || null,
        project_manager: project.project_manager?.id || "",
      });
    }
  }, [project, open]);

  useEffect(() => {
    const fetchManagers = async () => {
      const res = await assort_api.get(
        APP_POINTS.PROJECTS + "manager-options/",
      );
      setManagers(res.data);
    };
    fetchManagers();
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleManagerChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      project_manager: Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await assort_api.patch(
        `${APP_POINTS.PROJECTS}project/${project.id}/update/`,
        formData,
      );
      // mockResponse = {
      //   id: id,
      //   message: "Project updated successfully",
      // };
      toast.success("Project Updated");
      onOpenChange(false);
    } catch (error) {
      console.log(error);
      toast.error("Couldn't update project");
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update project information and project manager assignment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-project-name">Project Name</Label>
            <Input
              id="edit-project-name"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Project name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-project-description">Description</Label>
            <textarea
              id="edit-project-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Project description..."
              className="w-full p-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phase-deadline">Deadline</Label>
            <Input
              id="phase-deadline"
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-project-manager">Project Manager</Label>
            <Select
              value={
                formData.project_manager
                  ? String(formData.project_manager)
                  : undefined
              }
              onValueChange={handleManagerChange}
              required
            >
              <SelectTrigger id="edit-project-manager">
                <SelectValue placeholder="Select project manager" />
              </SelectTrigger>
              <SelectContent>
                {managers?.map((manager) => (
                  <SelectItem key={manager.id} value={String(manager.id)}>
                    {manager.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
