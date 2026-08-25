import { useEffect, useRef } from "react";

import { useWorkspaceSocket } from "@/websocket/useWorkspaceSocket";

import {
  useAppDispatch,
  useCallSessionState,
  useWorkspaceState,
} from "@/redux/hooks";

import {
  setConnected,
  setIncomingCall,
  setWorkspaceSummary,
  updateWorkspaceSummary,
  clearIncomingCall,
  addWaitingCall,
  removeWaitingCall,
} from "@/redux/slices/workspaceSlice";

import {
  clearCallSession,
  sessionSwitchReady,
} from "@/redux/slices/callSessionSlice";

import { getAccessToken, getAdminStatus } from "@/api/authStore";

import IncomingCallContainer from "./IncomingCallContainer";
import WaitingCallsContainer from "./WaitingCallsContainer";
import CallSessionContainer from "../call/CallSessionContainer";

export default function WorkspaceProvider({ children }) {
  const dispatch = useAppDispatch();

  const { incomingCall } = useWorkspaceState();

  const { session, sessionSwitch } = useCallSessionState();

  const incomingCallRef = useRef(incomingCall);
  const sessionRef = useRef(session);
  const sessionSwitchRef = useRef(sessionSwitch);

  const token = getAccessToken();
  const isAdmin = getAdminStatus();

  const enabled = Boolean(token) && !isAdmin;

  useEffect(() => {
    incomingCallRef.current = incomingCall;
  }, [incomingCall]);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    sessionSwitchRef.current = sessionSwitch;
  }, [sessionSwitch]);

  useWorkspaceSocket(enabled, {
    onConnected() {
      console.log("Workspace socket connected");

      dispatch(setConnected(true));
    },

    onDisconnected() {
      dispatch(setConnected(false));
    },

    onIncomingCall({ data }) {
      const currentIncomingCall = incomingCallRef.current;

      const currentSession = sessionRef.current;

      if (currentSession?.id || currentIncomingCall?.session_id) {
        dispatch(addWaitingCall(data));
        return;
      }

      /*
       * Update the ref immediately. Otherwise, two incoming
       * events before React rerenders could both become the
       * primary incoming call.
       */
      incomingCallRef.current = data;

      dispatch(setIncomingCall(data));
    },

    onCallWaiting({ data }) {
      dispatch(addWaitingCall(data));
    },

    onCallAcceptedElsewhere({ data }) {
      const currentIncomingCall = incomingCallRef.current;

      if (String(currentIncomingCall?.session_id) === String(data.session_id)) {
        incomingCallRef.current = null;
        dispatch(clearIncomingCall());
      }

      dispatch(removeWaitingCall(data.session_id));
    },

    onCallEnded({ data }) {
      const endedSessionId = String(data.session_id);

      const currentIncomingCall = incomingCallRef.current;

      const currentSession = sessionRef.current;

      const currentSwitch = sessionSwitchRef.current;

      /*
       * Clear a ringing incoming call.
       */
      if (String(currentIncomingCall?.session_id) === endedSessionId) {
        incomingCallRef.current = null;
        dispatch(clearIncomingCall());
      }

      /*
       * Remove the session from waiting calls.
       */
      dispatch(removeWaitingCall(data.session_id));

      /*
       * Normally CallSessionContainer handles call_ended
       * through the call socket. This is a fallback for when
       * that socket has disconnected but the workspace socket
       * is still connected.
       */
      if (String(currentSession?.id) === endedSessionId) {
        sessionRef.current = null;

        dispatch(clearCallSession());

        /*
         * Do not leave a session switch stuck if the workspace
         * event arrived before the call-session event.
         */
        if (currentSwitch.status === "REQUESTED" && currentSwitch.requestId) {
          dispatch(
            sessionSwitchReady({
              requestId: currentSwitch.requestId,
            }),
          );
        }
      }
    },

    onWorkspaceSummary({ data }) {
      dispatch(setWorkspaceSummary(data));
    },

    onSummaryUpdated({ data }) {
      dispatch(updateWorkspaceSummary(data));
    },

    onError(error) {
      console.error("Workspace socket error:", error);
    },
  });

  useEffect(() => {
    if (!enabled) {
      dispatch(setConnected(false));
    }
  }, [enabled, dispatch]);

  return (
    <>
      {children}

      {/* <WorkspaceSummaryContainer /> */}
      <IncomingCallContainer />
      <WaitingCallsContainer />
      <CallSessionContainer />
    </>
  );
}
