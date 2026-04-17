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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockMembers = [
  { id: 101, full_name: "John Smith" },
  { id: 102, full_name: "Sarah Johnson" },
  { id: 103, full_name: "Mike Chen" },
  { id: 104, full_name: "Emma Wilson" },
  { id: 105, full_name: "David Lee" },
  { id: 106, full_name: "Lisa Anderson" },
];

export function AddTaskModal({ open, onOpenChange }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    deadline: "",
    lead_id: "",
    expected_hours: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    onOpenChange(false);
    setFormData({
      title: "",
      deadline: "",
      lead_id: "",
      expected_hours: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>Add a new task to this phase.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Task Title</Label>
            <Input
              id="task-title"
              name="title"
              placeholder="e.g., Create wireframes"
              value={formData.title}
              onChange={handleChange}
              required
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
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-lead">Task Lead</Label>
            <Select
              value={formData.lead_id || undefined}
              onValueChange={(value) => handleSelectChange("lead_id", value)}
            >
              <SelectTrigger id="task-lead">
                <SelectValue placeholder="Select a task lead" />
              </SelectTrigger>
              <SelectContent>
                {mockMembers.map((lead) => (
                  <SelectItem key={lead.id} value={String(lead.id)}>
                    {lead.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-hours">Expected Hours</Label>
            <Input
              id="task-hours"
              name="expected_hours"
              type="number"
              placeholder="e.g., 40"
              value={formData.expected_hours}
              onChange={handleChange}
              required
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
              disabled={
                isLoading ||
                !formData.title ||
                !formData.deadline ||
                !formData.lead_id ||
                !formData.expected_hours
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
