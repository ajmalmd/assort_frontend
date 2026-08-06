import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { formatEnum } from "@/appFunctions";
import { useNavigate } from "react-router";
import RoomChat from "../RoomChat";

export default function ChatMessages({
  currentRoom,
  setDetailCon,
  setSelectedRoom,
}) {
  if (!currentRoom?.id) return null;

  const navigate = useNavigate();

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

          <div
            onClick={() => {
              currentRoom.type === "GROUP" && setDetailCon(true);
              currentRoom.type === "PROJECT" &&
                navigate(`/app/project/${currentRoom.project}`);
            }}
          >
            <p className="font-semibold">{currentRoom.title}</p>

            <p className="text-xs text-muted-foreground">
              {currentRoom.type === "DIRECT"
                ? formatEnum(currentRoom.status)
                : currentRoom.type}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <RoomChat
          room={currentRoom}
          className="h-full"
          chatType={currentRoom.type}
          setSelectedRoom={setSelectedRoom}
        />
      </div>
    </div>
  );
}
