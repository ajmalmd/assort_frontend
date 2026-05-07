import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X } from "lucide-react";
import { formatEnum } from "@/appFunctions";

export function DeptSelectHeadModal({
  open,
  onOpenChange,
  onSelect,
  memberOptions = [],
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = memberOptions.filter(
    (mem) =>
      mem.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelect = (member) => {
    onSelect?.(member);
    setSearchQuery("");
    onOpenChange(false);
  };

  // Reset on close
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:w-full p-4 sm:p-6 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Department Head</DialogTitle>
          <DialogDescription>
            Choose an employee to be the head of this department.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto max-h-[75vh] pr-1 min-h-0 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 p-1 hover:bg-muted rounded transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          <ScrollArea className="h-48 sm:h-64 border rounded-lg p-4">
            <div className="space-y-2">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleSelect(member)}
                    className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border"
                  >
                    <div className="flex flex-col">
                      <p className="font-medium text-sm">{member.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.email}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs bg-secondary/30 px-2 py-1 rounded">
                          {formatEnum(member.role)}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    No Member found
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
