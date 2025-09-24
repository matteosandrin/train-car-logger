import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadLogs, saveLogs, STORAGE_KEY, TrainLogEntry } from './storage';

interface LogsContextValue {
  logs: TrainLogEntry[];
  addLog: (car: number, line: string, timestamp?: number) => void;
}

const LogsContext = createContext<LogsContextValue | undefined>(undefined);

export const LogsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [logs, setLogs] = useState<TrainLogEntry[]>(() => loadLogs());

  const addLog = useCallback((car: number, line: string, timestamp?: number) => {
    setLogs((prev) => {
      const nextEntry: TrainLogEntry = {
        car,
        line,
        timestamp: timestamp ?? Math.floor(Date.now() / 1000),
      };
      const nextLogs = [...prev, nextEntry];
      saveLogs(nextLogs);
      return nextLogs;
    });
  }, []);

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

  const value = useMemo(() => ({ logs, addLog }), [logs, addLog]);

  return <LogsContext.Provider value={value}>{children}</LogsContext.Provider>;
};

export function useLogsContext(): LogsContextValue {
  const context = useContext(LogsContext);
  if (!context) {
    throw new Error('useLogsContext must be used within a LogsProvider');
  }
  return context;
}
