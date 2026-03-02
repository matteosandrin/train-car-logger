import type { TrainLogEntry } from "@train-car-logger/shared";
import { keys, loadLogs, saveLogs } from "./local-storage";
import { getToken } from "../auth/auth-service";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

let _flushing = false;
let _onlineListenerRegistered = false;

type QueueEntry = { op: "add" | "delete"; entry: TrainLogEntry };

function readQueue(): QueueEntry[] {
  try {
    const raw = localStorage.getItem(keys.SYNC_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(entries: QueueEntry[]): void {
  localStorage.setItem(keys.SYNC_QUEUE_KEY, JSON.stringify(entries));
}

function entryKey(e: TrainLogEntry): string {
  return `${e.timestamp}|${e.car}|${e.line}`;
}

function opKey(q: QueueEntry): string {
  return `${q.op}|${entryKey(q.entry)}`;
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
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
  const key = opKey({ op: "add", entry });
  if (!queue.some((q) => opKey(q) === key)) {
    queue.push({ op: "add", entry });
    writeQueue(queue);
  }

  flush();
}

/**
 * Add an entry to the pending delete queue, then attempt to flush.
 * Safe to call even when offline or when VITE_API_URL is not set.
 */
export function enqueueDelete(entry: TrainLogEntry): void {
  if (!API_URL) {
    console.warn("VITE_API_URL is not set, skipping sync");
    return;
  }

  const queue = readQueue();
  const key = opKey({ op: "delete", entry });
  if (!queue.some((q) => opKey(q) === key)) {
    queue.push({ op: "delete", entry });
    writeQueue(queue);
  }

  flush();
}

/**
 * Attempt to send all queued operations to the backend.
 * On success, removes the processed entries from the queue.
 * On failure, leaves the queue intact for the next retry.
 */
export async function flush(): Promise<void> {
  if (_flushing) return;
  _flushing = true;
  try {
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

    console.log(`[sync] Flushing ${snapshot.length} queued operation(s)`);

    const toAdd = snapshot.filter((q) => q.op === "add").map((q) => q.entry);
    const toDelete = snapshot.filter((q) => q.op === "delete").map((q) => q.entry);
    const flushedKeys = new Set<string>();

    if (toAdd.length > 0) {
      try {
        const response = await fetch(`${API_URL}/api/logs`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ entries: toAdd }),
        });

        if (response.ok) {
          toAdd.forEach((e) => flushedKeys.add(opKey({ op: "add", entry: e })));
          console.log(`[sync] Uploaded ${toAdd.length} entry/entries`);
        } else if (response.status === 401) {
          console.warn("[sync] Upload failed — not authenticated");
        } else {
          console.warn(`[sync] Upload failed — server responded ${response.status}`);
        }
      } catch (err) {
        console.warn("[sync] Upload failed — network error", err);
      }
    }

    if (toDelete.length > 0) {
      try {
        const response = await fetch(`${API_URL}/api/logs`, {
          method: "DELETE",
          headers: authHeaders(),
          body: JSON.stringify({ entries: toDelete }),
        });

        if (response.ok) {
          toDelete.forEach((e) => flushedKeys.add(opKey({ op: "delete", entry: e })));
          console.log(`[sync] Deleted ${toDelete.length} entry/entries`);
        } else if (response.status === 401) {
          console.warn("[sync] Delete failed — not authenticated");
        } else {
          console.warn(`[sync] Delete failed — server responded ${response.status}`);
        }
      } catch (err) {
        console.warn("[sync] Delete failed — network error", err);
      }
    }

    if (flushedKeys.size > 0) {
      const remaining = readQueue().filter((q) => !flushedKeys.has(opKey(q)));
      writeQueue(remaining);
      console.log(`[sync] Flush complete — ${flushedKeys.size} operation(s) processed`);
    }
  } finally {
    _flushing = false;
  }
}

/**
 * Bidirectional sync on startup:
 * - Uploads local entries missing from remote
 * - Saves remote entries missing from localStorage
 * Returns the merged local entries list.
 * Throws an error with message "AUTH_REQUIRED" if the server returns 401.
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
    const token = getToken();
    const res = await fetch(`${API_URL}/api/logs`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (res.status === 401) {
      throw new Error("AUTH_REQUIRED");
    }

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
        headers: authHeaders(),
        body: JSON.stringify({ entries: toUpload }),
      });
      if (uploadRes.ok) {
        console.log(`[sync] Upload complete`);
      } else {
        if (uploadRes.status === 401) {
          throw new Error("AUTH_REQUIRED");
        }
        console.warn(`[sync] Upload failed — re-queuing ${toUpload.length} entries for retry`);
        const currentQueue = readQueue();
        const currentQKeys = new Set(currentQueue.map(opKey));
        toUpload.forEach((entry) => {
          const k = opKey({ op: "add", entry });
          if (!currentQKeys.has(k)) currentQueue.push({ op: "add", entry });
        });
        writeQueue(currentQueue);
      }
    }

    // Remote entries missing locally → add to merged set
    // Exclude entries that are pending deletion in the queue (not yet flushed to remote)
    const pendingDeleteKeys = new Set(
      readQueue().filter((q) => q.op === "delete").map((q) => entryKey(q.entry))
    );
    const toSaveLocally = remoteEntries.filter(
      (e) => !localKeys.has(entryKey(e)) && !pendingDeleteKeys.has(entryKey(e)),
    );

    // Build a map of remote entries by key so we can apply server id/notes to local entries
    const remoteByKey = new Map(remoteEntries.map((e) => [entryKey(e), e]));

    // For entries that exist in both, use the remote version (has id and notes)
    const reconciled = localEntries.map((e) => remoteByKey.get(entryKey(e)) ?? e);

    if (toSaveLocally.length > 0 || reconciled.some((e, i) => {
      const orig = localEntries[i];
      return e !== orig && (e.id !== orig.id || e.notes !== orig.notes);
    })) {
      const merged = [...reconciled, ...toSaveLocally].sort(
        (a, b) => a.timestamp - b.timestamp,
      );
      saveLogs(merged);
      console.log(`[sync] Sync complete — local store now has ${merged.length} entries`);
      return merged;
    }

    console.log("[sync] Sync complete — no new entries in either direction");
    return localEntries;
  } catch (err) {
    if (err instanceof Error && err.message === "AUTH_REQUIRED") {
      throw err;
    }
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
  if (!_onlineListenerRegistered) {
    window.addEventListener("online", () => {
      flush();
    });
    _onlineListenerRegistered = true;
  }
  flush();
}
