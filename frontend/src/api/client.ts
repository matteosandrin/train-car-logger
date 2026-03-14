import type { TrainLogEntry, StationPair } from "@train-car-logger/shared";
import { getToken } from "../auth/auth-service";
import { API_URL } from "./config";

export function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  if (!API_URL) throw new Error("VITE_API_URL is not set");

  const token = getToken();
  const { headers, ...rest } = init;
  return fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
}

export interface SharedFriend {
  id: number;
  username: string;
  cars: { id: number, car: string; line: string; notified: boolean }[];
}

export async function deleteLogs(entries: TrainLogEntry[]): Promise<void> {
  const res = await apiFetch("/api/logs", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entries }),
  });
  if (!res.ok) throw new Error("Failed to delete logs");
}

export async function fetchSharedFriends(): Promise<SharedFriend[]> {
  const res = await apiFetch("/api/logs/shared-cars");
  if (!res.ok) throw new Error("Failed to load shared cars");
  const data = (await res.json()) as { friends: SharedFriend[] };
  return data.friends;
}

export async function updateLogNotes(id: number, notes: string): Promise<void> {
  const res = await apiFetch(`/api/logs/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes }),
  });
  if (!res.ok) throw new Error("Failed to update notes");
}

export async function fetchStationPairs(line: string, limit?: number): Promise<StationPair[]> {
  const res = await apiFetch(`/api/logs/station-pairs?line=${line.toString()}${limit ? `&limit=${limit}` : ""}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { pairs: StationPair[] };
  return data.pairs;
}

export async function postNotifications(entries: {friendUserId: number, loggedCarId: number}[]): Promise<{total: number}> {
  const res = await apiFetch("/api/notifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entries })
  })
  if (!res.ok) throw new Error("Failed to set notifications")
  return res.json()
}
