import { Chat } from "@/components/chat";
import { MemoryPanel } from "@/components/memory-panel";

export default function Page() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Walrus Memory Agent
        </h1>
        <p className="text-sm opacity-70">
          Tell the agent something about yourself, reload the page, and ask it
          again. Memory is stored on Walrus, encrypted, and owned by your
          Walrus Memory account.
        </p>
      </header>

      <div className="grid flex-1 gap-6 md:grid-cols-[1fr_20rem]">
        <Chat />
        <MemoryPanel />
      </div>
    </main>
  );
}
