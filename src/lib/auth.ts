import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "industria_lease_session";
const STATE_COOKIE = "industria_lease_oauth_state";

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SECRET must be configured with at least 32 characters.");
  return value;
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function createOAuthState() {
  const value = `${crypto.randomUUID()}.${Date.now()}`;
  return `${value}.${sign(value)}`;
}

export function verifyOAuthState(value: string | undefined) {
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [id, timestamp, signature] = parts;
  const payload = `${id}.${timestamp}`;
  const expected = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  const validSignature = signatureBuffer.length === expectedBuffer.length && timingSafeEqual(signatureBuffer, expectedBuffer);
  const fresh = Number(timestamp) > Date.now() - 10 * 60 * 1000;
  return validSignature && fresh;
}

export type GoogleSession = {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  createdAt: number;
};

export function createSessionCookie(session: GoogleSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readSessionCookie(value: string | undefined): GoogleSession | null {
  if (!value) return null;
  const separator = value.lastIndexOf(".");
  if (separator < 1) return null;
  const payload = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  const expected = sign(payload);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as GoogleSession;
    return typeof session.sub === "string" && typeof session.email === "string" ? session : null;
  } catch {
    return null;
  }
}

export { SESSION_COOKIE, STATE_COOKIE };
