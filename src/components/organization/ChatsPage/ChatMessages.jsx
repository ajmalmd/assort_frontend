import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Video } from "lucide-react";
import RoomChat from "../RoomChat";
import ConfirmActionModal from "@/components/common/ConfirmActionModal";
import toast from "react-hot-toast";
import { formatEnum } from "@/appFunctions";
import { useNavigate } from "react-router";

export default function ChatMessages({
  currentRoom,
  setDetailCon,
  setSelectedRoom,
  startCall,
  startingCall,
  showStartCallConfirm,
  setShowStartCallConfirm,
}) {
  const navigate = useNavigate();

  if (!currentRoom?.id) return null;

  const handleStartCallClick = () => {
    if (currentRoom.active_call) {
      toast.error("A call is active");
      return;
    }

    setShowStartCallConfirm(true);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            onClick={() => setSelectedRoom({})}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div
            onClick={() => {
              currentRoom.type === "GROUP" && setDetailCon(true);
              currentRoom.type === "PROJECT" &&
                navigate(`/app/project/${currentRoom.project}`);
            }}
            className="cursor-pointer"
          >
            <p className="font-semibold">{currentRoom.title}</p>
            <p className="text-xs text-muted-foreground">
              {currentRoom.type === "DIRECT"
                ? formatEnum(currentRoom.status)
                : currentRoom.type}
            </p>
          </div>
        </div>

        <Button
          size="icon"
          variant="ghost"
          onClick={handleStartCallClick}
          disabled={startingCall}
        >
          <Video className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 min-h-0">
        <RoomChat
          room={currentRoom}
          className="h-full"
          chatType={currentRoom.type}
          setSelectedRoom={setSelectedRoom}
        />
      </div>

      <ConfirmActionModal
        open={showStartCallConfirm}
        onOpenChange={setShowStartCallConfirm}
        title="Start call?"
        description={`Start a call with ${currentRoom.title}?`}
        confirmText="Start call"
        cancelText="Cancel"
        variant="default"
        loading={startingCall}
        onConfirm={startCall}
      />
    </div>
  );
}
