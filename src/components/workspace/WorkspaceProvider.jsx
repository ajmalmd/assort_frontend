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

import { getAccessToken, getAdminStatus } from "@/api/authStore";

import WorkspaceSummaryContainer from "./WorkspaceSummaryContainer";
import IncomingCallContainer from "./IncomingCallContainer";
import WaitingCallsContainer from "./WaitingCallsContainer";
import CallSessionContainer from "../call/CallSessionContainer";

export default function WorkspaceProvider({ children }) {
  const dispatch = useAppDispatch();

  const { incomingCall } = useWorkspaceState();
  const { session } = useCallSessionState();

  const incomingCallRef = useRef(null);
  const sessionRef = useRef(null);

  const token = getAccessToken();
  const isAdmin = getAdminStatus();

  const enabled = !!token && !isAdmin;

  useEffect(() => {
    incomingCallRef.current = incomingCall;
  }, [incomingCall]);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useWorkspaceSocket(enabled, {
    onConnected: () => {
      console.log("workspace connected");

      dispatch(setConnected(true));
    },

    onDisconnected: () => {
      dispatch(setConnected(false));
    },

    onIncomingCall: ({ data }) => {
      const currentIncomingCall = incomingCallRef.current;
      const currentSession = sessionRef.current;

      if (currentSession?.id || currentIncomingCall?.session_id) {
        dispatch(addWaitingCall(data));
        return;
      }

      dispatch(setIncomingCall(data));
    },

    onCallWaiting: ({ data }) => {
      dispatch(addWaitingCall(data));
    },

    onCallAcceptedElsewhere: ({ data }) => {
      const currentCall = incomingCallRef.current;

      if (currentCall?.session_id === data.session_id) {
        dispatch(clearIncomingCall());
      }

      dispatch(removeWaitingCall(data.session_id));
    },

    onCallEnded: ({ data }) => {
      const currentCall = incomingCallRef.current;

      if (currentCall?.session_id === data.session_id) {
        dispatch(clearIncomingCall());
      }

      dispatch(removeWaitingCall(data.session_id));
    },

    onWorkspaceSummary: ({ data }) => {
      dispatch(setWorkspaceSummary(data));
    },

    onSummaryUpdated: ({ data }) => {
      dispatch(updateWorkspaceSummary(data));
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
