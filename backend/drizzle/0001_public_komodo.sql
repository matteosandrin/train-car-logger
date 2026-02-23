DROP INDEX "uq_log_entry";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "username" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_log_entry" ON "cars" USING btree ("user_id","timestamp","car","line");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");