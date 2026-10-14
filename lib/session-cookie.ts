/**
 * Shared between the middleware (Edge) and the server helpers (Node), so it
 * must not import `next/headers` or anything server-only.
 */
export const SESSION_COOKIE = "walrus_memory_session";

const NAMESPACE_PREFIX = "walrus-memory-template";

/** Only a v4 UUID is accepted back, so a hand-edited cookie cannot name an arbitrary namespace. */
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
} as const;

export function isValidSessionId(value: string | undefined): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function namespaceFor(sessionId: string): string {
  return `${NAMESPACE_PREFIX}-${sessionId}`;
}
