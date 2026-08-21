import { useEffect, useRef } from "react";

export default function ParticipantVideo({ participant, stream }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.srcObject = stream || null;

    if (stream) {
      video.play().catch((error) => {
        console.warn("Remote media playback failed:", error);
      });
    }

    return () => {
      video.srcObject = null;
    };
  }, [stream]);

  const videoEnabled = participant?.video;

  return (
    <div className="relative overflow-hidden rounded-lg bg-neutral-900">
      {/*
       * Keep this mounted even when camera is OFF.
       *
       * The element must remain alive so remote AUDIO can play.
       */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={
          videoEnabled && stream
            ? "h-full w-full object-cover"
            : "absolute h-px w-px opacity-0"
        }
      />

      {!videoEnabled && (
        <div className="flex h-full min-h-48 items-center justify-center text-white/60">
          <div className="text-center">
            <div className="mb-2 text-lg">{participant.member.full_name}</div>

            <div className="text-xs">Camera off</div>
          </div>
        </div>
      )}

      <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
        {participant.member.full_name}
      </div>
    </div>
  );
}
