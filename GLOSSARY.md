# Glossary

Short definitions for every term in the course. The phase where it's explained is in brackets.

## The web [01]
- **Browser**: the program that downloads and shows websites. It only runs HTML, CSS and JavaScript.
- **HTML**: the structure of a page (headings, buttons, inputs).
- **CSS**: the styling (colours, layout, fonts).
- **JavaScript (JS)**: the language that makes pages interactive, and (with Node/Bun) runs servers.
- **DOM**: the browser's tree of the page's elements. JS changes it to update the page.
- **Client**: the side that makes requests (usually the browser).
- **Server**: a computer or program that answers requests.
- **Frontend**: code that runs in the browser (the UI).
- **Backend**: code that runs on the server (auth, database, secrets).
- **Database**: permanent storage for app data.
- **HTTP / HTTPS**: the request/response protocol of the web (HTTPS = encrypted).
- **Request / Response**: a message from the client / the server's answer to it.
- **HTTP method**: the verb of a request: `GET` (read), `POST` (create/send), `PUT`/`PATCH` (update), `DELETE`.
- **Status code**: the result of a request: `200` OK, `401` not logged in, `404` not found, `500` server error.
- **Header**: extra key/value info sent with a request or response (e.g. `Cookie`, `Content-Type`).
- **URL**: a web address: protocol + domain + path + query.
- **DNS**: turns domain names into IP addresses.
- **localhost**: your own computer.
- **JSON**: a text format for data that looks like JS objects.
- **API**: URLs that programs call to get or change data.
- **REST**: an API style: URLs name *things*, HTTP methods name *actions*.
- **API key**: a secret password that lets your program use someone else's API.

## JavaScript & TypeScript [02]
- **Variable**: a named value (`const` = fixed, `let` = changeable).
- **Function / arrow function**: reusable code (`function f() {}` / `() => {}`).
- **Object / Array**: named fields `{a: 1}` / an ordered list `[1, 2]`.
- **Loop**: repeat code (`for`, `for...of`, `.map`, `.filter`, `.reduce`).
- **Destructuring**: pull values out of objects/arrays (`const { id } = obj`).
- **Spread**: copy into a new object/array (`{...obj}`, `[...arr]`).
- **Module (import/export)**: sharing code between files.
- **Callback**: a function passed in, to be called later.
- **Promise**: a value that will arrive later (pending → fulfilled/rejected).
- **async/await**: a readable way to wait for Promises.
- **Event loop**: how single-threaded JS handles slow tasks without freezing.
- **TypeScript**: JavaScript + types, checked while you code, compiled to JS.
- **Type / interface**: describes the shape of data.
- **Generic**: a type with a slot to fill in (`Promise<User>`).

## Tooling [03]
- **Node.js**: runs JS outside the browser.
- **Bun**: a fast JS runtime + package manager + test runner in one.
- **Runtime**: the program that executes your code (browser, Node, Bun).
- **Package**: reusable code published to the npm registry.
- **Package manager**: installs packages (npm, pnpm, yarn, bun).
- **package.json**: project info, scripts and dependencies.
- **Lockfile** (`bun.lock`): the exact installed versions.
- **node_modules**: the folder of downloaded packages (never commit it).
- **dependencies / devDependencies**: needed at runtime / only while developing.
- **Semantic versioning**: `MAJOR.MINOR.PATCH`. A new major version may break things.
- **Environment variable / `.env`**: config and secrets kept outside the code.
- **Git**: version control: commits, branches, merges.
- **Commit**: a saved snapshot of your code.
- **Branch**: a parallel line of development.
- **GitHub**: a website that hosts Git repositories.
- **Pull request (PR)**: a request to merge a branch, with code review.
- **.gitignore**: files Git should not track.

## React & Next.js [04]
- **React**: a library for building UIs from components.
- **Component**: a function that returns UI (JSX).
- **JSX**: HTML-like syntax inside JavaScript.
- **Props**: inputs passed to a component.
- **State**: data that changes over time. Changing it re-renders the component.
- **Hook**: a `use…` function that adds features (`useState`, `useEffect`, `useChat`).
- **Re-render**: React running a component again to update the UI.
- **Vite**: a fast dev server and bundler, popular for plain React apps.
- **Bundler**: combines and optimises code for the browser.
- **Hot reload (HMR)**: the page updates instantly when you save a file.
- **Framework**: a library that gives your app its structure (Next.js on top of React).
- **Next.js**: a full-stack React framework: routing, server code, rendering.
- **Turbopack**: Next.js's built-in bundler.
- **CSR**: client-side rendering. HTML is built in the browser by JS.
- **SSR**: server-side rendering. HTML is built on the server for each request.
- **SSG**: static site generation. HTML is built once at build time.
- **ISR**: SSG pages that rebuild in the background on a timer.
- **Hydration**: React attaching interactivity to server-rendered HTML.
- **SPA**: single-page application. One HTML page, and JS swaps views.
- **SEO**: making pages easy for search engines to read.
- **App Router**: Next.js routing where folders in `app/` become URLs.
- **Layout**: UI that wraps pages and stays on screen between them.
- **Dynamic route**: a URL segment with a variable, like `[id]`.
- **Route handler**: `route.ts`, an API endpoint (`export async function POST`).
- **Server Component**: runs only on the server and can use the DB directly (the default).
- **Client Component**: `"use client"`, runs in the browser, and can use state and events.
- **Server Action**: `"use server"`, a server function you can call from a form or button.
- **Tailwind CSS**: styling with utility classes (`flex p-4 text-sm`).
- **shadcn/ui**: copy-in React components built on Radix UI + Tailwind.

