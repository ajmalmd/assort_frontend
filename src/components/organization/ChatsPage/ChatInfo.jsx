import { APP_POINTS } from "@/api/apiConfig";
import assort_api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function ChatInfo({ currentRoom, setDetailCon }) {
  const [details, setDetails] = useState({});

  useEffect(() => {
    const fetchGroupDetails = async () => {
      const res = await assort_api.get(
        `${APP_POINTS.CHAT}groups/${currentRoom.id}`,
      );

      setDetails(res.data);
    };
    if (currentRoom.id) {
      fetchGroupDetails();
    }
  }, [currentRoom]);

  return (
    <div className="flex flex-1 flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDetailCon(false)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <h2 className="font-semibold">Group Details</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Group Info */}
        <div className="flex flex-col items-center">
          {details?.image ? (
            <img
              src={details?.image}
              alt={details?.title}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
              {details?.title?.charAt(0)}
            </div>
          )}

          <h3 className="mt-4 text-xl font-semibold">{details?.title}</h3>

          <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
            {details?.description}
          </p>

          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{details?.members?.length} Members</span>
          </div>
        </div>

        {/* Members */}
        <div className="mt-8">
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Members
          </h4>

          <div className="space-y-2">
            {details?.members?.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-3"
              >
                <div className="flex items-center gap-3">
                  {member?.profile_pic ? (
                    <img
                      src={member?.profile_pic}
                      alt={member?.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground">
                      {member?.name?.charAt(0)}
                    </div>
                  )}

                  <div>
                    <p className="font-medium">{member?.name}</p>
                  </div>
                </div>

                {member?.role === "ADMIN" && (
                  <div className="flex items-center gap-1 text-green-500">
                    <span className="text-xs font-medium">Admin</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
