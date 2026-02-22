import type { TrainLogEntry } from "@train-car-logger/shared";

const SYNC_QUEUE_KEY = "train-car-logger-sync-queue";
const API_URL = import.meta.env.VITE_API_URL as string | undefined;

function readQueue(): TrainLogEntry[] {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(entries: TrainLogEntry[]): void {
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(entries));
}

function entryKey(e: TrainLogEntry): string {
  return `${e.timestamp}|${e.car}|${e.line}`;
}

/**
 * Add an entry to the pending sync queue, then attempt to flush.
 * Safe to call even when offline or when VITE_API_URL is not set.
 */
export function enqueue(entry: TrainLogEntry): void {
  if (!API_URL) {
    console.warn("VITE_API_URL is not set, skipping sync");
    return;
  }

  const queue = readQueue();
  const alreadyQueued = queue.some((e) => entryKey(e) === entryKey(entry));
  if (!alreadyQueued) {
    queue.push(entry);
    writeQueue(queue);
  }

  flush();
}

/**
 * Attempt to send all queued entries to the backend.
 * On success, removes the sent entries from the queue.
 * On failure, leaves the queue intact for the next retry.
 */
export async function flush(): Promise<void> {
  if (!API_URL) {
    console.warn("VITE_API_URL is not set, skipping sync");
    return;
  }
  if (!navigator.onLine) {
    console.warn("Offline, skipping sync");
    return;
  }

  const snapshot = readQueue();
  if (snapshot.length === 0) return;

  try {
    const response = await fetch(`${API_URL}/api/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries: snapshot }),
    });

    if (response.ok) {
      const sentKeys = new Set(snapshot.map(entryKey));
      const remaining = readQueue().filter((e) => !sentKeys.has(entryKey(e)));
      writeQueue(remaining);
    }
  } catch {
    // Network error — leave queue intact for next retry
  }
}

/**
 * Register the online event listener and attempt an initial flush.
 * Call once at app startup.
 */
export function initSyncService(): void {
  if (!API_URL) {
    console.warn("VITE_API_URL is not set, skipping sync");
    return;
  }
  window.addEventListener("online", () => {
    flush();
  });
  flush();
}
