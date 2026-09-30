# Phase 06: Authentication: Cookies, Sessions, JWT, OAuth, Auth.js, Middleware (20 min, 💡 + 👩‍💻)

## 🎯 Goal
Understand how websites "remember" who you are, and build **email/password + GitHub + Google login** with Auth.js.

**You'll understand:**
- Why passwords are never stored, only hashed
- How a cookie makes a stateless protocol feel logged-in
- The real trade-off between database sessions and JWTs
- What actually happens when you click "Continue with GitHub"

> 🌿 **Branch:** `git switch phase-06-auth` for the finished result of this phase.
> 🔍 **See what this phase adds:** `git diff phase-05-database..phase-06-auth --stat`
> 📖 Sections marked **▸ Go deeper** are optional. Skip them in the live session.

---

## 💡 1. Authentication vs Authorization

| | Question | Example in our app |
|---|---|---|
| **Authentication (AuthN)** | *Who are you?* | Logging in with email + password |
| **Authorization (AuthZ)** | *What are you allowed to do?* | You can only open **your own** chats |

## 💡 2. Never store passwords: hash them

If your database leaks, plain passwords would expose every user. Instead we store a **hash**: a one-way scramble.

```
"hunter22"  ──bcrypt──▶  "$2b$10$N9qo8uLOickgx2ZMRZoMye.IjZAgcfl7p92ldGxad68LJZdL17lhW"
```
- You **can't** turn the hash back into the password.
- To log in, we hash what the user typed and **compare** the result: `bcrypt.compare(typed, storedHash)`.
- bcrypt adds a random **salt** (so two users with the same password get different hashes), and it's deliberately **slow**, which makes guessing expensive for attackers.

## 💡 3. HTTP forgets you: cookies

HTTP is **stateless**. Every request is a stranger. So how does the server know request #2 comes from the person who logged in with request #1?

**Cookies**: small pieces of data the server asks the browser to store. The browser then **sends them back automatically** with every request to that site.

```
1. POST /login (email, password)       ───▶  server checks the password ✔
2.                                      ◀───  Set-Cookie: authjs.session-token=eyJhbGci...; HttpOnly; Secure
3. GET /chat   Cookie: authjs.session-token=eyJhbGci...  ───▶  server reads the cookie → "ah, it's Asha"
```
Important cookie flags:
- **HttpOnly**: JavaScript in the page **can't read it**, so an injected script can't steal it (protects against XSS).
- **Secure**: only sent over HTTPS.
- **SameSite**: not sent with requests coming from other sites (protects against CSRF).
- **Max-Age / Expires**: how long it lasts.

(We also use a normal, non-secret cookie in Phase 07 to remember the chosen AI model.)

## 💡 4. What goes inside the cookie? Sessions vs JWT ⭐

**Option A: Database session.** The cookie holds a random ID. The server looks it up in a `Session` table on every request.

**Option B: JWT (JSON Web Token).** The cookie holds the user info itself, **signed** with a secret so nobody can fake or change it.

A JWT has three parts, `header.payload.signature`, each base64-encoded:
```
eyJhbGciOiJIUzI1NiJ9 . eyJpZCI6InUxIiwibmFtZSI6IkFzaGEiLCJleHAiOjE3MzAwMDB9 . 4pBd…signature
  {"alg":"HS256"}        {"id":"u1","name":"Asha","exp":1730000…}              HMAC(header+payload, AUTH_SECRET)
```
Anyone can *read* the payload (it's only encoded, not encrypted), but only the server, which knows `AUTH_SECRET`, can create a valid signature. Change one letter and the signature no longer matches. (Auth.js goes further and **encrypts** its JWT cookie, so it can't even be read.)

| | **Database session** | **JWT** |
|---|---|---|
| Cookie contains | random session ID | signed (and encrypted) user data |
| Each request | DB lookup | just verify the signature (no DB) → fast |
| Log out everywhere / ban user instantly | ✅ delete the row | ❌ harder (the token is valid until it expires) |
| Scales across servers | needs a shared DB | ✅ stateless |
| Our app | — | ✅ **required** for the email/password (Credentials) provider in Auth.js |

> 🔑 **The trade-off in one line:** a JWT is fast because the server doesn't have to look anything up, and that same property is why you can't instantly revoke one.

Note the odd consequence in our app: we have a `Session` table in the schema (the Prisma adapter creates it), but we never use it, because `session: { strategy: "jwt" }` keeps sessions in the cookie. The table is there for the OAuth providers' account linking.

<details>
<summary><b>▸ Go deeper: how a signature actually prevents forgery</b></summary>

The signature is `HMAC(header + payload, AUTH_SECRET)` — a hash that mixes in a secret only the server knows.

