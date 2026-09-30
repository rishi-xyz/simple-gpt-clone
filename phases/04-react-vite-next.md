# Phase 04: React, Vite, Next.js + Rendering (15 min, 💡 + 👩‍💻)

## 🎯 Goal
Understand **why** we use React and Next.js, what Vite is, and what CSR / SSR / SSG mean. Then **create our project**.

**You'll understand:**
- Why we describe UI as a function of state instead of poking the DOM
- Where a page's HTML gets built, and what that costs
- When a component must say `"use client"` — the #1 beginner error in Next.js
- How folders in `app/` become URLs

> 🌿 **Branch:** `git switch phase-04-nextjs` for the finished result of this phase.
> 📖 Sections marked **▸ Go deeper** are optional. Skip them in the live session.

---

## 💡 1. Why React?

With plain JS, you change the page by hand: `document.getElementById(...).innerText = ...`. In a big app like ChatGPT, with hundreds of messages, a sidebar and loading states, this gets messy fast.

**React** lets you describe *what the UI should look like for the current data*. When the data changes, React updates the page for you.

```
UI = f(state)        your component is a function: data in → UI out
```

Compare. Adding one chat message **by hand**, worrying about *how* to change the page:

```js
const div = document.createElement("div");
div.className = "message";
div.textContent = text;
document.getElementById("messages").appendChild(div);
// ...and now also hide the empty state, scroll to the bottom, disable the button
```

The same thing in **React**, describing *what* it should look like:

```tsx
{messages.map((message) => <Message key={message.id} message={message} />)}
```
Add to the `messages` array, and the screen matches. React works out the minimum set of DOM changes needed (it compares the new output with the previous one, the "virtual DOM" diff). You never write `appendChild` again.

> `key` tells React which item is which when a list changes, so it can move elements instead of rebuilding them. Always give lists a stable, unique `key` — never the array index if the list can reorder.

### Components
A component is a function that returns **JSX** (HTML-like syntax inside JS):

```tsx
function Greeting({ name }: { name: string }) {   // props = inputs
  return <h1 className="text-2xl">Hello {name}!</h1>;
}

<Greeting name="Asha" />   // use it like an HTML tag
```
- **Props**: data passed *into* a component from its parent (read-only).
- JSX uses `className` instead of `class`, and `{ }` for JS expressions.

### State and hooks ⭐

**State** is data that changes over time. Changing it **re-renders** the component. **Hooks** are functions starting with `use…` that add features to components.

```tsx
"use client";
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);   // [current value, setter]
  return <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>;
}
```

#### `useState`: remembering a value

```tsx
const [value, setValue] = useState(initialValue);
//     ↑        ↑                      ↑
//   current  function to           starting value
//   value    change it             (only used on the first render)
```

Why not a plain variable? Because **a normal variable doesn't survive a re-render, and changing it doesn't tell React to update the screen**:

```tsx
let count = 0;                          // ❌ resets every render, no re-render triggered
count++;                                //    the screen never changes

const [count, setCount] = useState(0);  // ✅ React remembers it and re-renders on change
setCount(count + 1);
```

**The three rules that cause most `useState` bugs:**

**1. Setting state is asynchronous.** The variable doesn't change on the next line:
```tsx
function handleClick() {
  setCount(count + 1);
  console.log(count);     // still the old value! the new one arrives on the NEXT render
}
```

**2. Updating based on the previous value needs the function form:**
```tsx
setCount(count + 1);
setCount(count + 1);            // ❌ both read the same old count → +1 total

setCount((c) => c + 1);
setCount((c) => c + 1);         // ✅ each gets the latest → +2 total
```

**3. Never mutate state — replace it.** React compares old and new; the same object means "nothing changed":
```tsx
messages.push(newMessage);              // ❌ same array → no re-render
setMessages([...messages, newMessage]); // ✅ new array → re-renders

user.name = "Ravi";                     // ❌
setUser({ ...user, name: "Ravi" });     // ✅
```
This is why Phase 02 warned about `push` and `sort`. In React, **make a new thing**.

