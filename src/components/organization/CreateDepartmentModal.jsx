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
import { Checkbox } from "@/components/ui/checkbox";
import { APP_POINTS } from "@/api/apiConfig";
import assort_api from "@/api/axios";
import toast from "react-hot-toast";
import { formatEnum } from "@/appFunctions";

export default function CreateDepartmentModal({ open, onOpenChange }) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHead, setSelectedHead] = useState("");
  const [selectedMembers, setSelectedMembers] = useState(new Set());
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await assort_api.get(
          APP_POINTS.ORGANIZATIONS + "dept-member-options/",
        );
        setMembers(res?.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMembers();
  }, []);

  // Optional: reset state on close
  useEffect(() => {
    if (!open) {
      setSelectedHead("");
      setSelectedMembers(new Set());
    }
  }, [open]);

  const handleMemberToggle = (memberId) => {
    const newMembers = new Set(selectedMembers);
    if (newMembers.has(memberId)) {
      newMembers.delete(memberId);
    } else {
      newMembers.add(memberId);
    }
    setSelectedMembers(newMembers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await assort_api.post(APP_POINTS.DEPARTMENTS + "create/", {
        name: e.target["dept-name"]?.value,
        head: selectedHead || null,
        members: Array.from(selectedMembers),
      });

      toast.success("Department created");
      setIsLoading(false);
      onOpenChange(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      error?.response?.data?.message
        ? toast.error(error.response.data.message)
        : toast.error("Couldn't create department");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[95vw] max-w-md sm:w-full p-4 sm:p-6 max-h-[90vh] overflow-hidden flex flex-col"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Create New Department</DialogTitle>
          <DialogDescription>
            Create a department and assign a head and members.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 overflow-y-auto max-h-[75vh] pr-1 min-h-0 flex-1"
        >
          <div className="space-y-2">
            <Label htmlFor="dept-name">Department Name</Label>
            <Input id="dept-name" placeholder="e.g., Engineering" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dept-head">Select Department Head</Label>
            <Select value={selectedHead} onValueChange={setSelectedHead}>
              <SelectTrigger id="dept-head">
                <SelectValue placeholder="Choose a department head" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Select Head</SelectItem>
                {members?.map(
                  (head) =>
                    !selectedMembers.has(head.id) && (
                      <SelectItem key={head.id} value={head.id.toString()}>
                        {head.full_name}
                      </SelectItem>
                    ),
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Select Members</Label>
            <div className="space-y-2 h-40 sm:h-48 overflow-y-auto border rounded-lg p-3">
              {members?.map(
                (member) =>
                  member.id != selectedHead && (
                    <label
                      key={member.id}
                      className="flex items-center gap-3 cursor-pointer py-2"
                    >
                      <Checkbox
                        checked={selectedMembers.has(member.id)}
                        onCheckedChange={() => handleMemberToggle(member.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {member.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.email}
                        </p>
                      </div>
                      <p className="inline-block mt-2 text-xs bg-primary text-white px-2 py-1 rounded">
                        {formatEnum(member.role)}
                      </p>
                    </label>
                  ),
              )}
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Department"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