An attacker who wants to change `{"id":"u1"}` to `{"id":"u2"}` can easily edit the payload (it's just base64). But then they must produce a matching signature, and to do that they'd need `AUTH_SECRET`. Without it they'd have to guess, and there are more possible values than atoms in the observable universe.

The server verifies by recomputing the signature and comparing. Mismatch → rejected.

**This is why `AUTH_SECRET` leaking is catastrophic:** anyone with it can mint a valid token for *any* user. It belongs in `.env` (git-ignored) and in Vercel's environment variables, never in code.
</details>

## 💡 5. OAuth: "Continue with GitHub/Google"

With OAuth, you don't handle passwords at all. GitHub proves who the user is.

```
 You        Our app                       GitHub
  │ click "Continue with GitHub"  │                            │
  │──────────────────────────────▶│ redirect to github.com/login/oauth/authorize?client_id=…
  │◀──────────────────────────────│                            │
  │──── log in on GitHub + "Authorize app" ──────────────────▶ │
  │◀──── redirect to /api/auth/callback/github?code=XYZ ───────│
  │──────────────────────────────▶│ ── exchange code + secret ─▶│
  │                               │ ◀── access token + profile ─│
  │◀── Set-Cookie (logged in!) ───│  create User + Account rows │
```
You register an **OAuth app** on GitHub/Google to get a **Client ID** (public) and a **Client Secret** (secret). You also set the **callback URL** where GitHub sends the user back.

## 💡 6. Auth.js (NextAuth v5)

Auth.js handles all of the above for us: providers (GitHub, Google, Credentials…), cookies, JWT encryption, CSRF protection, and saving users to our DB through the **Prisma adapter**.

We configure it once in `auth.ts`, and it gives us:
- `auth()`: "who is logged in?" (use it in Server Components, actions and API routes)
- `signIn()` / `signOut()`
- `handlers`: the `/api/auth/*` routes (OAuth callbacks, etc.)

## 💡 7. Middleware (in Next.js 16: "Proxy")

**Middleware** is code that runs **before** a request reaches your page or API. It's a checkpoint at the door:

```
request ──▶ [ middleware: logged in? add headers? redirect? ] ──▶ page / API route
```
Common uses: redirect logged-out users, add security headers, A/B tests, locale redirects. In Express-style servers, every `app.use(...)` is a middleware in a chain.

> **Next.js 16 renamed `middleware.ts` to `proxy.ts`** (the function is called `proxy`). The Next.js docs say to use it only for quick, *optimistic* checks, **not** as your only security.

**Our app doesn't use a proxy.** Every page and API route calls `auth()` itself and checks ownership (`chat.userId !== userId`). That's the real security layer. If you want the "door checkpoint" too, it would look like this (optional, not in the reference app):

```ts
// proxy.ts (optional)
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  if (!req.auth) return NextResponse.redirect(new URL("/login", req.url));
});

export const config = { matcher: ["/chat/:path*"] };
```

## 💡 8. Validation with Zod

Never trust form input. **Zod** checks that data has the right shape:
```ts
const schema = z.object({ email: z.email(), password: z.string().min(6) });
const parsed = schema.safeParse(input);   // { success: true, data } or { success: false, error }
```

---

## 👩‍💻 Build it

### Step 1: Install
```bash
bun add next-auth@beta @auth/prisma-adapter bcryptjs zod
bunx auth secret          # writes AUTH_SECRET into your .env (used to sign/encrypt the JWT)
```

### Step 2: Configure Auth.js
**`auth.ts`** (project root). Read every comment:
```ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Email/password login only works with JWT sessions (not database sessions).
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    // allowDangerousEmailAccountLinking lets someone who signed up with
    // email/password later log in with GitHub/Google using the same email.
    // Fine for a demo; in a real app you'd verify emails first.
    GitHub({ allowDangerousEmailAccountLinking: true }),
    Google({ allowDangerousEmailAccountLinking: true }),
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user?.password) return null;

        const ok = await bcrypt.compare(parsed.data.password, user.password);
        return ok ? user : null;
      },
    }),
  ],
  callbacks: {
    // Put the user's id into the token, then into the session,
    // so we can use session.user.id everywhere.
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
  },
});
```

The `callbacks` put the user's `id` into the JWT, and then into `session.user.id`. We need the id to load *this user's* chats.

### Step 3: The Auth.js API routes
`[...nextauth]` is a **catch-all** route: it matches `/api/auth/signin`, `/api/auth/callback/github`, and every other path under `/api/auth`.

**`app/api/auth/[...nextauth]/route.ts`**
```ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

### Step 4: Server Actions for login, register and logout
`"use server"` at the top means every exported function runs **on the server**, even though forms in the browser call them. The `deleteChat` action at the bottom is used in Phase 08. Add it now so the file is complete.

**`app/actions.ts`**
```ts
"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

// ---------- Auth ----------

export async function login(_prev: string | undefined, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
  } catch (error) {
    // Wrong email/password → show an error message.
    // Anything else (like the redirect after success) must be re-thrown.
    if (error instanceof AuthError) return "Invalid email or password";
    throw error;
  }
}

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function register(_prev: string | undefined, formData: FormData) {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return parsed.error.issues[0].message;

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return "An account with this email already exists";

  await prisma.user.create({
    data: { name, email, password: await bcrypt.hash(password, 10) },
  });

  // Log the new user in right away
  await signIn("credentials", { email, password, redirectTo: "/" });
}

