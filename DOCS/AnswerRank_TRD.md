__ANSWERRANK__

__AI\-Native Influencer Discovery & Campaign Management Platform__

*Technical Requirements Document \(TRD\)*

*The blueprint the build agent uses to make technical decisions without guessing*

__Team__

One Wish Willow

__Engineers__

Aryan Chaurasia | Harshit Agrawal

__Date__

June 2026

__Version__

v1\.0 — Implementation Ready

__Companion Doc__

AnswerRank Master Project Documentation \(PRD \+ Architecture\)

__Status__

Stack locked\. Visual design deferred — see Section 1 note\.

*Scope note: this document locks the frontend FRAMEWORK and STACK only\. Visual design — color system, component layout, typography, and UX flows — is intentionally out of scope here and will be defined in a separate design pass\. Any AI build agent using this document should treat all visual/UI decisions as TBD and avoid inventing a design system from this TRD alone\.*

# __Table of Contents__

# __Why This Document Matters__

The TRD translates the AnswerRank product vision into fixed technical decisions: what language, what framework, what database, what third\-party services\. Without it, an AI build agent picks a stack on its own — sometimes well, often inconsistently from file to file\. This document locks in every major choice so the agent \(or any human engineer\) stays coherent across the entire codebase\.

Every decision below is final unless explicitly marked TBD\. Where a decision is deferred \(frontend visual design\), that is stated plainly rather than left ambiguous\.

# __1\. Frontend__

## __1\.1 Framework & Language__

__Decision__

__Locked Choice__

__Framework__

Next\.js 15 \(App Router\)

__Language__

TypeScript 5\.x — strict mode enabled

__Rendering Strategy__

SSR for the root layout, navigation shell, and public\-facing pages \(fast initial paint, SEO metadata\)\. CSR \('use client'\) for all interactive, stateful surfaces — the Creator Diagnostic Dashboard and the Brand Campaign Studio — since these depend on WebSocket data and client\-side state\.

__Styling Engine__

Tailwind CSS v4 — utility classes only at this stage; no design tokens or theme defined yet \(see note below\)

__Component Primitives__

shadcn/ui — used for unstyled/lightly\-styled base primitives \(buttons, inputs, dialogs\) only, pending the design pass

*UI/UX deferred: Visual identity \(color palette, layout density, typography, motion language\) is NOT defined in this document\. The frontend framework, language, and component approach above are locked so engineering can begin; the design system will be supplied separately and layered on top of this stack without requiring a framework change\.*

## __1\.2 Key Frontend Libraries__

__Library__

__Purpose__

__State Management__

Zustand v5 — global state \(audit status, search results, selected creator\)

__Data Fetching__

TanStack Query v5 — REST API layer for all non\-realtime data

__Realtime Transport__

Native WebSocket API — persistent connection to the FastAPI /ws/audit/\{auditId\} endpoint

__Forms & Validation__

React Hook Form v7 \+ Zod — typed, validated forms for URL submission and campaign search

__Tables__

TanStack Table v8 \+ TanStack Virtual v3 — virtualized rendering for large creator result sets

__Charts__

Recharts 2\.x — score radar charts, visibility trend lines \(chart components only; visual theme TBD\)

__Animation__

Framer Motion v11 — score arc fills, leaderboard reordering

__Icons__

lucide\-react

# __2\. Backend__

## __2\.1 Framework & Runtime__

__Decision__

__Locked Choice__

__Framework__

FastAPI \(Python 3\.12\) on Uvicorn \+ Gunicorn

__Why__

Native async/await is mandatory for non\-blocking calls to the embedding model, Gemini API, and Qdrant\. Gunicorn manages multiple Uvicorn worker processes for production concurrency\.

__Schema Validation__

Pydantic v2 at every input/output boundary — request bodies, internal task payloads, and API responses are all typed and validated\.

__Background Jobs__

Celery v5 \+ Redis \(Upstash Serverless\) — handles URL ingestion, scoring, and embedding as async tasks off the request thread\.

__Async Design Rule__

Every function touching a network resource uses async/await\. CPU\-bound work \(regex normalization, heuristic scoring\) is offloaded to a thread pool via asyncio\.to\_thread\(\) so the API thread is never blocked\.

## __2\.2 Core API Surface__

__Method__

__Endpoint__

__Function__

__POST__

/api/v1/audit

Submit a creator URL for scoring

__GET__

/api/v1/audit/\{audit\_id\}

Poll audit status and result

__WS__

/ws/audit/\{audit\_id\}

Stream live scoring/ingestion events

__POST__

/api/v1/campaign/search

Brand keyword search against the creator database

__GET__

/api/v1/creator/\{creator\_id\}

Full creator profile and score history

__POST__

/api/v1/optimize

Trigger the Gemini Fix\-It Copilot rewrite

