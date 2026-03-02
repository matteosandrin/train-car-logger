import type { TrainLogEntry } from "@train-car-logger/shared";

const STORAGE_KEY = "train-car-logger";
const SYNC_QUEUE_KEY = "train-car-logger-sync-queue";
const LAST_SYNC_KEY = "train-car-logger-last-sync";

export const keys = {
  STORAGE_KEY,
  SYNC_QUEUE_KEY,
  LAST_SYNC_KEY,
};

interface PersistedData {
  data: TrainLogEntry[];
}

const emptyData: PersistedData = { data: [] };

function parseStoredData(raw: string | null): PersistedData {
  if (!raw) {
    return emptyData;
  }

  try {
    const parsed = JSON.parse(raw) as PersistedData;
    if (Array.isArray(parsed.data)) {
      return { data: parsed.data }; // trust entries to be well-formed
    }
    return emptyData;
  } catch (error) {
    console.warn("Failed to parse stored train log data", error);
    return emptyData;
  }
}

export function loadLogs(): TrainLogEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  return parseStoredData(stored).data;
}

export function saveLogs(entries: TrainLogEntry[]): void {
  if (typeof window === "undefined") {
    return;
  }

  const payload: PersistedData = { data: entries };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function appendLog(entry: TrainLogEntry): TrainLogEntry[] {
  const next = [...loadLogs(), entry];
  saveLogs(next);
  return next;
}

export function getLastSyncTime(): number | null {
  const raw = localStorage.getItem(LAST_SYNC_KEY);
  if (!raw) return null;
  const parsed = parseInt(raw, 10);
  return isNaN(parsed) ? null : parsed;
}

export function setLastSyncTime(ts: number): void {
  localStorage.setItem(LAST_SYNC_KEY, String(ts));
}

export { STORAGE_KEY };
