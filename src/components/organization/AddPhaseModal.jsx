import { useState } from "react";
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
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import toast from "react-hot-toast";
import { today_localdate } from "@/appFunctions";

export function AddPhaseModal({
  open,
  onOpenChange,
  project,
  addedPhaseDetails,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
  });

  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await assort_api.post(
        `${APP_POINTS.PROJECTS + project.id}/add-phase/`,
        formData,
      );
      toast.success("Phase added");
      setIsLoading(false);
      onOpenChange(false);
      addedPhaseDetails({
        ...formData,
        id: res.data.id,
        status: "PLANNED",
        tasks: [],
      });
      setFormData({ title: "", description: "", deadline: "" });
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      const message = error?.response?.data?.message || "Couldn't add phase";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Phase</DialogTitle>
          <DialogDescription>
            Create a new phase for the project "{project.title}".
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phase-title">Phase Title</Label>
            <Input
              id="phase-title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Phase title..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phase-description">Description</Label>
            <textarea
              id="phase-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the phase goals and scope..."
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
              max={project?.deadline || undefined}
              min={today_localdate}
            />
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
              disabled={isLoading || !formData.title || !formData.deadline}
            >
              {isLoading ? "Adding..." : "Add Phase"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
