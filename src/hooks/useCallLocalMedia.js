import { useCallback, useEffect, useRef, useState } from "react";

import { useAppDispatch } from "@/redux/hooks";
import { setLocalMedia } from "@/redux/slices/callSessionSlice";

const initialDevices = {
  audio: { available: null, error: null },
  video: { available: null, error: null },
};

function getMediaErrorMessage(error, kind) {
  const label = kind === "audio" ? "Microphone" : "Camera";

  switch (error?.name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return `${label} permission was denied.`;

    case "NotFoundError":
    case "DevicesNotFoundError":
      return `No ${label.toLowerCase()} was found.`;

    case "NotReadableError":
    case "TrackStartError":
      return `The ${label.toLowerCase()} is being used by another application.`;

    case "SecurityError":
      return "Media access requires a secure HTTPS connection.";

    default:
      return `Unable to access the ${label.toLowerCase()}.`;
  }
}

export default function useLocalMedia({ onTrackEnded } = {}) {
  const dispatch = useAppDispatch();

  const streamRef = useRef(null);
  const onTrackEndedRef = useRef(onTrackEnded);

  const [devices, setDevices] = useState(initialDevices);

  useEffect(() => {
    onTrackEndedRef.current = onTrackEnded;
  }, [onTrackEnded]);

  const stopTracks = useCallback((stream) => {
    stream?.getTracks().forEach((track) => {
      track.onended = null;
      track.stop();
    });
  }, []);

  const checkDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      setDevices({
        audio: {
          available: false,
          error: "This browser does not support media devices.",
        },
        video: {
          available: false,
          error: "This browser does not support media devices.",
        },
      });

      return;
    }

    try {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();

      const audioAvailable = mediaDevices.some(
        (device) => device.kind === "audioinput",
      );
      const videoAvailable = mediaDevices.some(
        (device) => device.kind === "videoinput",
      );

      setDevices({
        audio: {
          available: audioAvailable,
          error: audioAvailable ? null : "No microphone was detected.",
        },
        video: {
          available: videoAvailable,
          error: videoAvailable ? null : "No camera was detected.",
        },
      });
    } catch (error) {
      console.warn("[MEDIA] Unable to check devices:", error);
    }
  }, []);

  const requestTrack = useCallback(
    async (kind) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        const message = "This browser does not support media devices.";

        return { track: null, error: message };
      }

      const constraints =
        kind === "audio"
          ? { audio: true, video: false }
          : { audio: false, video: true };

      try {
        const mediaStream =
          await navigator.mediaDevices.getUserMedia(constraints);
        const track =
          mediaStream.getTracks().find((item) => item.kind === kind) ?? null;

        if (!track) {
          stopTracks(mediaStream);

          return {
            track: null,
            error: `No ${
              kind === "audio" ? "microphone" : "camera"
            } track was created.`,
          };
        }

        setDevices((current) => ({
          ...current,
          [kind]: { available: true, error: null },
        }));

        return { track, error: null };
      } catch (error) {
        const message = getMediaErrorMessage(error, kind);
        const noDevice =
          error?.name === "NotFoundError" ||
          error?.name === "DevicesNotFoundError";

        setDevices((current) => ({
          ...current,
          [kind]: {
            available: noDevice ? false : current[kind].available,
            error: message,
          },
        }));

        return { track: null, error: message };
      }
    },
    [stopTracks],
  );

  const attachTrackEndedHandler = useCallback(
    (track, kind) => {
      track.onended = () => {
        const stream = streamRef.current;

        // Manual stops remove the track before calling stop(), so ignore them.
        if (!stream?.getTracks().includes(track)) {
          return;
        }

        stream.removeTrack(track);

        const label = kind === "audio" ? "Microphone" : "Camera";
        const message = `${label} was disconnected.`;

        setDevices((current) => ({
          ...current,
          [kind]: { available: false, error: message },
        }));

        dispatch(setLocalMedia({ [kind]: false }));

        onTrackEndedRef.current?.({ kind, stream, message });
      };
    },
    [dispatch],
  );

  useEffect(() => {
    if (!navigator.mediaDevices?.addEventListener) {
      return undefined;
    }

    const handleDeviceChange = () => {
      void checkDevices();
    };

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        handleDeviceChange,
      );
    };
  }, [checkDevices]);

  const startMedia = useCallback(async () => {
    if (streamRef.current) {
      stopTracks(streamRef.current);
    }

    streamRef.current = new MediaStream();

    dispatch(setLocalMedia({ audio: false, video: false, screen: false }));

    await checkDevices();

    return streamRef.current;
  }, [checkDevices, dispatch, stopTracks]);

  const removeTrack = useCallback((kind) => {
    const stream = streamRef.current;

    if (!stream) {
      return;
    }

    const track = stream.getTracks().find((item) => item.kind === kind);

    if (!track) {
      return;
    }

    track.onended = null;
    stream.removeTrack(track);
    track.stop();
  }, []);

  const toggleAudio = useCallback(async () => {
    let stream = streamRef.current;

    if (!stream) {
      stream = new MediaStream();
      streamRef.current = stream;
    }

    const existingTrack = stream
      .getAudioTracks()
      .find((track) => track.readyState === "live");

    if (existingTrack) {
      removeTrack("audio");
      dispatch(setLocalMedia({ audio: false }));

      return { enabled: false, error: null };
    }

    const { track, error } = await requestTrack("audio");

    if (!track) {
      return { enabled: false, error };
    }

    stream.addTrack(track);
    attachTrackEndedHandler(track, "audio");
    dispatch(setLocalMedia({ audio: true }));

    return { enabled: true, error: null };
  }, [attachTrackEndedHandler, dispatch, removeTrack, requestTrack]);

  const toggleVideo = useCallback(async () => {
    let stream = streamRef.current;

    if (!stream) {
      stream = new MediaStream();
      streamRef.current = stream;
    }

    const existingTrack = stream
      .getVideoTracks()
      .find((track) => track.readyState === "live");

    if (existingTrack) {
      removeTrack("video");
      dispatch(setLocalMedia({ video: false }));

      return { enabled: false, error: null };
    }

    const { track, error } = await requestTrack("video");

    if (!track) {
      return { enabled: false, error };
    }

    stream.addTrack(track);
    attachTrackEndedHandler(track, "video");
    dispatch(setLocalMedia({ video: true }));

    return { enabled: true, error: null };
  }, [attachTrackEndedHandler, dispatch, removeTrack, requestTrack]);

  const stopMedia = useCallback(() => {
    stopTracks(streamRef.current);
    streamRef.current = null;

    dispatch(setLocalMedia({ audio: false, video: false, screen: false }));
  }, [dispatch, stopTracks]);

  useEffect(() => {
    return () => {
      stopTracks(streamRef.current);
      streamRef.current = null;
    };
  }, [stopTracks]);

  return {
    streamRef,
    devices,
    checkDevices,
    startMedia,
    stopMedia,
    toggleAudio,
    toggleVideo,
  };
}
