# Phase 03: Tooling: Node, Bun, Package Managers, Git, GitHub (10 min, concepts)

## 🎯 Goal
Know what each tool in a modern JS project does, so commands like `bun add` or `git push` make sense.

**You'll understand:**
- Why JavaScript can run on a server at all
- What `package.json`, the lockfile and `node_modules` each do
- Where secrets live, and how to keep them off GitHub
- Enough Git to save your work and undo mistakes

> 🌿 **Branch:** `git switch phase-03-tooling` for runnable module and env-var examples.
> 📖 Sections marked **▸ Go deeper** are optional. Skip them in the live session.

---

## 💡 1. Running JavaScript outside the browser: Node.js and Bun

JS was made for browsers. **Node.js** (2009) took Chrome's JS engine (V8) and let JS run **on your computer or a server**. That's how we can write *backend* code in JavaScript.

| | Browser JS | Node.js / Bun |
|---|---|---|
| Has `window`, `document`, DOM | ✅ | ❌ |
| Can read files, open DB connections, read secret env vars | ❌ | ✅ |
| Used for | UI, clicks | servers, scripts, build tools |

**Bun** is a newer, very fast **all-in-one** JS runtime. It's a runtime (like Node), a package manager (like npm), a test runner and a bundler in one tool. It also runs TypeScript directly.

```bash
node script.js      # run with Node
bun script.ts       # run with Bun (TypeScript works directly)
```

> **In this course:** we use **Bun** to install packages and run scripts (`bun install`, `bun dev`). Next.js itself runs on Node under the hood. Everything also works with `npm` if you prefer.

## 💡 2. Packages and package managers

A **package** is code someone else wrote and published (React, Prisma, bcrypt…). They live on the **npm registry** (npmjs.com). A **package manager** downloads them into your project.

| Package manager | Install all | Add a package | Add a dev tool | Run a script | Run a CLI once |
|---|---|---|---|---|---|
| **npm** (comes with Node) | `npm install` | `npm install zod` | `npm install -D prisma` | `npm run dev` | `npx prisma` |
| **pnpm** (saves disk space) | `pnpm install` | `pnpm add zod` | `pnpm add -D prisma` | `pnpm dev` | `pnpm dlx prisma` |
| **yarn** | `yarn` | `yarn add zod` | `yarn add -D prisma` | `yarn dev` | `yarn dlx prisma` |
| **bun** (fastest) | `bun install` | `bun add zod` | `bun add -d prisma` | `bun dev` | `bunx prisma` |

The key files:

```
package.json      ← your project's "ID card": name, scripts, dependencies (you edit this)
bun.lock          ← exact versions that were installed (don't edit, DO commit)
node_modules/     ← the downloaded code (huge, never commit it; rebuild with `bun install`)
```

A part of our `package.json`:
```jsonc
{
  "scripts": {
    "dev": "next dev",                       // bun dev         → start dev server
    "build": "prisma generate && next build",// bun run build   → production build
    "start": "next start"
  },
  "dependencies": { "next": "16.3.7", "react": "19.2.8", "ai": "^7.0.122" },
  "devDependencies": { "prisma": "^7.10.0", "typescript": "^5" }
}
```
- **dependencies**: needed when the app runs.
- **devDependencies**: only needed while developing or building (TypeScript, linters, the Prisma CLI).
- `^7.0.122` means "7.x, at least 7.0.122". This is **semantic versioning**: `MAJOR.MINOR.PATCH`. A new MAJOR version can break your code.

## 💡 3. Environment variables and `.env`

Secrets (API keys, DB passwords) must **never** be written in your code or pushed to GitHub. We put them in a `.env` file, and the code reads them with `process.env.NAME`.

```bash
# .env   (in .gitignore, so it never leaves your computer)
OPENROUTER_API_KEY="sk-or-..."
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chatgpt"
```
We commit a `.env.example` with the **names only**, so teammates know what they need to fill in.

> ⚠️ In Next.js, only variables starting with `NEXT_PUBLIC_` are sent to the browser. Everything else stays on the server.

---

## 💡 4. Git: a time machine for your code

**Git** tracks changes to your files. You make **commits** (snapshots) and can always go back to one.

```
main:  ●──────●──────●──────────●   (merge)
        init   auth    \        /
feature/sidebar:        ●──────●
```

```bash
git init                         # start tracking this folder
git status                       # what changed?
git add .                        # stage all changes (choose what goes in the next snapshot)
git commit -m "add login page"   # take the snapshot
git log --oneline                # history

git checkout -b feature/sidebar  # new branch (a parallel line of work)
git switch main                  # go back to main
git merge feature/sidebar        # bring the branch's commits into main
```

**`.gitignore`** lists files Git should ignore: `node_modules/`, `.env`, `.next/`.

<details>
<summary><b>▸ Go deeper: undoing things in Git</b></summary>

| Situation | Command |
|---|---|
| Changed a file, want the last committed version back | `git restore <file>` |
| Staged with `git add`, want to unstage | `git restore --staged <file>` |
| Last commit message was wrong | `git commit --amend -m "better message"` |
| Want to undo the last commit but **keep** the changes | `git reset --soft HEAD~1` |
| Want to undo the last commit and **throw away** the changes | `git reset --hard HEAD~1` ⚠️ |
| Already pushed, need a safe undo | `git revert <commit>` (makes a new, opposite commit) |

`git reset --hard` deletes work permanently. Before any scary command, `git status` and `git log --oneline` tell you where you are.

**`.gitignore` only ignores files Git isn't already tracking.** If you committed `.env` once, adding it to `.gitignore` changes nothing — you must `git rm --cached .env` **and** treat those secrets as leaked (rotate the keys).
</details>

## 💡 5. GitHub: Git in the cloud

**Git** is the tool on your computer. **GitHub** is a website that hosts Git repositories, so you can back up, share and collaborate.

```bash
git remote add origin https://github.com/you/chatgpt-clone.git
git push -u origin main          # upload your commits
git pull                         # download others' commits
git clone <url>                  # copy a repo to your computer
```

- **Pull Request (PR)**: "please merge my branch". Teammates review the code before it goes into `main`.
- **Fork**: your own copy of someone else's repo.
- Vercel (Phase 09) deploys your site **automatically every time you push** to GitHub.

## ✅ Checkpoint
You know why `node_modules` isn't committed, where secrets go, and the difference between Git and GitHub.

## 🤖 Ask your agent
- "What's the difference between `bun install` and `bun add`? When does `bun.lock` change?"
- "I accidentally committed my `.env`. What should I do?" *(Hint: the answer includes "rotate your keys".)*
- "Walk me through making a branch, committing, and opening a PR on GitHub."

➡️ Next: [Phase 04: React, Vite, Next.js](04-react-vite-next.md)
