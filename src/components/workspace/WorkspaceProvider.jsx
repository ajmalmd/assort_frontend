import { useEffect, useRef } from "react";
import { useWorkspaceSocket } from "@/websocket/useWorkspaceSocket";
import { useAppDispatch, useWorkspaceState } from "@/redux/hooks";

import {
  setConnected,
  setIncomingCall,
  setWorkspaceSummary,
  updateWorkspaceSummary,
  clearIncomingCall,
} from "@/redux/slices/workspaceSlice";

import { getAccessToken, getAdminStatus } from "@/api/authStore";

import IncomingCallContainer from "./IncomingCallContainer";
import WorkspaceSummaryContainer from "./WorkspaceSummaryContainer";

export default function WorkspaceProvider({ children }) {
  const dispatch = useAppDispatch();

  const { incomingCall } = useWorkspaceState();

  const incomingCallRef = useRef(null);

  const token = getAccessToken();
  const isAdmin = getAdminStatus();

  const enabled = !!token && !isAdmin;

  useEffect(() => {
    incomingCallRef.current = incomingCall;
  }, [incomingCall]);

  useWorkspaceSocket(enabled, {
    onConnected: () => {
      console.log("workspace connected");
      
      dispatch(setConnected(true));
    },

    onDisconnected: () => {
      dispatch(setConnected(false));
    },

    onIncomingCall: ({ data }) => {
      dispatch(setIncomingCall(data));
    },

    onCallEnded: ({ data }) => {
      const currentCall = incomingCallRef.current;

      if (currentCall && currentCall.session_id === data.session_id) {
        dispatch(clearIncomingCall());
      }
    },

    onCallWaiting: ({ data }) => {
      // Phase 6
      console.log("Call waiting:", data);
      // handle multiple calls waiting
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

      <IncomingCallContainer />
      {/* <WorkspaceSummaryContainer /> */}
    </>
  );
}
