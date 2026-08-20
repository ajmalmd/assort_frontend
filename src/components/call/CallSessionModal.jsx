import { useEffect, useRef } from "react";
import { useCallSessionState } from "@/redux/hooks";
import ParticipantVideo from "./ParticipantVideo";

export default function CallSessionModal({
  localStream,
  remoteStreams,
  onLeave,
  onToggleAudio,
  onToggleVideo,
}) {
  const { session, participant, participants, localMedia, socketConnected } =
    useCallSessionState();

  const localVideoRef = useRef(null);

  useEffect(() => {
    if (!localVideoRef.current) {
      return;
    }

    localVideoRef.current.srcObject = localStream || null;

    return () => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    };
  }, [localStream]);

  if (!session) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
      <div className="flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-xl bg-neutral-950">
        {/* Header */}

        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 text-white">
          <div>
            <h2 className="font-semibold">Call</h2>

            <p className="text-xs text-white/50">
              {socketConnected ? "Connected" : "Connecting..."}
            </p>
          </div>

          <div className="text-sm text-white/60">
            {participants.length} participant
            {participants.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Video area */}

        <div className="relative flex-1 p-4">
          <div className="grid h-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Local video */}

            <div className="relative overflow-hidden rounded-lg bg-neutral-900">
              {localMedia.video ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-48 items-center justify-center text-white/50">
                  Camera off
                </div>
              )}

              <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
                {participant?.member?.full_name || "You"}
              </div>
            </div>

            {/* Remote participants */}

            {participants
              .filter((p) => p.member.id !== participant?.member.id)
              .map((p) => (
                <ParticipantVideo
                  key={p.member.id}
                  participant={p}
                  stream={remoteStreams[p.member.id]}
                />
              ))}
          </div>
        </div>

        {/* Controls */}

        <div className="flex items-center justify-center gap-3 border-t border-white/10 px-5 py-4">
          <button
            type="button"
            onClick={onToggleAudio}
            className="rounded-full bg-white/10 px-4 py-3 text-sm text-white hover:bg-white/20"
          >
            {localMedia.audio ? "Mute" : "Unmute"}
          </button>

          <button
            type="button"
            onClick={onToggleVideo}
            className="rounded-full bg-white/10 px-4 py-3 text-sm text-white hover:bg-white/20"
          >
            {localMedia.video ? "Camera off" : "Camera on"}
          </button>

          <button
            type="button"
            onClick={onLeave}
            className="rounded-full bg-red-600 px-5 py-3 text-sm font-medium text-white hover:bg-red-700"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
}
