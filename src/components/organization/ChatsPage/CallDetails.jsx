import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CallDetails({ currentRoom }) {
  if (!currentRoom) return null;
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border bg-card p-4 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            onClick={() => setSelectedRoom({})}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <p className="font-semibold">
              {currentRoom == "meeting" ? "Meeting" : currentRoom.title}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-accent/20 mb-4">
            <Video className="h-8 w-8 text-accent" />
          </div>

          <h3 className="text-lg font-semibold mb-2">Calls</h3>

          <p className="text-sm text-muted-foreground">No calls yet</p>
        </div>
      </div>
    </div>
  );
}
