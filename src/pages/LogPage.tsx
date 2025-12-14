import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { useLogsContext } from "../logs-context";
import { assetUrl } from "../assets";
import ConfettiExplosion from "../components/ConfettiExplosion";
import RepeatExplosion from "../components/RepeatExplosion";
import StatsDisplay from "../components/ui/StatsDisplay";
import { calculateTrainStats } from "../utils/stats";
import { LuChevronDown } from "react-icons/lu";

const FILTER_SORTED_LINES = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "a",
  "c",
  "e",
  "b",
  "d",
  "f",
  "m",
  "n",
  "q",
  "r",
  "w",
  "j",
  "z",
  "l",
  "g",
  "s",
];

type LogLocationState = {
  fromNewEntry?: boolean;
  repeat: number;
};

type SwipeState = {
  startX: number;
  currentX: number;
  isDragging: boolean;
};

const LogPage: React.FC = () => {
  const { logs, removeLog } = useLogsContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [showConfetti, setShowConfetti] = useState(false);
  const [showRepeatExplosion, setShowRepeatExplosion] = useState(false);
  const [repeatNum, setRepeatNum] = useState(0);
  const [swipeStates, setSwipeStates] = useState<Map<string, SwipeState>>(
    new Map(),
  );
  const [lineFilter, setLineFilter] = useState<string | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const sortedLogs = useMemo(
    () => [...logs].sort((a, b) => b.timestamp - a.timestamp),
    [logs],
  );

  const uniqueLines = useMemo(() => {
    const lines = [...new Set(logs.map((log) => log.line))];
    return lines.sort(
      (a, b) =>
        FILTER_SORTED_LINES.indexOf(a) - FILTER_SORTED_LINES.indexOf(b)
    );
  }, [logs]);

  const filteredLogs = useMemo(
    () =>
      lineFilter
        ? sortedLogs.filter((log) => log.line === lineFilter)
        : sortedLogs,
    [sortedLogs, lineFilter],
  );

  const { loggedCarsCount, repeatCars, leaderboard } = useMemo(
    () => calculateTrainStats(logs),
    [logs],
  );

  useEffect(() => {
    const locationState = location.state as LogLocationState | undefined;

    if (!locationState?.fromNewEntry) {
      return;
    }

    if (locationState.repeat > 1) {
      setShowRepeatExplosion(true);
      setRepeatNum(locationState?.repeat ?? 2);
      const timer = window.setTimeout(() => {
        setShowRepeatExplosion(false);
      }, 2800);
      const clearedPath = `${location.pathname}${location.search}${location.hash}`;
      navigate(clearedPath, { replace: true });
      return () => window.clearTimeout(timer);
    }

    setShowConfetti(true);

    const timer = window.setTimeout(() => {
      setShowConfetti(false);
    }, 2600);

    const clearedPath = `${location.pathname}${location.search}${location.hash}`;
    navigate(clearedPath, { replace: true });

    return () => window.clearTimeout(timer);
  }, [location, navigate]);

  const handleSwipeStart = useCallback(
    (event: React.TouchEvent | React.MouseEvent, entryId: string) => {
      const clientX =
        "touches" in event ? event.touches[0].clientX : event.clientX;
      setSwipeStates(
        (prev) =>
          new Map(
            prev.set(entryId, {
              startX: clientX,
              currentX: clientX,
              isDragging: true,
            }),
          ),
      );
    },
    [],
  );

  const handleSwipeMove = useCallback(
    (event: React.TouchEvent | React.MouseEvent, entryId: string) => {
      const swipeState = swipeStates.get(entryId);
      if (!swipeState?.isDragging) return;

      event.preventDefault();
      const clientX =
        "touches" in event ? event.touches[0].clientX : event.clientX;
      setSwipeStates(
        (prev) =>
          new Map(
            prev.set(entryId, {
              ...swipeState,
              currentX: clientX,
            }),
          ),
      );
    },
    [swipeStates],
  );

  const handleSwipeEnd = useCallback(
    (entry: (typeof sortedLogs)[number], entryId: string) => {
      const swipeState = swipeStates.get(entryId);
      if (!swipeState?.isDragging) return;

      const swipeDistance = swipeState.startX - swipeState.currentX;
      const deleteThreshold = 150;

      if (swipeDistance > deleteThreshold) {
        removeLog(entry);
      }

      setSwipeStates((prev) => {
        const newMap = new Map(prev);
        newMap.delete(entryId);
        return newMap;
      });
    },
    [swipeStates, removeLog],
  );

  const handleExport = useCallback(() => {
    if (sortedLogs.length === 0) {
      return;
    }

    const timestamp = new Date();
    const pad = (value: number) => value.toString().padStart(2, "0");
    const fileName = `train-car-log-${timestamp.getFullYear()}${pad(timestamp.getMonth() + 1)}${pad(timestamp.getDate())}-${pad(timestamp.getHours())}${pad(timestamp.getMinutes())}${pad(timestamp.getSeconds())}.json`;

    const blob = new Blob([JSON.stringify(sortedLogs, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.rel = "noopener";
    link.click();

    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }, [sortedLogs]);

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-6">
      {showConfetti && (
        <ConfettiExplosion onComplete={() => setShowConfetti(false)} />
      )}
      {showRepeatExplosion && (
        <RepeatExplosion
          onComplete={() => setShowRepeatExplosion(false)}
          repeatNumber={repeatNum}
        />
      )}

      <StatsDisplay
        loggedCarsCount={loggedCarsCount}
        repeatCarsCount={repeatCars.length}
      />

      {leaderboard.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Repeat Cars</h2>
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <table className="min-w-full table-auto text-left">
              <thead className="bg-slate-100">
                <tr>
                  {["Car", "Repeats"].map((header) => (
                    <th
                      key={header}
                      className="px-3 py-2 text-base font-semibold text-slate-600"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((item, index) => {
                  const rowClasses =
                    "px-3 py-2 text-xl text-slate-700 font-mono";
                  return (
                    <tr key={item.car} className="even:bg-slate-50">
                      <td className={rowClasses + " w-1/2"}>{item.car}</td>
                      <td className={rowClasses}>
                        <div className="grid grid-cols-3 gap-1 w-fit">
                          {item.entries.map((line, index) => {
                            return (
                              <img
                                className="w-12 aspect-square"
                                src={assetUrl(`/img/${line}.svg`)}
                                key={index}
                              />
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sortedLogs.length === 0 ? (
        <p className="text-slate-600">
          No trips yet. Log your first train car!
        </p>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">History</h2>
            <Button
              variant="pill"
              onClick={handleExport}
              disabled={sortedLogs.length === 0}
            >
              Export JSON
            </Button>
          </div>

          <span className="text-sm text-slate-400">
            Swipe left on a row to delete it.
          </span>

          <div className="rounded-xl overflow-hidden shadow-sm ring-1 ring-slate-200">
            <button
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-900"
            >
              <span className="flex items-center gap-2">
                Filter by line
                {lineFilter !== null && (
                  <span>
                    <img
                      className="w-4 h-4"
                      src={assetUrl(`/img/${lineFilter}.svg`)}
                      alt={`Line ${lineFilter}`}
                    />
                  </span>
                )}
              </span>
              <LuChevronDown
                className={`w-5 h-5 transition-transform duration-200 ${filtersExpanded ? "rotate-180" : ""}`}
              />
            </button>

            <div
              className={`grid transition-all duration-200 ease-in-out ${
                filtersExpanded
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="flex flex-wrap gap-2 items-center px-4 pb-4">
                  <button
                    onClick={() => setLineFilter(null)}
                    className={`px-5 h-10 rounded-full text-sm font-medium transition-colors ${
                      lineFilter === null
                        ? "text-slate-900 bg-sky-100"
                        : "text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    All lines
                  </button>
                  {uniqueLines.map((line) => (
                    <button
                      key={line}
                      onClick={() => setLineFilter(line)}
                      className={`rounded-full transition-all ${
                        lineFilter === line
                          ? "text-slate-900 bg-sky-100"
                          : `text-slate-500 hover:bg-slate-200 ${lineFilter !== null ? "opacity-50" : ""}`
                      }`}
                    >
                      <img
                        className="w-10 aspect-square"
                        src={assetUrl(`/img/${line}.svg`)}
                        alt={`Line ${line}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {filteredLogs.length === 0 && lineFilter !== null ? (
            <div className="text-center py-8 text-slate-500">
              No entries for this line.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <table className="min-w-full table-auto text-left">
                <thead className="bg-slate-100">
                  <tr>
                    {["Date", "Car", "Line"].map((header) => (
                      <th
                        key={header}
                        className="px-3 py-2 text-base font-semibold text-slate-600"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((entry) => {
                    const rowClasses =
                      "px-3 py-2 text-sm text-slate-700 font-mono";
                    const entryId = `${entry.timestamp}-${entry.car}-${entry.line}`;
                    const swipeState = swipeStates.get(entryId);
                    const swipeOffset = swipeState
                      ? Math.min(0, swipeState.currentX - swipeState.startX)
                      : 0;

                    return (
                      <tr
                        key={entryId}
                        className={`even:bg-slate-50 transition-colors relative overflow-hidden`}
                        style={{
                          transform: `translateX(${swipeOffset}px)`,
                          transition: swipeState?.isDragging
                            ? "none"
                            : "transform 0.3s ease-out",
                        }}
                        onTouchStart={(event) =>
                          handleSwipeStart(event, entryId)
                        }
                        onTouchMove={(event) => handleSwipeMove(event, entryId)}
                        onTouchEnd={() => handleSwipeEnd(entry, entryId)}
                        onMouseDown={(event) =>
                          handleSwipeStart(event, entryId)
                        }
                        onMouseMove={(event) => handleSwipeMove(event, entryId)}
                        onMouseUp={() => handleSwipeEnd(entry, entryId)}
                        onMouseLeave={() => handleSwipeEnd(entry, entryId)}
                      >
                        <td className={rowClasses}>
                          {new Date(entry.timestamp).toLocaleString()}
                        </td>
                        <td className={rowClasses}>{entry.car}</td>
                        <td className={rowClasses + " relative"}>
                          <img
                            className="w-8 aspect-square"
                            src={assetUrl(`/img/${entry.line}.svg`)}
                          />
                          {/* add a red background when doing swipe to delete */}
                          {swipeOffset < 0 && (
                            <div
                              className="absolute inset-y-0 bg-red-500 -z-10 flex items-center"
                              style={{
                                left: "100%",
                                width: "200vw",
                              }}
                            >
                              <div className="text-xl font-semibold text-white ml-3 font-sans">
                                ⌫
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LogPage;
