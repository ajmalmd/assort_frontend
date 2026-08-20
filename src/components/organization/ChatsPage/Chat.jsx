import { useState } from "react";
import ChatInfo from "./ChatInfo";
import ChatMessages from "./ChatMessages";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import { useAppDispatch } from "@/redux/hooks";
import { setCallSession } from "@/redux/slices/callSessionSlice";
import toast from "react-hot-toast";

export default function Chat({ currentRoom, setSelectedRoom }) {
  const [isDetailCon, setDetailCon] = useState(false);
  const [startingCall, setStartingCall] = useState(false);
  const [showStartCallConfirm, setShowStartCallConfirm] = useState(false);

  const dispatch = useAppDispatch();

  const startCall = async () => {
    try {
      setStartingCall(true);

      const response = await assort_api.post(APP_POINTS.CALL + "start/", {
        chat_room_id: currentRoom.id,
        origin: currentRoom.type,
      });

      const call = response.data;

      console.log("Call started:", call);

      setShowStartCallConfirm(false);

      dispatch(setCallSession(call));
    } catch (error) {
      console.error("Failed to start call:", error);

      toast.error(error?.response?.data?.detail || "Failed to start call");
    } finally {
      setStartingCall(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {isDetailCon ? (
        <ChatInfo currentRoom={currentRoom} setDetailCon={setDetailCon} />
      ) : (
        <ChatMessages
          currentRoom={currentRoom}
          setDetailCon={setDetailCon}
          setSelectedRoom={setSelectedRoom}
          startCall={startCall}
          startingCall={startingCall}
          showStartCallConfirm={showStartCallConfirm}
          setShowStartCallConfirm={setShowStartCallConfirm}
        />
      )}
    </div>
  );
}
