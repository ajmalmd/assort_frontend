import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";

function getIntensity(hours = 0) {
  if (hours >= 10) return "bg-zinc-200";
  if (hours >= 8) return "bg-zinc-100";
  if (hours >= 4) return "bg-zinc-50";
  return "bg-white";
}

export default function TimesheetPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthlyDetails, setMonthlyDetails] = useState({});

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await assort_api.get(
          APP_POINTS.PROJECTS + "timesheet/monthly-stats",
          {
            params: {
              year: currentDate.getFullYear(),
              month: currentDate.getMonth() + 1,
            },
          },
        );
        setMonthlyDetails(res.data || {});
      } catch (error) {
        console.log(error);
        setMonthlyDetails({});
      }
    };

    fetchDetails();
  }, [currentDate]);

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();

  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay();

  const days = useMemo(() => {
    const arr = [];

    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let i = 1; i <= daysInMonth; i++) arr.push(i);

    return arr;
  }, [daysInMonth, firstDay]);

  const previousMonth = () => {
    setCurrentDate((prev) => {
      return new Date(prev.getFullYear(), prev.getMonth() - 1);
    });
  };

  const nextMonth = () => {
    setCurrentDate((prev) => {
      return new Date(prev.getFullYear(), prev.getMonth() + 1);
    });
  };

  const getDayData = (day) => {
    if (!day) return null;

    const date = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1,
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const raw = monthlyDetails?.day_stats?.[date];

    if (!raw) {
      return { date };
    }

    return {
      date,
      ...raw,
    };
  };

  const handleDayClick = (data) => {
    if (!data?.logs_count) return;
    navigate(`/app/timesheet/work-log/${data.date}`);
  };

  return (
    <div className="min-h-full space-y-5 p-3 sm:space-y-6 sm:p-4">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg font-semibold text-zinc-900 sm:text-xl">
          Monthly Log Stats
        </p>

        <div className="flex items-center justify-between gap-2 rounded-2xl bg-black p-1.5 sm:gap-3 sm:p-2">
          <button
            onClick={previousMonth}
            className="flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white transition hover:bg-zinc-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="min-w-[100px] sm:min-w-[160px] whitespace-nowrap text-center text-sm font-medium text-white sm:text-base">
            {monthName}
          </div>

          <button
            onClick={nextMonth}
            className="flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white transition hover:bg-zinc-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="rounded-2xl border bg-white p-3 sm:p-5">
          <p className="text-xs text-zinc-500 sm:text-sm">Logged</p>
          <p className="mt-1 text-lg font-semibold text-zinc-900 sm:mt-2 sm:text-2xl truncate">
            {monthlyDetails?.total_hours ?? 0}h
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-3 sm:p-5">
          <p className="text-xs text-zinc-500 sm:text-sm">Approved</p>
          <p className="mt-1 text-lg font-semibold text-zinc-900 sm:mt-2 sm:text-2xl truncate">
            {monthlyDetails?.approved_hours ?? 0}h
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-3 sm:p-5">
          <p className="text-xs text-zinc-500 sm:text-sm">Pending</p>
          <p className="mt-1 text-lg font-semibold text-zinc-900 sm:mt-2 sm:text-2xl truncate">
            {monthlyDetails?.pending_hours ?? 0}h
          </p>
        </div>
      </div>

      {/* CALENDAR */}
      <div className="rounded-2xl border bg-white/80 backdrop-blur-sm overflow-x-auto">
        <div className="min-w-[700px] sm:min-w-0">
          {/* WEEK HEADER */}
          <div className="grid grid-cols-7 border-b bg-zinc-50 sticky top-0 z-10">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="border-r p-2 text-center text-[11px] font-medium text-zinc-500 sm:p-3 sm:text-sm"
              >
                {d}
              </div>
            ))}
          </div>

          {/* GRID */}
          <div className="grid grid-cols-7">
            {days.map((day, idx) => {
              const data = getDayData(day);

              const total = data?.total_hours || 0;
              const approved = data?.approved_hours || 0;

              return (
                <button
                  key={idx}
                  disabled={!day}
                  onClick={() => handleDayClick(data)}
                  className={`
                    min-h-[90px] sm:min-h-[140px]
                    border-b border-r p-1 sm:p-2
                    text-left transition-all
                    ${
                      day
                        ? "bg-white hover:bg-zinc-50 active:scale-[0.98]"
                        : "bg-zinc-50 cursor-default"
                    }
                    ${day ? getIntensity(total) : ""}
                  `}
                >
                  {day && (
                    <div className="flex h-full flex-col">
                      {/* TOP */}
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-xs font-semibold text-zinc-900 sm:text-sm">
                          {day}
                        </span>

                        {total ? (
                          <span className="text-[10px] sm:text-xs text-zinc-500">
                            {total}h
                          </span>
                        ) : null}
                      </div>

                      {/* BODY */}
                      {total ? (
                        <div className="mt-2 flex flex-1 flex-col justify-between">
                          <div className="space-y-1">
                            <div className="rounded-md border bg-white/90 px-1.5 py-1 text-[9px] sm:text-xs text-zinc-700">
                              <p>Logs: {data?.logs_count ?? 0}</p>
                              <p>Approved: {approved}h</p>
                            </div>
                          </div>

                          <div className="mt-2">
                            {data?.pending_hours > 0 && (
                              <div className="mt-1 flex justify-between text-[9px] sm:text-xs text-zinc-500">
                                <p>Pending</p>
                                <p>{data.pending_hours}h</p>
                              </div>
                            )}

                            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-200">
                              <div
                                className="h-full rounded-full bg-black transition-all"
                                style={{
                                  width: total
                                    ? `${(approved / total) * 100}%`
                                    : "0%",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 text-[10px] sm:text-xs text-zinc-400">
                          No logs
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
