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
