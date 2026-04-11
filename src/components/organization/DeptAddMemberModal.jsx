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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Check } from "lucide-react";
import { formatEnum } from "@/appFunctions";

export function DeptAddMemberModal({
  open,
  onOpenChange,
  memberOptions,
  onAddMembers,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState(new Set());

  const filteredMembers = memberOptions.filter(
    (member) =>
      member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleMember = (memberId) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const selected = memberOptions.filter((m) => selectedMembers.has(m.id));
    onAddMembers(selected);

    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    onOpenChange(false);
    setSearchQuery("");
    setSelectedMembers(new Set());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Members to Department</DialogTitle>
          <DialogDescription>
            Search and select members to add to this department.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 space-y-4"
        >
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="h-[300px] rounded-lg border border-border/40">
            <div className="p-4 space-y-2">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleMember(member.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                      selectedMembers.has(member.id)
                        ? "border-primary bg-primary/10"
                        : "border-border/40 hover:border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {member.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {member.email}
                        </p>
                        <p className="inline-block mt-2 text-xs bg-primary text-white px-2 py-1 rounded">
                          {formatEnum(member.role)}
                        </p>
                      </div>
                      {selectedMembers.has(member.id) && (
                        <Check className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No members found
                </p>
              )}
            </div>
          </ScrollArea>

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
              disabled={isLoading || selectedMembers.size === 0}
            >
              {isLoading
                ? "Adding..."
                : `Add ${selectedMembers.size > 0 ? selectedMembers.size : ""} Member${selectedMembers.size !== 1 ? "s" : ""}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
