"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import { useLogsContext } from "@/providers/LogsProvider";
import ConfettiExplosion from "@/components/effects/ConfettiExplosion";
import RepeatExplosion from "@/components/effects/RepeatExplosion";
import StatsDisplay from "@/components/ui/StatsDisplay";
import { calculateTrainStats } from "@/lib/utils/stats";
import { SUBWAY_LINES } from "@/lib/utils/subway";
import LeaderboardTable from "@/components/history/LeaderboardTable";
import LineFilter from "@/components/history/LineFilter";
import HistoryTable from "@/components/history/HistoryTable";

function HistoryPageContent() {
  const { logs, removeLog } = useLogsContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const processedRef = useRef(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showRepeatExplosion, setShowRepeatExplosion] = useState(false);
  const [repeatNum, setRepeatNum] = useState(0);
  const [lineFilter, setLineFilter] = useState<string | null>(null);
  const [carSortOrder, setCarSortOrder] = useState<"asc" | "desc" | null>(
    null,
  );

  const toggleCarSort = useCallback(() => {
    setCarSortOrder((prev) => {
      if (prev === null) return "asc";
      if (prev === "asc") return "desc";
      return null;
    });
  }, []);

  const sortedLogs = useMemo(() => {
    const sorted = [...logs];
    if (carSortOrder === "asc") {
      sorted.sort((a, b) => parseInt(a.car, 10) - parseInt(b.car, 10));
    } else if (carSortOrder === "desc") {
      sorted.sort((a, b) => parseInt(b.car, 10) - parseInt(a.car, 10));
    } else {
      sorted.sort((a, b) => b.timestamp - a.timestamp);
    }
    return sorted;
  }, [logs, carSortOrder]);

  const uniqueLines = useMemo(() => {
    const lines = [...new Set(logs.map((log) => log.line))];
    return lines.sort(
      (a, b) => SUBWAY_LINES.indexOf(a) - SUBWAY_LINES.indexOf(b),
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
    const fromNewEntry = searchParams.get("fromNewEntry");
    const repeat = searchParams.get("repeat");

    if (!fromNewEntry || processedRef.current) {
      return;
    }

    processedRef.current = true;

    const repeatCount = parseInt(repeat ?? "0", 10);

    if (repeatCount > 1) {
      setShowRepeatExplosion(true);
      setRepeatNum(repeatCount);
      const timer = window.setTimeout(() => {
        setShowRepeatExplosion(false);
      }, 2800);
      router.replace("/history", { scroll: false });
      return () => window.clearTimeout(timer);
    }

    setShowConfetti(true);

    const timer = window.setTimeout(() => {
      setShowConfetti(false);
    }, 2600);

    router.replace("/history", { scroll: false });

    return () => window.clearTimeout(timer);
  }, [searchParams, router]);


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

      <LeaderboardTable leaderboard={leaderboard} />

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

          <LineFilter
            uniqueLines={uniqueLines}
            lineFilter={lineFilter}
            setLineFilter={setLineFilter}
          />

          {filteredLogs.length === 0 && lineFilter !== null ? (
            <div className="text-center py-8 text-slate-500">
              No entries for this line.
            </div>
          ) : (
            <HistoryTable
              filteredLogs={filteredLogs}
              carSortOrder={carSortOrder}
              toggleCarSort={toggleCarSort}
              onDeleteEntry={removeLog}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense>
      <HistoryPageContent />
    </Suspense>
  );
}
