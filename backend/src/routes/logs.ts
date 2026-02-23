import type { TrainLogEntry } from "@train-car-logger/shared";
import { and, desc, eq, isNotNull, ne } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { Router } from "express";
import { db } from "../db/client";
import { logEntries, users } from "../db/schema";
import { requireAuth } from "../middleware/auth";


const router = Router();

router.post("/logs", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const { entries } = req.body as { entries: TrainLogEntry[] };

  if (!Array.isArray(entries) || entries.length === 0) {
    res.status(400).json({ error: "entries must be a non-empty array" });
    return;
  }

  for (const e of entries) {
    if (
      typeof e.timestamp !== "number" ||
      typeof e.car !== "string" ||
      typeof e.line !== "string"
    ) {
      res
        .status(400)
        .json({ error: "each entry must have timestamp (number), car (string), line (string)" });
      return;
    }
  }

  const rows = entries.map((e) => ({
    userId,
    timestamp: e.timestamp,
    car: e.car,
    line: e.line,
  }));

  const result = await db
    .insert(logEntries)
    .values(rows)
    .onConflictDoNothing()
    .returning({ id: logEntries.id });

  res.json({ accepted: result.length, total: entries.length });
});

router.get("/logs", requireAuth, async (req, res) => {
  const userId = req.user!.userId;

  const rows = await db
    .select({
      timestamp: logEntries.timestamp,
      car: logEntries.car,
      line: logEntries.line,
    })
    .from(logEntries)
    .where(eq(logEntries.userId, userId))
    .orderBy(desc(logEntries.timestamp));

  res.json({ entries: rows });
});

router.delete("/logs", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const { entries } = req.body as { entries: TrainLogEntry[] };

  if (!Array.isArray(entries) || entries.length === 0) {
    res.status(400).json({ error: "entries must be a non-empty array" });
    return;
  }

  for (const e of entries) {
    if (
      typeof e.timestamp !== "number" ||
      typeof e.car !== "string" ||
      typeof e.line !== "string"
    ) {
      res
        .status(400)
        .json({ error: "each entry must have timestamp (number), car (string), line (string)" });
      return;
    }
  }

  let deleted = 0;
  for (const e of entries) {
    const result = await db
      .delete(logEntries)
      .where(
        and(
          eq(logEntries.userId, userId),
          eq(logEntries.timestamp, e.timestamp),
          eq(logEntries.car, e.car),
          eq(logEntries.line, e.line),
        )
      )
      .returning({ id: logEntries.id });
    deleted += result.length;
  }

  res.json({ deleted, total: entries.length });
});

router.get("/logs/shared-cars", requireAuth, async (req, res) => {
  const queryUserId = req.user!.userId;

  const other = alias(logEntries, "other");

  const rows = await db
    .select({
      car: logEntries.car,
      timestamp: logEntries.timestamp,
      sharedWithUserId: other.userId,
      sharedWithUsername: users.username,
    })
    .from(logEntries)
    .innerJoin(
      other,
      and(
        eq(logEntries.car, other.car),
        ne(other.userId, queryUserId),
        isNotNull(other.userId)
      )
    )
    .innerJoin(users, eq(users.id, other.userId))
    .where(eq(logEntries.userId, queryUserId))
    .orderBy(desc(logEntries.timestamp));

  const grouped: Record<number, { id: number; username: string; cars: string[] }> = {};
  for (const row of rows) {
    const uid = row.sharedWithUserId!;
    if (!grouped[uid]) grouped[uid] = { id: uid, username: row.sharedWithUsername, cars: [] };
    if (!grouped[uid].cars.includes(row.car)) grouped[uid].cars.push(row.car);
  }

  const friends = Object.values(grouped);

  res.json({ friends });
});

export default router;
