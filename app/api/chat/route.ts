import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { after } from "next/server";

import { memoryModel, memwalCredentials, plainModel } from "@/lib/memwal";
import { getSessionNamespace } from "@/lib/session";

/**
 * The Walrus Memory SDK calls `await import("crypto")` internally, so this
 * handler must run on the Node.js runtime. Do not switch it to "edge".
 */
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  // Degrade instead of failing: an unconfigured deploy still answers, it just
  // answers without memory.
  const configured = memwalCredentials() !== null;
  const model = configured
    ? memoryModel(await getSessionNamespace())
    : plainModel();

  if (configured) {
    // `autoSave` runs `analyze()` fire-and-forget. On a serverless function
    // the instance can suspend as soon as the response finishes, which drops
    // the write — so hold the save open past the response.
    after(async () => {
      await (model as { flush?: () => Promise<void> }).flush?.();
    });
  }

  const result = streamText({
    // `withMemWal` is untyped by design, so the model is cast at the edge of
    // the memory layer rather than threaded through as `any`.
    model: model as Parameters<typeof streamText>[0]["model"],
    system:
      "You are a helpful assistant with persistent memory. When recalled " +
      "memories are relevant, use them naturally instead of asking the user " +
      "to repeat themselves.",
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