From our chat screen (`components/chat.tsx`):
```tsx
const [input, setInput] = useState("");            // what's typed in the box
const [model, setModel] = useState(initialModel);  // which AI model is picked
```

#### Events: reacting to the user

Event handlers are props starting with `on…`. Pass a **function**, don't call it:
```tsx
<button onClick={handleClick}>      {/* ✅ passing the function */}
<button onClick={handleClick()}>    {/* ❌ runs immediately on render! */}
<button onClick={() => remove(id)}> {/* ✅ arrow wrapper when you need arguments */}
```

| Event | Fires when | Where in our app |
|---|---|---|
| `onClick` | an element is clicked | send button, delete chat, log out |
| `onChange` | an input's value changes | typing in the message box |
| `onSubmit` | a form is submitted | the chat form, login form |
| `onKeyDown` | a key goes down | Enter to send, Shift+Enter for a newline |
| `onValueChange` | a shadcn/Radix component changes | the model dropdown |

**Controlled inputs** are the standard React pattern: state holds the value, and the input reports changes back.

```tsx
const [input, setInput] = useState("");

<Textarea
  value={input}                                  // state → input
  onChange={(e) => setInput(e.target.value)}     // input → state
/>
```
```
   state ──── value ────▶ <input>
     ▲                        │
     └──── onChange ──────────┘     one source of truth
```
Forget `onChange` and the box looks frozen: you type and nothing appears, because `value` is pinned to state that never changes.

The real handlers from `components/chat.tsx`:
```tsx
function handleSubmit(e?: React.FormEvent) {
  e?.preventDefault();                  // stop the browser reloading the page
  if (!input.trim() || isLoading) return;
  sendMessage({ text: input }, { body: { model } });
  setInput("");                         // clear the box
}

// Enter sends, Shift+Enter makes a new line
function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSubmit();
  }
}
```
> `e.preventDefault()` cancels the browser's default behaviour — a form reloading the page, or Enter inserting a newline.

#### `useEffect`: running code after render

`useEffect` is for **side effects**: work outside React's render, like scrolling, timers or subscriptions.

```tsx
useEffect(() => {
  // runs AFTER the render is painted
}, [dependencies]);
```

The **dependency array** controls when it runs — that's the whole hook:

```tsx
useEffect(() => { ... });              // after EVERY render (rarely what you want)
useEffect(() => { ... }, []);          // once, after the first render
useEffect(() => { ... }, [messages]);  // whenever `messages` changes
```

Ours scrolls to the newest message whenever the list changes (`components/chat.tsx`):
```tsx
const bottomRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);              // re-run every time a message arrives
```

**Cleanup:** return a function to undo the effect. React runs it before the next effect and when the component unmounts:
```tsx
useEffect(() => {
  const timer = setInterval(tick, 1000);
  return () => clearInterval(timer);    // ← without this, the timer leaks
}, []);
```

> ⚠️ **Don't reach for `useEffect` by habit.** You don't need it to fetch data in Next.js (Server Components do that), or to compute a value from state (just compute it while rendering). Ours uses it for one thing: scrolling.

#### `useRef`: a box that doesn't re-render

Two uses. Point at a DOM element:
```tsx
const bottomRef = useRef<HTMLDivElement>(null);
<div ref={bottomRef} />                       // bottomRef.current is now that div
bottomRef.current?.scrollIntoView();
```
Or hold a value that changes **without** causing a re-render.

| | `useState` | `useRef` |
|---|---|---|
| Changing it re-renders | ✅ yes | ❌ no |
| Read as | `count` | `ref.current` |
| Use for | anything shown on screen | DOM elements, timer IDs, previous values |

#### The hooks in our app

