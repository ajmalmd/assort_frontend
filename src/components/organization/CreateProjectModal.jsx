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
import { useNavigate } from "react-router";

export function CreateProjectModal({ open, onOpenChange }) {
  const [isLoading, setIsLoading] = useState(false);
  const [managers, setManagers] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedManager, setSelectedManager] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;

    const fetchManagers = async () => {
      try {
        const res = await assort_api.get(
          APP_POINTS.PROJECTS + "manager-options/",
        );
        setManagers(res?.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchManagers();
  }, [open]);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setDeadline("");
      setSelectedManager("");
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!selectedManager) {
      toast.error("Please select a project manager");
      return;
    }

    setIsLoading(true);

    try {
      const res = await assort_api.post(APP_POINTS.PROJECTS + "create/", {
        title,
        description,
        project_manager: Number(selectedManager),
        deadline: deadline || null,
      });

      toast.success("Project Created");
      onOpenChange(false);

      navigate(`/app/project/${res.data.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't create project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:w-full p-4 sm:p-6 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project and assign a project manager.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 overflow-y-auto max-h-[75vh] pr-1 min-h-0 flex-1"
        >
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="project-title">Project Title</Label>
            <Input
              id="project-title"
              placeholder="Title of the project"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <textarea
              id="project-description"
              placeholder="Describe the project..."
              className="w-full p-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          {/* Manager */}
          <div className="space-y-2">
            <Label htmlFor="project-manager">Select Project Manager</Label>
            <Select value={selectedManager} onValueChange={setSelectedManager}>
              <SelectTrigger id="project-manager">
                <SelectValue placeholder="Choose a manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Select Manager</SelectItem>
                {managers?.map((manager) => (
                  <SelectItem key={manager.id} value={manager.id.toString()}>
                    {manager.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
