# Phase 05: Databases: SQL, NoSQL, Postgres, Prisma (15 min, 💡 + 👩‍💻)

## 🎯 Goal
Understand how apps store data, how SQL and NoSQL differ, and **set up Postgres + Prisma** for our users, chats and messages.

---

## 💡 1. Why a database?

Variables in your server disappear when it restarts. A **database** stores data **permanently** and lets you search it quickly and safely. Many users can also use it at the same time.

## 💡 2. SQL (relational) databases

Data lives in **tables** (like spreadsheets). Each **row** is one record, and each **column** has a fixed type.

```
User                                  Chat                                      Message
┌──────┬────────┬───────────────┐    ┌──────┬───────────────┬────────┐       ┌──────┬────────┬───────────┬─────────┐
│ id   │ name   │ email         │    │ id   │ title         │ userId │       │ id   │ chatId │ role      │ content │
├──────┼────────┼───────────────┤    ├──────┼───────────────┼────────┤       ├──────┼────────┼───────────┼─────────┤
│ u1   │ Asha   │ asha@mail.com │◀───│ c1   │ Pasta recipe  │ u1     │◀──────│ m1   │ c1     │ user      │ pasta?  │
│ u2   │ Ravi   │ ravi@mail.com │    │ c2   │ Learn TS      │ u1     │       │ m2   │ c1     │ assistant │ Sure!.. │
└──────┴────────┴───────────────┘    └──────┴───────────────┴────────┘       └──────┴────────┴───────────┴─────────┘
```

- **Primary key** (`id`): identifies each row uniquely.
- **Foreign key** (`userId`): points to a row in another table. This is a **relation**: one user has many chats, and one chat has many messages.
- **SQL** (Structured Query Language) is how you ask questions:

```sql
SELECT * FROM "Chat" WHERE "userId" = 'u1' ORDER BY "createdAt" DESC;
INSERT INTO "Message" ("id", "chatId", "role", "content") VALUES ('m3', 'c1', 'user', 'thanks');
DELETE FROM "Chat" WHERE "id" = 'c2';
```

Popular SQL databases: **PostgreSQL** (what we use), MySQL, SQLite, SQL Server.

## 💡 3. NoSQL databases

"Not only SQL". The data isn't stored in fixed tables. The most common kind is a **document database** like **MongoDB**, which stores JSON-like documents:

```json
// a "chats" collection in MongoDB: messages nested inside the chat
{
  "_id": "c1",
  "userId": "u1",
  "title": "Pasta recipe",
  "messages": [
    { "role": "user", "content": "pasta?" },
    { "role": "assistant", "content": "Sure!.." }
  ]
}
```

Other NoSQL types: key-value (**Redis**, which is very fast and good for caches), wide-column (Cassandra), graph (Neo4j).

## 💡 4. SQL vs NoSQL: Postgres vs MongoDB

| | **SQL (PostgreSQL)** | **NoSQL (MongoDB)** |
|---|---|---|
| Shape | Tables with a fixed **schema** | Flexible JSON documents |
| Relations | Excellent (JOINs, foreign keys) | Manual (nest data or store references) |
| Consistency | Strong (ACID transactions) | Configurable |
| Change structure | Migrations | Just start saving new fields |
| Scaling | Vertical first (bigger machine), horizontal is possible | Built for horizontal (many machines) |
| Good for | Users, orders, payments, **our chats** (clear relations) | Logs, catalogs, fast-changing shapes, prototyping |

**Why Postgres here?** Our data has clear relations (User → Chat → Message). Postgres is free and rock-solid, and hosts like **Neon**, **Supabase** and Vercel give you a free cloud Postgres.

## 💡 5. ORMs and Prisma

Writing raw SQL strings in JS is easy to get wrong and gives you no types. An **ORM** (Object-Relational Mapper) lets you use the database with normal code:

```ts
// Instead of: SELECT * FROM "Chat" WHERE "userId" = $1 ORDER BY "createdAt" DESC
const chats = await prisma.chat.findMany({
  where: { userId },
  orderBy: { createdAt: "desc" },
});   // ← fully typed! chats[0].title autocompletes
```

**Prisma** works like this:
1. You describe your tables in **`schema.prisma`**.
2. `prisma migrate dev` creates a **migration** (a SQL file that changes the database) and applies it.
3. `prisma generate` creates a **typed client** (`lib/generated/prisma`) you use in code.

A **migration** is a versioned, committed SQL file that describes a change to the database schema. Everyone on the team (and production) applies the same changes in the same order.

## 💡 6. Docker in one paragraph

Installing Postgres by hand is a pain. **Docker** runs software in **containers**: small isolated boxes that come with everything the software needs. `docker-compose.yml` describes the containers, and `docker compose up -d` starts them in the background.

---

## 👩‍💻 Build it

### Step 1: Start Postgres with Docker
Create in the project root:

**`docker-compose.yml`**
```yaml
# Local Postgres database for development.
# Start it with: docker compose up -d
services:
  db:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: chatgpt
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

```bash
docker compose up -d          # start (-d = in the background)
docker ps                     # check it's running
```
> **No Docker?** Create a free database at https://neon.tech and use its connection string as `DATABASE_URL` below.

### Step 2: Environment variables
Create **`.env.example`** (committed, no real secrets) and copy it to **`.env`** (secret, git-ignored):

**`.env.example`**
```bash
# Database
# Local (docker compose): the value below works as-is.
# Production: paste your Neon connection string here.
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chatgpt"

