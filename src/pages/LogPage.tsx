import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useLogsContext } from '../logs-context';
import { assetUrl } from '../assets';
import ConfettiExplosion from '../components/ConfettiExplosion';

type LogLocationState = {
  fromNewEntry?: boolean;
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
  const [swipeStates, setSwipeStates] = useState<Map<string, SwipeState>>(new Map());

  const sortedLogs = useMemo(() => [...logs].sort((a, b) => b.timestamp - a.timestamp), [logs]);

  const { totalLoggedCars, repeatCars } = useMemo(() => {
    const counts = new Map<string, number>();

    for (const entry of logs) {
      counts.set(entry.car, (counts.get(entry.car) ?? 0) + 1);
    }

    let repeated: string[] = [];
    counts.forEach((count: number, car: string) => {
      if (count > 1) {
        repeated.push(car);
      }
    });

    return {
      totalLoggedCars: logs.length,
      repeatCars: repeated,
    };
  }, [logs]);

  useEffect(() => {
    const locationState = location.state as LogLocationState | undefined;

    if (!locationState?.fromNewEntry) {
      return;
    }

    setShowConfetti(true);

    const timer = window.setTimeout(() => {
      setShowConfetti(false);
    }, 2600);

    const clearedPath = `${location.pathname}${location.search}${location.hash}`;
    navigate(clearedPath, { replace: true });

    return () => window.clearTimeout(timer);
  }, [location, navigate]);

  const handleSwipeStart = useCallback((event: React.TouchEvent | React.MouseEvent, entryId: string) => {
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    setSwipeStates(prev => new Map(prev.set(entryId, {
      startX: clientX,
      currentX: clientX,
      isDragging: true
    })));
  }, []);

  const handleSwipeMove = useCallback((event: React.TouchEvent | React.MouseEvent, entryId: string) => {
    const swipeState = swipeStates.get(entryId);
    if (!swipeState?.isDragging) return;

    event.preventDefault();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    setSwipeStates(prev => new Map(prev.set(entryId, {
      ...swipeState,
      currentX: clientX
    })));
  }, [swipeStates]);

  const handleSwipeEnd = useCallback((entry: typeof sortedLogs[number], entryId: string) => {
    const swipeState = swipeStates.get(entryId);
    if (!swipeState?.isDragging) return;

    const swipeDistance = swipeState.startX - swipeState.currentX;
    const deleteThreshold = 150;

    if (swipeDistance > deleteThreshold) {
      removeLog(entry);
    }

    setSwipeStates(prev => {
      const newMap = new Map(prev);
      newMap.delete(entryId);
      return newMap;
    });
  }, [swipeStates, removeLog]);

  const handleExport = useCallback(() => {
    if (sortedLogs.length === 0) {
      return;
    }

    const timestamp = new Date();
    const pad = (value: number) => value.toString().padStart(2, '0');
    const fileName = `train-car-log-${timestamp.getFullYear()}${pad(timestamp.getMonth() + 1)}${pad(timestamp.getDate())}-${pad(timestamp.getHours())}${pad(timestamp.getMinutes())}${pad(timestamp.getSeconds())}.json`;

    const blob = new Blob([JSON.stringify(sortedLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.rel = 'noopener';
    link.click();

    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }, [sortedLogs]);

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-6">
      {showConfetti && <ConfettiExplosion onComplete={() => setShowConfetti(false)} />}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Log</h1>
        <div className="flex items-center gap-3">
          {sortedLogs.length > 0 && <Button
            variant="pill"
            onClick={handleExport}
            disabled={sortedLogs.length === 0}
          >
            Export JSON
          </Button>}
          <Button
            variant="pill"
            onClick={() => navigate('/')}
          >
            Close
          </Button>
        </div>
      </div>

      <p className="text-base text-slate-600">Entries are stored on this device and ordered by most recent first.</p>
      <p className="text-base text-slate-600">Swipe left to delete a row.</p>

      <div className="grid gap-4 grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-medium text-slate-500">TOTAL CARS</p>
          <p className="text-3xl font-semibold text-slate-900">{totalLoggedCars}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-medium text-slate-500">REPEAT CARS</p>
          <p className="text-3xl font-semibold text-slate-900">{repeatCars.length > 0 ? repeatCars.join(', ') : '–'}</p>
        </div>
      </div>

      {sortedLogs.length === 0 ? (
        <p className="text-slate-600">No trips yet. Log your first train car!</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <table className="min-w-full table-auto text-left">
            <thead className="bg-slate-200">
              <tr>
                { ["Date", "Car", "Line"].map(header => (
                  <th key={header} className="px-3 py-2 text-base font-semibold text-slate-600 md:px-6 md:py-4">{header}</th>
                )) }
              </tr>
            </thead>
            <tbody>
              {sortedLogs.map((entry) => {
                const rowClasses = "px-3 py-2 md:px-6 md:py-4 text-sm md:text-base text-slate-700 font-mono";
                const entryId = `${entry.timestamp}-${entry.car}-${entry.line}`;
                const swipeState = swipeStates.get(entryId);
                const swipeOffset = swipeState ? Math.min(0, swipeState.currentX - swipeState.startX) : 0;

                return (
                  <tr
                    key={entryId}
                    className={`even:bg-slate-50 transition-colors relative overflow-hidden`}
                    style={{
                      transform: `translateX(${swipeOffset}px)`,
                      transition: swipeState?.isDragging ? 'none' : 'transform 0.3s ease-out'
                    }}
                    onTouchStart={(event) => handleSwipeStart(event, entryId)}
                    onTouchMove={(event) => handleSwipeMove(event, entryId)}
                    onTouchEnd={() => handleSwipeEnd(entry, entryId)}
                    onMouseDown={(event) => handleSwipeStart(event, entryId)}
                    onMouseMove={(event) => handleSwipeMove(event, entryId)}
                    onMouseUp={() => handleSwipeEnd(entry, entryId)}
                    onMouseLeave={() => handleSwipeEnd(entry, entryId)}
                  >
                    <td className={rowClasses}>
                      {new Date(entry.timestamp).toISOString().replace("T", " ").slice(0, 19)}
                    </td>
                    <td className={rowClasses}>{entry.car}</td>
                    <td className={rowClasses}><img className="w-8 aspect-square" src={assetUrl(`/img/${entry.line}.svg`)}/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LogPage;
