import type { TrainLogEntry } from "@train-car-logger/shared";
import { loadLogs, saveLogs } from "./local-storage";

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
    console.warn("[sync] VITE_API_URL is not set, skipping flush");
    return;
  }
  if (!navigator.onLine) {
    console.warn("[sync] Offline, skipping flush");
    return;
  }

  const snapshot = readQueue();
  if (snapshot.length === 0) return;

  console.log(`[sync] Flushing ${snapshot.length} queued entry/entries`);

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
      console.log(`[sync] Flush complete — ${snapshot.length} entry/entries uploaded`);
    } else {
      console.warn(`[sync] Flush failed — server responded ${response.status}`);
    }
  } catch (err) {
    console.warn("[sync] Flush failed — network error", err);
  }
}

/**
 * Bidirectional sync on startup:
 * - Uploads local entries missing from remote
 * - Saves remote entries missing from localStorage
 * Returns the merged local entries list.
 */
export async function syncWithRemote(): Promise<TrainLogEntry[]> {
  if (!API_URL) {
    console.warn("[sync] VITE_API_URL is not set, skipping startup sync");
    return loadLogs();
  }
  if (!navigator.onLine) {
    console.warn("[sync] Offline, skipping startup sync");
    return loadLogs();
  }

  console.log("[sync] Starting bidirectional sync...");

  try {
    const res = await fetch(`${API_URL}/api/logs`);
    if (!res.ok) {
      console.warn(`[sync] Failed to fetch remote logs — server responded ${res.status}`);
      return loadLogs();
    }

    const { entries: remoteEntries } = (await res.json()) as {
      entries: TrainLogEntry[];
    };
    const localEntries = loadLogs();

    console.log(`[sync] Remote: ${remoteEntries.length} entries, Local: ${localEntries.length} entries`);

    const remoteKeys = new Set(remoteEntries.map(entryKey));
    const localKeys = new Set(localEntries.map(entryKey));

    // Local entries missing from remote → upload them
    const toUpload = localEntries.filter((e) => !remoteKeys.has(entryKey(e)));
    if (toUpload.length > 0) {
      console.log(`[sync] Uploading ${toUpload.length} local entry/entries missing from remote`);
      const uploadRes = await fetch(`${API_URL}/api/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: toUpload }),
      });
      if (uploadRes.ok) {
        console.log(`[sync] Upload complete`);
      } else {
        console.warn(`[sync] Upload failed — server responded ${uploadRes.status}`);
      }
    }

    // Remote entries missing locally → merge into localStorage
    const toSaveLocally = remoteEntries.filter(
      (e) => !localKeys.has(entryKey(e)),
    );
    if (toSaveLocally.length > 0) {
      console.log(`[sync] Saving ${toSaveLocally.length} remote entry/entries missing locally`);
      const merged = [...localEntries, ...toSaveLocally].sort(
        (a, b) => a.timestamp - b.timestamp,
      );
      saveLogs(merged);
      console.log(`[sync] Sync complete — local store now has ${merged.length} entries`);
      return merged;
    }

    console.log("[sync] Sync complete — no new entries in either direction");
    return localEntries;
  } catch (err) {
    console.warn("[sync] Sync failed — network error", err);
    return loadLogs();
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