# Auth.js — generate a secret with: npx auth secret
AUTH_SECRET=""

# GitHub OAuth app — callback: http://localhost:3000/api/auth/callback/github
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""

# Google OAuth client — callback: http://localhost:3000/api/auth/callback/google
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""

# OpenRouter — get a key at https://openrouter.ai/keys
OPENROUTER_API_KEY=""
```

```bash
cp .env.example .env
```
Open `.gitignore` and make sure it has these lines, so `.env` is never committed but `.env.example` is:
```gitignore
.env*
!.env.example
/lib/generated/prisma
```

### Step 3: Install Prisma
```bash
bun add @prisma/client @prisma/adapter-pg
bun add -d prisma dotenv
```
- `prisma`: the CLI (migrate, generate, studio)
- `@prisma/client`: the runtime library
- `@prisma/adapter-pg`: connects Prisma to Postgres using the `pg` driver
- `dotenv`: lets the Prisma config read `.env`

### Step 4: Prisma config
**`prisma.config.ts`** tells the Prisma CLI where the schema and migrations are, and which database to use:
```ts
// This file was generated by Prisma, and assumes you have installed the following:
// npm install --save-dev prisma dotenv
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

### Step 5: The schema, our tables
The top 4 models are the tables **Auth.js** needs (Phase 06). `Chat` and `Message` are ours. Read the comments!

**`prisma/schema.prisma`**
```prisma
generator client {
  provider = "prisma-client"
  output   = "../lib/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

// ---------- Auth.js tables ----------

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String? // only set for email/password users
  accounts      Account[]
  sessions      Session[]
  chats         Chat[]
  createdAt     DateTime  @default(now())
}

model Account {
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([provider, providerAccountId])
}

model Session {
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@id([identifier, token])
}

// ---------- App tables ----------

model Chat {
  id        String    @id @default(cuid())
  title     String    @default("New chat")
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages  Message[]
  createdAt DateTime  @default(now())
}

model Message {
  id        String   @id @default(cuid())
  chatId    String
  chat      Chat     @relation(fields: [chatId], references: [id], onDelete: Cascade)
  role      String // "user" or "assistant"
  content   String
  createdAt DateTime @default(now())
}
```

How to read it:
- `@id @default(cuid())`: a primary key that fills itself with a random unique id
- `String?`: optional (can be `NULL`)
- `@unique`: no two users can have the same email
- `chats Chat[]`: one user has many chats
- `@relation(fields: [userId], references: [id], onDelete: Cascade)`: a foreign key. **Delete a user → their chats are deleted too**, and deleting a chat deletes its messages.

### Step 6: Create the tables
```bash
bunx prisma migrate dev --name init   # writes prisma/migrations/…/migration.sql and runs it
bunx prisma generate                  # creates the typed client in lib/generated/prisma
```
Open `prisma/migrations/*/migration.sql`. It's the real SQL (`CREATE TABLE "Chat" …`) that Prisma wrote for you.

Also add a `postinstall` script to `package.json`, so the client is regenerated after every install (Vercel needs this):
```json
"scripts": {
  "dev": "next dev",
  "build": "prisma generate && next build",
  "start": "next start",
  "lint": "eslint",
  "postinstall": "prisma generate"
}
```

### Step 7: One shared Prisma client
**`lib/prisma.ts`**
```ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

// In dev, Next.js hot-reloads files, which would create a new client (and
// new DB connections) every time. Keeping it on globalThis reuses one client.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

In dev, Next.js reloads files on every save. Without the `globalThis` trick, each reload would open **new** database connections until Postgres runs out.

### Step 8: Look at your data
```bash
bunx prisma studio      # opens a web UI to browse and edit your tables
```

## ✅ Checkpoint
- `docker ps` shows a `postgres:16` container.
- `bunx prisma studio` shows the tables `User`, `Account`, `Session`, `VerificationToken`, `Chat`, `Message`.
- Commit: `git add . && git commit -m "database + prisma"`

## ⚠️ Common errors
| Error | Fix |
|---|---|
| `Can't reach database server at localhost:5432` | Docker isn't running → `docker compose up -d` |
| `port 5432 already in use` | Another Postgres is running. Stop it, or change the port to `"5433:5432"` in the compose file and in `DATABASE_URL` |
| `Cannot find module '@/lib/generated/prisma/client'` | Run `bunx prisma generate` |

## 🧪 Try it yourself
1. Add a `pinned Boolean @default(false)` field to `Chat`, run `bunx prisma migrate dev --name add-pinned`, and look at the new migration SQL.
2. In Prisma Studio, create a user by hand and a chat that belongs to them. Then delete the user and watch the chat disappear (cascade).

## 🤖 Ask your agent
- "Translate these 3 Prisma queries from our project into raw SQL."
- "How would this schema look in MongoDB? What would be easier and what would be harder?"
- "What are database indexes, and which ones would help our Chat and Message tables?"
- "What's a SQL injection and how does Prisma protect me from it?"

➡️ Next: [Phase 06: Authentication](06-auth.md)
