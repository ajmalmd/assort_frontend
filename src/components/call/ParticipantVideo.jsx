import { useEffect, useRef } from "react";

export default function ParticipantVideo({ participant, stream }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.srcObject !== stream) {
      video.srcObject = stream || null;
    }

    if (!stream) {
      return;
    }

    const startPlayback = async () => {
      try {
        await video.play();
      } catch (error) {
        /*
         * AbortError is harmless. It means another source/load
         * operation replaced the current play request.
         */
        if (error.name !== "AbortError") {
          console.warn("Remote media playback failed:", error);
        }
      }
    };

    if (video.readyState >= 1) {
      void startPlayback();
    } else {
      video.addEventListener("loadedmetadata", startPlayback, { once: true });
    }

    return () => {
      video.removeEventListener("loadedmetadata", startPlayback);

      if (video.srcObject === stream) {
        video.srcObject = null;
      }
    };
  }, [stream]);

  const videoEnabled = Boolean(participant?.video);

  return (
    <div className="relative overflow-hidden rounded-lg bg-neutral-900">
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