| Hook | Used for | Where |
|---|---|---|
| `useState` | values that change | input text, chosen model, sidebar open/closed |
| `useEffect` | run code after render | scroll to the newest message |
| `useRef` | point at a DOM element | the "bottom of chat" div |
| `useActionState` | form submit state + result | login/register errors and pending state |
| `useRouter` / `usePathname` | navigate, read the URL | delete a chat, highlight the active one |
| `useChat` (AI SDK) | the whole chat: messages, send, status | the chat screen |

**The rules of hooks**, which the linter enforces:
1. Only call hooks at the **top level** of a component — never inside `if`, loops or nested functions.
2. Only call them from **components** or other hooks.

React tracks hooks by call order, so a conditional hook shifts every later one:
```tsx
if (isLoggedIn) {
  const [name, setName] = useState("");   // ❌ breaks the order
}
const [name, setName] = useState("");     // ✅ always runs
if (isLoggedIn) { /* use it here */ }
```

<details>
<summary><b>▸ Go deeper: why does my effect run twice in development?</b></summary>

In development, React **Strict Mode** deliberately mounts every component twice to surface missing cleanup. It does **not** happen in production.

If running twice breaks something, that's a real bug the check just found — usually a missing cleanup function. Add the cleanup rather than disabling Strict Mode.
</details>

## 💡 2. Vite: the fast dev server & bundler

The browser can't run `.tsx` files or `import` from `node_modules` directly. A **build tool** turns your code into files the browser understands:

- **Dev server**: serves your app locally, with **hot reload** (save a file → the page updates instantly).
- **Bundler**: combines hundreds of files into a few small, optimised `.js` / `.css` files for production.

**Vite** is the most popular build tool for plain React apps (`bun create vite`). It's very fast because in dev it serves files straight to the browser without bundling first. Next.js has its own build tool (**Turbopack**), so we don't use Vite in this project. You'll see Vite a lot in other projects, though.

## 💡 3. Why Next.js?

React is only a **UI library**. It doesn't give you routing, a backend, data loading or SEO. **Next.js** is a **framework** built on React that adds all of these.

| | **React** | **Vite + React** | **Next.js** |
|---|---|---|---|
| What is it | UI library | Build tool + React | Full-stack framework on React |
| Routing (pages/URLs) | ❌ (add a library) | ❌ (add React Router) | ✅ folders = URLs |
| Backend / API routes | ❌ | ❌ (separate server needed) | ✅ built in |
| Rendering | client only | client only (CSR) | CSR, SSR, SSG, ISR, mix per page |
| SEO | weak | weak | strong |
| Good for | — | SPAs, dashboards, learning React | Full apps, sites that need SEO, **our project** |

## 💡 4. CSR vs SSR vs SSG (vs ISR) ⭐

*Where* and *when* is the HTML made?

```
CSR  (Client-Side Rendering)
  Browser ──GET──▶ Server:  "here's an empty <div id=root> + a big JS file"
  Browser runs the JS ─▶ fetches data ─▶ builds the page     (blank screen until JS finishes)

SSR  (Server-Side Rendering)
  Browser ──GET──▶ Server runs React + fetches data NOW ─▶ sends full HTML
  Page shows immediately, then JS "hydrates" it (makes it clickable)

SSG  (Static Site Generation)
  At BUILD time: Server renders HTML once ─▶ saved as files ─▶ served from a CDN
  Super fast, but the same page for everyone until you rebuild

ISR  (Incremental Static Regeneration)
  SSG + "rebuild this page in the background every N seconds"
```

| | CSR | SSR | SSG | ISR |
|---|---|---|---|---|
| HTML made | in browser | on server, per request | at build time | at build + refreshed |
| First load | slow | fast | fastest | fastest |
| Data freshness | live | live | stale until rebuild | refreshed on a timer |
| SEO | ❌ | ✅ | ✅ | ✅ |
| Example | Admin dashboard | **Your chat page** (per-user data) | Blog, docs, landing page | Product page, news |

**Hydration** means React attaching click handlers to HTML that was rendered on the server.

