// Run me:  bun playground/01-basics.js
// Phase 02 · variables, objects, arrays, functions

const name = "Asha";
let count = 0;
count = count + 1;

console.log(`Hello ${name}, you have ${count} new message`);

const user = { id: "u1", name: "Asha", email: "asha@mail.com" };
console.log(user.name, user.email);

const messages = [
  { role: "user", content: "hi" },
  { role: "assistant", content: "Hello!" },
];
messages.push({ role: "user", content: "how are you?" });
console.log("messages:", messages.length);

const add = (a, b) => a + b;
console.log("2 + 3 =", add(2, 3));
