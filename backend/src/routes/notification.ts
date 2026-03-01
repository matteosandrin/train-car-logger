import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { notificationsTable } from "../db/schema";
import { db } from "../db/client";

const router = Router();

// mark notification as delivered
router.post("/notifications", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const { entries } = req.body as { entries: { loggedCarId: number, friendUserId: number }[] };

  if (!Array.isArray(entries) || entries.length === 0) {
    res.status(400).json({ error: "entries must be a non-empty array" });
    return;
  }

  for (const e of entries) {
    if (
      typeof e.loggedCarId !== "number" ||
      typeof e.friendUserId !== "number"
    ) {
      res
        .status(400)
        .json({ error: "each entry must have loggedCarId (number) and friendUserId (number)" });
      return;
    }
  }

  const rows = entries.map((row) => ({
    userId,
    ...row
  }))

  const result = await db
    .insert(notificationsTable)
    .values(rows)
    .onConflictDoNothing()
    .returning({ id: notificationsTable.id });

  res.json({ total: result.length })
});

export default router;