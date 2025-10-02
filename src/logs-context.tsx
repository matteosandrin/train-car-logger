import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadLogs, saveLogs, STORAGE_KEY, TrainLogEntry } from './storage';

interface LogsContextValue {
  logs: TrainLogEntry[];
  addLog: (car: string, line: string, timestamp?: number) => void;
  removeLog: (entry: TrainLogEntry) => void;
  getCarCount: (car: string) => number;
}

const LogsContext = createContext<LogsContextValue | undefined>(undefined);

export const LogsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [logs, setLogs] = useState<TrainLogEntry[]>(() => loadLogs());

  const addLog = useCallback((car: string, line: string, timestamp?: number) => {
    setLogs((prev) => {
      const nextEntry: TrainLogEntry = {
        car,
        line,
        timestamp: timestamp ?? Math.floor(Date.now()),
      };
      const nextLogs = [...prev, nextEntry];
      saveLogs(nextLogs);
      return nextLogs;
    });
  }, []);

  const removeLog = useCallback((entryToRemove: TrainLogEntry) => {
    setLogs((prev) => {
      let didRemove = false;
      const nextLogs = prev.filter((entry) => {
        const isMatch =
          entry.timestamp === entryToRemove.timestamp &&
          entry.car === entryToRemove.car &&
          entry.line === entryToRemove.line;
        if (isMatch) {
          didRemove = true;
        }
        return !isMatch;
      });

      if (!didRemove) {
        return prev;
      }

      saveLogs(nextLogs);
      return nextLogs;
    });
  }, []);

  const getCarCount = useCallback((car: string): number => {
    const newLogs = loadLogs();
    return newLogs.filter(entry => entry.car === car).length;
  }, [loadLogs]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        setLogs(loadLogs());
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const value = useMemo(() => ({ logs, addLog, removeLog, getCarCount }), [logs, addLog, removeLog, getCarCount]);

  return <LogsContext.Provider value={value}>{children}</LogsContext.Provider>;
};

export function useLogsContext(): LogsContextValue {
  const context = useContext(LogsContext);
  if (!context) {
    throw new Error('useLogsContext must be used within a LogsProvider');
  }
  return context;
}
