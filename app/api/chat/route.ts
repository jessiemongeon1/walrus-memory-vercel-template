import { gateway } from "@ai-sdk/gateway";
import { withMemWal } from "@mysten-incubation/memwal/ai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { after } from "next/server";

import { memwalCredentials } from "@/lib/memwal";
import { getSessionNamespace } from "@/lib/session";

/**
 * The Walrus Memory SDK calls `await import("crypto")` internally, so this
 * handler must run on the Node.js runtime. Do not switch it to "edge".
 */
export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL_ID = process.env.MODEL_ID ?? "openai/gpt-4o-mini";

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  const credentials = memwalCredentials();

  // Degrade instead of failing: an unconfigured deploy still answers, it just
  // answers without memory.
  const model = credentials
    ? withMemWal(gateway(MODEL_ID), {
        ...credentials,
        namespace: await getSessionNamespace(),
        maxMemories: 5,
        autoSave: true,
        debug: process.env.NODE_ENV !== "production",
      })
    : gateway(MODEL_ID);

  if (credentials) {
    // `autoSave` runs `analyze()` fire-and-forget. On a serverless function
    // the instance can suspend as soon as the response finishes, which drops
    // the write — so hold the save open past the response.
    after(async () => {
      await (model as { flush?: () => Promise<void> }).flush?.();
    });
  }

  const result = streamText({
    model,
    system:
      "You are a helpful assistant with persistent memory. When recalled " +
      "memories are relevant, use them naturally instead of asking the user " +
      "to repeat themselves.",
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
