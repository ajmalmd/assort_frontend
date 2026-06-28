import { APP_POINTS } from "@/api/apiConfig";
import assort_api from "@/api/axios";
import { Button } from "../../ui/button";
import RoomChat from "../RoomChat";

function CreateProjectChat({ projectId, hasProjectRight, onRoomCreated }) {
  const createChat = async () => {
    try {
      const res = await assort_api.post(
        `${APP_POINTS.CHAT}projects/${projectId}/`,
      );

      onRoomCreated?.(res.data.room_id);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="flex items-center justify-center">
      <div className="max-w-md text-center pt-6">
        <h3>Chat not created</h3>
        {hasProjectRight && (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a dedicated chat room to discuss tasks, share updates, and
              collaborate with your team.
            </p>
            <Button className="mt-6" onClick={createChat}>
              Create Chat Room
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function ProjectChatTab({
  roomId,
  projectId,
  hasProjectRight,
  onRoomCreated,
}) {
  return roomId ? (
    <RoomChat
      roomId={roomId}
      className="h-[calc(100vh-220px)]"
      chatType={"PROJECT"}
    />
  ) : (
    <CreateProjectChat
      projectId={projectId}
      hasProjectRight={hasProjectRight}
      onRoomCreated={onRoomCreated}
    />
  );
}