export async function loginWithGitHub() {
  await signIn("github", { redirectTo: "/" });
}

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/" });
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}

// ---------- Chats ----------

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

export async function deleteChat(chatId: string) {
  const userId = await getUserId();
  // deleteMany with userId makes sure you can only delete your own chats
  await prisma.chat.deleteMany({ where: { id: chatId, userId } });
  revalidatePath("/", "layout");
}
```

Notice:
- `register` validates with Zod, checks for duplicates, **hashes** the password (`bcrypt.hash(password, 10)`, where 10 = the cost/slowness), then logs the user in.
- `signIn(... redirectTo)` works by **throwing** a redirect. That's why `login` re-throws any error that isn't an `AuthError`.
- `deleteMany({ where: { id, userId } })` is **authorization**: you can only delete a chat that is yours.

### Step 5: The form component (Client Component)
`useActionState` runs the server action, and gives us its return value (the error message) and a `pending` flag.

**`components/auth-form.tsx`**
```tsx
"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  // A server action that returns an error message (or nothing on success)
  action: (prev: string | undefined, formData: FormData) => Promise<string | undefined>;
  submitLabel: string;
  showName?: boolean;
};

export function AuthForm({ action, submitLabel, showName }: Props) {
  const [error, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="grid gap-4">
      {showName && (
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" minLength={6} required />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Please wait..." : submitLabel}
      </Button>
    </form>
  );
}
```

**`components/oauth-buttons.tsx`**
```tsx
import { loginWithGitHub, loginWithGoogle } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function OAuthButtons() {
  return (
    <div className="grid gap-2">
      <form action={loginWithGitHub}>
        <Button variant="outline" className="w-full">
          Continue with GitHub
        </Button>
      </form>
      <form action={loginWithGoogle}>
        <Button variant="outline" className="w-full">
          Continue with Google
        </Button>
      </form>
    </div>
  );
}
```

### Step 6: Login and register pages (Server Components)
**`app/login/page.tsx`**
```tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { login } from "@/app/actions";
import { AuthForm } from "@/components/auth-form";
import { OAuthButtons } from "@/components/oauth-buttons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function LoginPage() {
  // Already logged in? Go straight to the chat.
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Log in to continue chatting</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <AuthForm action={login} submitLabel="Log in" />
          <Separator />
          <OAuthButtons />
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
```

**`app/register/page.tsx`**
```tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { register } from "@/app/actions";
import { AuthForm } from "@/components/auth-form";
import { OAuthButtons } from "@/components/oauth-buttons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Sign up to start chatting</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <AuthForm action={register} submitLabel="Sign up" showName />
          <Separator />
          <OAuthButtons />
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
```

### Step 7: A temporary protected home page
Replace `app/page.tsx` for now (Phase 07 replaces it for real):
```tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { logout } from "@/app/actions";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect("/login");   // not logged in → go away

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-2xl">Hi {session.user.name ?? session.user.email} 👋</h1>
      <form action={logout}>
        <Button>Log out</Button>
      </form>
    </main>
  );
}
```

### Step 8 (optional): GitHub & Google login
Email/password works without this. For OAuth:
- **GitHub**: Settings → Developer settings → OAuth Apps → New. Homepage `http://localhost:3000`, callback `http://localhost:3000/api/auth/callback/github`. Put the ID and secret in `.env` as `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`.
- **Google**: Google Cloud Console → APIs & Services → Credentials → OAuth client ID (Web). Redirect URI `http://localhost:3000/api/auth/callback/google` → `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`.

Auth.js picks up variables named `AUTH_<PROVIDER>_ID` / `_SECRET` automatically.

Restart `bun dev` after editing `.env`.

## ✅ Checkpoint
- Visiting `/` while logged out redirects you to `/login`.
- You can **sign up** at `/register`, you see "Hi <name> 👋", **log out**, and log back in.
- In Prisma Studio, the `User` table has your row, and `password` is a `$2b$…` hash, **not** your password.
- DevTools → Application → Cookies: there's an `authjs.session-token` cookie marked **HttpOnly**.

## ⚠️ Common errors
| Error | Fix |
|---|---|
| `MissingSecret` | Run `bunx auth secret`, then restart the dev server |
| "Invalid email or password" right after signup | Check `DATABASE_URL`, and make sure you ran the migration |
| OAuth `redirect_uri mismatch` | The callback URL in GitHub/Google must match exactly |

## 🧪 Try it yourself
1. Copy your session cookie value, paste it into https://jwt.io and see what happens. Why can't it be decoded? (Hint: Auth.js *encrypts* it.)
2. Change the password rule to at least 8 characters, in **both** Zod schemas.

## 🤖 Ask your agent
- "Explain XSS and CSRF and which cookie flags protect against each."
- "Why does the Credentials provider require JWT sessions in Auth.js?"
- "What does `allowDangerousEmailAccountLinking` do and why is it 'dangerous'?"
- "Walk through `login()` in actions.ts. Why do we re-throw non-AuthError errors?"

➡️ Next: [Phase 07: The AI chat](07-ai-chat.md)
