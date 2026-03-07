import { keys } from "../storage/local-storage";
import { API_URL } from "../api/config";

const { TOKEN_KEY, USER_KEY } = keys;

export interface AuthUser {
  userId: number;
  username: string;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function storeSession(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function register(
  username: string,
  password: string,
): Promise<{ token: string; user: AuthUser }> {
  if (!API_URL) throw new Error("VITE_API_URL is not set");

  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = (await res.json()) as { token?: string; userId?: number; username?: string; error?: string };
  if (!res.ok) throw new Error(data.error ?? "Registration failed");

  const user: AuthUser = { userId: data.userId!, username: data.username! };
  storeSession(data.token!, user);
  return { token: data.token!, user };
}

export async function login(
  username: string,
  password: string,
): Promise<{ token: string; user: AuthUser }> {
  if (!API_URL) throw new Error("VITE_API_URL is not set");

  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = (await res.json()) as { token?: string; userId?: number; username?: string; error?: string };
  if (!res.ok) throw new Error(data.error ?? "Login failed");

  const user: AuthUser = { userId: data.userId!, username: data.username! };
  storeSession(data.token!, user);
  return { token: data.token!, user };
}