__DELETE__

/api/v1/gdpr/wipe/\{creator\_id\}

Hard\-delete all creator content and vectors

# __3\. Database__

__Component__

__Decision__

__Primary Database__

PostgreSQL 16 via Supabase — managed, includes built\-in Auth and Storage

__Stores__

Users, sessions, creator profiles, audit history, brand queries, score records, billing/subscription tier state

__Vector Database__

Qdrant Cloud — HNSW\-indexed Approximate Nearest Neighbor \(ANN\) search\. A single collection holds all creator content embeddings with metadata payload \(creator\_id, niche, score, follower\_count\)\.

__Object Storage__

Supabase Storage — raw extracted creator content \(transcripts, article text\)\. Lifecycle rule: auto\-delete after 90 days\.

__Cache / Broker__

Redis \(Upstash Serverless\) — Celery broker, job progress counters, rate\-limit counters, session tokens

*Two data stores are intentional, not redundant: Supabase Postgres holds structured, relational, transactional data; Qdrant holds high\-dimensional vectors for semantic search\. Neither substitutes for the other\.*

# __4\. Authentication__

__Decision__

__Specification__

__Method__

Supabase Auth \(JWT\) on the backend, paired with NextAuth\.js on the frontend for SSO session handling

__Sign\-in Options__

Google OAuth 2\.0 and Magic Link \(email\) — no password\-based login in V1

__Token Lifecycle__

JWTs issued with 1\-hour expiry; refresh tokens rotated on every use

__Backend Enforcement__

FastAPI dependency Depends\(get\_current\_user\) validates the JWT on every protected route

__Data Isolation__

Row\-Level Security \(RLS\) in Supabase — creators can only access their own audit history; brands can only access their own campaign queries

__Roles__

CREATOR \(audit submission, Fix\-It access\) · BRAND \(campaign search, profiler access\) · BRAND\_ENTERPRISE \(Share of Voice analytics, bulk export\) · ADMIN \(settings, GDPR wipe, billing\)

# __5\. Hosting & Deployment__

__Layer__

__Platform__

__Frontend__

Vercel — automatic preview deployments per branch; edge caching for the Next\.js shell

__Backend \(FastAPI \+ Celery\)__

Railway or Render \(containerized\) — Celery worker replicas auto\-scale based on Redis queue depth \(0–10 workers per queue\)

__Database__

Supabase \(managed PostgreSQL 16\), deployed in the same region as the backend to minimize latency

__Vector Database__

Qdrant Cloud \(managed\)

__CI/CD__

GitHub Actions — lint, type\-check, unit tests, and Playwright E2E smoke tests on every PR; Docker build \+ push on merge to main

__Monitoring__

Sentry \(error tracking, both frontend and backend\); OpenTelemetry traces to Grafana Tempo; Prometheus metrics exposed at /metrics with Grafana dashboards; Flower UI for Celery queue monitoring

# __6\. Third\-Party APIs & Services__

__Service__

__Purpose__

__Tier__

__trafilatura__

Web content extraction \(blogs/articles\)

Open\-source, free

__YouTube Transcript API__

Transcript extraction from YouTube video URLs

Free \(unofficial API; rate\-limited\)

__SentenceTransformers / text\-embedding\-3\-small__

Converts creator content and brand keywords into semantic vectors for matching

Free \(self\-hosted model\) or paid per\-token \(OpenAI embeddings, fallback\)

__Gemini API \(Google AI\)__

Generative Fix\-It Copilot — rewrites creator content to add missing structure\. Called ONLY on creator opt\-in, never in the core scoring path\.

Paid, metered per tier \(free tier: 1 rewrite/month; Pro: unlimited\)

__Qdrant Cloud__

Vector database for semantic search

Free tier available; paid tiers at scale

__Supabase__

PostgreSQL, Auth, and Storage

Free tier available; paid tiers at scale

__Upstash Redis__

Celery broker and cache

Free tier available; paid tiers at scale

__AWS Secrets Manager__

Centralized API key and secret storage

Paid, low fixed cost

__Sentry__

Error tracking \(frontend \+ backend\)

Free tier available; paid tiers at scale

# __7\. Folder Structure & Naming Conventions__

## __7\.1 Frontend \(Next\.js App Router\)__

app/
  \(auth\)/
    login/              \-\- NextAuth\.js Google \+ Magic Link sign\-in
  dashboard/
    page\.tsx            \-\- Creator/Brand landing
    audit/\[auditId\]/
      page\.tsx           \-\- Creator Diagnostic Dashboard
    campaign/
      page\.tsx           \-\- Brand Campaign Studio
    creator/\[id\]/
      page\.tsx           \-\- Creator Score Profiler \(deep\-dive\)
  settings/
    page\.tsx             \-\- API keys, org config, billing tier
  api/
    v1/                  \-\- Next\.js API routes \(thin proxy to FastAPI\)
