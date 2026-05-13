import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import BackButton from "@/components/ui/backButton";
import { formatEnum } from "@/appFunctions";
import { Badge } from "@/components/ui/badge";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";

function getStatusBadge(status) {
  switch (status) {
    case "APPROVED":
      return "bg-black text-white hover:bg-black";

    case "LOGGED":
      return "bg-zinc-200 text-zinc-700 hover:bg-zinc-200";

    case "REJECTED":
      return "border border-zinc-300 bg-white text-zinc-500";

    default:
      return "";
  }
}

export default function TimesheetDetailPage() {
  const [dayDetails, setDayDetails] = useState(null);
  const { date } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!date) return;

    const fetchDetails = async () => {
      try {
        const res = await assort_api.get(
          APP_POINTS.PROJECTS + "timesheet/day-stats",
          {
            params: { date },
          },
        );

        setDayDetails(res.data || null);
      } catch (error) {
        console.log(error);
        setDayDetails(null);
      }
    };

    fetchDetails();
  }, [date]);

  const parsedDate = new Date(date);
  const isValidDate = !isNaN(parsedDate.getTime());

  const formattedDate = isValidDate
    ? parsedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Invalid Date";

  const weekday = isValidDate
    ? parsedDate.toLocaleDateString("en-US", {
        weekday: "long",
      })
    : "";

  const logs = dayDetails?.logs ?? [];

  return (
    <div className="space-y-6">
      <BackButton onClick={() => navigate(-1)} />

      {/* HERO */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-zinc-500">{weekday}</p>

            <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-zinc-900">
              {formattedDate}
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-500">
              Daily execution timeline and reviewed worklogs across assigned
              projects.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:min-w-[320px]">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs text-zinc-500">Total</p>
              <h3 className="mt-2 text-3xl font-semibold text-zinc-900">
                {dayDetails?.total_hours ?? 0}h
              </h3>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs text-zinc-500">Approved</p>
              <h3 className="mt-2 text-3xl font-semibold text-zinc-900">
                {dayDetails?.approved_hours ?? 0}h
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="mt-12">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900">
            Activity Timeline
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Chronological breakdown of logged work.
          </p>
        </div>

        <div className="space-y-10">
          {logs.map((log, index) => (
            <div
              key={log.id}
              className="grid grid-cols-1 lg:grid-cols-[90px_24px_1fr] gap-4 lg:gap-6"
            >
              {/* TIME */}
              <div className="pt-1 text-sm text-gray-900 flex flex-col">
                <div>{log.start_time}</div>
                <div className="mt-1 text-zinc-500">{log.end_time}</div>
              </div>

              {/* LINE */}
              <div className="relative hidden lg:flex justify-center">
                <div className="h-full w-px bg-zinc-600" />

                <div className="absolute top-2 h-3 w-3 rounded-full border border-zinc-500 bg-white" />

                {index === logs.length - 1 && (
                  <div className="absolute bottom-0 h-10 w-4 bg-gray-900" />
                )}
              </div>

              {/* CONTENT */}
              <div className="rounded-3xl border border-zinc-200 bg-white p-4 sm:p-6 transition hover:shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-stretch lg:justify-between gap-6">
                  {/* LEFT */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-zinc-900">
                        {log.job_title}
                      </h3>

                      <p className="mt-2 text-sm text-zinc-500">
                        {log.project} → {log.phase} → {log.task}
                      </p>
                    </div>

                    <blockquote className="border-l border-zinc-300 pl-4 text-sm italic leading-relaxed text-zinc-500">
                      “{log.remarks}”
                    </blockquote>

                    {log.reviewer && (
                      <div className="text-xs text-zinc-500">
                        Reviewed by {log.reviewer}
                      </div>
                    )}
                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 lg:min-w-[72px]">
                    <Badge className={getStatusBadge(log.status)}>
                      {formatEnum(log.status)}
                    </Badge>

                    <h3 className="text-sm lg:text-lg font-medium text-zinc-900">
                      {log.duration ?? 0}h
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {logs.length === 0 && (
            <div className="text-sm text-zinc-500">
              No logs available for this day.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
