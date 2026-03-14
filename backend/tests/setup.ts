import { beforeEach } from "vitest";
import { db } from "../src/db/client";
import { sql } from "drizzle-orm";

beforeEach(async () => {
  await db.execute(
    sql`TRUNCATE TABLE notifications, cars, users RESTART IDENTITY CASCADE`
  );
});
