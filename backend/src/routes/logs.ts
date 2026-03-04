import type { TrainLogEntry } from "@train-car-logger/shared";
import { and, desc, eq, isNotNull, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { Router } from "express";
import { db } from "../db/client";
import { carsTable, notificationsTable, usersTable } from "../db/schema";
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
    notes: typeof e.notes === "string" ? e.notes : null,
    origin: typeof e.origin === "string" ? e.origin : null,
    destination: typeof e.destination === "string" ? e.destination : null,
  }));

  const result = await db
    .insert(carsTable)
    .values(rows)
    .onConflictDoNothing()
    .returning({ id: carsTable.id });

  res.json({ accepted: result.length, total: entries.length });
});

router.get("/logs", requireAuth, async (req, res) => {
  const userId = req.user!.userId;

  const rows = await db
    .select({
      id: carsTable.id,
      timestamp: carsTable.timestamp,
      car: carsTable.car,
      line: carsTable.line,
      notes: carsTable.notes,
      origin: carsTable.origin,
      destination: carsTable.destination,
    })
    .from(carsTable)
    .where(eq(carsTable.userId, userId))
    .orderBy(desc(carsTable.timestamp));

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
      .delete(carsTable)
      .where(
        and(
          eq(carsTable.userId, userId),
          eq(carsTable.timestamp, e.timestamp),
          eq(carsTable.car, e.car),
          eq(carsTable.line, e.line),
        )
      )
      .returning({ id: carsTable.id });
    deleted += result.length;
  }

  res.json({ deleted, total: entries.length });
});

router.patch("/logs/:id", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const id = parseInt(req.params.id, 10);
  const { notes } = req.body as { notes: string };

  if (isNaN(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }

  if (typeof notes !== "string") {
    res.status(400).json({ error: "notes must be a string" });
    return;
  }

  const result = await db
    .update(carsTable)
    .set({ notes })
    .where(and(eq(carsTable.id, id), eq(carsTable.userId, userId)))
    .returning({ id: carsTable.id });

  if (result.length === 0) {
    res.status(404).json({ error: "entry not found" });
    return;
  }

  res.json({ ok: true });
});

router.get("/logs/shared-cars", requireAuth, async (req, res) => {
  const queryUserId = req.user!.userId;

  const other = alias(carsTable, "other");

  const rows = await db
    .select({
      id: carsTable.id,
      car: carsTable.car,
      line: carsTable.line,
      timestamp: carsTable.timestamp,
      sharedWithUserId: other.userId,
      sharedWithUsername: usersTable.username,
      notified: sql<boolean>`${isNotNull(notificationsTable.id)}`
    })
    .from(carsTable)
    .innerJoin(
      other,
      and(
        eq(carsTable.car, other.car),
        ne(other.userId, queryUserId),
        isNotNull(other.userId)
      )
    )
    .innerJoin(usersTable, eq(usersTable.id, other.userId))
    .leftJoin(notificationsTable, and(
      eq(carsTable.userId, notificationsTable.userId),
      eq(other.userId, notificationsTable.friendUserId),
      eq(carsTable.id, notificationsTable.loggedCarId)
    ))
    .where(eq(carsTable.userId, queryUserId))
    .orderBy(desc(carsTable.timestamp));

  const grouped: Record<number, { id: number; username: string; cars: { id: number, car: string; line: string, notified: boolean }[] }> = {};
  for (const row of rows) {
    const uid = row.sharedWithUserId!;
    if (!grouped[uid]) grouped[uid] = { id: uid, username: row.sharedWithUsername, cars: [] };
    if (!grouped[uid].cars.some((c) => c.id === row.id)) {
      grouped[uid].cars.push({ id: row.id, car: row.car, line: row.line, notified: row.notified });
    }
  }

  const friends = Object.values(grouped);

  res.json({ friends });
});

export default router;
