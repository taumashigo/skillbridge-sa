# SkillBridge SA — Deployment Roadmap

A step-by-step guide from where you are now to a live Vercel deployment.

---

## Phase 1: Scaffold the Next.js Project (Local)

You have all the code — now it needs to live inside a proper Next.js project.

```bash
# 1. Create the Next.js project
npx create-next-app@latest skillbridge-sa \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd skillbridge-sa

# 2. Install dependencies
npm install @prisma/client bullmq zod zustand @tanstack/react-query \
  framer-motion recharts next-auth pdf-parse mammoth uuid

npm install -D prisma vitest @testing-library/react

# 3. Copy the delivered files into the project:
#    - app.jsx          → src/app/page.tsx (rename + adapt)
#    - schema.prisma    → prisma/schema.prisma
#    - migration.sql    → prisma/migrations/001_init/migration.sql
#    - prompts.js       → src/lib/ai/prompts.ts
#    - claude-client.js → src/lib/ai/claude-client.ts
#    - cv-parser.js     → src/lib/services/cv-parser.ts
#    - competency-engine.js → src/lib/services/competency-engine.ts
#    - podcast-orchestrator.js → src/lib/services/podcast-orchestrator.ts
#    - api-handlers.js  → src/app/api/ (split into route files)
#    - worker.js        → src/lib/queue/worker.ts
#    - app.test.js      → tests/app.test.ts
#    - .env.example     → .env.local (fill in your values)

# 4. Initialise Prisma
npx prisma init
# Then replace the generated schema with your schema.prisma

# 5. Verify it runs locally
npm run dev
```

**Key decision:** The delivered `app.jsx` is a self-contained React app. You can either:
- Use it directly as a single-page component (quickest path)
- Break it into separate route files under `src/app/` (cleaner for production)

I'd recommend starting with it as-is, then refactoring later.

---

## Phase 2: Set Up External Services

Vercel is serverless — you can't run Postgres or Redis on it directly. You need managed services.

### Database: Supabase (Recommended)

Supabase gives you Postgres + pgvector + object storage + auth in one platform, with a Vercel integration that auto-syncs environment variables.

```
1. Go to supabase.com → Create new project
2. Choose a region close to SA (eu-west-1 or af-south-1 if available)
3. Enable the pgvector extension:
   - Dashboard → SQL Editor → Run: CREATE EXTENSION IF NOT EXISTS vector;
4. Run your migration:
   - SQL Editor → Paste contents of migration.sql → Run
5. Grab your connection string:
   - Settings → Database → Connection string (URI)
   - Copy the "Session pooler" URI for Vercel
```

**Why Supabase over Neon/Vercel Postgres:** Supabase gives you pgvector, object storage (for CVs), and row-level security out of the box. It has a native Vercel marketplace integration.

### Redis: Upstash (Recommended)

```
1. Go to upstash.com → Create new Redis database
2. Choose a region matching your Supabase region
3. Copy the UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
```

**Note for Vercel:** BullMQ requires a persistent Redis connection, which doesn't work well with serverless. For Vercel, you have two options:
- **Option A (simpler):** Replace BullMQ with **Upstash QStash** — a serverless queue that calls your API routes as webhooks. This is the recommended approach for Vercel.
- **Option B:** Run the BullMQ worker on a separate always-on service (Railway, Fly.io, or a small EC2 instance).

### Object Storage: Supabase Storage

```
1. In your Supabase project → Storage → Create bucket "cv-uploads"
2. Set the bucket to private (signed URLs only)
3. Use the Supabase JS client for uploads instead of raw S3
```

### Anthropic API Key

```
1. Go to console.anthropic.com
2. Create an API key
3. Set a usage limit to control costs during development
```

---

## Phase 3: Adapt Code for Vercel's Serverless Model

A few things need adjusting for Vercel:

### 3a. Replace BullMQ with QStash (or inline calls)

For the MVP, the simplest approach is to make LLM calls inline in API routes rather than through a queue. This means the API response will be slower (10-20s for AI calls), but it works immediately on Vercel without extra infrastructure.

```typescript
// Instead of: await queue.add('competency-extract', { ... })
// Do this in your API route:
const result = await generateCompetencyMap(title, description, proficiency, requestId);
await prisma.competencyMap.create({ ... });
return apiResponse(result);
```

For production with better UX, switch to Upstash QStash:
```bash
npm install @upstash/qstash
```

QStash will call your API routes as webhooks when jobs are ready.

