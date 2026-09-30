// Run me:  bun playground/04-types.ts
// Phase 02 · TypeScript

type Message = {
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
};

function lastText(messages: Message[]): string {
  return messages[messages.length - 1].content;
}

const chat: Message[] = [
  { role: "user", content: "What is a closure?" },
  { role: "assistant", content: "A closure is a function that remembers..." },
];

console.log(lastText(chat));

// Uncomment to see TypeScript catch the bug before you run it:
// const bad: Message = { role: "bot", content: "hi" };
