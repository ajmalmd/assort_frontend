import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, UserPlus } from "lucide-react";

import { useCallSessionState } from "@/redux/hooks";
import ParticipantVideo from "./ParticipantVideo";
import CallInviteMembers from "./CallInviteMembers";

export default function CallSessionModal({
  localStream,
  remoteStreams,
  onLeave,
  onToggleAudio,
  onToggleVideo,
}) {
  const { session, participant, participants, localMedia, socketConnected } =
    useCallSessionState();

  const [inviteOpen, setInviteOpen] = useState(false);

  const localVideoRef = useRef(null);

  useEffect(() => {
    const video = localVideoRef.current;

    if (!video) {
      return;
    }

    video.srcObject = localStream || null;

    if (localStream) {
      video.play().catch((error) => {
        if (error.name !== "AbortError") {
          console.warn("Local video playback failed:", error);
        }
      });
    }

    return () => {
      video.srcObject = null;
    };
  }, [localStream, localMedia.video]);

  if (!session) {
    return null;
  }

  const participantCount = participants.length;

  const getGridClass = () => {
    if (participantCount <= 1) {
      return "grid-cols-1";
    }

    if (participantCount <= 4) {
      return "grid-cols-1 sm:grid-cols-2";
    }

    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  };

  const canInvite = () => {
    if (session.mode === "MEETING") {
      return true;
    }

    if (session.origin === "GROUP" || session.origin === "PROJECT") {
      return true;
    }

    return false;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <div className="flex h-dvh w-full flex-col bg-neutral-950">
        {/* Header */}

        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-white sm:text-base">
              {session.title || "Call"}
            </h2>

            <div className="mt-0.5 flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  socketConnected ? "bg-green-500" : "bg-yellow-500"
                }`}
              />

              <span className="text-xs text-white/50">
                {socketConnected ? "Connected" : "Connecting..."}
              </span>
            </div>
          </div>

          {canInvite() && (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-white/50 sm:block">
                {participantCount}{" "}
                {participantCount === 1 ? "participant" : "participants"}
              </span>

              <button
                type="button"
                onClick={() => setInviteOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                title="Invite members"
              >
                <UserPlus size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Video area */}

        <div className="min-h-0 flex-1 overflow-hidden p-2 sm:p-4">
          <div
            className={`grid h-full min-h-0 auto-rows-fr gap-2 sm:gap-3 ${getGridClass()}`}
          >
            {/* Local participant */}

            <div className="relative h-full min-h-0 overflow-hidden rounded-xl bg-neutral-900">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={
                  localMedia.video
                    ? "h-full w-full object-cover"
                    : "absolute h-px w-px opacity-0"
                }
              />

              {!localMedia.video && (
                <div className="flex h-full min-h-0 items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-2xl font-semibold text-white">
                      {participant?.member?.full_name
                        ?.charAt(0)
                        ?.toUpperCase() || "Y"}
                    </div>
                  </div>
                </div>
              )}

              <div className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-2.5 py-1.5 text-xs text-white backdrop-blur-sm">
                You
              </div>

              {!localMedia.audio && (
                <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white">
                  <MicOff size={15} />
                </div>
              )}
            </div>

            {/* Remote participants */}

            {participants
              .filter((p) => p.member.id !== participant?.member?.id)
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

        <div className="shrink-0 border-t border-white/10 bg-neutral-950/95 px-4 py-3 backdrop-blur sm:py-4">
          <div className="flex items-center justify-center gap-3">
            <CallControlButton
              active={localMedia.audio}
              onClick={onToggleAudio}
              activeIcon={<Mic size={20} />}
              inactiveIcon={<MicOff size={20} />}
              label={localMedia.audio ? "Mute microphone" : "Unmute microphone"}
            />

            <CallControlButton
              active={localMedia.video}
              onClick={onToggleVideo}
              activeIcon={<Video size={20} />}
              inactiveIcon={<VideoOff size={20} />}
              label={localMedia.video ? "Turn camera off" : "Turn camera on"}
            />

            <button
              type="button"
              onClick={onLeave}
              title="Leave call"
              className="flex h-12 w-14 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-700 active:scale-95 sm:w-16"
            >
              <PhoneOff size={21} />
            </button>
          </div>
        </div>
      </div>

      <CallInviteMembers
        sessionId={session.id}
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </div>
  );
}

function CallControlButton({
  active,
  onClick,
  activeIcon,
  inactiveIcon,
  label,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex h-12 w-12 items-center justify-center rounded-full transition active:scale-95 sm:h-12 sm:w-12 ${
        active
          ? "bg-white/10 text-white hover:bg-white/20"
          : "bg-white text-neutral-950 hover:bg-white/90"
      }`}
    >
      {active ? activeIcon : inactiveIcon}
    </button>
  );
}
