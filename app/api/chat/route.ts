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
