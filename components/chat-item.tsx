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
