# Phase 04: React, Vite, Next.js + Rendering (15 min, 💡 + 👩‍💻)

## 🎯 Goal
Understand **why** we use React and Next.js, what Vite is, and what CSR / SSR / SSG mean. Then **create our project**.

---

## 💡 1. Why React?

With plain JS, you change the page by hand: `document.getElementById(...).innerText = ...`. In a big app like ChatGPT, with hundreds of messages, a sidebar and loading states, this gets messy fast.

**React** lets you describe *what the UI should look like for the current data*. When the data changes, React updates the page for you.

```
UI = f(state)        your component is a function: data in → UI out
```

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

### State and hooks
**State** is data that changes over time. Changing it **re-renders** the component. **Hooks** are functions starting with `use…` that add features to components.

```tsx
"use client";
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);   // [current value, setter]
  return <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>;
}
```

| Hook | Used for | In our project |
|---|---|---|
| `useState` | values that change | the input box text, the selected model |
| `useEffect` | run code *after* render (side effects) | scroll to the newest message |
| `useRef` | point at a DOM element | the "bottom of chat" div |
| `useActionState` | form submit state + result | login/register errors |
| `useChat` (AI SDK) | the whole chat: messages, send, status | the chat screen |

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

### Step 5: Save your work
```bash
git add . && git commit -m "Next.js + shadcn setup"
```

## ✅ Checkpoint
- `bun dev` runs, and http://localhost:3000 shows your heading and a working shadcn button.
- `components/ui/` has the 12 components.

## 🧪 Try it yourself
1. Remove `"use client"` from `page.tsx` and read the error. Why does `useState` need a client component?
2. Create `app/about/page.tsx` that returns `<h1>About</h1>` and open `/about`. That's file-based routing.

## 🤖 Ask your agent
- "Explain hydration with a diagram. What is a hydration mismatch error?"
- "In this project, which components are Server Components and which are Client Components, and why?"
- "When would I choose Vite + React instead of Next.js?"

➡️ Next: [Phase 05: Databases](05-database.md)
