-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ENUMs / Constants will be managed through CHECK constraints as defined in schema

-- TABLE users
-- Note: users table is an extension of auth.users
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL UNIQUE,
    full_name text,
    role text NOT NULL CHECK (role IN ('creator', 'brand', 'admin')),
    avatar_url text,
    onboarding_completed boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- TABLE creator_profiles
CREATE TABLE IF NOT EXISTS public.creator_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    primary_niche text NOT NULL,
    handle text,
    platform text CHECK (platform IN ('youtube', 'blog', 'instagram')),
    follower_count integer DEFAULT 0,
    current_answer_rank_score numeric(5,2),
    verified boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- TABLE brand_profiles
CREATE TABLE IF NOT EXISTS public.brand_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    company_name text NOT NULL,
    industry text,
    seats_used integer NOT NULL DEFAULT 1,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- TABLE audits
CREATE TABLE IF NOT EXISTS public.audits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id uuid NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
    source_url text NOT NULL,
    platform text NOT NULL CHECK (platform IN ('youtube', 'blog')),
    status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'ingesting', 'scoring', 'indexing', 'complete', 'failed')),
    failure_reason text,
    composite_score numeric(5,2),
    word_count integer,
    vector_id text,
    created_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz
);

-- TABLE content_normalized
CREATE TABLE IF NOT EXISTS public.content_normalized (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id uuid NOT NULL UNIQUE REFERENCES public.audits(id) ON DELETE CASCADE,
    raw_text text NOT NULL,
    storage_uri text,
    language text NOT NULL DEFAULT 'en',
    created_at timestamptz NOT NULL DEFAULT now()
);

-- TABLE score_records
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

-- TABLE optimization_events
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

-- TABLE campaign_queries
CREATE TABLE IF NOT EXISTS public.campaign_queries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id uuid NOT NULL REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
    query_text text NOT NULL,
    niche_filter text,
    min_score_filter numeric(5,2),
    result_count integer,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- TABLE saved_creators
CREATE TABLE IF NOT EXISTS public.saved_creators (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id uuid NOT NULL REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
    creator_id uuid NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
    campaign_query_id uuid REFERENCES public.campaign_queries(id) ON DELETE SET NULL,
    note text,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (brand_id, creator_id)
);

-- TABLE subscriptions
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

-- TABLE audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    action text NOT NULL,
    target_table text,
    target_id uuid,
    metadata jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_audits_creator_id_created_at ON public.audits(creator_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audits_status_active ON public.audits(status) WHERE status NOT IN ('complete', 'failed');
CREATE INDEX IF NOT EXISTS idx_campaign_queries_brand_id_created_at ON public.campaign_queries(brand_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_creators_brand_id ON public.saved_creators(brand_id);
-- (brand_id, creator_id) covered by UNIQUE constraint
CREATE INDEX IF NOT EXISTS idx_creator_profiles_primary_niche ON public.creator_profiles(primary_niche);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_current_answer_rank_score ON public.creator_profiles(current_answer_rank_score);
-- user_id index for subscriptions covered by UNIQUE constraint
-- email index for users covered by UNIQUE constraint

-- 5.2 Row Level Security (RLS) Rules
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

-- users
CREATE POLICY users_select_own ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_update_own ON public.users FOR UPDATE USING (auth.uid() = id);

-- creator_profiles
CREATE POLICY creator_profiles_select_own ON public.creator_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY creator_profiles_update_own ON public.creator_profiles FOR UPDATE USING (auth.uid() = user_id);

-- brand_profiles
CREATE POLICY brand_profiles_select_own ON public.brand_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY brand_profiles_update_own ON public.brand_profiles FOR UPDATE USING (auth.uid() = user_id);

-- audits
CREATE POLICY audits_select_own ON public.audits FOR SELECT USING (creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()));
CREATE POLICY audits_insert_own ON public.audits FOR INSERT WITH CHECK (creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()));
CREATE POLICY audits_update_own ON public.audits FOR UPDATE USING (creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()));
CREATE POLICY audits_delete_own ON public.audits FOR DELETE USING (creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()));

