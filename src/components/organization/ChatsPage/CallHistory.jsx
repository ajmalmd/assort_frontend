import { Video } from "lucide-react";

export default function CallHistory({ currentRoom }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-accent/20 mb-4">
          <Video className="h-8 w-8 text-accent" />
        </div>

        <h3 className="text-lg font-semibold mb-2">Video Calls</h3>

        <p className="text-sm text-muted-foreground">
          Select a call from the list to view details
        </p>
      </div>
    </div>
  );
}