## 💡 5. Server Components vs Client Components (Next.js App Router)

In Next.js, components are **Server Components by default**:

| Server Component (default) | Client Component (`"use client"` at top) |
|---|---|
| Runs **only on the server** | Runs in the **browser** (also pre-rendered on the server) |
| Can be `async`, can `await` the database directly | Can use `useState`, `useEffect`, `onClick` |
| Can read secrets | ❌ never put secrets here |
| Sends **no JS** to the browser (fast) | Adds JS to the bundle |
| Ex: `sidebar.tsx` (loads chats from DB) | Ex: `chat.tsx` (typing, sending, streaming) |

**Server Actions** (`"use server"`) are functions that run on the server, but you can call them from a form or a button in the browser. Next.js creates the API request for you. We use them for login and for deleting chats.

### When do I need `"use client"`?

This is the error you'll hit most often. The rule:

> Add `"use client"` **only** when the file uses state, effects, refs, browser events or browser APIs. Otherwise leave it off.

| You use… | Needs `"use client"` |
|---|---|
| `useState`, `useEffect`, `useRef`, `useChat` | ✅ yes |
| `onClick`, `onChange`, `onSubmit` handlers | ✅ yes |
| `window`, `document`, `localStorage`, `document.cookie` | ✅ yes |
| `await prisma…`, `await auth()`, secrets | ❌ no — must stay a Server Component |
| Just showing props / JSX | ❌ no |

The error looks like this, and it means "you used a hook in a Server Component":
```
You're importing a component that needs `useState`. This React hook only works
in a Client Component. To fix, mark the file with the "use client" directive.
```

**Important:** `"use client"` marks a **boundary**, not a whole subtree of files. Everything *imported by* a client component also ships to the browser. So push `"use client"` as far **down** the tree as you can, keeping data-loading parents on the server.

In our app that split is deliberate:
```
app/chat/[id]/page.tsx     server  → loads messages from the database
  └── components/chat.tsx  client  → typing, streaming, state
        └── message.tsx    server-safe → just renders text
```

<details>
<summary><b>▸ Go deeper: passing a Server Component into a Client Component</b></summary>

A client component can't *import* a server component, but it can receive one as `children`. We use this for the mobile sidebar in Phase 08:

```tsx
// app/chat/layout.tsx — a Server Component
<MobileSidebar>      {/* client: handles open/close state */}
  <Sidebar />        {/* server: queries the database */}
</MobileSidebar>
```
The `Sidebar` is rendered **on the server**, and only its finished output is handed to the client component. That's how we get a database-backed sidebar inside an interactive slide-out panel, without shipping Prisma to the browser.
</details>

## 💡 6. App Router: folders are URLs

```
app/
  layout.tsx                → wraps every page (html, body, fonts)
  page.tsx                  → "/"
  login/page.tsx            → "/login"
  chat/layout.tsx           → wraps everything under /chat (sidebar)
  chat/[id]/page.tsx        → "/chat/abc123"  ([id] = dynamic part of the URL)
  api/chat/route.ts         → "/api/chat"     (an API endpoint: export GET/POST functions)
```

---

## 👩‍💻 Build it: create the project

### Step 1: Create a Next.js app
```bash
bunx create-next-app@latest chatgpt --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-bun
cd chatgpt
bun dev
```
Open http://localhost:3000. You should see the Next.js starter page. 🎉
(npm users: `npx create-next-app@latest chatgpt …` without `--use-bun`, then `npm run dev`.)

**What you got:** `app/` (pages), `public/` (images), `package.json`, `tsconfig.json` (TypeScript settings, including the `@/*` alias), `next.config.ts`, and `app/globals.css` with **Tailwind** already set up.

> **Tailwind CSS** means styling with small utility classes right in your JSX: `className="flex gap-2 rounded-md p-4 text-sm"`. There's no separate CSS file to maintain.

