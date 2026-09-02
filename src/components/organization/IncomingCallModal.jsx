import { useEffect, useRef } from "react";

import { useAppDispatch } from "@/redux/hooks";
import { clearIncomingCall } from "@/redux/slices/workspaceSlice";
import { APP_POINTS } from "@/api/apiConfig";
import assort_api from "@/api/axios";
import {
  setCallSession,
  setParticipant,
} from "@/redux/slices/callSessionSlice";

export default function IncomingCallModal({ call }) {
  const dispatch = useAppDispatch();

  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio("/sounds/incoming-call.mp3");
    audio.loop = true;

    audioRef.current = audio;

    audio.play().catch(() => {
      console.log("Unable to autoplay ringtone.");
    });

    return () => {
      stopRingtone();
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      stopRingtone();
      dispatch(clearIncomingCall());
    }, 62000);

    return () => clearTimeout(timeout);
  }, []);

  const stopRingtone = () => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  const handleAccept = async () => {
    try {
      stopRingtone();

      const response = await assort_api.post(
        `${APP_POINTS.CALL + call.session_id}/join/`,
      );
      const data = response.data;

      dispatch(clearIncomingCall());

      dispatch(
        setCallSession({
          id: call.session_id,
          origin: call.origin,
          mode: call.mode,
          title: call.title,
          organization: call.organization,
          chat_room_id: call.chat_room_id ?? null,
        }),
      );

      dispatch(setParticipant(data.participant));
    } catch (error) {
      console.log(error);

      dispatch(clearIncomingCall());
    }
  };

  const handleDecline = async () => {
    try {
      stopRingtone();

      await assort_api.post(`${APP_POINTS.CALL + call.session_id}/decline/`);
    } finally {
      dispatch(clearIncomingCall());
    }
  };

  const getCallLabel = () => {
    if (call.mode === "MEETING") {
      return "meeting";
    }

    if (call.origin === "GROUP") {
      return "group call";
    }

    if (call.origin === "PROJECT") {
      return "project call";
    }

    return "call";
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40">
      <div className="w-96 rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold">Incoming {getCallLabel()}</h2>

        <p className="mt-2 text-gray-600">{call.title}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleDecline}
            className="rounded bg-red-600 px-4 py-2 text-white"
          >
            Decline
          </button>

          <button
            onClick={handleAccept}
            className="rounded bg-green-600 px-4 py-2 text-white"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
