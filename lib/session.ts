import { cookies } from "next/headers";

const COOKIE_NAME = "walrus_memory_session";
const NAMESPACE_PREFIX = "walrus-memory-template";

/** Only a v4 UUID is accepted back, so a hand-edited cookie cannot pick someone else's namespace shape. */
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/**
 * Per-visitor memory separation.
 *
 * A namespace is a data-organization boundary, not a security boundary: the
 * delegate key can read and write every namespace under the account, so
 * separation depends entirely on the server choosing the namespace. This file
 * is the only place that does, and it never reads one from the request body.
 *
 * The multi-tenant guidance says to derive the namespace from an
 * authenticated user ID and to keep it stable — explicitly, never from a
 * session ID. This template has no accounts, so the cookie is the closest
 * stand-in available: server-issued, HTTP-only, and persisted for 30 days so
 * it stays stable across visits. Clearing cookies or switching browsers does
 * start a fresh namespace, which is the cost of shipping a demo with no
 * sign-in. In a real app, use the authenticated user ID.
 *
 * https://docs.wal.app/walrus-memory/sdk/cookbook-multi-tenant
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
