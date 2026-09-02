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
import toast from "react-hot-toast";

export default function CallSessionContainer() {
  const dispatch = useAppDispatch();

  const {
    session,
    participant,
    participants,
    sessionSwitch,
    socketConnected,
    mediaReady,
  } = useCallSessionState();

  const [localStream, setLocalStream] = useState(null);

  const [, setRemoteStreamsVersion] = useState(0);

  const webrtcRef = useRef(null);
  const remoteStreamsRef = useRef(new Map());

  const readyMembersRef = useRef(new Set());

  const [readyMembersVersion, setReadyMembersVersion] = useState(0);

  const readyAnnouncedRef = useRef(false);
  const initialMediaStateSentRef = useRef(false);

  const leaveRequestedRef = useRef(false);

  const cleanupDoneRef = useRef(false);

  /*
   * useLocalMedia is created before the call socket. Keep a stable
   * forwarding callback here, then connect it to the socket-dependent
   * handler after `send` has been initialized.
   */
  const localTrackEndedHandlerRef = useRef(null);

  const forwardLocalTrackEnded = useCallback((data) => {
    void localTrackEndedHandlerRef.current?.(data);
  }, []);

  const { streamRef, startMedia, stopMedia, toggleAudio, toggleVideo } =
    useLocalMedia({
      onTrackEnded: forwardLocalTrackEnded,
    });

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
    readyMembersRef.current.clear();

    readyAnnouncedRef.current = false;
    initialMediaStateSentRef.current = false;

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
    leaveRequestedRef.current = false;

    readyAnnouncedRef.current = false;
    initialMediaStateSentRef.current = false;

    readyMembersRef.current.clear();
    setReadyMembersVersion((value) => value + 1);
  }, [session?.id]);

  /*
   * ------------------------------------------------
   * Call session socket
   * ------------------------------------------------
   */

  const { send, closeIntentionally } = useCallSessionSocket(
    session?.id,
    !!session,
    {
      onConnected() {
        // console.log("CALL SOCKET CONNECTED");
        dispatch(setSocketConnected(true));
      },

      onDisconnected() {
        dispatch(setSocketConnected(false));

        // A reconnect requires a new readiness handshake.
        readyAnnouncedRef.current = false;
        initialMediaStateSentRef.current = false;

        readyMembersRef.current.clear();
        setReadyMembersVersion((value) => value + 1);

        webrtcRef.current?.removeAllPeers();
      },

      onPresenceState(data) {
        dispatch(setParticipants(data.participants));
      },

      onParticipantJoined(data) {
        const newParticipant = data.participant;

        // console.log("PARTICIPANT JOINED", newParticipant);

        dispatch(addParticipant(newParticipant));
      },

      onParticipantReady(data) {
        const memberId = Number(data.member_id);
        const localMemberId = Number(participant?.member?.id);

        if (!memberId || memberId === localMemberId) {
          return;
        }

        const alreadyReady = readyMembersRef.current.has(memberId);

        readyMembersRef.current.add(memberId);

        if (!alreadyReady) {
          setReadyMembersVersion((value) => value + 1);

          // Reannounce so a newly connected participant learns
          // that this existing participant is also ready.
          if (readyAnnouncedRef.current) {
            send({
              type: "call_ready",
            });
          }
        }
      },

      onParticipantLeft(data) {
        const memberId = Number(data.member_id);
        const localMemberId = Number(participant?.member?.id);

        // We left a group/project/meeting that continues.
        if (memberId === localMemberId) {
          const switching = sessionSwitch.status === "REQUESTED";

          const requestId = sessionSwitch.requestId;

          cleanupCurrentCall();
          closeIntentionally();

          if (switching && requestId) {
            dispatch(
              sessionSwitchReady({
                requestId,
              }),
            );
          }

          return;
        }

        readyMembersRef.current.delete(memberId);
        setReadyMembersVersion((value) => value + 1);

        dispatch(removeParticipant(memberId));

        webrtcRef.current?.removePeer(memberId);
        remoteStreamsRef.current.delete(memberId);

        setRemoteStreamsVersion((value) => value + 1);
      },

      onMediaUpdated(data) {
        dispatch(updateParticipantMedia(data));
      },

      onOffer(data) {
        // console.log("RECEIVED OFFER", data);
        webrtcRef.current?.handleOffer(data);
      },

      onAnswer(data) {
        // console.log("RECEIVED ANSWER", data);
        webrtcRef.current?.handleAnswer(data);
      },

      onIceCandidate(data) {
        // console.log("RECEIVED ICE", data);
        webrtcRef.current?.handleIceCandidate(data);
      },

      onCallEnded() {
        const switching = sessionSwitch.status === "REQUESTED";
        const requestId = sessionSwitch.requestId;

        cleanupCurrentCall();

        closeIntentionally();

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
    },
  );

  const handleLocalTrackEnded = useCallback(
    async ({ kind, stream, message }) => {
      await webrtcRef.current?.setLocalStream(stream);

      send({
        type: "participant_update",
        [kind]: false,
      });

      toast.error(message);
    },
    [send],
  );

  useEffect(() => {
    localTrackEndedHandlerRef.current = handleLocalTrackEnded;

    return () => {
      localTrackEndedHandlerRef.current = null;
    };
  }, [handleLocalTrackEnded]);

  const requestLeave = useCallback(() => {
    if (leaveRequestedRef.current) {
      return false;
    }

    const sent = send({
      type: "leave_call",
    });

    if (!sent) {
      return false;
    }

    leaveRequestedRef.current = true;

    return true;
  }, [send]);

  useEffect(() => {
    if (!socketConnected || !mediaReady) {
      return;
    }

    if (!participant?.member?.id) {
      return;
    }

    if (!webrtcRef.current || !streamRef.current) {
      return;
    }

    if (readyAnnouncedRef.current) {
      return;
    }

    const sent = send({
      type: "call_ready",
    });

    if (!sent) {
      return;
    }

    readyAnnouncedRef.current = true;

    // console.log("[WebRTC] LOCAL SIGNALING READY", {
    //   memberId: participant.member.id,
    // });
  }, [socketConnected, mediaReady, participant?.member?.id, send, streamRef]);

  useEffect(() => {
    if (!socketConnected || !mediaReady) {
      return;
    }

    if (initialMediaStateSentRef.current) {
      return;
    }

    const sent = send({
      type: "participant_update",
      audio: false,
      video: false,
      screen: false,
    });

    if (!sent) {
      return;
    }

    initialMediaStateSentRef.current = true;
  }, [socketConnected, mediaReady, send]);

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

    if (!socketConnected) {
      return;
    }

    requestLeave();
  }, [
    session?.id,
    sessionSwitch.status,
    sessionSwitch.requestId,
    socketConnected,
    requestLeave,
  ]);

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
        // console.log(`WebRTC connection ${memberId}:`, state);
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

        // console.log("LOCAL MEDIA READY", {
        //   stream,
        //   socketConnected,
        // });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        setLocalStream(stream);

        if (webrtcRef.current) {
          await webrtcRef.current.setLocalStream(stream);
        }

        dispatch(setMediaReady(true));
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

  useEffect(() => {
    if (
      !socketConnected ||
      !mediaReady ||
      !webrtcRef.current ||
      !participant?.member?.id ||
      !participants.length ||
      !readyMembersRef.current.size
    ) {
      return;
    }

    void webrtcRef.current
      .connectToParticipants(participants, readyMembersRef.current)
      .catch((error) => {
        console.error("[WebRTC] Negotiation failed:", error);
      });
  }, [
    socketConnected,
    mediaReady,
    participants,
    participant?.member?.id,
    readyMembersVersion,
  ]);

  /*
   * ------------------------------------------------
   * Remote streams
   * ------------------------------------------------
   */

  const remoteStreams = {};

  for (const [memberId, stream] of remoteStreamsRef.current) {
    remoteStreams[memberId] = stream;
  }

  const handleToggleAudio = useCallback(async () => {
    const result = await toggleAudio();

    if (result.error) {
      toast.error(result.error);
      return;
    }

    const audioTrack =
      streamRef.current
        ?.getAudioTracks()
        .find((track) => track.readyState === "live") ?? null;

    // console.log("[AUDIO] Local track", {
    //   result,
    //   track: audioTrack
    //     ? {
    //         id: audioTrack.id,
    //         enabled: audioTrack.enabled,
    //         muted: audioTrack.muted,
    //         readyState: audioTrack.readyState,
    //         label: audioTrack.label,
    //       }
    //     : null,
    // });

    await webrtcRef.current?.setLocalStream(streamRef.current);

    send({
      type: "participant_update",
      audio: result.enabled,
    });
  }, [send, streamRef, toggleAudio]);

  const handleToggleVideo = useCallback(async () => {
    const result = await toggleVideo();

    if (result.error) {
      console.warn(result.error);
      toast.error(result.error);
      return;
    }

    await webrtcRef.current?.setLocalStream(streamRef.current);

    send({
      type: "participant_update",
      video: result.enabled,
    });
  }, [send, streamRef, toggleVideo]);

  /*
   * ------------------------------------------------
   * Leave manually
   * ------------------------------------------------
   */

  const handleLeave = useCallback(() => {
    requestLeave();
  }, [requestLeave]);

  if (!session) {
    return null;
  }

  return (
    <CallSessionModal
      localStream={localStream}
      remoteStreams={remoteStreams}
      onLeave={handleLeave}
      onToggleAudio={handleToggleAudio}
      onToggleVideo={handleToggleVideo}
    />
  );
}
