import { useState } from "react";
import ChatInfo from "./ChatInfo";
import ChatMessages from "./ChatMessages";

export default function Chat({ currentChat, setSelectedChat }) {
  const [isDetailCon, setDetailCon] = useState(false);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {isDetailCon ? (
        <ChatInfo currentChat={currentChat} setDetailCon={setDetailCon} />
      ) : (
        <ChatMessages
          currentChat={currentChat}
          setDetailCon={setDetailCon}
          setSelectedChat={setSelectedChat}
        />
      )}
    </div>
  );
}
