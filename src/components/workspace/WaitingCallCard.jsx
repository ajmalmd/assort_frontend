import { useEffect, useState, useCallback } from "react";

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

  const dispatch = useAppDispatch();

  const { session, sessionSwitch } = useCallSessionState();

  const { incomingCall } = useWorkspaceState();

  const { requestSwitch } = useCallSessionSwitch();

  /*
   * ------------------------------------------------
   * Join waiting call
   * ------------------------------------------------
   */

  const joinWaitingCall = useCallback(async () => {
    if (accepting || declining) {
      return;
    }

    setAccepting(true);

    try {
      if (incomingCall) {
        dispatch(moveIncomingCallToWaiting());
      }

      const response = await assort_api.post(
        `${APP_POINTS.CALL}${call.session_id}/join/`,
      );

      const data = response.data;

      dispatch(
        setCallSession({
          id: call.session_id,
        }),
      );

      dispatch(setParticipant(data.participant));

      dispatch(removeWaitingCall(call.session_id));

      dispatch(clearSessionSwitch());
    } catch (error) {
      console.error("Failed to accept waiting call:", error);

      dispatch(clearSessionSwitch());
    } finally {
      setAccepting(false);
    }
  }, [accepting, declining, call.session_id, dispatch]);

  /*
   * ------------------------------------------------
   * Accept
   * ------------------------------------------------
   */

  const acceptCall = async () => {
    if (accepting || declining) {
      return;
    }

    // If we're already inside another call, ask CallSessionContainer to leave it first.
    if (session?.id) {
      requestSwitch(call.session_id);
      return;
    }

    // active call, Join immediately.
    await joinWaitingCall();
  };

  /*
   * ------------------------------------------------
   * Wait for current call cleanup
   * ------------------------------------------------
   */

  useEffect(() => {
    if (
      sessionSwitch.status !== "READY" ||
      String(sessionSwitch.targetSessionId) !== String(call.session_id)
    ) {
      return;
    }

    joinWaitingCall();
  }, [
    sessionSwitch.status,
    sessionSwitch.targetSessionId,
    call.session_id,
    joinWaitingCall,
  ]);

  /*
   * ------------------------------------------------
   * Decline
   * ------------------------------------------------
   */

  const declineCall = async () => {
    if (accepting || declining) {
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
  };

  const switching =
    sessionSwitch.status === "REQUESTED" &&
    String(sessionSwitch.targetSessionId) === String(call.session_id);

  return (
    <div className="rounded-lg border bg-card p-4 shadow-lg">
      <div className="mb-3">
        <p className="font-medium">Incoming Call</p>

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