### 3b. Prisma on Vercel

```bash
# Add to package.json scripts:
"postinstall": "prisma generate"

# In your Prisma schema, add for connection pooling:
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // For migrations
}
```

### 3c. File Uploads

For Vercel, use Supabase Storage instead of S3/MinIO:
```bash
npm install @supabase/supabase-js
```

---

## Phase 4: Configure Environment Variables

Create `.env.local` for local development:

```env
# Supabase
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="https://[id].upstash.io"
UPSTASH_REDIS_REST_TOKEN="AX..."

# Anthropic
ANTHROPIC_API_KEY="sk-ant-..."

# Auth
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

---

## Phase 5: Push to GitHub & Deploy

```bash
# 1. Initialise Git
git init
git add .
git commit -m "SkillBridge SA — initial commit"

# 2. Create GitHub repo
gh repo create skillbridge-sa --private --push

# 3. Connect to Vercel
#    Option A: Via Vercel dashboard
#    - Go to vercel.com/new
#    - Import your GitHub repo
#    - Vercel auto-detects Next.js
#
#    Option B: Via CLI
npm i -g vercel
vercel link
vercel env add DATABASE_URL
vercel env add ANTHROPIC_API_KEY
# ... add all env vars

# 4. Deploy
vercel --prod
```

### Add Supabase via Vercel Marketplace

```
1. Vercel Dashboard → Your project → Storage tab
2. Click "Connect Store" → Select Supabase
3. This auto-syncs all Supabase env vars to your Vercel project
```

---

## Phase 6: Post-Deployment Checklist

| Task | Priority | Notes |
|------|----------|-------|
| Verify all pages load | Critical | Test each route |
| Test CV upload + parse | Critical | Needs Supabase Storage working |
| Test job ingestion | Critical | Needs Anthropic API key |
| Set up custom domain | High | Vercel → Settings → Domains |
| Enable Vercel Analytics | High | Free tier available |
| Set Anthropic API spend limit | High | Console → Usage limits |
| Run Prisma migration on Supabase | Critical | `npx prisma db push` or SQL Editor |
| Configure CORS if needed | Medium | Next.js handles this by default |
| Set up error monitoring (Sentry) | Medium | `npm install @sentry/nextjs` |
| Enable Vercel Speed Insights | Low | Free with Vercel |

---

## Recommended Service Tier (Starting Costs)

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| **Vercel** | Hobby (free) or Pro ($20) | $0–$20 |
| **Supabase** | Free tier (500 MB DB, 1 GB storage) | $0 |
| **Upstash Redis** | Free tier (10K commands/day) | $0 |
| **Anthropic API** | Pay-as-you-go | ~$5–$30 depending on usage |

**Total MVP cost: $5–$50/month**, mostly Anthropic API usage.

---

## Phase 7: Iterate Towards Production

Once the MVP is live, the priority order for improvements:

1. **Break `app.jsx` into proper route files** — cleaner routing, better code splitting
2. **Add Upstash QStash** — non-blocking AI calls with progress indicators
3. **Implement NextAuth properly** — magic link email via Resend or Postmark
4. **Add Supabase Row-Level Security** — enforces data isolation at the DB level
5. **Enable pgvector semantic search** — for CV↔Job matching beyond keyword overlap
6. **Add Vercel Cron Jobs** — for scheduled tasks like weekly plan emails
7. **Set up CI/CD** — GitHub Actions running tests before deploy
8. **Add rate limiting middleware** — Upstash Ratelimit for API protection

---

## Quick Reference: File → Location Mapping

```
Delivered File          → Next.js Location
─────────────────────────────────────────
app.jsx                 → src/app/page.tsx
schema.prisma           → prisma/schema.prisma
migration.sql           → prisma/migrations/001_init/migration.sql
prompts.js              → src/lib/ai/prompts.ts
claude-client.js        → src/lib/ai/claude-client.ts
cv-parser.js            → src/lib/services/cv-parser.ts
competency-engine.js    → src/lib/services/competency-engine.ts
podcast-orchestrator.js → src/lib/services/podcast-orchestrator.ts
api-handlers.js         → src/app/api/[route]/route.ts (split per endpoint)
worker.js               → src/lib/queue/worker.ts (or replace with QStash)
app.test.js             → tests/app.test.ts
docker-compose.yml      → docker-compose.yml (local dev only)
Dockerfile              → Dockerfile (for non-Vercel deploys)
.env.example            → .env.local
README.md               → README.md
```
