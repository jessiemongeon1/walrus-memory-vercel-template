"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";

export function Chat() {
  const { messages, sendMessage, status, error } = useChat();
  const [input, setInput] = useState("");

  const busy = status === "submitted" || status === "streaming";

  return (
    <section className="flex min-h-[28rem] flex-col rounded-xl border border-black/10 dark:border-white/15">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm opacity-60">
            Try: &ldquo;I take my coffee black and I am allergic to shellfish.&rdquo;
          </p>
        )}

        {messages.map((message) => (
          <div key={message.id} className="text-sm">
            <span className="mr-2 font-medium opacity-60">
              {message.role === "user" ? "You" : "Agent"}
            </span>
            <span className="whitespace-pre-wrap">
              {message.parts
                .filter((part) => part.type === "text")
                .map((part) => part.text)
                .join("")}
            </span>
          </div>
        ))}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {error.message}
          </p>
        )}
      </div>

      <form
        className="flex gap-2 border-t border-black/10 p-3 dark:border-white/15"
        onSubmit={(event) => {
          event.preventDefault();
          if (!input.trim() || busy) return;
          sendMessage({ text: input });
          setInput("");
        }}
      >
        <input
          className="flex-1 rounded-lg border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/40 dark:border-white/20 dark:focus:border-white/50"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Say something the agent should remember"
          aria-label="Message"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-white dark:text-black"
        >
          {busy ? "…" : "Send"}
        </button>
      </form>
    </section>
  );
}
