# SkillBridge SA

**From "not shortlisted" to "job-ready" — a skills intelligence platform for South African job seekers.**

SkillBridge SA ingests a job posting (URL or manual entry) alongside your CV and profile, then produces a structured competency map, adaptive skills assessments, a curated learning plan with certified training providers, an interactive steerable panel podcast, and job-winning artefacts (ATS-optimised CVs, portfolio briefs, interview practice).

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Repository Structure](#repository-structure)
4. [Database Schema](#database-schema)
5. [API Specification](#api-specification)
6. [Key Screens](#key-screens)
7. [Local Development Setup](#local-development-setup)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Privacy & POPIA Compliance](#privacy--popia-compliance)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                          │
│  Next.js 14 (App Router) + TypeScript + TailwindCSS         │
│  Framer Motion animations · Recharts/D3 radar charts        │
│  PWA shell · Reduced-data mode · Responsive mobile-first    │
├─────────────────────────────────────────────────────────────┤
│                      API / BFF TIER                         │
│  Next.js API Routes (Edge + Node runtimes)                  │
│  Auth: magic-link email OTP (NextAuth / custom)             │
│  Rate limiting (upstash/ratelimit) · Request ID middleware   │
│  Structured JSON responses · Input validation (Zod)         │
├─────────────────────────────────────────────────────────────┤
│                     SERVICE TIER                            │
│  ┌────────────┐ ┌──────────────┐ ┌────────────────────┐    │
│  │ Job Ingest │ │ CV Parser    │ │ Competency Engine  │    │
│  │ Service    │ │ Service      │ │ (hybrid LLM+rules) │    │
│  └────────────┘ └──────────────┘ └────────────────────┘    │
│  ┌────────────┐ ┌──────────────┐ ┌────────────────────┐    │
│  │ Assessment │ │ Learning &   │ │ Podcast            │    │
│  │ Service    │ │ Institutions │ │ Orchestrator       │    │
│  └────────────┘ └──────────────┘ └────────────────────┘    │
│  ┌────────────┐ ┌──────────────┐                           │
│  │ CV/ATS     │ │ Portfolio &  │  BullMQ async queue       │
│  │ Optimiser  │ │ Interview   │  (Redis-backed)            │
│  └────────────┘ └──────────────┘                           │
├─────────────────────────────────────────────────────────────┤
│                      DATA TIER                              │
│  PostgreSQL 15 + pgvector (semantic search)                 │
│  Redis (queue + sessions + rate-limit counters)             │
│  S3-compatible object storage (CVs, audio, exports)         │
│  Signed URLs for all file access                            │
└─────────────────────────────────────────────────────────────┘
```

### Key Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Next.js App Router** | SSR for SEO landing page; RSC for dashboard reduces client JS; API routes co-located for deployment simplicity on Vercel. |
| **pgvector** | Semantic search across CVs, job descriptions, and learning resources without a separate vector DB. Reduces infrastructure cost. |
| **BullMQ + Redis** | Long-running LLM calls (podcast generation, CV parsing) must not block HTTP. Queue gives retry, back-pressure, and observability. |
| **Hybrid competency extraction** | Deterministic regex/NLP for known skills taxonomy + LLM for nuanced inference. Deterministic layer is fast/cheap; LLM adds depth. |
| **Transcript-first podcast** | Audio TTS is optional and bandwidth-heavy. Transcript works on 2G, is searchable, exportable, and accessible. |
| **POPIA by design** | Consent gates before CV analysis; signed URLs (not public); user-triggered full deletion; no protected-class inference. |
| **Reduced-data mode** | Toggle disables images, defers non-critical JS, uses smaller API payloads. Critical for SA mobile users on metered data. |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | TailwindCSS 3.4 + CSS variables for theming |
| Animation | Framer Motion 11 + Lottie (micro-animations) |
| Charts | Recharts (radar, bar, progress) |
| State | Zustand (client) + React Query (server state) |
| Auth | NextAuth.js with email magic-link provider |
| Validation | Zod (shared client/server schemas) |
| Database | PostgreSQL 15 + pgvector extension |
| Queue | BullMQ + Redis 7 |
| Object Storage | S3-compatible (AWS S3 / Supabase Storage / MinIO) |
| CV Parsing | pdf-parse + mammoth (DOCX) + LLM structuring |
| LLM | Anthropic Claude API (competencies, assessments, podcast) |
| TTS | Optional: ElevenLabs / browser SpeechSynthesis |
| Deployment | Vercel (primary) / Docker + fly.io / AWS ECS |

---

## Repository Structure

```
skillbridge-sa/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Auth routes (login, verify)
│   ├── (marketing)/              # Landing page, about
│   ├── dashboard/                # Main dashboard
│   ├── onboarding/               # Profile wizard
│   ├── job/                      # Job input + analysis
│   ├── assessment/               # Skills tests
│   ├── learning/                 # Resource library + institutions
│   ├── podcast/                  # Podcast studio
│   ├── cv-optimiser/             # CV/ATS editor
│   ├── interview/                # Interview simulator
│   ├── settings/                 # Privacy, preferences
│   └── api/                      # API routes
│       ├── profile/
│       ├── cv/
│       ├── job/
│       ├── assessment/
│       ├── learning/
│       ├── institutions/
│       ├── podcast/
│       └── health/
├── components/                   # Shared UI components
│   ├── ui/                       # Primitives (Button, Card, Modal)
│   ├── charts/                   # Radar, progress, timeline
│   ├── podcast/                  # Speaker cards, transcript
│   └── layout/                   # Nav, sidebar, footer
├── lib/                          # Shared utilities
│   ├── services/                 # Business logic modules
│   ├── db/                       # Prisma schema + migrations
│   ├── queue/                    # BullMQ job definitions
│   ├── ai/                       # LLM prompt templates + helpers
│   └── validators/               # Zod schemas
├── public/                       # Static assets
├── tests/                        # Test suites
├── docker/                       # Docker configs
│   ├── Dockerfile
│   └── docker-compose.yml
├── docs/                         # Extended documentation
│   ├── API.md
│   ├── SCHEMA.md
│   └── DEPLOYMENT.md
└── .env.example
```

---

## Database Schema

### Core Tables

```sql
-- Users
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    name            VARCHAR(255),
    language_pref   VARCHAR(10) DEFAULT 'en',
    data_mode       VARCHAR(20) DEFAULT 'standard',  -- 'standard' | 'reduced'
    consent_cv      BOOLEAN DEFAULT FALSE,
    consent_analytics BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ  -- soft delete for POPIA
);

-- User Profiles (onboarding data)
CREATE TABLE profiles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    education_level VARCHAR(100),
    years_experience INTEGER,
    industries      TEXT[],
    prior_roles     TEXT[],
    skill_ratings   JSONB DEFAULT '{}',  -- { "python": 4, "sql": 3 }
    hours_per_week  INTEGER DEFAULT 10,
    device_type     VARCHAR(50),
    bandwidth       VARCHAR(50),  -- 'low' | 'medium' | 'high'
    budget          VARCHAR(50),  -- 'free' | 'low' | 'medium' | 'flexible'
    portfolio_links JSONB DEFAULT '[]',
    strengths       TEXT[],
    interests       TEXT[],
    avoid_prefs     TEXT[],
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- CVs
CREATE TABLE cvs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    file_key        VARCHAR(500) NOT NULL,  -- S3 object key
    file_name       VARCHAR(255),
    file_type       VARCHAR(50),
    file_size_bytes INTEGER,
    extracted_text  TEXT,
    structured_data JSONB,  -- parsed sections
    embedding       vector(1536),  -- pgvector
    redacted_sections TEXT[],
    status          VARCHAR(50) DEFAULT 'uploaded',  -- uploaded|parsing|parsed|error
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs
CREATE TABLE jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(500) NOT NULL,
    description     TEXT,
    source_url      VARCHAR(2000),
    raw_text        TEXT,
    requirements    JSONB,  -- normalised requirements
    proficiency     VARCHAR(50),  -- beginner|intermediate|advanced
    timeline        VARCHAR(50),  -- 2_weeks|1_month|3_months
    embedding       vector(1536),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Competency Maps
CREATE TABLE competency_maps (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id          UUID REFERENCES jobs(id) ON DELETE CASCADE,
    competencies    JSONB NOT NULL,
    -- Each: { name, category, definition, why_it_matters,
    --         levels: { basic, intermediate, advanced },
    --         evidence_examples, synonyms, ats_keywords }
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- CV-Job Match Reports
CREATE TABLE match_reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    cv_id           UUID REFERENCES cvs(id) ON DELETE SET NULL,
    job_id          UUID REFERENCES jobs(id) ON DELETE CASCADE,
    overall_score   DECIMAL(5,2),
    overlaps        JSONB,
    gaps            JSONB,
    strengths       JSONB,
    recommendations JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Assessments
CREATE TABLE assessments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id          UUID REFERENCES jobs(id) ON DELETE CASCADE,
    competency      VARCHAR(255),
    questions       JSONB,  -- array of question objects
    status          VARCHAR(50) DEFAULT 'pending',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE assessment_submissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id   UUID REFERENCES assessments(id) ON DELETE CASCADE,
    answers         JSONB,
    scores          JSONB,
    overall_score   DECIMAL(5,2),
    gap_report      JSONB,
    feedback        JSONB,
    submitted_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Learning Resources
CREATE TABLE learning_resources (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(500),
    type            VARCHAR(50),  -- doc|course|paper|template|video
    provider        VARCHAR(255),
    url             VARCHAR(2000),
    competencies    TEXT[],
    difficulty      VARCHAR(50),
    estimated_hours DECIMAL(5,1),
    prerequisites   TEXT[],
    description     TEXT,
    embedding       vector(1536),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Training Institutions
CREATE TABLE institutions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(500),
    url             VARCHAR(2000),
    description     TEXT,
    best_for        TEXT,
    typical_offerings TEXT[],
    recognition     TEXT,
    category        VARCHAR(100),  -- university|tvet|vendor_cert|online|bootcamp
    region          VARCHAR(100),  -- global|south_africa|africa
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- User saved resources
CREATE TABLE saved_resources (
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    resource_id     UUID REFERENCES learning_resources(id) ON DELETE CASCADE,
    notes           TEXT,
    saved_at        TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, resource_id)
);

-- Podcast Episodes
CREATE TABLE podcast_episodes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id          UUID REFERENCES jobs(id) ON DELETE CASCADE,
    title           VARCHAR(500),
    outline         JSONB,
    status          VARCHAR(50) DEFAULT 'generating',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE podcast_turns (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    episode_id      UUID REFERENCES podcast_episodes(id) ON DELETE CASCADE,
    turn_number     INTEGER NOT NULL,
    speaker         VARCHAR(100),  -- moderator|expert|hiring_mgr|user_avatar
    content         TEXT NOT NULL,
    chapter         VARCHAR(255),
    is_redirect     BOOLEAN DEFAULT FALSE,
    audio_key       VARCHAR(500),  -- optional S3 key
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE podcast_bookmarks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    episode_id      UUID REFERENCES podcast_episodes(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    turn_id         UUID REFERENCES podcast_turns(id) ON DELETE CASCADE,
    note            TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- CV Optimisation
CREATE TABLE cv_optimisations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    cv_id           UUID REFERENCES cvs(id) ON DELETE SET NULL,
    job_id          UUID REFERENCES jobs(id) ON DELETE CASCADE,
    keyword_report  JSONB,
    suggestions     JSONB,
    ats_version     TEXT,
    human_version   TEXT,
    missing_sections JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio Projects
CREATE TABLE portfolio_projects (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id          UUID REFERENCES jobs(id) ON DELETE CASCADE,
    title           VARCHAR(500),
    brief           JSONB,  -- requirements, criteria, rubric, stack, readme, talking_points
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Interview Practice
CREATE TABLE interview_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id          UUID REFERENCES jobs(id) ON DELETE CASCADE,
    questions       JSONB,
    answers         JSONB,
    feedback        JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log (POPIA)
CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    action          VARCHAR(100),
    resource_type   VARCHAR(100),
    resource_id     UUID,
    metadata        JSONB,
    ip_address      INET,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_user ON profiles(user_id);
CREATE INDEX idx_cvs_user ON cvs(user_id);
CREATE INDEX idx_jobs_user ON jobs(user_id);
CREATE INDEX idx_assessments_user_job ON assessments(user_id, job_id);
CREATE INDEX idx_podcast_episodes_user ON podcast_episodes(user_id);
CREATE INDEX idx_podcast_turns_episode ON podcast_turns(episode_id);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_cvs_embedding ON cvs USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_jobs_embedding ON jobs USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_resources_embedding ON learning_resources USING ivfflat (embedding vector_cosine_ops);
```

---

## API Specification

All responses follow a consistent envelope:

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "requestId": "req_abc123",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

Error responses:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Job title is required",
    "details": [{ "field": "title", "issue": "required" }]
  },
  "requestId": "req_abc123"
}
```

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/profile` | Create/update user profile |
| GET | `/api/profile` | Get current user profile |
| POST | `/api/cv/upload` | Upload CV file (multipart) |
| POST | `/api/cv/parse` | Trigger CV parsing job |
| GET | `/api/cv/:id` | Get parsed CV data |
| DELETE | `/api/cv/:id` | Delete CV + all derived data |
| POST | `/api/job/ingest` | Submit job (URL or pasted text) |
| GET | `/api/job/:id` | Get job details |
| GET | `/api/job/:id/competencies` | Get competency map |
| GET | `/api/job/:id/match` | Get CV↔Job match report |
| POST | `/api/assessment/generate` | Generate assessment for job |
| POST | `/api/assessment/submit` | Submit assessment answers |
| GET | `/api/assessment/:id/results` | Get scored results + gap report |
| GET | `/api/learning/recommendations` | Get learning resources for job |
| GET | `/api/institutions/recommendations` | Get institutions + cert bodies |
| POST | `/api/podcast/episode/create` | Create podcast episode |
| POST | `/api/podcast/episode/:id/redirect` | Redirect podcast discussion |
| GET | `/api/podcast/episode/:id/transcript` | Get full transcript |
| POST | `/api/podcast/episode/:id/bookmark` | Add bookmark |
| POST | `/api/cv/optimise` | Generate ATS-optimised CV |
| GET | `/api/cv/optimise/:id` | Get optimisation results |
| POST | `/api/portfolio/generate` | Generate project briefs |
| POST | `/api/interview/start` | Start interview session |
| POST | `/api/interview/:id/answer` | Submit interview answer |
| GET | `/api/settings` | Get user settings |
| PUT | `/api/settings` | Update settings |
| POST | `/api/data/export` | Request data export (POPIA) |
| DELETE | `/api/data/delete` | Delete all user data (POPIA) |

---

## Testing Plan

### Unit Tests
- Zod schema validation (profile, job, CV structured data)
- Competency extraction (deterministic layer)
- Assessment scoring logic
- Match score computation

### Integration Tests
- CV upload → parse → structured data flow
- Job ingest → competency map generation
- Assessment generate → submit → gap report
- Podcast create → redirect → transcript update

### E2E Tests (Playwright)
- Full onboarding flow
- Job submission + dashboard view
- Assessment completion
- Podcast interaction with redirect

### Manual QA Checklist
- [ ] Mobile responsiveness (320px–768px)
- [ ] Reduced-data mode toggle
- [ ] CV delete cascades to all derived data
- [ ] Consent modal blocks analysis until accepted
- [ ] Skeleton loaders appear during async operations

---

## Deployment

### Option A: Vercel (Recommended)

```bash
# 1. Push to GitHub
git push origin main

# 2. Connect to Vercel
vercel link

# 3. Set environment variables
vercel env add DATABASE_URL
vercel env add REDIS_URL
vercel env add S3_BUCKET
vercel env add ANTHROPIC_API_KEY
vercel env add NEXTAUTH_SECRET

# 4. Deploy
vercel --prod
```

External services needed:
- **Database**: Supabase (Postgres + pgvector) or Neon
- **Redis**: Upstash
- **Object Storage**: Supabase Storage or AWS S3
- **Queue**: Upstash QStash (serverless alternative to BullMQ)

### Option B: Docker

```bash
docker-compose up -d
```

See `docker/docker-compose.yml` for full configuration including Postgres, Redis, and MinIO.

### Option C: AWS ECS / Azure Container Apps

See `docs/DEPLOYMENT.md` for cloud-specific guides.

---

## Privacy & POPIA Compliance

1. **Consent gates**: CV analysis requires explicit opt-in; toggle in settings.
2. **Data minimisation**: Only extract what's needed; no protected-class inference.
3. **Right to access**: `/api/data/export` produces a ZIP of all user data.
4. **Right to deletion**: `/api/data/delete` removes user + all derived data.
5. **Encryption**: Files encrypted at rest (S3 SSE); database connections over TLS.
6. **Signed URLs**: All file downloads use time-limited signed URLs.
7. **Audit log**: Every data access/mutation is logged with request ID.
8. **No guarantees**: UI never promises "you will get hired"; always explains "why" behind recommendations.

---

## Licence

Proprietary — SkillBridge SA © 2025. All rights reserved.
