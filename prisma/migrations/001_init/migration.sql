-- ============================================================
-- SkillBridge SA — Database Migration
-- PostgreSQL 15 + pgvector
-- Run: psql -U skillbridge -d skillbridge -f migration.sql
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ────────────────────────────────────────────────────────────
-- Users & Auth
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email             VARCHAR(255) UNIQUE NOT NULL,
    name              VARCHAR(255),
    language_pref     VARCHAR(10) DEFAULT 'en',
    data_mode         VARCHAR(20) DEFAULT 'standard',
    consent_cv        BOOLEAN DEFAULT FALSE,
    consent_analytics BOOLEAN DEFAULT FALSE,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW(),
    deleted_at        TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS sessions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token VARCHAR(500) UNIQUE NOT NULL,
    user_id       UUID NOT NULL,
    expires       TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier VARCHAR(255) NOT NULL,
    token      VARCHAR(500) UNIQUE NOT NULL,
    expires    TIMESTAMPTZ NOT NULL,
    UNIQUE(identifier, token)
);

-- ────────────────────────────────────────────────────────────
-- Profiles
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    education_level  VARCHAR(100),
    years_experience INTEGER,
    industries       TEXT[] DEFAULT '{}',
    prior_roles      TEXT[] DEFAULT '{}',
    skill_ratings    JSONB DEFAULT '{}',
    hours_per_week   INTEGER DEFAULT 10,
    device_type      VARCHAR(50),
    bandwidth        VARCHAR(50),
    budget           VARCHAR(50),
    portfolio_links  JSONB DEFAULT '[]',
    strengths        TEXT[] DEFAULT '{}',
    interests        TEXT[] DEFAULT '{}',
    avoid_prefs      TEXT[] DEFAULT '{}',
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- CVs (with pgvector embedding)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cvs (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_key          VARCHAR(500) NOT NULL,
    file_name         VARCHAR(255),
    file_type         VARCHAR(50),
    file_size_bytes   INTEGER,
    extracted_text    TEXT,
    structured_data   JSONB,
    embedding         vector(1536),
    redacted_sections TEXT[] DEFAULT '{}',
    status            VARCHAR(50) DEFAULT 'uploaded',
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cvs_user ON cvs(user_id);
CREATE INDEX IF NOT EXISTS idx_cvs_embedding ON cvs USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ────────────────────────────────────────────────────────────
-- Jobs (with pgvector embedding)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS jobs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title        VARCHAR(500) NOT NULL,
    description  TEXT,
    source_url   VARCHAR(2000),
    raw_text     TEXT,
    requirements JSONB,
    proficiency  VARCHAR(50),
    timeline     VARCHAR(50),
    embedding    vector(1536),
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_user ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_embedding ON jobs USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ────────────────────────────────────────────────────────────
-- Competency Maps
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS competency_maps (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id       UUID UNIQUE NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    competencies JSONB NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- Match Reports
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS match_reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cv_id           UUID REFERENCES cvs(id) ON DELETE SET NULL,
    job_id          UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    overall_score   DECIMAL(5,2),
    overlaps        JSONB,
    gaps            JSONB,
    strengths       JSONB,
    recommendations JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- Assessments
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS assessments (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id     UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    competency VARCHAR(255),
    questions  JSONB,
    status     VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessments_user_job ON assessments(user_id, job_id);

CREATE TABLE IF NOT EXISTS assessment_submissions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    answers       JSONB,
    scores        JSONB,
    overall_score DECIMAL(5,2),
    gap_report    JSONB,
    feedback      JSONB,
    submitted_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- Learning Resources (with pgvector)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS learning_resources (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(500),
    type            VARCHAR(50),
    provider        VARCHAR(255),
    url             VARCHAR(2000),
    competencies    TEXT[] DEFAULT '{}',
    difficulty      VARCHAR(50),
    estimated_hours DECIMAL(5,1),
    prerequisites   TEXT[] DEFAULT '{}',
    description     TEXT,
    embedding       vector(1536),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_embedding ON learning_resources USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE TABLE IF NOT EXISTS institutions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              VARCHAR(500),
    url               VARCHAR(2000),
    description       TEXT,
    best_for          TEXT,
    typical_offerings TEXT[] DEFAULT '{}',
    recognition       TEXT,
    category          VARCHAR(100),
    region            VARCHAR(100),
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_resources (
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES learning_resources(id) ON DELETE CASCADE,
    notes       TEXT,
    saved_at    TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, resource_id)
);

-- ────────────────────────────────────────────────────────────
-- Podcast Episodes
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS podcast_episodes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id     UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    title      VARCHAR(500),
    outline    JSONB,
    status     VARCHAR(50) DEFAULT 'generating',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_podcast_episodes_user ON podcast_episodes(user_id);

CREATE TABLE IF NOT EXISTS podcast_turns (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    episode_id  UUID NOT NULL REFERENCES podcast_episodes(id) ON DELETE CASCADE,
    turn_number INTEGER NOT NULL,
    speaker     VARCHAR(100),
    content     TEXT NOT NULL,
    chapter     VARCHAR(255),
    is_redirect BOOLEAN DEFAULT FALSE,
    audio_key   VARCHAR(500),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_podcast_turns_episode ON podcast_turns(episode_id);

CREATE TABLE IF NOT EXISTS podcast_bookmarks (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    episode_id UUID NOT NULL REFERENCES podcast_episodes(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    turn_id    UUID NOT NULL REFERENCES podcast_turns(id) ON DELETE CASCADE,
    note       TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- CV Optimisation
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cv_optimisations (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cv_id            UUID REFERENCES cvs(id) ON DELETE SET NULL,
    job_id           UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    keyword_report   JSONB,
    suggestions      JSONB,
    ats_version      TEXT,
    human_version    TEXT,
    missing_sections JSONB,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- Portfolio Projects
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS portfolio_projects (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id     UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    title      VARCHAR(500),
    brief      JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- Interview Sessions
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS interview_sessions (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id     UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    questions  JSONB,
    answers    JSONB,
    feedback   JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- Audit Log (POPIA compliance)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_log (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    action        VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id   UUID,
    metadata      JSONB,
    ip_address    INET,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);

-- ────────────────────────────────────────────────────────────
-- Updated-at trigger function
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
