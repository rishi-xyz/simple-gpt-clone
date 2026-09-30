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
