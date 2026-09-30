# Phase 08: Sidebar & Polish (5–10 min, 👩‍💻)

## 🎯 Goal
Finish the app: a sidebar listing your chats (with delete), a user menu with logout, a mobile menu, and Markdown answers.

> 🌿 **Branch:** `git switch phase-08-sidebar` for the finished result of this phase.
> 🔍 **See what this phase adds:** `git diff phase-07-ai-chat..phase-08-sidebar --stat`

## 💡 Quick concepts
- **Nested layouts**: `app/chat/layout.tsx` wraps every `/chat/*` page, so the sidebar stays on screen while only the page part changes.
- **Server Components fetch data directly**: the sidebar is an `async` component that queries Prisma. There's no API route and no `useEffect`.
- **`revalidatePath`**: after a server action changes data (delete a chat), it tells Next.js to re-render the affected pages with fresh data.
- **Composition**: a Server Component (`Sidebar`) can be passed as `children` into a Client Component (`MobileSidebar`).

---

## 👩‍💻 Build it

### Step 1: Markdown support
AI answers use Markdown (`**bold**`, lists, code blocks). We render it with `react-markdown` and style it with Tailwind's typography plugin (`prose` classes).
```bash
bun add react-markdown
bun add -d @tailwindcss/typography
```
In **`app/globals.css`**, add the plugin line under the existing `@import` lines at the top:
```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@plugin "@tailwindcss/typography";
```
Now update the message bubble to its final version:

**`components/message.tsx`**
```tsx
import ReactMarkdown from "react-markdown";
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

  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}
```

### Step 2: One chat in the list (Client Component: it needs `onClick` + current URL)
**`components/chat-item.tsx`**
```tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { TrashIcon } from "lucide-react";
import { deleteChat } from "@/app/actions";
import { cn } from "@/lib/utils";

// One chat in the sidebar list, with a delete button that shows on hover.
export function ChatItem({ id, title }: { id: string; title: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = pathname === `/chat/${id}`;

  async function handleDelete() {
    await deleteChat(id);
    // If we deleted the chat we're looking at, start a new one
    if (isActive) router.push("/");
  }

  return (
    <div
      className={cn(
        "group flex items-center rounded-md text-sm hover:bg-accent",
        isActive && "bg-accent",
      )}
    >
      <Link href={`/chat/${id}`} className="flex-1 truncate px-2 py-2">
        {title}
      </Link>
      <button
        onClick={handleDelete}
        className="mr-1 rounded p-1 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"
        aria-label="Delete chat"
      >
        <TrashIcon className="size-4" />
      </button>
    </div>
  );
}
```

### Step 3: The user menu
**`components/user-menu.tsx`**
```tsx
"use client";

import { LogOutIcon } from "lucide-react";
import { logout } from "@/app/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function UserMenu({ name, email, image }: Props) {
  const displayName = name || email || "User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md p-2 text-left text-sm hover:bg-accent">
        <Avatar className="size-7">
          <AvatarImage src={image ?? undefined} />
          <AvatarFallback>{displayName[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="truncate">{displayName}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
          {email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()}>
          <LogOutIcon /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### Step 4: The sidebar (Server Component: reads the DB)
**`components/sidebar.tsx`**
```tsx
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ChatItem } from "@/components/chat-item";
import { UserMenu } from "@/components/user-menu";

// The left column: "New chat" button, list of chats, and the user menu.
export async function Sidebar() {
  const session = await auth();
  const user = session?.user;

  // Only show chats that have at least one message
  const chats = await prisma.chat.findMany({
    where: { userId: user?.id, messages: { some: {} } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <Button asChild variant="outline" className="justify-start">
        {/* prefetch off: visiting "/" creates a chat, so only do it on click */}
        <Link href="/" prefetch={false}>
          <PlusIcon /> New chat
        </Link>
      </Button>

      <nav className="-mx-1 flex flex-1 flex-col gap-1 overflow-y-auto px-1">
        {chats.length === 0 && (
          <p className="px-2 py-4 text-sm text-muted-foreground">No chats yet</p>
        )}
        {chats.map((chat) => (
          <ChatItem key={chat.id} id={chat.id} title={chat.title} />
        ))}
      </nav>

      {user && <UserMenu name={user.name} email={user.email} image={user.image} />}
    </div>
  );
}
```

### Step 5: The mobile slide-out panel
**`components/mobile-sidebar.tsx`**
```tsx
"use client";

import { useState } from "react";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// On small screens the sidebar lives inside a slide-out panel.
export function MobileSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <MenuIcon />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetTitle className="sr-only">Chats</SheetTitle>
        {/* Close the panel when a link inside it is clicked */}
        <div
          className="h-full"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) setOpen(false);
          }}
        >
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

### Step 6: The chat layout
**`app/chat/layout.tsx`**
```tsx
import { Sidebar } from "@/components/sidebar";
import { MobileSidebar } from "@/components/mobile-sidebar";

export default function ChatLayout({ children }: LayoutProps<"/chat">) {
  return (
    <div className="flex h-dvh">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-muted/40 md:block">
        <Sidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar with a menu button */}
        <div className="flex items-center border-b p-2 md:hidden">
          <MobileSidebar>
            <Sidebar />
          </MobileSidebar>
          <span className="font-semibold">ChatGPT Clone</span>
        </div>
        {children}
      </div>
    </div>
  );
}
```

## ✅ Checkpoint: the full app works! 🎉
- The sidebar lists your chats with titles taken from the first message.
- "New chat" starts a fresh conversation. Hover a chat and click 🗑 to delete it.
- AI answers render **bold**, lists and code blocks.
- Shrink the browser window: a ☰ menu button appears with a slide-out sidebar.
- The avatar menu → **Log out** works.

Compare your project with [`../chatgpt`](../chatgpt). It should match file for file.

```bash
git add . && git commit -m "complete chatgpt clone"
```

## 🧪 Try it yourself
1. Show each chat's date under its title in the sidebar (`chat.createdAt.toLocaleDateString()`).
2. Add a dark-mode toggle (the `next-themes` package + the `dark` class).

## 🤖 Ask your agent
- "Why is `Sidebar` a Server Component but `ChatItem` a Client Component?"
- "What would happen if I removed `revalidatePath` from `deleteChat`?"
- "Why does the 'New chat' link use `prefetch={false}`?"

➡️ Next: [Phase 09: Deploy](09-deploy.md)
