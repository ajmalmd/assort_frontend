import { useState } from "react";
import ChatInfo from "./ChatInfo";
import ChatMessages from "./ChatMessages";

export default function Chat({ currentRoom, setSelectedRoom }) {
  const [isDetailCon, setDetailCon] = useState(false);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {isDetailCon ? (
        <ChatInfo currentRoom={currentRoom} setDetailCon={setDetailCon} />
      ) : (
        <ChatMessages
          currentRoom={currentRoom}
          setDetailCon={setDetailCon}
          setSelectedRoom={setSelectedRoom}
        />
      )}
    </div>
  );
}
