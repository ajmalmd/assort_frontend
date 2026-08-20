import { useCallback, useEffect, useRef, useState } from "react";

import { useAppDispatch, useCallSessionState } from "@/redux/hooks";

import {
  setSocketConnected,
  setParticipants,
  addParticipant,
  removeParticipant,
  updateParticipantMedia,
  clearCallSession,
  setMediaReady,
  sessionSwitchReady,
} from "@/redux/slices/callSessionSlice";

import { useCallSessionSocket } from "@/websocket/useCallSessionSocket";

import WebRTCService from "@/webrtc/WebRTCService";
import useLocalMedia from "@/hooks/useCallLocalMedia";

import CallSessionModal from "./CallSessionModal";

export default function CallSessionContainer() {
  const dispatch = useAppDispatch();

  const { session, participant, participants, sessionSwitch } =
    useCallSessionState();

  const [localStream, setLocalStream] = useState(null);

  const [, setRemoteStreamsVersion] = useState(0);

  const webrtcRef = useRef(null);
  const remoteStreamsRef = useRef(new Map());

  const leavingForSwitchRef = useRef(false);

  const cleanupDoneRef = useRef(false);

  const { streamRef, startMedia, stopMedia, toggleAudio, toggleVideo } =
    useLocalMedia();

  /*
   * ------------------------------------------------
   * Cleanup
   * ------------------------------------------------
   */

  const cleanupCurrentCall = useCallback(() => {
    if (cleanupDoneRef.current) {
      return;
    }

    cleanupDoneRef.current = true;

    webrtcRef.current?.destroy();
    webrtcRef.current = null;

    remoteStreamsRef.current.clear();

    setRemoteStreamsVersion((value) => value + 1);

    stopMedia();

    setLocalStream(null);

    dispatch(setMediaReady(false));
    dispatch(setSocketConnected(false));
    dispatch(clearCallSession());
  }, [dispatch, stopMedia]);

  /*
   * Reset cleanup guards when a new call starts.
   */
  useEffect(() => {
    if (!session?.id) {
      return;
    }

    cleanupDoneRef.current = false;
    leavingForSwitchRef.current = false;
  }, [session?.id]);

  /*
   * ------------------------------------------------
   * Call session socket
   * ------------------------------------------------
   */

  const { send } = useCallSessionSocket(session?.id, !!session, {
    onConnected() {
      dispatch(setSocketConnected(true));
    },

    onDisconnected() {
      dispatch(setSocketConnected(false));

      if (sessionSwitch.status === "REQUESTED" && sessionSwitch.requestId) {
        cleanupCurrentCall();

        dispatch(
          sessionSwitchReady({
            requestId: sessionSwitch.requestId,
          }),
        );
      }
    },

    onPresenceState(data) {
      dispatch(setParticipants(data.participants));

      if (webrtcRef.current && streamRef.current) {
        webrtcRef.current.connectToParticipants(data.participants);
      }
    },

    onParticipantJoined(data) {
      const newParticipant = data.participant;

      dispatch(addParticipant(newParticipant));

      if (webrtcRef.current && streamRef.current) {
        webrtcRef.current.addParticipant(newParticipant);
      }
    },

    onParticipantLeft(data) {
      const memberId = Number(data.member_id);

      dispatch(removeParticipant(memberId));

      webrtcRef.current?.removePeer(memberId);

      remoteStreamsRef.current.delete(memberId);

      setRemoteStreamsVersion((value) => value + 1);
    },

    onMediaUpdated(data) {
      dispatch(updateParticipantMedia(data));
    },

    onOffer(data) {
      webrtcRef.current?.handleOffer(data);
    },

    onAnswer(data) {
      webrtcRef.current?.handleAnswer(data);
    },

    onIceCandidate(data) {
      webrtcRef.current?.handleIceCandidate(data);
    },

    onCallEnded() {
      const switching = sessionSwitch.status === "REQUESTED";

      const requestId = sessionSwitch.requestId;

      cleanupCurrentCall();

      if (switching && requestId) {
        dispatch(
          sessionSwitchReady({
            requestId,
          }),
        );
      }
    },

    onError(error) {
      console.error("Call session socket error:", error);
    },
  });

  /*
   * ------------------------------------------------
   * Session switch request
   * ------------------------------------------------
   */

  useEffect(() => {
    if (!session?.id) {
      return;
    }

    if (sessionSwitch.status !== "REQUESTED") {
      return;
    }

    if (leavingForSwitchRef.current) {
      return;
    }

    leavingForSwitchRef.current = true;

    send({
      type: "leave_call",
    });
  }, [session?.id, sessionSwitch.status, sessionSwitch.requestId, send]);

  /*
   * ------------------------------------------------
   * WebRTC service
   * ------------------------------------------------
   */

  useEffect(() => {
    if (!participant?.member?.id) {
      return;
    }

    const service = new WebRTCService({
      localMemberId: participant.member.id,

      sendSignal: send,

      onRemoteStream({ memberId, stream }) {
        remoteStreamsRef.current.set(Number(memberId), stream);

        setRemoteStreamsVersion((value) => value + 1);
      },

      onRemoteStreamRemoved(memberId) {
        remoteStreamsRef.current.delete(Number(memberId));

        setRemoteStreamsVersion((value) => value + 1);
      },

      onConnectionStateChange({ memberId, state }) {
        console.log(`WebRTC connection ${memberId}:`, state);
      },
    });

    webrtcRef.current = service;

    return () => {
      service.destroy();

      if (webrtcRef.current === service) {
        webrtcRef.current = null;
      }

      remoteStreamsRef.current.clear();
    };
  }, [participant?.member?.id, send]);

  /*
   * ------------------------------------------------
   * Local media
   * ------------------------------------------------
   */

  useEffect(() => {
    if (!participant?.member?.id) {
      return;
    }

    let cancelled = false;

    const initializeMedia = async () => {
      try {
        const stream = await startMedia({
          audio: true,
          video: true,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());

          return;
        }

        setLocalStream(stream);

        webrtcRef.current?.setLocalStream(stream);

        dispatch(setMediaReady(true));

        webrtcRef.current?.connectToParticipants(participants);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to initialize call media:", error);

          dispatch(setMediaReady(false));
        }
      }
    };

    initializeMedia();

    return () => {
      cancelled = true;
    };
  }, [participant?.member?.id, startMedia, dispatch]);

  /*
   * ------------------------------------------------
   * Remote streams
   * ------------------------------------------------
   */

  const remoteStreams = {};

  for (const [memberId, stream] of remoteStreamsRef.current) {
    remoteStreams[memberId] = stream;
  }

  /*
   * ------------------------------------------------
   * Leave manually
   * ------------------------------------------------
   */

  const handleLeave = () => {
    send({
      type: "leave_call",
    });
  };

  if (!session) {
    return null;
  }

  return (
    <CallSessionModal
      localStream={localStream}
      remoteStreams={remoteStreams}
      onLeave={handleLeave}
      onToggleAudio={toggleAudio}
      onToggleVideo={toggleVideo}
    />
  );
}
