import { NextResponse, type NextRequest } from "next/server";

import {
  isValidSessionId,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/session-cookie";

/**
 * Issues the session cookie before any handler runs.
 *
 * Doing this in the route handlers instead would let a first-time visitor's
 * chat request and memory-panel request each mint a different session, so the
 * panel would read a namespace the chat was not writing to.
 */
export function middleware(request: NextRequest) {
  if (isValidSessionId(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.next();
  }

  const sessionId = crypto.randomUUID();

  // Set it on the request as well, so handlers in *this* request see it
  // rather than only the next one.
  request.cookies.set(SESSION_COOKIE, sessionId);
  const response = NextResponse.next({ request: { headers: request.headers } });
  response.cookies.set(SESSION_COOKIE, sessionId, SESSION_COOKIE_OPTIONS);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
