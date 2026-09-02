import { useEffect, useState } from "react";
import {
  Video,
  ArrowLeft,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Clock,
  Users,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";

import { useAppDispatch } from "@/redux/hooks";
import {
  setCallSession,
  setParticipant,
} from "@/redux/slices/callSessionSlice";

import ConfirmActionModal from "@/components/common/ConfirmActionModal";

const formatDuration = (duration) => {
  if (!duration) return null;

  // Backend format:
  // "00:01:35.494363"
  const parts = duration.split(":");

  if (parts.length !== 3) return null;

  const hours = Number(parts[0]) || 0;
  const minutes = Number(parts[1]) || 0;
  const seconds = Math.floor(Number(parts[2]) || 0);

  const totalMinutes = hours * 60 + minutes;

  if (totalMinutes === 0) {
    return `${seconds}s`;
  }

  return `${totalMinutes}m ${String(seconds).padStart(2, "0")}s`;
};

const formatCallDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function CallDetails({ currentRoom, setSelectedRoom }) {
  const dispatch = useAppDispatch();

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [startingCall, setStartingCall] = useState(false);
  const [showStartCallConfirm, setShowStartCallConfirm] = useState(false);

  const isMeeting = currentRoom === "meeting";

  useEffect(() => {
    if (!currentRoom) {
      setHistory([]);
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoadingHistory(true);

        const endpoint = isMeeting
          ? `${APP_POINTS.CALL}meetings/history/`
          : `${APP_POINTS.CALL}rooms/${currentRoom.chat_room_id}/history/`;

        const res = await assort_api.get(endpoint);

        setHistory(res.data);
      } catch (error) {
        console.error("Failed to fetch call history:", error);

        setHistory([]);

        toast.error(
          error?.response?.data?.detail || "Failed to load call history",
        );
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [currentRoom, isMeeting]);

  if (!currentRoom) return null;

  const handleStartCallClick = () => {
    if (!isMeeting && currentRoom?.last_call?.is_call_active) {
      toast.error("A call is already active");
      return;
    }

    setShowStartCallConfirm(true);
  };

  const startCall = async () => {
    try {
      setStartingCall(true);

      const payload = isMeeting
        ? {
            origin: "MEETING",
          }
        : {
            chat_room_id: currentRoom.chat_room_id,
            origin: currentRoom.room_type,
          };

      const response = await assort_api.post(
        `${APP_POINTS.CALL}start/`,
        payload,
      );

      const { participant, participant_count, ...session } = response.data;

      setShowStartCallConfirm(false);

      dispatch(
        setCallSession({
          ...session,
          title: isMeeting ? "Meeting" : currentRoom?.title,
        }),
      );
      dispatch(setParticipant(participant));
    } catch (error) {
      console.error("Failed to start call:", error);

      toast.error(error?.response?.data?.detail || "Failed to start call");
    } finally {
      setStartingCall(false);
    }
  };

  const renderParticipationStatus = (item) => {
    switch (item.participation_status) {
      case "ATTENDED":
        return (
          <div className="flex items-center gap-1 text-green-600">
            <Check className="h-4 w-4" />
            <span>Attended</span>
          </div>
        );

      case "MISSED":
        return (
          <div className="flex items-center gap-1 text-red-600">
            <PhoneMissed className="h-4 w-4" />
            <span>Missed</span>
          </div>
        );

      case "DECLINED":
        return (
          <div className="flex items-center gap-1 text-red-600">
            <X className="h-4 w-4" />
            <span>Declined</span>
          </div>
        );

      default:
        return (
          <span className="text-muted-foreground">
            {item.participation_status}
          </span>
        );
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* header */}
      <div className="shrink-0 border-b border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              className="md:hidden"
              onClick={() => setSelectedRoom(null)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="min-w-0">
              <p className="truncate font-semibold">
                {isMeeting ? "Meetings" : currentRoom.title}
              </p>

              <p className="text-xs text-muted-foreground">
                {isMeeting ? "Meeting history" : "Call history"}
              </p>
            </div>
          </div>

          <Button
            onClick={handleStartCallClick}
            disabled={startingCall}
            className="gap-2"
          >
            <Video className="h-4 w-4" />

            <span className="hidden sm:inline">
              {isMeeting ? "Start Meeting" : "Start Call"}
            </span>
          </Button>
        </div>
      </div>

      {/* history */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {loadingHistory ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Loading {isMeeting ? "meetings" : "calls"}...
            </p>
          </div>
        ) : history.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Video className="h-5 w-5 text-muted-foreground" />
            </div>

            <div>
              <p className="font-medium">
                No {isMeeting ? "meetings" : "calls"} yet
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Start {isMeeting ? "a meeting" : "a call"} to begin.
              </p>
            </div>
          </div>
        ) : (
          <div>
            {history.map((item) => {
              const duration = formatDuration(item.duration);

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 border-b border-border px-4 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {/* icon */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      {isMeeting ? (
                        <Video className="h-4 w-4" />
                      ) : item.direction === "OUTGOING" ? (
                        <PhoneOutgoing className="h-4 w-4 text-green-600" />
                      ) : item.participation_status === "MISSED" ? (
                        <PhoneMissed className="h-4 w-4 text-red-600" />
                      ) : (
                        <PhoneIncoming className="h-4 w-4 text-sky-600" />
                      )}
                    </div>

                    <div className="min-w-0">
                      {/* title/status */}
                      <div className="text-sm font-medium">
                        {isMeeting ? (
                          "Meeting"
                        ) : item.participation_status === "MISSED" ? (
                          <span className="text-red-600">Missed call</span>
                        ) : item.direction === "OUTGOING" ? (
                          "Outgoing call"
                        ) : (
                          "Incoming call"
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {isMeeting && renderParticipationStatus(item)}

                        {duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {duration}
                          </span>
                        )}

                        {isMeeting && item.participant_count != null && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {item.participant_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-xs text-muted-foreground">
                      {formatCallDate(item.started_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmActionModal
        open={showStartCallConfirm}
        onOpenChange={setShowStartCallConfirm}
        title={isMeeting ? "Start meeting?" : "Start call?"}
        description={
          isMeeting
            ? "Start a new meeting?"
            : `Start a call with ${currentRoom.title}?`
        }
        confirmText={isMeeting ? "Start meeting" : "Start call"}
        cancelText="Cancel"
        variant="default"
        loading={startingCall}
        onConfirm={startCall}
      />
    </div>
  );
}