### Step 2: Add shadcn/ui (ready-made components)
**shadcn/ui** isn't a package you install. It **copies component source code into your project** (`components/ui/`), so you own it and can change it. The components are built on **Radix UI**, which makes them accessible.

```bash
bunx shadcn@latest init            # pick "Neutral" as the base color
bunx shadcn@latest add avatar button card dropdown-menu input label scroll-area select separator sheet sonner textarea
```
This creates `components.json`, `lib/utils.ts` (the `cn()` class helper), `components/ui/*.tsx` and theme colours in `app/globals.css`.

### Step 3: The root layout
`app/layout.tsx` wraps **every** page: `<html>`, `<body>`, fonts and page metadata. Replace it with:

**`app/layout.tsx`**
```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChatGPT Clone",
  description: "A simple ChatGPT clone built with Next.js and the AI SDK",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
```

`LayoutProps<"/">` is a type that Next.js 16 generates for each route, so `children` is typed for you.

### Step 4: Play with state (temporary page)
Replace `app/page.tsx` with a small client component, just to feel how React works. We'll replace it in Phase 07.

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [count, setCount] = useState(0);
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-semibold">ChatGPT Clone coming soon</h1>
      <Button onClick={() => setCount(count + 1)}>Clicked {count} times</Button>
    </main>
  );
}
```

### Step 5: The hooks playground (highly recommended)
The `phase-04-nextjs` branch includes `app/hooks-demo/page.tsx`, an interactive page covering everything above. Copy it into your project, or switch to the branch:

```bash
git switch phase-04-nextjs      # then: bun install && bun dev
```
Open **http://localhost:3000/hooks-demo**. It has five live sections:

| Section | Try this |
|---|---|
| **1. useState** | Compare the `+2 (function form)` and `+2 (buggy)` buttons. Only one adds 2 — that's the stale-value trap |
| **2. Controlled input** | Type and watch the counter. Press Enter to send, Shift+Enter for a newline (exactly how the real chat box behaves) |
| **3. map / filter / reduce** | Tick the checkbox to filter the list, delete items, and watch the reduce total update |
| **4. useEffect** | Start the timer, then watch your **browser tab title** change. Pause it and the cleanup runs |
| **5. useRef** | Focus the input from code, and see the render count survive re-renders without causing them |

> 🧪 **Best exercise of the whole course:** open that file and break things. Remove `onChange` from the textarea and try to type. Delete the `return () => clearInterval(timer)` cleanup, start/pause a few times, and watch the timer speed up as leaked intervals stack.

### Step 6: Save your work
```bash
git add . && git commit -m "Next.js + shadcn setup"
```

## ✅ Checkpoint
- `bun dev` runs, and http://localhost:3000 shows your heading and a working shadcn button.
- `components/ui/` has the 12 components.
- You can explain when a file needs `"use client"` and when it must not have it.
- On `/hooks-demo`: the counter increments, the textarea types, and the timer's tab title updates.

## 🧪 Try it yourself
1. Remove `"use client"` from `page.tsx` and read the error. Why does `useState` need a client component?
2. Create `app/about/page.tsx` that returns `<h1>About</h1>` and open `/about`. That's file-based routing.
3. In the hooks demo, replace `setChats(chats.filter(...))` with `chats.splice(...)`. The item won't disappear — explain why.
4. Add a "pin" button to section 3 that toggles a chat's `pinned` field. You'll need `map` to change one item while keeping the rest:
   ```tsx
   setChats(chats.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)));
   ```
5. Change the `useEffect` dependency array in section 4 to `[]` and start the timer. What breaks, and why?

## 🤖 Ask your agent
- "Explain hydration with a diagram. What is a hydration mismatch error?"
- "In this project, which components are Server Components and which are Client Components, and why?"
- "When would I choose Vite + React instead of Next.js?"
- "Walk me through `app/hooks-demo/page.tsx` section by section."
- "Why does mutating state not re-render in React? Explain reference equality."

➡️ Next: [Phase 05: Databases](05-database.md)
