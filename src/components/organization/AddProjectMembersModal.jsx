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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import toast from "react-hot-toast";

export function AddProjectMembersModal({
  open,
  onOpenChange,
  projectId,
  roles,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [orgMembers, setOrgMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [projectRole, setProjectRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchOrgMembers = async () => {
      const res = await assort_api.get(
        `${APP_POINTS.PROJECTS}member-options/${projectId}/`,
      );
      setOrgMembers(res.data);
    };
    fetchOrgMembers();
  }, []);

  const filteredMembers = orgMembers?.filter(
    (member) =>
      member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleMemberToggle = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalRole =
      projectRole === "__custom__" ? customRole.trim() : projectRole;

    if (!finalRole) return;

    setIsLoading(true);
    try {
      await assort_api.post(
        `${APP_POINTS.PROJECTS}project/add-members/${projectId}/`,
        { members: selectedMembers, role: finalRole },
      );
      setIsLoading(false);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Couldn't add members");
    }

    // Reset state
    setSelectedMembers([]);
    setProjectRole("");
    setCustomRole("");
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Members to Project</DialogTitle>
          <DialogDescription>
            Select members to add to this project and assign their role.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col overflow-hidden space-y-4"
        >
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Members</Label>
            <Input
              id="search"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Members List */}
          <div className="flex-1 overflow-hidden border rounded-lg">
            <ScrollArea className="h-full w-full">
              <div className="p-4 space-y-2">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50"
                    >
                      <Checkbox
                        id={`member-${member.id}`}
                        checked={selectedMembers.includes(member.id)}
                        onCheckedChange={() => handleMemberToggle(member.id)}
                      />
                      <label
                        htmlFor={`member-${member.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <p className="font-medium text-sm">
                          {member.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.email}
                        </p>
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No members found
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="project-role">Assign Project Role</Label>

            <Select
              value={projectRole}
              onValueChange={(value) => {
                setProjectRole(value);
                if (value !== "__custom__") {
                  setCustomRole("");
                }
              }}
              required
            >
              <SelectTrigger id="project-role">
                <SelectValue placeholder="Select a role for selected members" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={null}>Select Role</SelectItem>
                <SelectItem value="__custom__">+ Add new role</SelectItem>
                {roles.map((role, ind) => (
                  <SelectItem key={ind} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Role Input */}
          {projectRole === "__custom__" && (
            <div className="space-y-2">
              <Label htmlFor="custom-role">New Role</Label>
              <Input
                id="custom-role"
                placeholder="Enter new role..."
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
              />
            </div>
          )}

          {/* Footer */}
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
                selectedMembers.length === 0 ||
                !projectRole ||
                (projectRole === "__custom__" && !customRole.trim())
              }
            >
              {isLoading
                ? "Adding..."
                : `Add ${selectedMembers.length} Member${
                    selectedMembers.length !== 1 ? "s" : ""
                  }`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
