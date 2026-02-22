import {
  pgTable,
  serial,
  text,
  bigint,
  integer,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const logEntries = pgTable(
  "cars",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    timestamp: bigint("timestamp", { mode: "number" }).notNull(),
    car: text("car").notNull(),
    line: text("line").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uniqEntry: uniqueIndex("uq_log_entry").on(table.timestamp, table.car, table.line),
  })
);
