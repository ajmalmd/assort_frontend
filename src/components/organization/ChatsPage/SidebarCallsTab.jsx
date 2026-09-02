import { useCallback, useEffect, useState } from "react";
import {
  Video,
  Clock,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
} from "lucide-react";

import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import { useCallListSocket } from "@/websocket/useCallListSocket";

const formatDuration = (duration) => {
  if (!duration) return null;

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

export default function SidebarCallsTab({
  searchTerm,
  formatSidebarDate,
  selectedRoom,
  setSelectedRoom,
}) {
  const [calls, setCalls] = useState([]);

  const fetchCalls = useCallback(async () => {
    try {
      const res = await assort_api.get(`${APP_POINTS.CALL}rooms/`);

      setCalls(res.data);

      // Keep currently opened CallDetails synced
      setSelectedRoom((current) => {
        if (!current || current === "meeting") {
          return current;
        }

        const updatedRoom = res.data.find(
          (room) => room.chat_room_id === current.chat_room_id,
        );

        return updatedRoom || current;
      });
    } catch (err) {
      console.error("Failed to fetch calls:", err);
    }
  }, [setSelectedRoom]);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  useCallListSocket({
    onCallStarted: (room) => {
      console.log("OnCallStarted:", room);

      // Socket event contains `type`, which isn't part of our room state.
      const { type, ...updatedRoom } = room;

      setCalls((prev) => {
        const exists = prev.some(
          (item) => item.chat_room_id === updatedRoom.chat_room_id,
        );

        // Move active/recent call to top
        if (exists) {
          return [
            updatedRoom,
            ...prev.filter(
              (item) => item.chat_room_id !== updatedRoom.chat_room_id,
            ),
          ];
        }

        return [updatedRoom, ...prev];
      });

      // If user is currently viewing this room, update CallDetails immediately.
      setSelectedRoom((current) => {
        if (
          current &&
          current !== "meeting" &&
          current.chat_room_id === updatedRoom.chat_room_id
        ) {
          return updatedRoom;
        }

        return current;
      });
    },

    onCallEnded: ({ session_id, room_id }) => {
      console.log("OnCallEnded:", {
        session_id,
        room_id,
      });

      fetchCalls();
    },
  });

  const filteredCallRooms = calls.filter((call) =>
    call.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <>
      {/* Meetings */}
      <button
        onClick={() => setSelectedRoom("meeting")}
        className={`w-full border-b border-border px-4 py-3 flex items-center gap-3 transition-colors ${
          selectedRoom === "meeting"
            ? "bg-accent text-accent-foreground"
            : "hover:bg-accent/50"
        }`}
      >
        <div className="flex-1 min-w-0 flex justify-between gap-3">
          <div className="min-w-0 ml-6 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-lg font-bold">Meetings</p>
            </div>

            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              Click to view meeting history
            </div>
          </div>
        </div>
      </button>

      {/* Call rooms */}
      {filteredCallRooms.map((room) => (
        <button
          key={room.chat_room_id}
          onClick={() => setSelectedRoom(room)}
          className={`w-full border-b border-border px-4 py-3 flex items-center gap-3 transition-colors ${
            selectedRoom?.chat_room_id === room.chat_room_id
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent/50"
          }`}
        >
          <div className="shrink-0">
            {room.image ? (
              <img
                src={room.image}
                alt={room.title}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                {room.title.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 flex justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{room.title}</p>
              </div>

              {room.last_call ? (
                room.last_call.is_call_active ? (
                  <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                    <Video className="h-3 w-3" />
                    <span>Ongoing call</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {room.last_call.direction === "OUTGOING" ? (
                      <>
                        <PhoneOutgoing className="h-4 w-4 text-green-600" />
                        <span>Outgoing</span>
                      </>
                    ) : room.last_call.direction === "INCOMING" ? (
                      <>
                        <PhoneIncoming className="h-4 w-4 text-sky-600" />
                        <span>Incoming</span>
                      </>
                    ) : room.last_call.direction === "MISSED" ? (
                      <>
                        <PhoneMissed className="h-4 w-4 text-red-600" />
                        <span>Missed</span>
                      </>
                    ) : null}

                    {room.last_call.duration && (
                      <>
                        <span>•</span>

                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />

                          {formatDuration(room.last_call.duration)}
                        </span>
                      </>
                    )}
                  </div>
                )
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  No calls yet
                </p>
              )}
            </div>

            <div className="shrink-0 text-right">
              {room.last_call && (
                <p className="text-xs text-muted-foreground">
                  {formatSidebarDate(room.last_call.started_at)}
                </p>
              )}
            </div>
          </div>
        </button>
      ))}
    </>
  );
}
