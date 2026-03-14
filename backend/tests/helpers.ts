import supertest from "supertest";
import app from "../src/app";
import type { TrainLogEntry } from "@train-car-logger/shared";

export const request = supertest(app);

export async function createUser(
  username = "testuser",
  password = "password123"
) {
  const res = await request
    .post("/api/auth/register")
    .send({ username, password });
  return res.body as { token: string; userId: number; username: string };
}

export function authHeader(token: string) {
  return `Bearer ${token}`;
}

let entryCounter = 0;

export function makeEntry(overrides: Partial<TrainLogEntry> = {}): TrainLogEntry {
  entryCounter++;
  return {
    timestamp: Date.now() + entryCounter,
    car: String(1000 + entryCounter).slice(0, 4),
    line: "G",
    ...overrides,
  };
}
