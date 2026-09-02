import { useCallback, useEffect, useRef, useState } from "react";

import {
  useAppDispatch,
  useCallSessionState,
  useWorkspaceState,
} from "@/redux/hooks";

import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";

import {
  moveIncomingCallToWaiting,
  removeWaitingCall,
} from "@/redux/slices/workspaceSlice";

import {
  setCallSession,
  setParticipant,
  clearSessionSwitch,
} from "@/redux/slices/callSessionSlice";

import useCallSessionSwitch from "@/hooks/useCallSessionSwitch";

export default function WaitingCallCard({ call }) {
  const [accepting, setAccepting] = useState(false);

  const [declining, setDeclining] = useState(false);

  const joinInProgressRef = useRef(false);

  const dispatch = useAppDispatch();

  const { session, sessionSwitch } = useCallSessionState();

  const { incomingCall } = useWorkspaceState();

  const { requestSwitch } = useCallSessionSwitch();

  const isSwitchTarget =
    String(sessionSwitch.targetSessionId) === String(call.session_id);

  const joinWaitingCall = useCallback(async () => {
    if (joinInProgressRef.current || accepting || declining) {
      return;
    }

    joinInProgressRef.current = true;
    setAccepting(true);

    try {
      /*
       * A different incoming-call modal may still be open.
       * Move it to the waiting list before opening this call.
       */
      if (incomingCall) {
        dispatch(moveIncomingCallToWaiting());
      }

      const response = await assort_api.post(
        `${APP_POINTS.CALL}${call.session_id}/join/`,
      );

      const { participant } = response.data;

      /*
       * Preserve the metadata already received through the
       * workspace incoming-call payload.
       */
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

      dispatch(setParticipant(participant));

      dispatch(removeWaitingCall(call.session_id));

      /*
       * Clear only if this card was the requested target.
       * A direct accept with IDLE status can also clear safely.
       */
      if (sessionSwitch.status === "IDLE" || isSwitchTarget) {
        dispatch(clearSessionSwitch());
      }
    } catch (error) {
      console.error("Failed to accept waiting call:", error);

      if (isSwitchTarget) {
        dispatch(clearSessionSwitch());
      }
    } finally {
      joinInProgressRef.current = false;
      setAccepting(false);
    }
  }, [
    accepting,
    declining,
    incomingCall,
    call,
    dispatch,
    sessionSwitch.status,
    isSwitchTarget,
  ]);

  const acceptCall = useCallback(() => {
    if (accepting || declining || joinInProgressRef.current) {
      return;
    }

    if (session?.id) {
      requestSwitch(call.session_id);
      return;
    }

    void joinWaitingCall();
  }, [
    accepting,
    declining,
    session?.id,
    call.session_id,
    requestSwitch,
    joinWaitingCall,
  ]);

  useEffect(() => {
    if (sessionSwitch.status !== "READY" || !isSwitchTarget) {
      return;
    }

    void joinWaitingCall();
  }, [sessionSwitch.status, isSwitchTarget, joinWaitingCall]);

  const declineCall = useCallback(async () => {
    if (accepting || declining || joinInProgressRef.current) {
      return;
    }

    setDeclining(true);

    try {
      await assort_api.post(`${APP_POINTS.CALL}${call.session_id}/decline/`);

      dispatch(removeWaitingCall(call.session_id));
    } catch (error) {
      console.error("Failed to decline call:", error);
    } finally {
      setDeclining(false);
    }
  }, [accepting, declining, call.session_id, dispatch]);

  const switching = sessionSwitch.status === "REQUESTED" && isSwitchTarget;

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
    <div className="rounded-lg border bg-card p-4 shadow-lg">
      <div className="mb-3">
        <p className="font-medium">Incoming {getCallLabel()}</p>

        <p className="text-sm text-muted-foreground">
          {call.title || "Unknown user"}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={acceptCall}
          disabled={accepting || declining || switching}
          className="flex-1 rounded bg-green-600 px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {switching
            ? "Leaving current call..."
            : accepting
              ? "Joining..."
              : "Accept"}
        </button>

        <button
          type="button"
          onClick={declineCall}
          disabled={accepting || declining || switching}
          className="flex-1 rounded bg-red-600 px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {declining ? "Declining..." : "Decline"}
        </button>
      </div>
    </div>
  );
}
