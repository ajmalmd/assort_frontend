import { useCallback, useEffect, useRef } from "react";

import { useAppDispatch } from "@/redux/hooks";
import { setLocalMedia } from "@/redux/slices/callSessionSlice";

export default function useLocalMedia() {
  const dispatch = useAppDispatch();

  const streamRef = useRef(null);

  const startMedia = useCallback(
    async ({ audio = true, video = true } = {}) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio,
          video,
        });

        console.log("[MEDIA] local tracks", {
          audio: stream.getAudioTracks().map((track) => ({
            id: track.id,
            enabled: track.enabled,
            readyState: track.readyState,
          })),
          video: stream.getVideoTracks().map((track) => ({
            id: track.id,
            enabled: track.enabled,
            readyState: track.readyState,
          })),
        });

        // Ask for permission, but start with both media types OFF.
        stream.getAudioTracks().forEach((track) => {
          track.enabled = false;
        });

        stream.getVideoTracks().forEach((track) => {
          track.enabled = false;
        });

        streamRef.current = stream;

        dispatch(
          setLocalMedia({
            audio: false,
            video: false,
            screen: false,
          }),
        );

        return stream;
      } catch (error) {
        console.error("Unable to access local media:", error);

        throw error;
      }
    },
    [dispatch],
  );

  const stopMedia = useCallback(() => {
    if (!streamRef.current) {
      return;
    }

    streamRef.current.getTracks().forEach((track) => track.stop());

    streamRef.current = null;

    dispatch(
      setLocalMedia({
        audio: false,
        video: false,
        screen: false,
      }),
    );
  }, [dispatch]);

  const toggleAudio = useCallback(() => {
    const stream = streamRef.current;

    if (!stream) {
      return;
    }

    const tracks = stream.getAudioTracks();

    if (!tracks.length) {
      return;
    }

    const enabled = !tracks[0].enabled;

    tracks.forEach((track) => {
      track.enabled = enabled;
    });

    dispatch(
      setLocalMedia({
        audio: enabled,
      }),
    );

    return enabled;
  }, [dispatch]);

  const toggleVideo = useCallback(() => {
    const stream = streamRef.current;

    if (!stream) {
      return;
    }

    const tracks = stream.getVideoTracks();

    if (!tracks.length) {
      return;
    }

    const enabled = !tracks[0].enabled;

    tracks.forEach((track) => {
      track.enabled = enabled;
    });

    dispatch(
      setLocalMedia({
        video: enabled,
      }),
    );

    return enabled;
  }, [dispatch]);

  useEffect(() => {
    return () => {
      if (!streamRef.current) {
        return;
      }

      streamRef.current.getTracks().forEach((track) => track.stop());

      streamRef.current = null;
    };
  }, []);

  return {
    streamRef,

    startMedia,
    stopMedia,

    toggleAudio,
    toggleVideo,
  };
}
