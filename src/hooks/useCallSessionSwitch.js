import { useCallback } from "react";

import { useAppDispatch, useCallSessionState } from "@/redux/hooks";

import { requestSessionSwitch } from "@/redux/slices/callSessionSlice";

export default function useCallSessionSwitch() {
  const dispatch = useAppDispatch();

  const { session } = useCallSessionState();

  const requestSwitch = useCallback(
    (targetSessionId) => {
      if (!targetSessionId) {
        return null;
      }

      //  No active call, The caller can join immediately.
      if (!session?.id) {
        return null;
      }

      // Don't request switching to the call we're already inside.
      if (String(session.id) === String(targetSessionId)) {
        return null;
      }

      const requestId = crypto.randomUUID();

      dispatch(
        requestSessionSwitch({
          targetSessionId,
          requestId,
        }),
      );

      return requestId;
    },
    [dispatch, session?.id],
  );

  return {
    activeSession: session,
    requestSwitch,
  };
}
