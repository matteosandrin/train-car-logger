import { getToken } from "../auth/auth-service";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

export interface SharedCar {
  car: string;
  sharedWith: Array<{ id: number; username: string }>;
}

export async function fetchSharedCars(): Promise<SharedCar[]> {
  if (!API_URL) throw new Error("VITE_API_URL is not set");
  const token = getToken();
  if (!token) throw new Error("No token found");

  const res = await fetch(`${API_URL}/api/logs/shared-cars`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load shared cars");
  const data = (await res.json()) as { cars: SharedCar[] };
  return data.cars;
}
