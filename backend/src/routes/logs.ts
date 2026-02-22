import { Router } from "express";
import { desc } from "drizzle-orm";
import { db } from "../db/client";
import { logEntries } from "../db/schema";
import type { TrainLogEntry } from "@train-car-logger/shared";

const router = Router();

router.post("/logs", async (req, res) => {
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
    userId: null,
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

router.get("/logs", async (_req, res) => {
  const rows = await db
    .select({
      timestamp: logEntries.timestamp,
      car: logEntries.car,
      line: logEntries.line,
    })
    .from(logEntries)
    .orderBy(desc(logEntries.timestamp));

  res.json({ entries: rows });
});

export default router;
