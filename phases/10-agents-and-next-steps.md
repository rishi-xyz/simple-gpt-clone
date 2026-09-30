# Phase 10: Bonus: AI Agents & Next Steps (homework)

## 🎯 Goal
Understand what an **AI agent** is, add a **tool** to your chatbot, and pick your next challenge.

> 🌿 **Branch:** `git switch phase-10-agents` has the tool-calling code already working.
> 🔍 **See exactly what a tool adds:** `git diff phase-08-sidebar..phase-10-agents`

---

## 💡 1. Chatbot vs agent

Our app is a **chatbot**: text in, text out. The model can only use what it already knows. It can't check the time, search the web or read your database.

An **agent** is an LLM that can **use tools** and **work in a loop** until the task is done:

```
           ┌──────────────────────────────────────────────┐
           ▼                                              │
 user ─▶ LLM thinks ─▶ "I need to call getWeather('Pune')" │
                              │                           │
                     your code runs the tool              │
                              │                           │
                       result: 31°C, sunny ───────────────┘  (fed back to the LLM)
                              ...
          LLM: "It's 31°C and sunny in Pune ☀️"  ─▶ done
```
**Agent = LLM + tools + a loop (+ memory).**

- **Tool (function calling)**: you describe a function (name, description, input schema). The model decides *when* to call it and *with what arguments*. **Your code** runs it and gives back the result. The model never runs code itself.
- **Coding agents** (Claude Code, opencode, Cursor, Codex) are agents whose tools are "read file", "edit file" and "run terminal command". That's how they can build apps with you.
- **MCP (Model Context Protocol)**: a standard way to plug tools (GitHub, Google Drive, databases…) into any AI app, like USB for AI tools.
- **RAG (Retrieval-Augmented Generation)**: before answering, search your own documents (often with **embeddings** + a **vector database**) and put the relevant pieces into the prompt, so the model answers from *your* data.

## 👩‍💻 2. Add a tool to your chat

The AI SDK makes tools easy. In **`app/api/chat/route.ts`**, add these imports:
```ts
import { isStepCount, tool } from "ai";
import { z } from "zod";
```
Then give `streamText` a tool and let it run a few steps:
```ts
const result = streamText({
  model: openrouter(modelId),
  instructions: "You are a helpful assistant.",
  messages: await convertToModelMessages(messages),
  tools: {
    getTime: tool({
      description: "Get the current date and time in a timezone",
      inputSchema: z.object({
        timezone: z.string().describe("IANA timezone, e.g. Asia/Kolkata"),
      }),
      execute: async ({ timezone }) => ({
        time: new Date().toLocaleString("en-IN", { timeZone: timezone }),
      }),
    }),
  },
  // Let the model call a tool, read the result, then answer (up to 5 steps)
  stopWhen: isStepCount(5),
});
```
Ask: *"What time is it in Tokyo right now?"* The model calls `getTime`, gets the real time, and answers with it.

> ⚠️ Not every free model supports tool calling. If nothing happens, try another model (on OpenRouter's models page, filter by "Tools").

Want to *show* tool calls in the UI? Message `parts` now include items with `type: "tool-getTime"`. Render them in `components/message.tsx` (for example "🕒 Checking the time…").

## 🧪 3. Next challenges (pick any)

| Level | Challenge | You'll learn |
|---|---|---|
| 🟢 | Rename a chat (double-click the title → input → server action) | forms, server actions, `prisma.chat.update` |
| 🟢 | "Copy answer" button on AI messages | `navigator.clipboard`, client components |
| 🟡 | Search your chats in the sidebar | Prisma `contains` filter, URL search params |
| 🟡 | Let the AI write the chat title (a second `generateText` call) | more AI SDK |
| 🟡 | Add a real tool: weather (a free weather API) or web search | tools + calling third-party APIs |
| 🔴 | Upload an image/PDF and ask about it | file parts, multimodal models |
| 🔴 | RAG: chat with your college notes (embeddings + `pgvector`) | embeddings, vector search |
| 🔴 | Rate-limit each user to N messages per day | counting in the DB, `429` responses |

## 🤖 Ask your agent
- "Explain how tool calling works under the hood. What exactly does the model send back?"
- "Help me build the 'rename chat' feature step by step. Let me write the code."
- "What is MCP and how could I connect an MCP server to this app?"
- "Explain embeddings and vector search with a tiny example."

---

🎓 **You did it!** You went from "what is HTML?" to a full-stack, authenticated, database-backed, AI-powered app on the internet. Keep building. 🚀

⬅️ Back to the [course home](../README.md) · [Glossary](../GLOSSARY.md)
