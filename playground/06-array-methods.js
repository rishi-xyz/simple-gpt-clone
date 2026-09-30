// Run me:  bun playground/06-array-methods.js
// Phase 02 · map / filter / reduce and friends, on data shaped like our app's

const chats = [
  { id: "c1", title: "Pasta recipe",    messages: 4,  pinned: true  },
  { id: "c2", title: "Learn TypeScript", messages: 0,  pinned: false },
  { id: "c3", title: "Debug my code",   messages: 12, pinned: false },
  { id: "c4", title: "Trip planning",   messages: 7,  pinned: true  },
];

console.log("--- map: transform every item ---");
console.log(chats.map((c) => c.title));

console.log("\n--- filter: keep some items ---");
console.log(chats.filter((c) => c.messages > 0).map((c) => c.title));

console.log("\n--- find / some / every ---");
console.log("first pinned:", chats.find((c) => c.pinned)?.title);
console.log("any empty?  :", chats.some((c) => c.messages === 0));
console.log("all pinned? :", chats.every((c) => c.pinned));

console.log("\n--- reduce: squash into one value ---");
const total = chats.reduce((sum, c) => sum + c.messages, 0);
console.log("total messages:", total);

// reduce step by step — this is what actually happens above
let sum = 0;
for (const c of chats) {
  console.log(`  sum=${sum} + ${c.messages} = ${sum + c.messages}`);
  sum += c.messages;
}

console.log("\n--- chaining ---");
const busy = chats
  .filter((c) => c.messages > 0)
  .map((c) => `${c.title} (${c.messages})`)
  .join(" · ");
console.log(busy);

console.log("\n--- map vs forEach ---");
console.log("map    returns:", chats.map((c) => c.messages));
console.log("forEach returns:", chats.forEach((c) => c.messages));

console.log("\n--- mutation danger ---");
const nums = [3, 1, 2];
const copySorted = [...nums].sort((a, b) => a - b);
console.log("original after copy-sort:", nums, "→ sorted copy:", copySorted);
nums.sort((a, b) => a - b);
console.log("original after .sort()  :", nums, "← it changed!");

// 🧪 YOUR TURN
// 1. Get the titles of chats with more than 5 messages.
// 2. Count how many chats are pinned (try filter, then try reduce).
// 3. Find the chat with the MOST messages.
