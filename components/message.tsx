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
