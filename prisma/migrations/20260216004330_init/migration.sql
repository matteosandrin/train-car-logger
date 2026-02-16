-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "train_log_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "car" VARCHAR(4) NOT NULL,
    "line" VARCHAR(2) NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "clientCreatedAt" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "train_log_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "train_log_entries_car_idx" ON "train_log_entries"("car");

-- CreateIndex
CREATE INDEX "train_log_entries_userId_deletedAt_idx" ON "train_log_entries"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "train_log_entries_userId_timestamp_idx" ON "train_log_entries"("userId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "train_log_entries_userId_clientCreatedAt_car_line_key" ON "train_log_entries"("userId", "clientCreatedAt", "car", "line");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "train_log_entries" ADD CONSTRAINT "train_log_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
