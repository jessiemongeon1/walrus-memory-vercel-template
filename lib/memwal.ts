import "server-only";

import { MemWal } from "@mysten-incubation/memwal";

/**
 * Walrus Memory credentials come from the dashboard:
 *   Mainnet  https://memory.walrus.xyz
 *   Testnet  https://staging.memory.walrus.xyz
 *
 * The delegate key is server-side only. It must never reach a client
 * component or a NEXT_PUBLIC_* variable — the `server-only` import above
 * turns any such import into a build error.
 */
export type MemwalCredentials = {
  key: string;
  accountId: string;
  serverUrl: string;
};

export const MEMWAL_SERVER_URL =
  process.env.MEMWAL_SERVER_URL ?? "https://relayer.memory.walrus.xyz";

/**
 * Returns null rather than throwing when memory is not configured, so an
 * incomplete deploy loses its memory instead of its chat.
 */
export function memwalCredentials(): MemwalCredentials | null {
  const key = process.env.MEMWAL_PRIVATE_KEY;
  const accountId = process.env.MEMWAL_ACCOUNT_ID;

  if (!key || !accountId) return null;

  return { key, accountId, serverUrl: MEMWAL_SERVER_URL };
}

/**
 * Memoized for the life of a warm instance. A fresh client re-fetches
 * `/version` and `/config` before its first call, so reusing one keeps two
 * round trips off every request. The namespace is passed per call instead of
 * being baked in, because one client serves every visitor.
 */
let client: MemWal | null = null;

export function memwalClient(): MemWal | null {
  const credentials = memwalCredentials();
  if (!credentials) return null;

  client ??= MemWal.create(credentials);
  return client;
}
