import { useCallback, useEffect, useRef } from "react";

import { useAppDispatch } from "@/redux/hooks";
import { setLocalMedia } from "@/redux/slices/callSessionSlice";

export default function useLocalMedia() {
  const dispatch = useAppDispatch();

  const streamRef = useRef(null);

  const stopTracks = useCallback((stream) => {
    stream?.getTracks().forEach((track) => {
      track.stop();
    });
  }, []);

  const requestTrack = useCallback(async (kind) => {
    const constraints =
      kind === "audio"
        ? {
            audio: true,
            video: false,
          }
        : {
            audio: false,
            video: true,
          };

    try {
      const mediaStream =
        await navigator.mediaDevices.getUserMedia(constraints);

      return (
        mediaStream.getTracks().find((track) => track.kind === kind) ?? null
      );
    } catch (error) {
      console.warn(`[MEDIA] Unable to access ${kind}:`, error);

      return null;
    }
  }, []);

  const startMedia = useCallback(async () => {
    if (streamRef.current) {
      stopTracks(streamRef.current);
    }

    const stream = new MediaStream();

    /*
     * Request independently. A camera failure should not
     * prevent microphone access, and vice versa.
     */
    const [audioTrack, videoTrack] = await Promise.all([
      requestTrack("audio"),
      requestTrack("video"),
    ]);

    if (audioTrack) {
      audioTrack.enabled = false;
      stream.addTrack(audioTrack);
    }

    if (videoTrack) {
      videoTrack.enabled = false;
      stream.addTrack(videoTrack);
    }

    streamRef.current = stream;

    dispatch(
      setLocalMedia({
        audio: false,
        video: false,
        screen: false,
      }),
    );

    console.log("[MEDIA] initialization completed", {
      audioAvailable: Boolean(audioTrack),
      videoAvailable: Boolean(videoTrack),
      tracks: stream.getTracks().map((track) => ({
        id: track.id,
        kind: track.kind,
        enabled: track.enabled,
        readyState: track.readyState,
      })),
    });

    /*
     * Return even if the stream is empty.
     *
     * The user must still become WebRTC-ready so they can
     * receive the other participant's media.
     */
    return stream;
  }, [dispatch, requestTrack, stopTracks]);

  const stopMedia = useCallback(() => {
    stopTracks(streamRef.current);

    streamRef.current = null;

    dispatch(
      setLocalMedia({
        audio: false,
        video: false,
        screen: false,
      }),
    );
  }, [dispatch, stopTracks]);

  const toggleAudio = useCallback(async () => {
    let stream = streamRef.current;

    if (!stream) {
      stream = new MediaStream();
      streamRef.current = stream;
    }

    let track = stream
      .getAudioTracks()
      .find((item) => item.readyState === "live");

    /*
     * Retry device access when the original request failed.
     */
    if (!track) {
      track = await requestTrack("audio");

      if (!track) {
        return undefined;
      }

      stream.addTrack(track);
      track.enabled = true;
    } else {
      track.enabled = !track.enabled;
    }

    dispatch(
      setLocalMedia({
        audio: track.enabled,
      }),
    );

    return track.enabled;
  }, [dispatch, requestTrack]);

  const toggleVideo = useCallback(async () => {
    let stream = streamRef.current;

    if (!stream) {
      stream = new MediaStream();
      streamRef.current = stream;
    }

    let track = stream
      .getVideoTracks()
      .find((item) => item.readyState === "live");

    /*
     * Retry camera access when the original request failed.
     */
    if (!track) {
      track = await requestTrack("video");

      if (!track) {
        return undefined;
      }

      stream.addTrack(track);
      track.enabled = true;
    } else {
      track.enabled = !track.enabled;
    }

    dispatch(
      setLocalMedia({
        video: track.enabled,
      }),
    );

    return track.enabled;
  }, [dispatch, requestTrack]);

  useEffect(() => {
    return () => {
      stopTracks(streamRef.current);
      streamRef.current = null;
    };
  }, [stopTracks]);

  return {
    streamRef,
    startMedia,
    stopMedia,
    toggleAudio,
    toggleVideo,
  };
}
