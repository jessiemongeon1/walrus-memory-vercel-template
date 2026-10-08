import { gateway } from "@ai-sdk/gateway";
import { withMemWal } from "@mysten-incubation/memwal/ai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { memwalConfig } from "@/lib/memwal";
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
  const namespace = await getSessionNamespace();

  // `withMemWal` recalls relevant memories before each generation and saves
  // new facts afterwards, so the chat route needs no memory code of its own.
  const model = withMemWal(gateway(MODEL_ID), {
    ...memwalConfig(namespace),
    maxMemories: 5,
    autoSave: true,
    debug: process.env.NODE_ENV !== "production",
  });

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
