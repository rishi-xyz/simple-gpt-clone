# Build a ChatGPT Clone, from Zero, in 2 Hours

This course starts with "what does a browser actually understand?" and finishes with a working, deployed **ChatGPT clone**. The clone has login, saved chats, and streaming answers from real AI models.

Most topics are covered as **concepts**: you need to know what they are and why they exist. The **code** builds one real app, step by step. The finished app is in [`../chatgpt`](../chatgpt), so you can compare your code with it at any time.

```
┌────────────┐   HTTP    ┌──────────────────────────────┐  SQL   ┌────────────┐
│  Browser   │ ────────▶ │  Next.js server              │ ─────▶ │ PostgreSQL │
│ (React UI) │ ◀──────── │  pages · server actions ·    │ ◀───── │  (Prisma)  │
└────────────┘  stream   │  /api/chat · Auth.js         │        └────────────┘
                         └──────────────┬───────────────┘
                                        │ HTTPS (AI SDK)
                                        ▼
                                 ┌──────────────┐
                                 │  OpenRouter  │  → Gemma, Qwen, Nemotron…
                                 └──────────────┘
```

## What you will build

- Sign up / log in with **email + password**, **GitHub** or **Google**
- Chat with free AI models; answers **stream in word by word**
- Pick the model from a dropdown (your choice is remembered)
- Chats are **saved to a database** and listed in a sidebar; you can delete them
- Markdown rendering, a mobile-friendly layout, and deployment to **Vercel**

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind + shadcn/ui · Auth.js v5 · Prisma 7 + PostgreSQL · Vercel AI SDK v7 · OpenRouter · Bun

## The 2-hour plan

| # | Phase | Time | Type |
|---|---|---|---|
| 00 | [Setup](phases/00-setup.md) | 5 min | 🛠️ install |
| 01 | [How the web works](phases/01-how-the-web-works.md) | 10 min | 💡 concepts |
| 02 | [JavaScript & TypeScript foundations](phases/02-javascript-foundations.md) | 15 min | 💡 concepts + mini exercises |
| 03 | [Tooling: Node, Bun, package managers, Git, GitHub](phases/03-tooling.md) | 10 min | 💡 concepts |
| 04 | [React, Vite, Next.js + rendering (CSR/SSR/SSG)](phases/04-react-vite-next.md) | 15 min | 💡 + 👩‍💻 **start the project** |
| 05 | [Databases: SQL, NoSQL, Postgres, Prisma](phases/05-database.md) | 15 min | 💡 + 👩‍💻 **database** |
| 06 | [Auth: cookies, sessions, JWT, OAuth, Auth.js, middleware](phases/06-auth.md) | 20 min | 💡 + 👩‍💻 **login** |
| 07 | [AI chat: LLMs, APIs, streaming, Vercel AI SDK](phases/07-ai-chat.md) | 20 min | 💡 + 👩‍💻 **the chat** |
| 08 | [Sidebar & polish](phases/08-sidebar-and-polish.md) | 5 min | 👩‍💻 finish the UI |
| 09 | [Deploy to Vercel + Neon](phases/09-deploy.md) | 5 min | 🚀 ship it |
| 10 | [Bonus: AI agents & next steps](phases/10-agents-and-next-steps.md) | homework | 💡 + 🧪 |

Stuck on a word? Look it up in the [**Glossary**](GLOSSARY.md).

> **Short on time?** Phases 01–03 can be a quick 15-minute talk; students read them in detail later. The code starts in Phase 04.

## Before you start

- A laptop with **Linux / macOS / Windows (WSL recommended)**
- Basic comfort with the terminal (Phase 00 covers the essentials)
- A GitHub account, and a free [OpenRouter](https://openrouter.ai) account for the AI key

## How to use these lessons

Every phase file has the same parts:

1. **🎯 Goal**: what you'll understand or build
2. **💡 Concepts**: short explanations, diagrams and comparison tables
3. **👩‍💻 Build it**: numbered steps with commands and full code
4. **✅ Checkpoint**: what should work before you move on
5. **🤖 Ask your agent**: prompts to paste into a coding agent to go deeper
6. **🧪 Try it yourself**: small exercises

### Learning with a coding agent (Claude Code, opencode, Cursor, Codex…)

This folder has an [`AGENTS.md`](AGENTS.md) (and a `CLAUDE.md` that points to it). It turns your agent into a **tutor**: it explains things before it writes code and goes one phase at a time.

```bash
cd web-build
claude          # or: opencode, codex, cursor-agent …
```

Then say something like:

- *"I'm a beginner. Start Phase 01 with me."*
- *"I'm on Phase 06. Explain the difference between a session and a JWT with an example from this project."*
- *"My `/login` page shows an error. Here is the message: … Help me debug it, but explain the problem first."*

> 💡 **Tip:** Type the code yourself instead of letting the agent paste it. You learn by typing, breaking things, and fixing them.

## Reference app

The finished project is in [`../chatgpt`](../chatgpt). Every code block in these lessons is copied from it. If your version doesn't work, compare it with the reference file of the same name.
