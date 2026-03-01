import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { usersTable } from "../db/schema";

const router = Router();
const BCRYPT_ROUNDS = 12;

function signToken(userId: number, username: string): string {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign({ userId, username }, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? "30d") as jwt.SignOptions["expiresIn"],
  });
}

router.post("/auth/register", async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || typeof username !== "string" || username.trim().length === 0) {
    res.status(400).json({ error: "username is required" });
    return;
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    res.status(400).json({ error: "password must be at least 8 characters" });
    return;
  }

  const trimmedUsername = username.trim().toLowerCase();

  const existing = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.username, trimmedUsername))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "Username already taken" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const [newUser] = await db
    .insert(usersTable)
    .values({ username: trimmedUsername, passwordHash })
    .returning({ id: usersTable.id, username: usersTable.username });

  const token = signToken(newUser.id, newUser.username);
  res.status(201).json({ token, userId: newUser.id, username: newUser.username });
});

router.post("/auth/login", async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    res.status(400).json({ error: "username and password are required" });
    return;
  }

  const trimmedUsername = username.trim().toLowerCase();

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, trimmedUsername))
    .limit(1);

  // Always run bcrypt.compare to prevent user-enumeration via timing
  const dummyHash = "$2a$12$invalidhashfortimingprotection000000000000000";
  const hash = user?.passwordHash ?? dummyHash;
  const valid = await bcrypt.compare(password, hash);

  if (!user || !valid) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  const token = signToken(user.id, user.username);
  res.json({ token, userId: user.id, username: user.username });
});

export default router;
