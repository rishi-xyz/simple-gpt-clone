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
