
import "dotenv/config";

function getEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const portValue = Number(getEnv("PORT", "4000"));

if (!Number.isInteger(portValue) || portValue < 1 || portValue > 65535) {
  throw new Error("PORT must be a valid port number");
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: portValue,
  WEB_URL: getEnv("WEB_URL", "http://localhost:5173"),

  CLERK_SECRET_KEY: getEnv("CLERK_SECRET_KEY"),

  // WhatsApp via WAHA
  WAHA_BASE_URL: getEnv("WAHA_BASE_URL", "http://localhost:3001"),
  WAHA_API_KEY: getEnv("WAHA_API_KEY"),
  OTP_HASH_SECRET: getEnv("OTP_HASH_SECRET"),
};

