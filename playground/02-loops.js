// Run me:  bun playground/02-loops.js
// Phase 02 · loops and array methods

const nums = [1, 2, 3, 4];

console.log("map    ", nums.map((n) => n * 2));
console.log("filter ", nums.filter((n) => n > 2));
console.log("some   ", nums.some((n) => n > 3));
console.log("find   ", nums.find((n) => n > 1));
console.log("reduce ", nums.reduce((sum, n) => sum + n, 0));
console.log("join   ", nums.join(", "));

for (const n of nums) console.log("for..of", n);

// The real line from app/api/chat/route.ts — getting text out of a message
const message = {
  parts: [
    { type: "text", text: "Hello " },
    { type: "text", text: "world" },
  ],
};
const text = message.parts
  .map((part) => (part.type === "text" ? part.text : ""))
  .join("");
console.log("message text:", text);