-- content_normalized
CREATE POLICY content_normalized_select_own ON public.content_normalized FOR SELECT USING (audit_id IN (SELECT id FROM public.audits WHERE creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid())));
CREATE POLICY content_normalized_insert_own ON public.content_normalized FOR INSERT WITH CHECK (audit_id IN (SELECT id FROM public.audits WHERE creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid())));
CREATE POLICY content_normalized_update_own ON public.content_normalized FOR UPDATE USING (audit_id IN (SELECT id FROM public.audits WHERE creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid())));
CREATE POLICY content_normalized_delete_own ON public.content_normalized FOR DELETE USING (audit_id IN (SELECT id FROM public.audits WHERE creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid())));

-- score_records
-- Readable by owning creator OR any authenticated brand
CREATE POLICY score_records_select_creator ON public.score_records FOR SELECT USING (audit_id IN (SELECT id FROM public.audits WHERE creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid())));
CREATE POLICY score_records_select_brand ON public.score_records FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'brand'));
-- Writable only by service role (handled by not having INSERT/UPDATE/DELETE policies)

-- optimization_events
CREATE POLICY optimization_events_select_own ON public.optimization_events FOR SELECT USING (creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()));
CREATE POLICY optimization_events_insert_own ON public.optimization_events FOR INSERT WITH CHECK (creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()));
CREATE POLICY optimization_events_update_own ON public.optimization_events FOR UPDATE USING (creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()));
CREATE POLICY optimization_events_delete_own ON public.optimization_events FOR DELETE USING (creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()));

-- campaign_queries
CREATE POLICY campaign_queries_select_own ON public.campaign_queries FOR SELECT USING (brand_id IN (SELECT id FROM public.brand_profiles WHERE user_id = auth.uid()));
CREATE POLICY campaign_queries_insert_own ON public.campaign_queries FOR INSERT WITH CHECK (brand_id IN (SELECT id FROM public.brand_profiles WHERE user_id = auth.uid()));
CREATE POLICY campaign_queries_update_own ON public.campaign_queries FOR UPDATE USING (brand_id IN (SELECT id FROM public.brand_profiles WHERE user_id = auth.uid()));
CREATE POLICY campaign_queries_delete_own ON public.campaign_queries FOR DELETE USING (brand_id IN (SELECT id FROM public.brand_profiles WHERE user_id = auth.uid()));

-- saved_creators
CREATE POLICY saved_creators_select_own ON public.saved_creators FOR SELECT USING (brand_id IN (SELECT id FROM public.brand_profiles WHERE user_id = auth.uid()));
CREATE POLICY saved_creators_insert_own ON public.saved_creators FOR INSERT WITH CHECK (brand_id IN (SELECT id FROM public.brand_profiles WHERE user_id = auth.uid()));
CREATE POLICY saved_creators_update_own ON public.saved_creators FOR UPDATE USING (brand_id IN (SELECT id FROM public.brand_profiles WHERE user_id = auth.uid()));
CREATE POLICY saved_creators_delete_own ON public.saved_creators FOR DELETE USING (brand_id IN (SELECT id FROM public.brand_profiles WHERE user_id = auth.uid()));

-- subscriptions
CREATE POLICY subscriptions_select_own ON public.subscriptions FOR SELECT USING (user_id = auth.uid());
-- service role only for write operations

-- audit_logs
-- No client side read/write. Handled by backend only.

-- 5.3 Cross-Role Data Access — the Campaign Search Exception
CREATE OR REPLACE FUNCTION public.search_creators(
  p_niche text, p_min_score numeric
) RETURNS SETOF public.creator_profiles
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT * FROM public.creator_profiles
  WHERE primary_niche = p_niche
    AND current_answer_rank_score >= p_min_score
    AND verified = true;
$$;

-- 9. Triggers
-- audits row inserted with status='complete' and creator_profiles.current_answer_rank_score is stale
-- Trigger updates creator_profiles.current_answer_rank_score to the new value
CREATE OR REPLACE FUNCTION public.update_creator_score_on_audit_complete()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'complete' AND (OLD.status IS DISTINCT FROM 'complete' OR NEW.composite_score IS DISTINCT FROM OLD.composite_score) THEN
        UPDATE public.creator_profiles
        SET current_answer_rank_score = NEW.composite_score
        WHERE id = NEW.creator_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_creator_score
AFTER INSERT OR UPDATE ON public.audits
FOR EACH ROW
EXECUTE FUNCTION public.update_creator_score_on_audit_complete();

-- update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_creator_profiles_updated_at BEFORE UPDATE ON public.creator_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_brand_profiles_updated_at BEFORE UPDATE ON public.brand_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
