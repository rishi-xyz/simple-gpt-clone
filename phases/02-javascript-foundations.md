# Phase 02: JavaScript & TypeScript Foundations (15 min)

## 🎯 Goal
Learn the JavaScript you'll *actually see* in our project, and why we write it as TypeScript.

**You'll understand:**
- The syntax that shows up on almost every line of this project
- How to transform lists with `map` / `filter` / `reduce` instead of manual loops
- Why slow work needs `async` / `await`, and what a Promise really is
- What TypeScript adds, and how to read a type error

> 💻 **Run every snippet.** Switch to the branch with the runnable versions:
> ```bash
> git switch phase-02-javascript
> bun playground/01-basics.js
> bun playground/02-loops.js
> bun playground/03-async.js
> bun playground/04-types.ts
> ```
> Or paste snippets into `bun repl`, `node`, or the browser console (`F12` → Console).

> 📖 Sections marked **▸ Go deeper** are optional. Skip them in the live session.

---

## 💡 1. Variables and types

```js
const name = "Asha";     // const = can't be reassigned (use this by default)
let count = 0;           // let = can change
count = count + 1;
// var → old style, avoid it

// Basic types
"text"            // string
42, 3.14          // number
true, false       // boolean
null              // "empty on purpose"
undefined         // "not set yet"

// Template strings (backticks): put values inside ${}
const greeting = `Hello ${name}, you have ${count} new message`;
```

## 💡 2. Objects and arrays

```js
// Object = a group of named values
const user = { id: "u1", name: "Asha", email: "asha@mail.com" };
user.name;              // "Asha"

// Array = an ordered list
const messages = [
  { role: "user", content: "hi" },
  { role: "assistant", content: "Hello!" },
];
messages.length;        // 2
messages[0].content;    // "hi"
messages.push({ role: "user", content: "how are you?" });
```

## 💡 3. Functions

```js
// Classic function
function add(a, b) {
  return a + b;
}

// Arrow function (same thing, shorter). You'll see these everywhere in React
const add2 = (a, b) => a + b;

// Functions can be passed around like values
button.addEventListener("click", () => console.log("clicked"));
```

## 💡 4. Conditions and loops

```js
if (user) { /* ... */ } else { /* ... */ }

// Ternary: a one-line if/else (used a LOT in React)
const label = pending ? "Please wait..." : "Log in";

// Optional chaining: don't crash if something is missing
const id = session?.user?.id;   // undefined instead of an error

// Nullish default
const model = savedModel ?? "default-model";

// Loops
for (let i = 0; i < 3; i++) console.log(i);   // 0 1 2
for (const m of messages) console.log(m.content);
```

### Array methods: loops you'll use every day

```js
const nums = [1, 2, 3, 4];

nums.map((n) => n * 2);             // [2, 4, 6, 8]    transform each item
nums.filter((n) => n > 2);          // [3, 4]          keep some items
nums.some((n) => n > 3);            // true            is at least one true?
nums.find((n) => n > 1);            // 2               first match
nums.reduce((sum, n) => sum + n, 0);// 10              combine into one value
nums.join(", ");                    // "1, 2, 3, 4"
```

From our project (`app/api/chat/route.ts`), this gets the text out of a message:
```ts
message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");
```
And in React we turn arrays into UI with `.map`:
```tsx
{messages.map((message) => <Message key={message.id} message={message} />)}
```

## 💡 5. Destructuring and spread

```js
const { name, email } = user;            // pull fields out of an object
const [first, second] = messages;        // pull items out of an array
const { id, messages: msgs } = await req.json();   // rename while pulling

const updated = { ...user, name: "Ravi" };    // copy + change
const more = [...messages, newMessage];       // copy + add
```

## 💡 6. Modules: import / export

Each file is a module. Share code with `export`, use it with `import`.

```ts
// lib/models.ts
export const DEFAULT_MODEL = "google/gemma-4-31b-it:free";

// somewhere else
import { DEFAULT_MODEL } from "@/lib/models";   // "@/" = project root (set up in tsconfig.json)
import ReactMarkdown from "react-markdown";      // from a package in node_modules
```

---

## 💡 7. Async: callbacks → Promises → async/await ⭐

JavaScript runs **one thing at a time** (it's *single-threaded*). Some things are slow: network requests, the database, the AI. JS doesn't *wait and freeze*. It starts the slow task and keeps going.

```
sync:   [task A ██████████] [task B ██] [task C ██]        ← everything waits in line
async:  [start fetch]──────────waiting on network──────────[handle result]
        [other code runs meanwhile ██ ██ ██]
```

**1) Callbacks (old way):** "call this function when you're done". Nesting many of them makes code hard to read (*callback hell*).
```js
setTimeout(() => console.log("1 second later"), 1000);
```

**2) Promise:** an object that means *"I'll have a value later"*. It is **pending**, then **fulfilled** (success) or **rejected** (error).
```js
fetch("https://api.github.com/users/torvalds")
  .then((res) => res.json())
  .then((user) => console.log(user.name))
  .catch((err) => console.error("failed", err));
```

**3) async / await (modern way):** the same Promises, but the code reads top to bottom.
```js
async function getUser() {
  try {
    const res = await fetch("https://api.github.com/users/torvalds"); // wait here
    const user = await res.json();
    return user.name;
  } catch (err) {
    console.error("failed", err);
  }
}
```
- `await` only works inside an `async` function (or at the top level of a module).
- An `async` function **always returns a Promise**.
- Use `try / catch` to handle errors.

Our project is full of `await` because the database and auth are async:
```ts
const session = await auth();
const chat = await prisma.chat.findUnique({ where: { id } });
```

**Running things in parallel:** `await Promise.all([taskA(), taskB()])` waits for both at the same time.

### The three mistakes everyone makes

