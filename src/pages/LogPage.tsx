import React, { useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useLogsContext } from '../logs-context';
import { assetUrl } from '../assets';

const LONG_PRESS_DELAY_MS = 1000;

const LogPage: React.FC = () => {
  const { logs, removeLog } = useLogsContext();
  const navigate = useNavigate();

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

  const timersRef = useRef<Map<string, number>>(new Map());

  const cancelTimer = useCallback((id: string) => {
    const timeoutId = timersRef.current.get(id);
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
      timersRef.current.delete(id);
    }
  }, []);

  const startTimer = useCallback((id: string, action: () => void) => {
    cancelTimer(id);
    const timeoutId = window.setTimeout(() => {
      timersRef.current.delete(id);
      action();
    }, LONG_PRESS_DELAY_MS);
    timersRef.current.set(id, timeoutId);
  }, [cancelTimer]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTableRowElement>, entry: typeof sortedLogs[number], entryId: string) => {
    if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
      event.preventDefault();
      startTimer(entryId, () => removeLog(entry));
    }
  }, [removeLog, startTimer]);

  const handleKeyUp = useCallback((event: React.KeyboardEvent<HTMLTableRowElement>, entryId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      cancelTimer(entryId);
    }
  }, [cancelTimer]);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLTableRowElement>, entry: typeof sortedLogs[number], entryId: string) => {
    if (event.button !== 0) {
      return;
    }
    startTimer(entryId, () => removeLog(entry));
  }, [removeLog, startTimer]);

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
      <p className="text-base text-slate-600">Long press to delete a row.</p>

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
                const rowClasses = "px-3 py-2 md:px-6 md:py-4 text-base text-slate-700";
                const entryId = `${entry.timestamp}-${entry.car}-${entry.line}`;
                return (
                  <tr
                    key={entryId}
                    className="even:bg-slate-50 cursor-pointer text-unselectable transition-colors md:hover:bg-rose-100 md:focus-visible:bg-rose-100"
                    role="button"
                    tabIndex={0}
                    onPointerDown={(event) => handlePointerDown(event, entry, entryId)}
                    onPointerUp={() => cancelTimer(entryId)}
                    onPointerLeave={() => cancelTimer(entryId)}
                    onPointerCancel={() => cancelTimer(entryId)}
                    onKeyDown={(event) => handleKeyDown(event, entry, entryId)}
                    onKeyUp={(event) => handleKeyUp(event, entryId)}
                    onBlur={() => cancelTimer(entryId)}
                  >
                    <td className={rowClasses}>
                      {new Date(entry.timestamp).toLocaleString()}
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
