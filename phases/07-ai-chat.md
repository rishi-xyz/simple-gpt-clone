# Phase 07: The AI Chat: LLMs, APIs, Streaming, Vercel AI SDK (20 min, 💡 + 👩‍💻)

## 🎯 Goal
Understand how apps talk to AI models, then build the heart of our app: **send a message → stream the answer → save it**.

---

## 💡 1. What is an LLM?

A **Large Language Model** (GPT, Claude, Gemini, Llama, Qwen, Gemma…) is a program trained on huge amounts of text. It does one thing: **given some text, predict the next piece of text**, over and over.

- **Tokens**: models read and write in chunks of about ¾ of a word. `"Hello world!"` ≈ 3 tokens. Pricing and limits are counted in tokens.
- **Context window**: how many tokens the model can "see" at once (the whole conversation must fit).
- **The model has no memory.** Every time, we send **the whole conversation**. That's why our database stores all messages.
- **Roles**: `system` (instructions: "You are a helpful assistant"), `user` (you) and `assistant` (the AI).

```json
[
  { "role": "system",    "content": "You are a helpful assistant." },
  { "role": "user",      "content": "What's a closure in JS?" },
  { "role": "assistant", "content": "A closure is..." },
  { "role": "user",      "content": "Show an example" }      ← the model continues from here
]
```

## 💡 2. Calling an AI through an API

Models run on the provider's powerful GPUs. We call them over **HTTP**, like any other API, with an **API key**:

```
our server ──POST https://openrouter.ai/api/v1/chat/completions──▶ OpenRouter ──▶ the model
           headers: Authorization: Bearer sk-or-…
           body: { model: "google/gemma-4-31b-it:free", messages: [...] }
```
⚠️ The API key must **only** be used on the **server**. If it's in browser code, anyone can steal it and spend your money.

**OpenRouter** gives you **one API and one key for hundreds of models** from different companies, including free ones (model IDs ending in `:free`). That's why our app can have a model dropdown.

## 💡 3. Streaming

A full answer can take 10+ seconds. Instead of waiting, the server sends the answer **piece by piece** as the model generates it. That's the ChatGPT "typing" effect.

```
normal:     request ─────────── wait 10s ───────────▶ [whole answer]
streaming:  request ─▶ "A" ─▶ " closure" ─▶ " is" ─▶ " a" ─▶ ... ─▶ [done]
```
Under the hood, it's one HTTP response that stays open and sends chunks (Server-Sent Events).

## 💡 4. The Vercel AI SDK

Each AI provider has a slightly different API, and streaming by hand is painful. The **AI SDK** (`ai` package) gives us one simple toolkit:

| Piece | Where | Does |
|---|---|---|
| `streamText({ model, instructions, messages })` | server | calls the model and streams the answer |
| `openrouter("model-id")` | server | a **provider**: tells the SDK *which* model and API to use (swap in `anthropic(...)`, `openai(...)`, etc. with one line) |
| `convertToModelMessages()` | server | turns UI messages into the format models expect |
| `createUIMessageStreamResponse` + `toUIMessageStream` | server | sends the stream to the browser, and gives us `onEnd` to save the answer |
| `useChat()` | browser (React hook) | holds `messages`, `sendMessage()`, `status`, `stop()` and `error`, and updates the UI as chunks arrive |

**UI messages** have `parts` (text, images, tool calls…) instead of a single `content` string:
```ts
{ id: "m1", role: "assistant", parts: [{ type: "text", text: "Hello!" }] }
```

## 💡 5. The full flow of one message

```
components/chat.tsx                app/api/chat/route.ts                         OpenRouter
────────────────────               ─────────────────────                          ──────────
sendMessage({text}, {body:{model}})
   │  POST /api/chat {id, messages, model}
   └──────────────────────────────▶ 1. auth()        → logged in?        (401 if not)
                                    2. find chat     → is it yours?      (404 if not)
                                    3. save user msg → DB (+ set title)
                                    4. streamText()  ─────────────────────────────▶ model
   ◀══════ chunks stream back ══════ 5. stream response ◀═══════════ tokens ═══════
UI updates word by word             6. onEnd → save assistant msg → DB
onFinish → router.refresh() (sidebar gets the new title)
```

---

## 👩‍💻 Build it

### Step 1: Install and get a key
```bash
bun add ai @ai-sdk/react @openrouter/ai-sdk-provider
```
Create a key at https://openrouter.ai/keys and put it in `.env`:
```bash
OPENROUTER_API_KEY="sk-or-v1-..."
```
The OpenRouter provider reads `OPENROUTER_API_KEY` automatically.

