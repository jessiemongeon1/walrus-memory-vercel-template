import { MemWal } from "@mysten-incubation/memwal";

/**
 * Walrus Memory credentials come from the dashboard:
 *   Mainnet  https://memory.walrus.xyz
 *   Testnet  https://staging.memory.walrus.xyz
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        "Generate credentials at https://memory.walrus.xyz and add them to .env.local.",
    );
  }
  return value;
}

export const MEMWAL_SERVER_URL =
  process.env.MEMWAL_SERVER_URL ?? "https://relayer.memory.walrus.xyz";

/** Shared config for both the AI SDK middleware and direct `recall` calls. */
export function memwalConfig(namespace: string) {
  return {
    key: requireEnv("MEMWAL_PRIVATE_KEY"),
    accountId: requireEnv("MEMWAL_ACCOUNT_ID"),
    serverUrl: MEMWAL_SERVER_URL,
    namespace,
  };
}

/**
 * A client scoped to one visitor's namespace.
 *
 * Recall is scoped per account plus namespace, so every visitor needs their
 * own namespace or they read each other's memories. See `lib/session.ts`.
 */
export function memwalClient(namespace: string): MemWal {
  return MemWal.create(memwalConfig(namespace));
}
