import type { TrainLogEntry } from "@train-car-logger/shared";
import { getToken } from "../auth/auth-service";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  if (!API_URL) throw new Error("VITE_API_URL is not set");
  const token = getToken();
  if (!token) throw new Error("No token found");

  const { headers, ...rest } = init;
  return fetch(`${API_URL}${path}`, {
    ...rest,
    headers: { Authorization: `Bearer ${token}`, ...headers },
  });
}

export interface SharedFriend {
  id: number;
  username: string;
  cars: string[];
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