lib/                      \-\- shared utilities, API client, Zod schemas
store/                    \-\- Zustand stores \(auditStore, campaignStore, uiStore\)
components/               \-\- shared UI components \(pending design system\)

## __7\.2 Backend \(FastAPI\)__

app/
  api/
    v1/
      audit\.py           \-\- /api/v1/audit routes
      campaign\.py         \-\- /api/v1/campaign routes
      optimize\.py         \-\- /api/v1/optimize routes
      gdpr\.py             \-\- /api/v1/gdpr routes
  core/
    config\.py            \-\- environment & settings loader
    security\.py           \-\- JWT validation, RLS helpers
  models/                  \-\- Pydantic v2 schemas
  services/
    extraction\.py         \-\- trafilatura / YouTube Transcript logic
    scoring\.py            \-\- Deterministic Scoring Engine \(D1\-D7\)
    embedding\.py           \-\- SentenceTransformers / Qdrant interface
    gemini\.py             \-\- Fix\-It Copilot integration
  workers/
    celery\_app\.py
    tasks\.py              \-\- ingest\_and\_score, optimize\_content
  main\.py                  \-\- FastAPI app entrypoint

## __7\.3 Naming Conventions__

- Files: snake\_case for Python \(scoring\_engine\.py\), kebab\-case for Next\.js route segments, PascalCase for React components \(ScoreProgressArc\.tsx\)\.
- Pydantic schemas: PascalCase with a Schema suffix \(CreatorSchema, AuditRequestSchema\)\.
- Zustand stores: camelCase with a Store suffix \(auditStore, campaignStore\)\.
- Celery tasks: snake\_case, verb\-led \(ingest\_and\_score, optimize\_content\)\.
- Environment variables: SCREAMING\_SNAKE\_CASE, prefixed by service where ambiguous \(GEMINI\_API\_KEY, QDRANT\_URL\)\.

# __8\. Environment Variables__

Variable names only — values are managed via AWS Secrets Manager and never committed to source control or Docker images\.

__Variable__

__Used By__

__Purpose__

__NEXT\_PUBLIC\_SUPABASE\_URL__

Frontend

Supabase project URL for client\-side auth

__NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY__

Frontend

Supabase public anon key

__NEXTAUTH\_SECRET__

Frontend

NextAuth\.js session encryption secret

__NEXTAUTH\_URL__

Frontend

Canonical app URL for NextAuth callbacks

__GOOGLE\_CLIENT\_ID / GOOGLE\_CLIENT\_SECRET__

Frontend/Backend

Google OAuth credentials

__SUPABASE\_SERVICE\_ROLE\_KEY__

Backend

Server\-side privileged Supabase access

__DATABASE\_URL__

Backend

PostgreSQL connection string

__QDRANT\_URL / QDRANT\_API\_KEY__

Backend

Qdrant Cloud connection

__GEMINI\_API\_KEY__

Backend

Gemini API access for the Fix\-It Copilot

__OPENAI\_API\_KEY__

Backend

Fallback embedding model access

__REDIS\_URL__

Backend

Upstash Redis connection \(Celery broker \+ cache\)

__AWS\_ACCESS\_KEY\_ID / AWS\_SECRET\_ACCESS\_KEY__

Backend

AWS Secrets Manager and S3\-compatible storage access

__SENTRY\_DSN__

Frontend/Backend

Error tracking ingestion endpoint

__WEBHOOK\_HMAC\_SECRET__

Backend

Signs outbound webhook payloads

# __9\. Constraints & Hard Preferences__

- Scoring path must never call an LLM\. The Deterministic Scoring Engine \(D1–D7\) is pure Python; only the opt\-in Fix\-It Copilot may call Gemini\. This is a hard architectural rule, not a preference\.
- Core scoring latency must stay under 200ms per URL, excluding network\-bound extraction time\.
- Must work within free or low\-cost tiers wherever possible during MVP \(Supabase, Qdrant, Upstash, Vercel all have usable free tiers\); Gemini and embedding API usage must be metered per subscription tier to control variable cost\.
- No secrets in source code, environment files, or Docker images — all secrets resolve through AWS Secrets Manager at container startup\.
- Web\-first only for V1\. No native iOS/Android app\. Responsive layout is required, but a dedicated mobile app is explicitly out of scope\.
- English\-language content only in V1 \(creator transcripts, blog posts, and brand queries\)\.
- GDPR\-compatible by design: every creator must be hard\-deletable on demand \(Postgres rows, Qdrant vectors, Supabase Storage objects, Redis keys\) via a single wipe endpoint\.
- Visual design is explicitly out of scope for this document\. Any UI styling decisions made before the design pass is delivered should be treated as temporary scaffolding, not final\.

