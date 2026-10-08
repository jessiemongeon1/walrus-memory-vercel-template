import { memwalClient } from "@/lib/memwal";
import { getSessionNamespace } from "@/lib/session";

export const runtime = "nodejs";

/**
 * Backs the memory panel. Recall is a vector search, so it takes a query —
 * the panel passes a broad one by default to show what the agent is holding.
 */
export async function GET(request: Request) {
  const query =
    new URL(request.url).searchParams.get("query") ??
    "facts and preferences about the user";
  const namespace = await getSessionNamespace();

  try {
    const memwal = memwalClient(namespace);
    const { results } = await memwal.recall(query, 10);

    return Response.json({
      namespace,
      memories: results.map((memory) => ({
        text: memory.text,
        relevance: Number((1 - memory.distance).toFixed(2)),
        createdAt: memory.created_at ?? null,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "recall failed";
    return Response.json({ namespace, memories: [], error: message }, { status: 500 });
  }
}
