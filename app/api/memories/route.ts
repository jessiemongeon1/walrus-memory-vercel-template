import { memwalClient } from "@/lib/memwal";
import { getSessionNamespace } from "@/lib/session";

export const runtime = "nodejs";

const RECALL_LIMIT = 10;

/**
 * Backs the memory panel. Recall is a vector search, so it takes a query —
 * the panel passes a broad one by default to show what the agent is holding.
 */
export async function GET(request: Request) {
  const query =
    new URL(request.url).searchParams.get("query") ??
    "facts and preferences about the user";

  const memwal = memwalClient();
  if (!memwal) {
    return Response.json({
      configured: false,
      memories: [],
      error:
        "Walrus Memory is not configured. Set MEMWAL_PRIVATE_KEY and MEMWAL_ACCOUNT_ID.",
    });
  }

  const namespace = await getSessionNamespace();

  try {
    const { results } = await memwal.recall({
      query,
      namespace,
      limit: RECALL_LIMIT,
    });

    return Response.json({
      configured: true,
      namespace,
      memories: results.map((memory) => ({
        text: memory.text,
        relevance: Number((1 - memory.distance).toFixed(2)),
        createdAt: memory.created_at ?? null,
      })),
      // Recall silently caps at `limit`, so a full page might not be the
      // whole set.
      truncated: results.length === RECALL_LIMIT,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "recall failed";
    return Response.json(
      { configured: true, namespace, memories: [], error: message },
      { status: 500 },
    );
  }
}
