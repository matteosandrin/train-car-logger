import { Router } from "express";
import { eq, ne, and, isNotNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "../db/client";
import { logEntries } from "../db/schema";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/users/:userId/shared-cars", requireAuth, async (req, res) => {
  const queryUserId = parseInt(req.params.userId, 10);
  if (isNaN(queryUserId)) {
    res.status(400).json({ error: "userId must be an integer" });
    return;
  }

  const other = alias(logEntries, "other");

  const rows = await db
    .selectDistinct({
      car: logEntries.car,
      sharedWithUserId: other.userId,
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
    .where(eq(logEntries.userId, queryUserId));

  const grouped: Record<string, number[]> = {};
  for (const row of rows) {
    if (!grouped[row.car]) grouped[row.car] = [];
    grouped[row.car].push(row.sharedWithUserId!);
  }

  const cars = Object.entries(grouped).map(([car, sharedWith]) => ({ car, sharedWith }));

  res.json({ cars });
});

export default router;
