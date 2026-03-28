import dotenv from "dotenv";

dotenv.config();

const required = [
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
] as const;

const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(
    `[FATAL] Missing required environment variables: ${missing.join(", ")}\n` +
    `Copy .env.example to .env and fill in the values.`
  );
  process.exit(1);
}
