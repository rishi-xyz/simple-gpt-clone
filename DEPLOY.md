# Deploying this app

Follow [`phases/09-deploy.md`](phases/09-deploy.md) for the full walkthrough.
This is the short checklist.

## 1. Push to GitHub
```bash
git remote add origin https://github.com/<you>/chatgpt-clone.git
git push -u origin main
```
Confirm `.env` is **not** in the repo: `git ls-files | grep env` should only show `.env.example`.

## 2. Create a cloud database
https://neon.tech → New project → copy the connection string.

## 3. Create the tables on it (once, from your laptop)
```bash
DATABASE_URL="your-neon-url" bunx prisma migrate deploy
```

## 4. Deploy on Vercel
https://vercel.com/new → import the repo → add every variable from `.env.example`:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | the Neon connection string |
| `AUTH_SECRET` | `bunx auth secret`, or any long random string |
| `OPENROUTER_API_KEY` | from https://openrouter.ai/keys |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | optional |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | optional |

## 5. Update the OAuth callback URLs
Add the production URLs to your GitHub / Google apps:
`https://your-app.vercel.app/api/auth/callback/github` (and `/google`).

## Notes
- `bun run build` runs `prisma generate && next build`, so the Prisma client is
  always generated on Vercel before the build.
- `app/api/chat/route.ts` sets `maxDuration = 60`: the AI response may stream for
  up to 60 seconds. On Vercel's free plan the cap is lower, so very long answers
  can be cut off.
