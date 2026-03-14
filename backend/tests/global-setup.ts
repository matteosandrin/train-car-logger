import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "path";

export default async function globalSetup() {
  const baseUrl =
    process.env.DATABASE_URL ??
    "postgresql://localhost/train_car_logger_test";

  // Parse the connection string to get the DB name and a URL pointing at the default `postgres` DB
  const url = new URL(baseUrl);
  const testDbName = url.pathname.slice(1); // strip leading "/"
  url.pathname = "/postgres";
  const adminUrl = url.toString();

  // 1. Create the test database if it doesn't exist
  const adminPool = new Pool({ connectionString: adminUrl });
  try {
    await adminPool.query(`CREATE DATABASE "${testDbName}"`);
  } catch (err: any) {
    // 42P04 = database already exists
    if (err.code !== "42P04") throw err;
  } finally {
    await adminPool.end();
  }

  // 2. Run Drizzle migrations against the test database
  const testPool = new Pool({ connectionString: baseUrl });
  const db = drizzle(testPool);
  await migrate(db, {
    migrationsFolder: path.resolve(__dirname, "../drizzle"),
  });
  await testPool.end();
}
