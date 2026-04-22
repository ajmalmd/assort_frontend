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
  refreshMembers,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [orgMembers, setOrgMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [projectRole, setProjectRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!projectId) return;

    const fetchOrgMembers = async () => {
      try {
        const res = await assort_api.get(
          `${APP_POINTS.PROJECTS}member-options/${projectId}/`,
        );
        setOrgMembers(res.data || []);
      } catch (err) {
        console.error("Failed to fetch org members:", err);
      }
    };

    fetchOrgMembers();
  }, [projectId]);

  const filteredMembers = (orgMembers || []).filter((member) => {
    const q = searchQuery.toLowerCase();
    return (
      member.full_name?.toLowerCase().includes(q) ||
      member.email?.toLowerCase().includes(q)
    );
  });

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

    if (!finalRole || selectedMembers.length === 0) return;

    setIsLoading(true);
    try {
      await assort_api.post(
        `${APP_POINTS.PROJECTS}project/add-members/${projectId}/`,
        {
          members: selectedMembers,
          role: finalRole,
        },
      );

      toast.success("Members added successfully");

      // refresh parent list
      refreshMembers?.();

      // reset modal state
      setSelectedMembers([]);
      setProjectRole("");
      setCustomRole("");
      setSearchQuery("");

      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Couldn't add members");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Members to Project</DialogTitle>
          <DialogDescription>Select members and assign role.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col overflow-hidden space-y-4"
        >
          {/* Search */}
          <div className="space-y-2">
            <Label>Search Members</Label>
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Members List */}
          <div className="h-64 border rounded-lg overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={selectedMembers.includes(member.id)}
                        onCheckedChange={() => handleMemberToggle(member.id)}
                      />
                      <div>
                        <p className="font-medium text-sm">
                          {member.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
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

          {/* Role */}
          <div className="space-y-2">
            <Label>Assign Role</Label>

            <Select
              value={projectRole}
              onValueChange={(value) => {
                setProjectRole(value);
                if (value !== "__custom__") setCustomRole("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="__custom__">+ Add new role</SelectItem>

                {roles?.map((role, i) => (
                  <SelectItem key={i} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Role */}
          {projectRole === "__custom__" && (
            <div className="space-y-2">
              <Label>New Role</Label>
              <Input
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="Enter role"
              />
            </div>
          )}

          {/* Footer */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setProjectRole(null);
                onOpenChange(false);
              }}
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
                : `Add ${selectedMembers.length} Member(s)`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
