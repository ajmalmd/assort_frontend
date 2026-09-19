import { useState } from "react";
import { CircleAlert, Loader2 } from "lucide-react";

import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  {
    value: "TECHNICAL",
    label: "Technical Issue",
  },
  {
    value: "ACCOUNT",
    label: "Account",
  },
  {
    value: "BILLING",
    label: "Billing",
  },
  {
    value: "FEATURE_REQUEST",
    label: "Feature Request",
  },
  {
    value: "OTHER",
    label: "Other",
  },
];

const priorities = [
  {
    value: "LOW",
    label: "Low",
  },
  {
    value: "MEDIUM",
    label: "Medium",
  },
  {
    value: "HIGH",
    label: "High",
  },
];

const initialForm = {
  title: "",
  description: "",
  category: "OTHER",
  priority: "MEDIUM",
};

const RaiseTicketModal = ({ open, onOpenChange, onCreated }) => {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleOpenChange = (value) => {
    if (submitting) return;

    if (!value) {
      setForm(initialForm);
      setError("");
    }

    onOpenChange(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and description are required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const res = await assort_api.post(APP_POINTS.TICKETS, {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority,
      });

      setForm(initialForm);

      onCreated(res.data);
    } catch (error) {
      console.error("Failed to raise ticket:", error);

      const data = error.response?.data;

      if (data?.title?.[0]) {
        setError(data.title[0]);
      } else if (data?.description?.[0]) {
        setError(data.description[0]);
      } else {
        setError(data?.detail || "Unable to raise ticket. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Raise a support ticket</DialogTitle>

          <DialogDescription>
            Describe the issue you're facing and the platform team will follow
            up with you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="ticket-title">Title</Label>

            <Input
              id="ticket-title"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Briefly describe the issue"
              maxLength={255}
              disabled={submitting}
            />
          </div>

          {/* Category + Priority */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>

              <Select
                value={form.category}
                onValueChange={(value) => updateField("category", value)}
                disabled={submitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>

              <Select
                value={form.priority}
                onValueChange={(value) => updateField("priority", value)}
                disabled={submitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="ticket-description">Description</Label>

            <Textarea
              id="ticket-description"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Explain what happened, what you expected, and any steps that may help reproduce the issue..."
              rows={6}
              disabled={submitting}
              className="resize-none"
            />
          </div>

          {error && (
            <div className="flex gap-2 rounded-md bg-red-50 px-3 py-2.5">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                submitting || !form.title.trim() || !form.description.trim()
              }
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Raise Ticket
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RaiseTicketModal;
