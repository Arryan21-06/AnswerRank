-- Migration: 001_initial_schema
-- Description: Phase 2 Database Schema & Migrations

-- Set up gen_random_uuid
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table: users
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY, -- matches auth.users.id
    email text NOT NULL UNIQUE,
    full_name text,
    role text NOT NULL CHECK (role IN ('creator', 'brand', 'admin')),
    avatar_url text,
    onboarding_completed boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table: creator_profiles
CREATE TABLE IF NOT EXISTS public.creator_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE REFERENCES public.users(id),
    primary_niche text NOT NULL,
    handle text,
    platform text CHECK (platform IN ('youtube', 'blog', 'instagram')),
    follower_count integer DEFAULT 0,
    current_answer_rank_score numeric(5,2),
    verified boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table: brand_profiles
CREATE TABLE IF NOT EXISTS public.brand_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE REFERENCES public.users(id),
    company_name text NOT NULL,
    industry text,
    seats_used integer NOT NULL DEFAULT 1,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table: audits
CREATE TABLE IF NOT EXISTS public.audits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id uuid NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
    source_url text NOT NULL,
    platform text NOT NULL CHECK (platform IN ('youtube', 'blog')),
    status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','ingesting','scoring','indexing','complete','failed')),
    failure_reason text,
    composite_score numeric(5,2),
    word_count integer,
    vector_id text,
    created_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz
);

-- Table: content_normalized
CREATE TABLE IF NOT EXISTS public.content_normalized (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id uuid NOT NULL UNIQUE REFERENCES public.audits(id) ON DELETE CASCADE,
    raw_text text NOT NULL,
    storage_uri text,
    language text NOT NULL DEFAULT 'en',
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Table: score_records
CREATE TABLE IF NOT EXISTS public.score_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id uuid NOT NULL UNIQUE REFERENCES public.audits(id) ON DELETE CASCADE,
    direct_answer_density numeric(4,3) NOT NULL,
    entity_clarity numeric(4,3) NOT NULL,
    faq_coverage numeric(4,3) NOT NULL,
    structured_data numeric(4,3) NOT NULL,
    formatting_quality numeric(4,3) NOT NULL,
    freshness numeric(4,3) NOT NULL,
    content_depth numeric(4,3) NOT NULL,
    weights_version text NOT NULL DEFAULT 'v1',
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Table: optimization_events
CREATE TABLE IF NOT EXISTS public.optimization_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id uuid NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
    creator_id uuid NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'complete', 'failed')),
    original_excerpt text,
    optimized_text text,
    projected_score numeric(5,2),
    accepted boolean NOT NULL DEFAULT false,
    gemini_tokens_used integer,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Table: campaign_queries
CREATE TABLE IF NOT EXISTS public.campaign_queries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id uuid NOT NULL REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
    query_text text NOT NULL,
    niche_filter text,
    min_score_filter numeric(5,2),
    result_count integer,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Table: saved_creators
CREATE TABLE IF NOT EXISTS public.saved_creators (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id uuid NOT NULL REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
    creator_id uuid NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
    campaign_query_id uuid REFERENCES public.campaign_queries(id) ON DELETE SET NULL,
    note text,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (brand_id, creator_id)
);

-- Table: subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'creator_free', 'creator_pro', 'brand_trial', 'brand_enterprise')),
    audits_used_this_period integer NOT NULL DEFAULT 0,
    gemini_credits_remaining integer NOT NULL DEFAULT 1,
    billing_provider_customer_id text,
    current_period_end timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table: audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    action text NOT NULL,
    target_table text,
    target_id uuid,
    metadata jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_audits_creator_id_created_at ON public.audits(creator_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audits_status_active ON public.audits(status) WHERE status NOT IN ('complete', 'failed');

-- Implicit unique index for score_records.audit_id is handled by UNIQUE constraint.

CREATE INDEX IF NOT EXISTS idx_campaign_queries_brand_id_created_at ON public.campaign_queries(brand_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_creators_brand_id ON public.saved_creators(brand_id);
-- Implicit unique composite index on saved_creators(brand_id, creator_id) is handled by UNIQUE constraint.

CREATE INDEX IF NOT EXISTS idx_creator_profiles_primary_niche ON public.creator_profiles(primary_niche);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_current_answer_rank_score ON public.creator_profiles(current_answer_rank_score);
-- Implicit unique index on subscriptions.user_id is handled by UNIQUE constraint.
-- Implicit unique index on users.email is handled by UNIQUE constraint.


-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_normalized ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.optimization_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;


-- RLS POLICIES

-- users
CREATE POLICY "Users can read and update their own row only" ON public.users
    FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- creator_profiles
CREATE POLICY "Creators can read and update their own profile" ON public.creator_profiles
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- brand_profiles
CREATE POLICY "Brands can read and update their own profile only" ON public.brand_profiles
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- audits
CREATE POLICY "Creators can read and write only their own audits" ON public.audits
    FOR ALL
    USING (
        creator_id IN (
            SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        creator_id IN (
            SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()
        )
    );

-- content_normalized
CREATE POLICY "Creators can read and write only their own content" ON public.content_normalized
    FOR ALL
    USING (
        audit_id IN (
            SELECT id FROM public.audits WHERE creator_id IN (
                SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()
            )
        )
    )
    WITH CHECK (
        audit_id IN (
            SELECT id FROM public.audits WHERE creator_id IN (
                SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()
            )
        )
    );

-- score_records
CREATE POLICY "Readable by owning creator and any authenticated brand" ON public.score_records
    FOR SELECT
    USING (
        audit_id IN (
            SELECT id FROM public.audits WHERE creator_id IN (
                SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()
            )
        )
        OR
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'brand'
        )
    );
-- Writes to score_records should be bypassed via service-role only

-- optimization_events
CREATE POLICY "Creators can read and write only their own optimization events" ON public.optimization_events
    FOR ALL
    USING (
        creator_id IN (
            SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        creator_id IN (
            SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()
        )
    );

-- campaign_queries
CREATE POLICY "Brands can read and write only their own queries" ON public.campaign_queries
    FOR ALL
    USING (
        brand_id IN (
            SELECT id FROM public.brand_profiles WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        brand_id IN (
            SELECT id FROM public.brand_profiles WHERE user_id = auth.uid()
        )
    );

-- saved_creators
CREATE POLICY "Brands can read, insert, and delete only their own saved creators" ON public.saved_creators
    FOR ALL
    USING (
        brand_id IN (
            SELECT id FROM public.brand_profiles WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        brand_id IN (
            SELECT id FROM public.brand_profiles WHERE user_id = auth.uid()
        )
    );

-- subscriptions
CREATE POLICY "Users can read their own subscription row" ON public.subscriptions
    FOR SELECT
    USING (user_id = auth.uid());
-- Only service-role key writes to subscriptions

-- audit_logs
-- No client-side access. Admins will access this via dedicated API routes using service-role.

-- FUNCTION: search_creators
CREATE OR REPLACE FUNCTION public.search_creators(
    p_niche text,
    p_min_score numeric
) RETURNS SETOF public.creator_profiles
LANGUAGE sql SECURITY DEFINER AS $$
    SELECT * FROM public.creator_profiles
    WHERE primary_niche = p_niche
      AND current_answer_rank_score >= p_min_score
      AND verified = true;
$$;
