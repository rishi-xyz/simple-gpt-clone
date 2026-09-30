# Phase 09: Deploy to Vercel + Neon (5 min, 🚀)

## 🎯 Goal
Put the app on the internet with a real URL.

## 💡 Concepts
- **Hosting / deployment**: running your app on a server that's always on and reachable by anyone.
- **Vercel**: the company behind Next.js. You connect your GitHub repo, and **every `git push` deploys automatically**. Every PR also gets its own *preview* URL.
- **Serverless**: Vercel doesn't give you a server that's always running. Your pages and API routes run as **functions** that start on demand and scale automatically. (That's why `export const maxDuration = 60` is in our chat route: it's the time limit for that function.)
- **CDN / Edge**: static files are copied to servers all over the world, close to your users.
- **Neon**: a hosted, serverless **Postgres** with a free tier. Our local Docker database only exists on your laptop, so production needs a cloud one.
- **Build**: `bun run build` → `prisma generate && next build` creates an optimised production version.

## 👩‍💻 Do it

1. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/<you>/chatgpt-clone.git
   git push -u origin main
   ```
   Double-check that `.env` is **not** on GitHub.
2. **Create the database**: https://neon.tech → New project → copy the connection string (`postgresql://…neon.tech/neondb?sslmode=require`).
3. **Create the tables on Neon** (run once from your laptop):
   ```bash
   DATABASE_URL="your-neon-url" bunx prisma migrate deploy
   ```
   `migrate deploy` applies the existing migrations. Unlike `migrate dev`, it never creates new ones, so it's the safe command for production.
4. **Import on Vercel**: https://vercel.com/new → pick your repo → **Environment Variables**: add every variable from `.env.example` (`DATABASE_URL` = the Neon URL, `AUTH_SECRET`, `OPENROUTER_API_KEY`, and the OAuth keys if you use them) → **Deploy**.
5. **OAuth callbacks** (if you use them): add the production URLs to your GitHub/Google apps:
   `https://your-app.vercel.app/api/auth/callback/github` and `…/callback/google`.

## ✅ Checkpoint
Open `https://your-app.vercel.app`, sign up, and chat. Send the link to a friend! 🎉

## ⚠️ Common errors
| Symptom | Fix |
|---|---|
| Build fails: `Cannot find module '@/lib/generated/prisma/client'` | Make sure the `postinstall` / `build` scripts run `prisma generate` |
| 500 error on login | A missing env var on Vercel (often `AUTH_SECRET`). Add it and **redeploy** |
| `relation "User" does not exist` | You skipped step 3 (`prisma migrate deploy`) |

## 🤖 Ask your agent
- "What's the difference between serverless and a traditional server? What are cold starts?"
- "How do preview deployments work, and how would I use a separate database for them?"

➡️ Next: [Phase 10: Bonus: AI agents & next steps](10-agents-and-next-steps.md)
