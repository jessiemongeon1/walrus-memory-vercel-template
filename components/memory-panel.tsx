"use client";

import { useCallback, useEffect, useState } from "react";

type Memory = {
  text: string;
  relevance: number;
  createdAt: string | null;
};

export function MemoryPanel() {
  const [query, setQuery] = useState("");
  const [memories, setMemories] = useState<Memory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (search: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = search
        ? `/api/memories?query=${encodeURIComponent(search)}`
        : "/api/memories";
      const response = await fetch(url);
      const data = await response.json();
      setMemories(data.memories ?? []);
      setTruncated(Boolean(data.truncated));
      if (data.error) setError(data.error);
    } catch {
      setError("Could not reach the memory relayer.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load("");
  }, [load]);

  return (
    <aside className="flex flex-col gap-3 rounded-xl border border-black/10 p-4 dark:border-white/15">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">Memory</h2>
        <button
          type="button"
          onClick={() => void load(query)}
          className="text-xs underline opacity-70 hover:opacity-100"
        >
          Refresh
        </button>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void load(query);
        }}
      >
        <input
          className="w-full rounded-lg border border-black/15 bg-transparent px-2 py-1.5 text-xs outline-none dark:border-white/20"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search recalled memories"
          aria-label="Search memories"
        />
      </form>

      {loading && <p className="text-xs opacity-60">Recalling…</p>}

      {!loading && memories.length === 0 && !error && (
        <p className="text-xs opacity-60">
          Nothing stored yet. Memories appear here once the agent has saved a
          fact from your messages.
        </p>
      )}

      <ul className="space-y-2">
        {memories.map((memory, index) => (
          <li
            key={`${index}-${memory.text.slice(0, 24)}`}
            className="rounded-lg bg-black/[0.04] p-2 text-xs dark:bg-white/[0.06]"
          >
            <p className="whitespace-pre-wrap">{memory.text}</p>
            <p className="mt-1 opacity-50">relevance {memory.relevance}</p>
          </li>
        ))}
      </ul>

      {truncated && (
        <p className="text-xs opacity-60">
          Showing the first 10 matches; there may be more.
        </p>
      )}

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </aside>
  );
}
