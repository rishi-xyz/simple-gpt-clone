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