### Step 2: The list of models
**`lib/models.ts`**
```ts
// Free models on OpenRouter (the ":free" ones cost nothing).
// The free list changes often — see https://openrouter.ai/models?max_price=0
export const MODELS = [
  { id: "google/gemma-4-31b-it:free", label: "Gemma 4 31B" },
  { id: "qwen/qwen3.8-27b:free", label: "Qwen3.8 27B" },
  { id: "nvidia/nemotron-3-ultra-550b-a55b:free", label: "Nemotron 3 Ultra" },
  { id: "thinkingmachines/inkling:free", label: "Inkling" },
  { id: "inclusionai/ling-3.0-flash-sante:free", label: "inclusionai: Ling 3.0 Flash Sante" },
];

export const DEFAULT_MODEL = MODELS[0].id;
```

> 🔄 **Free models change often.** If a model returns an error, pick current ones from https://openrouter.ai/models?max_price=0 and update this list.

### Step 3: The API route, the backend of the chat ⭐
`route.ts` files are API endpoints. Exporting a function named `POST` handles `POST /api/chat`.

**`app/api/chat/route.ts`**
```ts
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_MODEL, MODELS } from "@/lib/models";

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

// Get the plain text out of a UI message (messages are made of "parts")
function getText(message: UIMessage) {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");
}

export async function POST(req: Request) {
  // 1. Only logged-in users can chat
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return new Response("Unauthorized", { status: 401 });

  // 2. Read what the browser sent us
  const { id, messages, model } = (await req.json()) as {
    id: string;
    messages: UIMessage[];
    model: string;
  };

  // 3. Make sure this chat belongs to this user
  const chat = await prisma.chat.findUnique({ where: { id } });
  if (!chat || chat.userId !== userId) {
    return new Response("Chat not found", { status: 404 });
  }

  // 4. Save the user's new message (and use it as the title if it's the first one)
  const userText = getText(messages[messages.length - 1]);
  await prisma.message.create({
    data: { chatId: id, role: "user", content: userText },
  });
  if (chat.title === "New chat") {
    await prisma.chat.update({
      where: { id },
      data: { title: userText.slice(0, 40) },
    });
  }

  // 5. Ask the AI model (only allow models from our list)
  const modelId = MODELS.some((m) => m.id === model) ? model : DEFAULT_MODEL;
  const result = streamText({
    model: openrouter(modelId),
    instructions: "You are a helpful assistant.",
    messages: await convertToModelMessages(messages),
  });

  // 6. Stream the answer back, and save it to the database when it's done
  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages: messages,
      onError: (error) =>
        error instanceof Error ? error.message : "Something went wrong",
      onEnd: async ({ responseMessage }) => {
        const text = getText(responseMessage);
        if (text) {
          await prisma.message.create({
            data: { chatId: id, role: "assistant", content: text },
          });
        }
      },
    }),
  });
}
```

Notice the security:
- Step 1 = **authentication**, and step 3 = **authorization** (it's *your* chat).
- Step 5 only allows models **from our list**, so nobody can send a request that uses an expensive model on your key.

### Step 4: The home page: find or create a chat
Now replace the temporary `app/page.tsx` with the real one. Visiting `/` finds an empty chat (or makes a new one) and **redirects** to it:

**`app/page.tsx`**
```tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Visiting "/" starts a new chat.
// We reuse the user's latest empty chat (if any) so we don't create lots of empty ones.
export default async function Home() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const chat =
    (await prisma.chat.findFirst({
      where: { userId, messages: { none: {} } },
      orderBy: { createdAt: "desc" },
    })) ?? (await prisma.chat.create({ data: { userId } }));

  redirect(`/chat/${chat.id}`);
}
```

### Step 5: The chat page (Server Component: loads from the DB)
`[id]` is the dynamic part of the URL. In Next.js 16, `params` is async, so we `await` it. This page runs on the server: it loads the messages (**SSR**) and passes them to the client component.

**`app/chat/[id]/page.tsx`**
```tsx
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { UIMessage } from "ai";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Chat } from "@/components/chat";
import { DEFAULT_MODEL, MODELS } from "@/lib/models";

export default async function ChatPage({ params }: PageProps<"/chat/[id]">) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const chat = await prisma.chat.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!chat || chat.userId !== session.user.id) notFound();

  // Convert DB rows into the message format the AI SDK's useChat expects
  const initialMessages: UIMessage[] = chat.messages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    parts: [{ type: "text", text: m.content }],
  }));

  // The model picked last time (saved in a cookie by the model dropdown)
  const savedModel = (await cookies()).get("model")?.value;
  const model = MODELS.some((m) => m.id === savedModel) ? savedModel! : DEFAULT_MODEL;

  return <Chat id={chat.id} initialMessages={initialMessages} initialModel={model} />;
}
```

### Step 6: The model dropdown
**`components/model-select.tsx`**
```tsx
"use client";

import { MODELS } from "@/lib/models";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

// Dropdown to pick which AI model answers
export function ModelSelect({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-52">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {MODELS.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            {model.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

### Step 7: One message bubble
For now this shows plain text. We add Markdown in Phase 08. Write this simple version first:
```tsx
import type { UIMessage } from "ai";

// One chat bubble. User messages sit on the right, AI answers take the full width.
export function Message({ message }: { message: UIMessage }) {
  const text = message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl bg-muted px-4 py-2">
          {text}
        </div>
      </div>
    );
  }

  return <div className="whitespace-pre-wrap">{text}</div>;
}
```
Save it as **`components/message.tsx`**.

### Step 8: The chat screen (Client Component) ⭐
This one is a client component because it has state, typing and streaming. `useChat` does the heavy lifting.

**`components/chat.tsx`**
```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ArrowUpIcon, SquareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Message } from "@/components/message";
import { ModelSelect } from "@/components/model-select";

