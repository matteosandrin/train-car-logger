CREATE TABLE "cars" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"timestamp" bigint NOT NULL,
	"car" text NOT NULL,
	"line" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cars" ADD CONSTRAINT "cars_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_log_entry" ON "cars" USING btree ("timestamp","car","line");