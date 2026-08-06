import { useState, useEffect } from "react";
import { Video, Clock, PhoneIncoming, PhoneOutgoing } from "lucide-react";

import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";

const mockCalls = [
  {
    chat_room_id: 101,
    room_type: "DIRECT",
    title: "John Doe",
    image: null,
    last_call: {
      id: 501,
      started_at: "2026-08-06T10:30:15Z",
      duration: 320,
      direction: "OUTGOING",
      is_call_active: false,
    },
  },
  {
    chat_room_id: 102,
    room_type: "GROUP",
    title: "Project Alpha",
    image: null,
    last_call: {
      id: 502,
      started_at: "2026-08-06T15:45:00Z",
      duration: 0,
      direction: "INCOMING",
      is_call_active: true,
    },
  },
  {
    chat_room_id: 103,
    room_type: "DIRECT",
    title: "Alice",
    image: null,
    last_call: null,
  },
];

export default function SidebarCallsTab({
  searchTerm,
  formatSidebarDate,
  selectedRoom,
  setSelectedRoom,
}) {
  const [calls, setCalls] = useState([]);
  const [lastMeeting, setLastMeeting] = useState({});

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const res = await assort_api.get(APP_POINTS.CALL + "rooms/");
        setCalls(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCalls();
  }, []);

  const filteredcallRooms = calls.filter((call) =>
    call.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  return (
    <>
      <button
        onClick={() => setSelectedRoom("meeting")}
        className={`w-full border-b border-border px-4 py-3 flex items-center gap-3 transition-colors 
                    ${selectedRoom === "meeting" ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"}
                    `}
      >
        <div className="flex-1 min-w-0 flex justify-between gap-3">
          <div className="min-w-0 ml-6 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-lg font-bold">Meetings</p>
            </div>

            {lastMeeting ? (
              lastMeeting.is_call_active ? (
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                  <Video className="h-3 w-3" />
                  <span>Ongoing meeting</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  Click to view meeting history
                </div>
              )
            ) : (
              <p className="text-xs text-muted-foreground mt-1">No calls yet</p>
            )}
          </div>
        </div>
      </button>

      {/* call rooms */}
      {filteredcallRooms.map((room) => (
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
                        <PhoneOutgoing className="h-3.5 w-3.5 text-green-600" />
                        <span>Outgoing</span>
                      </>
                    ) : (
                      <>
                        <PhoneIncoming className="h-3.5 w-3.5 text-sky-600" />
                        <span>Incoming</span>
                      </>
                    )}

                    <span>•</span>

                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.floor(room.last_call.duration / 60)}m{" "}
                      {room.last_call.duration % 60}s
                    </span>
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
