import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      DATABASE_URL:
        process.env.DATABASE_URL ??
        "postgresql://localhost/train_car_logger_test",
      JWT_SECRET: "test-secret",
      JWT_EXPIRES_IN: "1d",
      CORS_ORIGIN: "*",
      NODE_ENV: "test",
    },
    include: ["tests/**/*.test.ts"],
    globalSetup: "./tests/global-setup.ts",
    setupFiles: ["./tests/setup.ts"],
    fileParallelism: false,
    pool: "forks",
    testTimeout: 15000,
  },
});
