import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { formatEnum } from "@/appFunctions";
import { useNavigate } from "react-router";
import RoomChat from "../RoomChat";

export default function ChatMessages({
  currentChat,
  setDetailCon,
  setSelectedChat,
}) {
  if (!currentChat?.id) return null;

  const navigate = useNavigate();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border bg-card p-4 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            onClick={() => setSelectedChat({})}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div
            onClick={() =>
              currentChat.type === "GROUP"
                ? setDetailCon(true)
                : currentChat.type === "PROJECT"
                  ? navigate(`/app/project/${currentChat.project}`)
                  : setDetailCon(true)
            }
          >
            <p className="font-semibold">{currentChat.title}</p>

            <p className="text-xs text-muted-foreground">
              {currentChat.type === "DIRECT"
                ? formatEnum(currentChat.status)
                : currentChat.type}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <RoomChat
          roomId={currentChat.id}
          className="h-full"
          chatType={currentChat.type}
        />
      </div>
    </div>
  );
}
