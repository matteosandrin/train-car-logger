import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { loadLogs, saveLogs, STORAGE_KEY } from "./local-storage";
import type { TrainLogEntry } from "@train-car-logger/shared";
import { enqueue, enqueueDelete, initSyncService, syncWithRemote } from "./sync-service";
import { updateLogNotes } from "../api/client";
import { useAuthContext } from "../auth";

export interface LogsContextValue {
  logs: TrainLogEntry[];
  addLog: (car: string, line: string, timestamp?: number, notes?: string) => void;
  removeLog: (entry: TrainLogEntry) => void;
  updateNote: (entry: TrainLogEntry, notes: string) => Promise<void>;
  getCarCount: (car: string) => number;
}

export const LogsContext = createContext<LogsContextValue | undefined>(undefined);

export const LogsProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [logs, setLogs] = useState<TrainLogEntry[]>(() => loadLogs());
  const { isAuthenticated, logout } = useAuthContext();
  const navigate = useNavigate();

  const addLog = useCallback(
    (car: string, line: string, timestamp?: number, notes?: string) => {
      const nextEntry: TrainLogEntry = {
        car,
        line,
        timestamp: timestamp ?? Math.floor(Date.now()),
        notes: notes || undefined,
      };
      enqueue(nextEntry);
      setLogs((prev) => {
        const nextLogs = [...prev, nextEntry];
        saveLogs(nextLogs);
        return nextLogs;
      });
    },
    [],
  );

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
      if (didRemove) {
        enqueueDelete(entryToRemove);
      }
      return nextLogs;
    });
  }, []);

  const updateNote = useCallback(async (entry: TrainLogEntry, notes: string) => {
    setLogs((prev) => {
      const nextLogs = prev.map((e) =>
        e.timestamp === entry.timestamp && e.car === entry.car && e.line === entry.line
          ? { ...e, notes }
          : e,
      );
      saveLogs(nextLogs);
      return nextLogs;
    });
    if (entry.id) {
      await updateLogNotes(entry.id, notes);
    }
  }, []);

  const getCarCount = useCallback(
    (car: string): number => {
      const newLogs = loadLogs();
      return newLogs.filter((entry) => entry.car === car).length;
    },
    [loadLogs],
  );

  useEffect(() => {
    if (!isAuthenticated) return;

    initSyncService();
    syncWithRemote()
      .then((merged) => setLogs(merged))
      .catch((err: unknown) => {
        if (err instanceof Error && err.message === "AUTH_REQUIRED") {
          logout();
          navigate("/login");
        }
      });
  }, [isAuthenticated]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        setLogs(loadLogs());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const value = useMemo(
    () => ({ logs, addLog, removeLog, updateNote, getCarCount }),
    [logs, addLog, removeLog, updateNote, getCarCount],
  );

  return <LogsContext.Provider value={value}>{children}</LogsContext.Provider>;
};
