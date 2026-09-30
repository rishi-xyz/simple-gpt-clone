# Phase 00: Setup (5 min)

## 🎯 Goal
Install the tools and learn the few terminal commands you'll use all session.

## 🛠️ Install these

| Tool | Why we need it | Install | Check it works |
|---|---|---|---|
| **Node.js** (LTS) | Runs JavaScript outside the browser | https://nodejs.org | `node -v` |
| **Bun** | Fast JS runtime + package manager (we use it to install and run things) | `curl -fsSL https://bun.sh/install \| bash` (Windows: `powershell -c "irm bun.sh/install.ps1 \| iex"`) | `bun -v` |
| **Git** | Saves versions of your code | https://git-scm.com | `git -v` |
| **Docker Desktop** | Runs a Postgres database with one command | https://docker.com | `docker -v` |
| **VS Code** (or any editor) | Where you write code | https://code.visualstudio.com | open it |
| **A coding agent** (optional) | Your personal tutor | Claude Code: `npm i -g @anthropic-ai/claude-code` · opencode: https://opencode.ai | `claude` / `opencode` |

> **Can't install Docker?** That's OK. In Phase 05 you can use a free cloud Postgres from [Neon](https://neon.tech) instead.

Also create accounts on **GitHub** (https://github.com) and **OpenRouter** (https://openrouter.ai). OpenRouter gives us free AI models.

## 💡 The terminal in 60 seconds

The terminal (shell) is a text way to control your computer. You type a **command** and press Enter.

| Command | What it does |
|---|---|
| `pwd` | Show which folder you're in ("print working directory") |
| `ls` | List files in this folder (Windows cmd: `dir`) |
| `cd my-folder` | Go into a folder. `cd ..` goes up one level |
| `mkdir name` | Make a new folder |
| `code .` | Open this folder in VS Code |
| `Ctrl + C` | Stop the program that's running (e.g. the dev server) |
| `↑` arrow | Show the previous command again |

## ✅ Checkpoint
`node -v`, `bun -v`, `git -v` and `docker -v` all print version numbers.

## 🤖 Ask your agent
- "What's the difference between a terminal, a shell and a command line?"
- "What is the PATH variable and why does `bun: command not found` happen?"

➡️ Next: [Phase 01: How the web works](01-how-the-web-works.md)