type Props = {
  id: string;
  initialMessages: UIMessage[];
  initialModel: string;
};

export function Chat({ id, initialMessages, initialModel }: Props) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [model, setModel] = useState(initialModel);
  const bottomRef = useRef<HTMLDivElement>(null);

  // useChat handles sending messages to /api/chat and streaming the answer back
  const { messages, sendMessage, status, stop, error } = useChat({
    id,
    messages: initialMessages,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    // Refresh the sidebar so a new chat shows up with its title
    onFinish: () => router.refresh(),
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Remember the chosen model in a cookie, so the server can read it next time
  function changeModel(value: string) {
    setModel(value);
    document.cookie = `model=${value}; path=/; max-age=31536000`;
  }

  // Scroll to the newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    // Send the text, plus which model to use
    sendMessage({ text: input }, { body: { model } });
    setInput("");
  }

  // Enter sends, Shift+Enter makes a new line
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b p-3">
        <ModelSelect value={model} onChange={changeModel} />
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
          {messages.length === 0 && (
            <div className="mt-32 text-center">
              <h1 className="text-3xl font-semibold">How can I help you today?</h1>
            </div>
          )}

          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}

          {status === "submitted" && (
            <p className="animate-pulse text-muted-foreground">Thinking...</p>
          )}

          {error && (
            <p className="rounded-md border border-destructive/50 p-3 text-sm text-destructive">
              {error.message || "Something went wrong. Try again or pick another model."}
            </p>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input box */}
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl px-4 pb-4">
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message ChatGPT Clone..."
            rows={1}
            className="max-h-48 min-h-14 resize-none rounded-2xl pr-14"
          />
          {isLoading ? (
            <Button
              type="button"
              size="icon"
              onClick={stop}
              className="absolute right-2 bottom-2 rounded-full"
              aria-label="Stop"
            >
              <SquareIcon />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim()}
              className="absolute right-2 bottom-2 rounded-full"
              aria-label="Send"
            >
              <ArrowUpIcon />
            </Button>
          )}
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          AI can make mistakes. Check important info.
        </p>
      </form>
    </div>
  );
}
```

Things to point out:
- `status` goes `"ready"` → `"submitted"` (waiting for the first token) → `"streaming"` → `"ready"`.
- `sendMessage({ text }, { body: { model } })`: the extra `body` field is how `model` reaches the API route.
- The chosen model is saved in a **cookie** (`document.cookie = …`), so the *server* page can read it next time (Step 5: `cookies().get("model")`).

## ✅ Checkpoint
- Log in → you land on `/chat/<some-id>` with "How can I help you today?"
- Send "Explain promises in one paragraph". The answer **streams in**.
- Reload the page: the conversation is still there (it was loaded from the DB).
- Switch the model in the dropdown and ask again.
- In Prisma Studio, the `Message` table has both the `user` and `assistant` rows.

## ⚠️ Common errors
| Symptom | Fix |
|---|---|
| Red error box: "No endpoints found" / 404 from the model | That free model was removed. Update `lib/models.ts` |
| `401` / "Missing API key" | `OPENROUTER_API_KEY` isn't in `.env`, or you didn't restart `bun dev` |
| Rate limit (429) | Free models have limits. Wait a bit or switch models |

## 🧪 Try it yourself
1. Change `instructions` in the route to make the assistant answer like a pirate 🏴‍☠️. The system prompt controls behaviour.
2. Open DevTools → Network, send a message, and click the `chat` request. Watch the **response stream** in.
3. Try to open another user's chat URL (log in as a second user). You should get a 404. That's authorization working.

## 🤖 Ask your agent
- "Explain every line of `app/api/chat/route.ts` to me."
- "How would I switch this project from OpenRouter to the Anthropic provider?"
- "What's the difference between UIMessage and ModelMessage in the AI SDK?"
- "What are Server-Sent Events, and how does streaming work over HTTP?"

➡️ Next: [Phase 08: Sidebar & polish](08-sidebar-and-polish.md)
