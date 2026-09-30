# Phase 01: How the Web Works (10 min, concepts)

## 🎯 Goal
Understand what happens when you open a website, and what "frontend", "backend", "server", "database" and "API" really mean.

---

## 💡 1. The browser understands only three languages

A browser (Chrome, Firefox, Safari) can only run **three things**:

| Language | Job | Analogy (a house) |
|---|---|---|
| **HTML** | *Structure*: headings, buttons, inputs, images | The walls and rooms |
| **CSS** | *Style*: colours, sizes, layout, animations | The paint and furniture |
| **JavaScript (JS)** | *Behaviour*: what happens when you click, type or load data | The electricity and plumbing |

```html
<!-- index.html: save this file and open it in your browser! -->
<!DOCTYPE html>
<html>
  <head>
    <style>
      /* CSS */
      button { background: black; color: white; padding: 8px 16px; border-radius: 8px; }
    </style>
  </head>
  <body>
    <h1>Hello!</h1>                       <!-- HTML -->
    <button id="btn">Click me</button>
    <script>
      // JavaScript
      document.getElementById("btn").addEventListener("click", () => {
        alert("You clicked!");
      });
    </script>
  </body>
</html>
```

React, Next.js, TypeScript and Tailwind are all things **we** use to write code more easily. In the end, every one of them turns into plain **HTML + CSS + JS**, because that's all the browser understands.

- TypeScript → compiled to JavaScript
- React (JSX) → turned into JavaScript that creates HTML
- Tailwind classes → turned into a CSS file

The browser parses the HTML into a tree called the **DOM** (Document Object Model). JavaScript can change the DOM, and that's how pages update without reloading.

---

## 💡 2. Client and server

```
     YOU                                          SOMEONE ELSE'S COMPUTER
┌──────────────┐    1. request  "GET /chat"    ┌───────────────────────┐
│   Browser    │ ────────────────────────────▶ │        Server         │
│  (client)    │                               │  (runs your backend   │
│              │ ◀──────────────────────────── │   code 24/7)          │
└──────────────┘   2. response  HTML/JSON      └───────────┬───────────┘
                                                           │ 3. "give me this user's chats"
                                                           ▼
                                                   ┌───────────────┐
                                                   │   Database    │
                                                   └───────────────┘
```

- **Client**: the program that *asks*, usually the browser.
- **Server**: a computer (or program) that *answers* requests. "Server" can mean the machine or the program listening on it (for example our Next.js app on `localhost:3000`).
- **Frontend**: the code that runs **in the browser** (what you see and click).
- **Backend**: the code that runs **on the server** (checking passwords, talking to the database, calling the AI). The user can't see or change it, so **secrets live here**.
- **Database**: where data is stored *permanently* (users, chats, messages). If the server restarts, the data is still there.

> **Rule of thumb:** Never trust the frontend. Anyone can open DevTools and change the JS in their browser. Anything important (who is logged in, which chats they may see) must be checked on the **backend**.

---

## 💡 3. HTTP: the language of client ↔ server

Clients and servers talk using **HTTP** (HTTPS = the encrypted version). Every message is a **request** followed by a **response**.

```
REQUEST                                   RESPONSE
POST /api/chat HTTP/1.1                   HTTP/1.1 200 OK
Host: myapp.com                           Content-Type: application/json
Cookie: session=abc123
Content-Type: application/json            {"reply": "Hi! How can I help?"}

{"message": "hello"}
```

**Methods** (the verb, meaning *what* you want to do):

| Method | Meaning | Example |
|---|---|---|
| `GET` | Read something | Load a page, get a list of chats |
| `POST` | Create / send something | Send a chat message, log in |
| `PUT` / `PATCH` | Update | Rename a chat |
| `DELETE` | Delete | Delete a chat |

**Status codes** (the result):

| Code | Meaning |
|---|---|
| `200` OK | It worked |
| `201` Created | A new thing was created |
| `301/302/307` Redirect | "Go look over there instead" |
| `400` Bad Request | You sent something wrong |
| `401` Unauthorized | You're not logged in |
| `403` Forbidden | You're logged in, but not allowed |
| `404` Not Found | Doesn't exist |
| `500` Server Error | The server crashed |

**Headers** are extra information (key: value) sent with requests and responses, such as `Content-Type` and `Cookie`.

---

## 💡 4. URLs and DNS

```
https://myapp.vercel.app:443/chat/abc123?tab=recent#top
└─┬─┘   └──────┬───────┘ └┬┘ └────┬────┘ └───┬────┘ └┬┘
protocol     domain     port    path       query   fragment
```

Computers find each other by **IP address** (`76.76.21.21`). **DNS** is the internet's phonebook: it turns `myapp.vercel.app` into an IP. `localhost` means "this computer", and that's where your dev server runs.

---

## 💡 5. JSON and APIs

**JSON** is the most common format for sending data. It looks like a JavaScript object:

```json
{ "id": "abc123", "title": "My first chat", "messages": [{ "role": "user", "content": "hi" }] }
```

An **API** (Application Programming Interface) is a set of URLs that a program (not a human) can call to get or change data. A human visits `/chat` and sees a page. A program calls `/api/chat` and gets data back.

- **REST API**: a common style. You use URLs for *things* (`/api/chats/123`) and HTTP methods for *actions* (`GET`, `DELETE`).
- **Third-party APIs**: other companies' servers you can call. In this project we call **OpenRouter's API** to talk to AI models. We pay (or use the free tier) with an **API key**, a secret password for programs.

```js
// Calling an API from JavaScript
const res = await fetch("https://api.github.com/users/torvalds");
const user = await res.json();
console.log(user.name); // "Linus Torvalds"
```

---

## 💡 6. Where does our ChatGPT clone fit?

| Part | In our app |
|---|---|
| Frontend | React components in `components/` (chat box, sidebar) |
| Backend | Next.js server code: pages, `app/actions.ts`, `app/api/chat/route.ts` |
| Database | PostgreSQL, accessed through Prisma |
| Third-party API | OpenRouter (AI models), GitHub/Google (login) |

Next.js is special: **one project holds both frontend and backend.**

## ✅ Checkpoint
You can explain in one sentence each: HTML vs CSS vs JS, frontend vs backend, what a `404` means, and what an API is.

## 🧪 Try it yourself
1. Save the HTML example above as `index.html`, open it in a browser, and change the button colour.
2. Open DevTools (`F12`) → **Network** tab → reload any website. Click a request and find its method, status code and headers.

## 🤖 Ask your agent
- "What exactly happens, step by step, between typing google.com and seeing the page?"
- "What is the DOM? Show me how JavaScript changes it."
- "Why is HTTPS important? What would an attacker see with plain HTTP?"

➡️ Next: [Phase 02: JavaScript & TypeScript foundations](02-javascript-foundations.md)
