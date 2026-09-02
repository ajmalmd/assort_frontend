import { useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

export default function ParticipantVideo({ participant, stream }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (video) {
      video.srcObject = stream || null;
    }

    if (audio) {
      audio.srcObject = stream || null;
      audio.muted = false;
      audio.volume = 1;
    }

    if (!stream) {
      return undefined;
    }

    const startPlayback = async () => {
      try {
        await video?.play();
      } catch (error) {
        if (error.name !== "AbortError" && error.name !== "NotAllowedError") {
          console.warn("Remote video playback failed:", error);
        }
      }

      try {
        await audio?.play();
      } catch (error) {
        if (error.name !== "AbortError") {
          console.warn("Remote audio playback failed:", error);
        }
      }
    };

    void startPlayback();

    return () => {
      if (video?.srcObject === stream) {
        video.srcObject = null;
      }

      if (audio?.srcObject === stream) {
        audio.srcObject = null;
      }
    };
  }, [stream]);

  useEffect(() => {
    if (!participant?.audio || !stream) {
      return;
    }

    void audioRef.current?.play();
  }, [participant?.audio, stream]);

  const audioEnabled = Boolean(participant?.audio);
  const videoEnabled = Boolean(participant?.video);

  return (
    <div className="relative h-full min-h-0 overflow-hidden rounded-xl bg-neutral-900">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={
          videoEnabled && stream
            ? "h-full w-full object-cover"
            : "absolute h-px w-px opacity-0"
        }
      />

      <audio ref={audioRef} autoPlay />

      {!videoEnabled && (
        <div className="flex h-full min-h-0 items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-2xl font-semibold text-white">
            {participant?.member?.full_name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        </div>
      )}

      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-black/60 px-2.5 py-1.5 text-xs text-white backdrop-blur-sm">
        <span className="max-w-32 truncate">
          {participant.member.full_name}
        </span>

        <span
          title={audioEnabled ? "Microphone on" : "Microphone off"}
          className={audioEnabled ? "text-white" : "text-red-400"}
        >
          {audioEnabled ? <Mic size={15} /> : <MicOff size={15} />}
        </span>

        <span
          title={videoEnabled ? "Camera on" : "Camera off"}
          className={videoEnabled ? "text-white" : "text-red-400"}
        >
          {videoEnabled ? <Video size={15} /> : <VideoOff size={15} />}
        </span>
      </div>
    </div>
  );
}
