import { cookies } from "next/headers";

const COOKIE_NAME = "walrus_memory_session";
const NAMESPACE_PREFIX = "walrus-memory-template";

/** Only a v4 UUID is accepted back, so a hand-edited cookie cannot pick someone else's namespace shape. */
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/**
 * Per-visitor memory isolation.
 *
 * This template has no user accounts, so the session cookie stands in for an
 * identity. In a real app, derive the namespace from your authenticated user
 * ID instead, and never share one delegate key across tenants that should not
 * read each other's memories.
 */
export async function getSessionNamespace(): Promise<string> {
  const store = await cookies();
  const existing = store.get(COOKIE_NAME)?.value;

  if (existing && UUID_PATTERN.test(existing)) {
    return `${NAMESPACE_PREFIX}-${existing}`;
  }

  const sessionId = crypto.randomUUID();
  // A Route Handler can set cookies; a Server Component cannot. Both call this,
  // so a failed write falls back to a namespace that simply is not persisted.
  try {
    store.set(COOKIE_NAME, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  } catch {
    // Read-only cookie store — the caller gets a fresh namespace for this render.
  }

  return `${NAMESPACE_PREFIX}-${sessionId}`;
}
