import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

if (!process.env.JWT_EXPIRES_IN) {
  throw new Error("JWT_EXPIRES_IN is not set");
}

if (!process.env.CORS_ORIGIN) {
  throw new Error("CORS_ORIGIN is not set");
}