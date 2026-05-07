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
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import toast from "react-hot-toast";
import { today_localdate } from "@/appFunctions";

export function AddTimeLogModal({ open, onOpenChange, job, addedLogDetails }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    start_time: "",
    end_time: "",
    remarks: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await assort_api.post(
        `${APP_POINTS.PROJECTS}job/${job.id}/add-log/`,
        formData,
      );

      toast.success("Worklog added");
      setIsLoading(false);
      onOpenChange(false);
      addedLogDetails({
        ...formData,
        id: res.data.id,
        status: "LOGGED",
        duration: res.data.duration,
        start_time: res.data.start_time,
        end_time: res.data.end_time,
      });
      setFormData({
        date: "",
        start_time: "",
        end_time: "",
        remarks: "",
      });
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      const message = error?.response?.data?.message || "Couldn't add worklog";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:w-full p-4 sm:p-6 max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add Work-Log</DialogTitle>
          <DialogDescription>
            Add a new work log to the job "{job.title}".
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 overflow-y-auto pr-1 max-h-[75vh]"
        >
          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              name="date"
              type="date"
              value={formData.date}
              max={today_localdate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Start Time</Label>
            <Input
              name="start_time"
              type="time"
              value={formData.start_time}
              max={formData.end_time || undefined}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>End Time</Label>
            <Input
              name="end_time"
              type="time"
              value={formData.end_time}
              min={formData.start_time || undefined}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Remarks</Label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Describe the work you have done on this selected time span"
              className="w-full p-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
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
                !formData.date ||
                !formData.start_time ||
                !formData.end_time ||
                !formData.remarks
              }
            >
              {isLoading ? "Adding..." : "Add Log"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
