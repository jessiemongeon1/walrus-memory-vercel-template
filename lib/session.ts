import { cookies } from "next/headers";

import {
  isValidSessionId,
  namespaceFor,
  SESSION_COOKIE,
} from "./session-cookie";

/**
 * Per-visitor memory separation.
 *
 * A namespace is a data-organization boundary, not a security boundary: the
 * delegate key can read and write every namespace under the account, so
 * separation depends entirely on the server choosing the namespace. The
 * middleware issues the session cookie and this module reads it; neither ever
 * takes a namespace from a request body.
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
  const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;

  // The middleware sets this on every matched request, including the first
  // one. A request that somehow arrives without it gets a throwaway namespace
  // rather than reading someone else's.
  return namespaceFor(isValidSessionId(sessionId) ? sessionId : crypto.randomUUID());
}
