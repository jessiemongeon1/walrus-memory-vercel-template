---
name: Walrus Memory Agent
slug: walrus-memory-agent
publisher: Walrus
description: An AI chat agent with persistent, encrypted memory that the user owns, backed by Walrus Memory on Sui.
framework: Next.js
type: AI
css: Tailwind
githubUrl: https://github.com/MystenLabs/walrus-memory-vercel-template
demoUrl: https://walrus-memory-agent.vercel.app
deployUrl: https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMystenLabs%2Fwalrus-memory-vercel-template&env=MEMWAL_PRIVATE_KEY,MEMWAL_ACCOUNT_ID,MEMWAL_SERVER_URL&envDescription=Walrus%20Memory%20credentials%20from%20the%20dashboard&envLink=https%3A%2F%2Fdocs.wal.app%2Fwalrus-memory%2Fsdk%2Fheadless-setup&project-name=walrus-memory-agent&repository-name=walrus-memory-agent
---

# Walrus Memory Agent

An AI chat agent that remembers the people who talk to it. Memory is stored on
[Walrus](https://docs.wal.app), encrypted with Seal, and owned by your Walrus
Memory account rather than by the model provider.

Built with the [Vercel AI SDK](https://ai-sdk.dev) and
[`withMemWal`](https://docs.wal.app/walrus-memory/sdk/ai-integration), the
Walrus Memory middleware. The middleware recalls relevant memories before each
generation and saves new facts afterwards, so the chat route contains no memory
plumbing of its own.

## Demo

https://walrus-memory-agent.vercel.app

Tell the agent something about yourself, reload the page, and ask it what it
knows. The memory panel shows what recall returns for your session.

## Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMystenLabs%2Fwalrus-memory-vercel-template&env=MEMWAL_PRIVATE_KEY,MEMWAL_ACCOUNT_ID,MEMWAL_SERVER_URL&envDescription=Walrus%20Memory%20credentials%20from%20the%20dashboard&envLink=https%3A%2F%2Fdocs.wal.app%2Fwalrus-memory%2Fsdk%2Fheadless-setup&project-name=walrus-memory-agent&repository-name=walrus-memory-agent)

## Get your credentials

Walrus Memory authenticates every request with an Ed25519 delegate key tied to
a `MemWalAccount` object on Sui. Generate both once from the dashboard:

| Network | Dashboard | Relayer |
| --- | --- | --- |
| Mainnet | [memory.walrus.xyz](https://memory.walrus.xyz) | `https://relayer.memory.walrus.xyz` |
| Testnet | [staging.memory.walrus.xyz](https://staging.memory.walrus.xyz) | `https://relayer-staging.memory.walrus.xyz` |

The relayer must match the network your credentials came from. This is the only
step that needs a browser; the deployed app never opens one.

## Run locally

```bash
pnpm install
cp .env.example .env.local
```

Fill in `MEMWAL_PRIVATE_KEY`, `MEMWAL_ACCOUNT_ID`, and `MEMWAL_SERVER_URL`, add
an `AI_GATEWAY_API_KEY` for local model access, then start the dev server:

```bash
pnpm dev
```

Deployments on Vercel authenticate to the AI Gateway through OIDC, so
`AI_GATEWAY_API_KEY` is only needed locally.

## How it works

`app/api/chat/route.ts` wraps a gateway model with the memory middleware:

```ts
const model = withMemWal(gateway(MODEL_ID), {
  key: process.env.MEMWAL_PRIVATE_KEY!,
  accountId: process.env.MEMWAL_ACCOUNT_ID!,
  serverUrl: process.env.MEMWAL_SERVER_URL,
  namespace,
  maxMemories: 5,
  autoSave: true,
});
```

Before each call the middleware recalls up to `maxMemories` relevant memories
and injects them into the prompt as nonce-delimited untrusted data, behind a
system instruction telling the model never to follow instructions found inside
recalled text. After each call it extracts and saves new facts in the
background.

### Memory is scoped per visitor

Recall is scoped per account **plus namespace**. This template has no user
accounts, so `lib/session.ts` issues a session cookie and derives a namespace
from it, which keeps one visitor's memories out of another's.

In a real application, derive the namespace from your authenticated user ID
instead, and never share one delegate key across tenants that should not read
each other's memories.

### Two constraints worth keeping

- **The chat route runs on Node.js, not Edge.** The SDK calls
  `await import("crypto")` internally, so `runtime = "nodejs"` is required.
- **Memory failures are silent by design.** If recall fails, the middleware
  returns the prompt unchanged and the model answers without memory. The
  memory panel surfaces recall errors, and `debug: true` logs them in
  development, so a misconfigured relayer or account does not look like a
  working deploy.

## Project structure

```
app/api/chat/route.ts       chat endpoint, model wrapped with withMemWal
app/api/memories/route.ts   recall, backing the memory panel
lib/memwal.ts               credential loading and client construction
lib/session.ts              per-visitor namespace from a session cookie
components/chat.tsx         chat UI
components/memory-panel.tsx recall UI
```

## Learn more

- [Walrus Memory documentation](https://docs.wal.app/walrus-memory)
- [AI SDK integration](https://docs.wal.app/walrus-memory/sdk/ai-integration)
- [Headless SDK setup](https://docs.wal.app/walrus-memory/sdk/headless-setup)
- [Walrus](https://docs.wal.app)