**1. Forgetting `await`.** You get a `Promise` object instead of the value:
```js
const chat = prisma.chat.findUnique({ where: { id } });
console.log(chat.title);   // undefined — chat is a Promise, not a chat!
//    fix: const chat = await prisma.chat.findUnique(...)
```

**2. Using `await` inside `.map()` and expecting it to wait.** `.map` doesn't wait, so you get an array of Promises:
```js
const results = ids.map(async (id) => await getChat(id));   // [Promise, Promise, ...]
const results = await Promise.all(ids.map((id) => getChat(id)));   // ✅ actual values
```

**3. Awaiting in a loop when things could run at once.** Correct, but slow:
```js
for (const id of ids) await getChat(id);        // 3 chats × 100ms = 300ms
await Promise.all(ids.map((id) => getChat(id))); // all at once ≈ 100ms
```
Use the loop when each step **depends** on the previous one, and `Promise.all` when they're independent.

<details>
<summary><b>▸ Go deeper: the event loop, and why order surprises you</b></summary>

Run `bun playground/03-async.js` and look at the order it prints:
```
1. start
2. this runs BEFORE the callback — JS did not wait
4. Linus Torvalds has ... repos
5. failed: GitHub said 404
3. one second later (callback)
```
`3.` comes **last**, even though its `setTimeout` was scheduled first.

JS has **one** call stack. Slow things (timers, network, disk) are handled *outside* it by the runtime. When they finish, their callback is put in a **queue**. The **event loop** takes from that queue only when the call stack is empty.

```
call stack (one thing at a time)      queue (waiting to run)
┌──────────────┐                      ┌────────────────────┐
│ your code    │ ◀── event loop ───── │ timer callback     │
└──────────────┘   (when stack empty) │ fetch response     │
                                      └────────────────────┘
```
So: **all synchronous code runs first**, then queued callbacks. A slow synchronous loop (`for (let i=0; i<1e10; i++)`) blocks *everything*, including clicks and rendering. That's what "don't block the event loop" means.
</details>

---

## 💡 8. TypeScript: JavaScript with types

JS lets you do `user.nmae` (typo) and only fails **when the code runs**. **TypeScript** (TS) catches it **while you type**, right in your editor.

```ts
type Message = {
  role: "user" | "assistant";   // only these two strings are allowed
  content: string;
  createdAt?: Date;             // ? = optional
};

function lastText(messages: Message[]): string {
  return messages[messages.length - 1].content;
}

lastText([{ role: "bot", content: "hi" }]);
//          ^^^^^^^ Error: "bot" is not "user" | "assistant"
```

| Thing | Example |
|---|---|
| Basic types | `string`, `number`, `boolean`, `string[]`, `Date` |
| Union | `"user" \| "assistant"` |
| Object type | `type Props = { id: string; title: string }` (or `interface`) |
| Generic | `useState<string>("")`, `Promise<User>`, a type with a slot to fill in |
| Type-only import | `import type { UIMessage } from "ai"` |
| Casting (use rarely) | `m.role as "user" \| "assistant"` |

- Files end in `.ts`. Files with JSX (React) end in `.tsx`.
- Browsers don't understand TS, so it's **compiled** to JS. Next.js and Bun do this for you automatically.
- Libraries like Prisma, Zod and the AI SDK generate types, so your editor can **autocomplete** everything.

### How to read a TypeScript error

Type errors look scary but follow one pattern: **what it got** vs **what it wanted**.

```
Type 'string | undefined' is not assignable to type 'string'.
  Type 'undefined' is not assignable to type 'string'.
     ↑ got                            ↑ wanted
```
Translation: *"this might be `undefined`, and the place you're putting it can't handle that."* Fixes, in order of preference:

```ts
if (!savedModel) return;              // 1. handle the missing case (best)
const model = savedModel ?? DEFAULT;  // 2. give it a default
const model = savedModel!;            // 3. "trust me, it's there" — crashes if you're wrong
```
Our project uses #2 constantly, because config and cookies are so often missing:
```ts
const model = MODELS.some((m) => m.id === savedModel) ? savedModel! : DEFAULT_MODEL;
```

<details>
<summary><b>▸ Go deeper: types are erased at runtime</b></summary>

TypeScript types **vanish** when compiled. This runs fine even though the type says otherwise, because at runtime there is no check:
```ts
const data = JSON.parse(text) as Message;   // a lie TypeScript happily believes
```
`as` is a *claim*, not a check. That's exactly why we use **Zod** in Phase 06: it validates the actual data at runtime, and gives TypeScript a type it can trust.
```ts
const parsed = loginSchema.safeParse(credentials);  // real check, at runtime
if (!parsed.success) return null;
parsed.data.email;   // now TypeScript AND reality agree it's a valid email
```
**Rule:** for data from outside your program (forms, APIs, JSON), validate. `as` is for when you genuinely know more than the compiler.
</details>

## ✅ Checkpoint
You can read this line from our project and explain every part of it:
```ts
const modelId = MODELS.some((m) => m.id === model) ? model : DEFAULT_MODEL;
```

## 🧪 Try it yourself
1. Given `const chats = [{title:"a", n:2}, {title:"b", n:0}, {title:"c", n:5}]`, use `filter` + `map` to get the titles of chats with `n > 0`.
2. Write an `async` function that fetches `https://api.github.com/users/<your-username>` and logs your number of public repos. Break the URL on purpose and handle the error with `try/catch`.

## 🤖 Ask your agent
- "Explain the event loop to me like I'm 10. Why doesn't `await` freeze the whole page?"
- "Give me 5 quick exercises on map/filter/reduce and check my answers."
- "What's the difference between `type` and `interface` in TypeScript?"

➡️ Next: [Phase 03: Tooling](03-tooling.md)