## Databases [05]
- **SQL database (relational)**: tables with a fixed schema and relations (PostgreSQL, MySQL).
- **SQL**: the language for querying relational databases.
- **NoSQL**: non-table databases: document (MongoDB), key-value (Redis), and more.
- **PostgreSQL (Postgres)**: a powerful open-source SQL database. We use it.
- **MongoDB**: a popular document (JSON) database.
- **Table / row / column**: a collection / one record / one field.
- **Schema**: the definition of the tables and their columns.
- **Primary key**: a unique id for each row.
- **Foreign key / relation**: a column that points to a row in another table.
- **Cascade delete**: deleting a parent also deletes its children.
- **ACID / transaction**: a group of changes that succeed or fail together.
- **Index**: a structure that makes lookups fast.
- **ORM**: lets you use the database with code instead of SQL strings.
- **Prisma**: the TypeScript ORM we use (`schema.prisma`, migrate, generate, studio).
- **Migration**: a versioned SQL file that changes the database structure.
- **Docker / container**: runs software in an isolated, pre-packaged box.
- **Connection string** (`DATABASE_URL`): the address + credentials for a database.

## Auth [06]
- **Authentication**: proving who you are.
- **Authorization**: checking what you're allowed to do.
- **Hashing (bcrypt)**: one-way scrambling of passwords. **Salt** = random data added before hashing.
- **Cookie**: a small piece of data the browser stores and sends back with every request.
- **HttpOnly / Secure / SameSite**: cookie flags against XSS, eavesdropping and CSRF.
- **Session**: the server remembering a logged-in user.
- **JWT**: JSON Web Token. Signed data (`header.payload.signature`) that proves who you are without a DB lookup.
- **OAuth**: "Log in with GitHub/Google". The provider vouches for the user.
- **Client ID / secret**: the credentials of your OAuth app.
- **Callback / redirect URL**: where the OAuth provider sends the user back to.
- **Auth.js (NextAuth)**: the auth library we use.
- **Provider**: a login method in Auth.js (Credentials, GitHub, Google).
- **Adapter**: connects Auth.js to your database (Prisma adapter).
- **Middleware / Proxy**: code that runs before a request reaches a route (Next 16: `proxy.ts`).
- **Zod**: a library that validates data at runtime.
- **XSS**: an attacker's script running in your page.
- **CSRF**: another site tricking your browser into making requests to your site.

## AI [07, 10]
- **LLM**: a large language model that predicts the next text.
- **Token**: a chunk of text (about ¾ of a word). Pricing and limits use tokens.
- **Context window**: the maximum number of tokens a model can see at once.
- **System prompt / instructions**: hidden instructions that shape the model's behaviour.
- **Streaming**: sending the answer piece by piece as it's generated.
- **SSE (Server-Sent Events)**: a way to stream data over one HTTP response.
- **OpenRouter**: one API for hundreds of AI models (including free ones).
- **Vercel AI SDK**: a TypeScript toolkit for AI apps (`streamText`, `useChat`, tools).
- **Provider (AI SDK)**: an adapter for a specific AI company's API (`openrouter()`, `anthropic()`).
- **UIMessage**: a chat message with `parts`, used by `useChat`.
- **Agent**: an LLM + tools + a loop, working until a task is done.
- **Tool / function calling**: the model asks your code to run a function and uses the result.
- **MCP**: Model Context Protocol, a standard way to plug tools into AI apps.
- **RAG**: retrieve relevant documents and add them to the prompt.
- **Embedding**: a list of numbers that represents the meaning of a text.
- **Vector database**: stores embeddings and finds similar ones (e.g. `pgvector`).

## Deployment [09]
- **Deploy**: put your app on a public server.
- **Vercel**: the hosting platform for Next.js. It deploys every git push.
- **Serverless function**: code that runs on demand and scales automatically.
- **Cold start**: the delay when a serverless function starts from idle.
- **CDN / Edge**: servers worldwide that deliver files close to users.
- **Neon**: hosted serverless Postgres.
- **Build**: turning source code into an optimised production version.
- **Preview deployment**: a temporary URL for each branch or PR.
