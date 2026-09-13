/**
 * Server-Side Environment Variable & Secret Validator
 *
 * Enforces cryptographic strength, guards against accidental client-side
 * leakage, and blocks startup if secrets contain placeholder values in production.
 */

interface ServerEnv {
  NODE_ENV: "development" | "production" | "test";
  AUTH_SECRET?: string;
  DATABASE_URL?: string;
  REDIS_URL?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_ALLOWED_DOMAIN?: string;
  GEMINI_API_KEY?: string;
  OBJECT_STORAGE_BUCKET?: string;
  OBJECT_STORAGE_REGION?: string;
}

const PLACEHOLDER_STRINGS = [
  "replace-with-at-least-32-random-characters",
  "your-google-oauth-client-id",
  "your-google-oauth-client-secret",
  "your-gemini-api-key",
  "postgresql://user:password@localhost:5432/industria_lease",
];

export function validateServerEnv(): ServerEnv {
  const isProd = process.env.NODE_ENV === "production";

  const env: ServerEnv = {
    NODE_ENV: (process.env.NODE_ENV as ServerEnv["NODE_ENV"]) || "development",
    AUTH_SECRET: process.env.AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_ALLOWED_DOMAIN: process.env.GOOGLE_ALLOWED_DOMAIN,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    OBJECT_STORAGE_BUCKET: process.env.OBJECT_STORAGE_BUCKET,
    OBJECT_STORAGE_REGION: process.env.OBJECT_STORAGE_REGION || "ap-south-1",
  };

  // 1. Guard against dangerous NEXT_PUBLIC_ leakage
  const dangerousClientKeys = [
    "NEXT_PUBLIC_GEMINI_API_KEY",
    "NEXT_PUBLIC_AUTH_SECRET",
    "NEXT_PUBLIC_DATABASE_URL",
    "NEXT_PUBLIC_GOOGLE_CLIENT_SECRET",
  ];

  for (const dangerousKey of dangerousClientKeys) {
    if (process.env[dangerousKey]) {
      throw new Error(
        `CRITICAL SECURITY VIOLATION: Secret "${dangerousKey}" must NOT be exposed with a NEXT_PUBLIC_ prefix.`
      );
    }
  }

  // 2. Cryptographic entropy check on AUTH_SECRET if set
  if (env.AUTH_SECRET) {
    if (env.AUTH_SECRET.length < 32) {
      throw new Error(
        "CRITICAL SECURITY CONFIGURATION: AUTH_SECRET must be at least 32 characters long."
      );
    }
    if (isProd && PLACEHOLDER_STRINGS.includes(env.AUTH_SECRET)) {
      throw new Error(
        "CRITICAL SECURITY CONFIGURATION: Production AUTH_SECRET is set to an insecure default placeholder."
      );
    }
  }

  // 3. In production, prevent deploying with mock placeholders
  if (isProd) {
    if (env.GEMINI_API_KEY && PLACEHOLDER_STRINGS.includes(env.GEMINI_API_KEY)) {
      throw new Error("Production GEMINI_API_KEY cannot be a placeholder.");
    }
    if (env.GOOGLE_CLIENT_SECRET && PLACEHOLDER_STRINGS.includes(env.GOOGLE_CLIENT_SECRET)) {
      throw new Error("Production GOOGLE_CLIENT_SECRET cannot be a placeholder.");
    }
  }

  return env;
}

export const serverEnv = validateServerEnv();
