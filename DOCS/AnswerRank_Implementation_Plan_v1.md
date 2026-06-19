__ANSWERRANK__

__AI\-Native Influencer Discovery & Campaign Management Platform__

*Implementation Plan — Step\-by\-Step Build Sequence*

*The exact order to build so no foundation layer is ever skipped\.*

__Team__

One Wish Willow

__Engineers__

Aryan Chaurasia | Harshit Agrawal

__Date__

June 2026

__Version__

v1\.0 — Implementation Ready

__Companion Docs__

Master Project Documentation  •  TRD  •  App Flow  •  Backend Schema  •  UI/UX Design Spec

__Phases__

10 phases, sequenced by hard dependency, each with an explicit Done Criteria checklist\.

*Sequencing rule: each phase below assumes every prior phase's Done Criteria are fully met\. A build agent must not begin Phase N\+1 work — including exploratory or 'quick' changes — until Phase N is checked off\. Phases are ordered by hard dependency \(e\.g\. the Deterministic Scoring Engine in Phase 5 must exist before Campaign Match Probability in Phase 6 can be computed\), not by perceived importance\.*

# __Table of Contents__

# __1\. Why This Document Exists__

## __1\.1 Purpose__

This document defines the complete, dependency\-ordered build sequence for AnswerRank — from an empty repository to a production deployment\. It is not a sprint backlog\. It is not a set of user stories\. It is the single source of truth for build order\.

Every phase in this document answers three questions explicitly:

- What must be built, down to the file and function level\.
- Why it must be built now and not later — its dependency on prior phases\.
- How to verify it is done — a concrete Done Criteria checklist, not an opinion\.

## __1\.2 Scope__

This document covers the full V1 build of AnswerRank as defined in the Master Project Documentation, TRD, App Flow, Backend Schema, and UI/UX Design Specification\. It does not cover post\-V1 features \(real\-time AI citation monitoring, multi\-language support, native mobile apps\) which are explicitly out of scope per the PRD Section 1\.5\.

## __1\.3 Audience__

__Reader__

__Role in This Document__

__AI Coding Agent__

Primary consumer\. Uses this document as the build rulebook — reads the phase, executes the tasks in order, runs the Done Criteria before proceeding\.

__Engineers \(Aryan, Harshit\)__

Reviewers and approvers\. Verify Done Criteria are met before marking a phase complete\.

__Technical Reviewers__

Confirm architectural decisions match the TRD and Master Project Documentation\.

## __1\.4 Companion Documents__

This document is the fifth in the AnswerRank documentation set\. All five documents together constitute a complete product specification:

__\#__

__Document__

__Role__

__01__

Master Project Documentation

PRD \+ Full\-stack architecture reference\. Single source of truth for product decisions\.

__02__

Technical Requirements Document \(TRD\)

Frontend & backend stack lock\. Technology choices, folder structure, naming conventions\.

__03__

App Flow & Navigation Document

Every screen, user journey, loading state, empty state, modal, and redirect\.

__04__

UI/UX Design Specification

Design system, color tokens, typography, component library, responsive rules, AI build rules\.

__05__

Implementation Plan \(this document\)

Phase\-by\-phase build sequence with task lists, file targets, and Done Criteria\.

## __1\.5 How to Use This Document__

Read Section 2 \(Implementation Philosophy\) once before starting\. Then work through phases in strict numerical order\. Do not skip ahead\. At the end of each phase, run every item in the Done Criteria checklist\. If any item fails, do not proceed to the next phase — diagnose and fix within the current phase\.

*A build agent should treat a failed Done Criteria item as a build error, not a warning\. Proceeding with unmet criteria creates compounding problems in later phases that are significantly more expensive to diagnose\.*

# __2\. Implementation Philosophy__

## __2\.1 Foundation\-First Development__

AnswerRank is a pipeline product\. Every user\-facing feature depends on a data pipeline that must exist before the feature can function\. Building UI before the pipeline is live results in placeholder interfaces that must be rebuilt when real data arrives — a known anti\-pattern in AI product development\.

The sequence enforced here is therefore always: infrastructure before schema, schema before auth, auth before features, features before polish, polish before testing, testing before deployment\. This is not negotiable\.

## __2\.2 Dependency\-Driven Sequencing__

Each phase exists because later phases depend on it\. The specific dependency chain for AnswerRank:

__Phase__

__Why It Comes Here__

__Phase 1: Project Setup__

Phase 2 needs a configured environment with working toolchain\.

__Phase 2: Database Schema__

Phase 3 needs user tables to exist before auth can write to them\.

__Phase 3: Authentication__

Phase 4 needs a logged\-in creator identity before audit submission is meaningful\.

__Phase 4: Creator Ingestion__

Phase 5 needs normalized content to exist before scoring can run on it\.

__Phase 5: Scoring Engine__

Phase 6 needs real AR scores and vectors before brand search has anything to rank against\.

__Phase 6: Brand Search__

Phase 7 needs the core pipeline to be stable before secondary features are layered on top\.

__Phase 7: Secondary Features__

Phase 8 needs all features functional before visual polish is applied\.

__Phase 8: UI Polish__

Phase 9 needs a complete, polished product before testing documents final behavior\.

__Phase 9: Testing__

Phase 10 needs a verified, passing product before it is deployed to production\.

## __2\.3 AI Coding Agent Guidelines__

This document is written to be consumed directly by an AI coding agent \(Claude Code, Cursor, Copilot Workspace, or equivalent\)\. The following rules apply to the agent at all times:

- Read the entire phase before writing any code\. The task list is sequential — later tasks in a phase may depend on earlier ones\.
- Never invent an architectural decision not specified here or in the companion documents\. If the TRD says Next\.js 15, do not use Remix\. If the TRD says Zustand, do not add Redux\.
- When a task references a companion document section \(e\.g\., 'Backend Schema Section 5\.2'\), read that section before implementing\. Do not rely on memory\.
- Apply the naming conventions from TRD Section 7\.3 to every file created\. Inconsistent naming is a build error in a codebase this size\.
- Never commit real secrets, even to test branches\. Use \.env\.example placeholders only\.
- When a Done Criteria item cannot be verified programmatically, output the manual verification command or test step explicitly\.

## __2\.4 Definition of Done__

A phase is done when every item in its Done Criteria checklist is verified as true — not when the code is written and not when it 'seems to work'\. The Done Criteria are designed to be objectively falsifiable: each item has a clear pass/fail state\.

## __2\.5 Coding Standards__

These standards apply to all code written in all phases\. They are derived from the TRD and must not be overridden:

__Standard__

__Rule__

__TypeScript__

Strict mode enabled\. No 'any' types\. All component props fully typed\. Zod schema must match Pydantic schema\.

__Python__

Type hints on all function signatures\. Black/Ruff formatting enforced\. Pydantic v2 for all I/O\.

__Component Structure__

One component per file\. File name = component name in PascalCase\. Co\-locate test file: ComponentName\.test\.tsx\.

__State Management__

Zustand for global pipeline state, audit scores, search state\. Jotai for fine\-grained per\-row atom state\. No useState for cross\-component state\.

__Error Handling__

Every async function has explicit try/catch\. Backend errors return structured JSON: \{error: string, code: string\}\. Never expose stack traces to the client\.

__API Layer__

TanStack Query v5 for all REST calls\. No raw fetch\(\) calls in components\. Query keys follow the pattern: \['resource', id, 'subresource'\]\.

__Secrets__

Zero secrets in source code, \.env files, or Docker images\. AWS Secrets Manager at container startup\. \.env\.example for all local development\.

# __3\. Phase Overview__

AnswerRank's build sequence is dictated by its dual\-sided architecture: the Creator\-side scoring pipeline must exist and produce real scores and vectors before the Brand\-side matching logic has anything meaningful to rank against\. The table below summarizes all ten phases and their primary goals\.

__Phase__

__Name__

__Est\. Duration__

__Goal__

__1__

Project Setup

~2 days

Repo, tooling, and environment exist and run with zero errors\.

__2__

Database Schema & Migrations

~2 days

Every table, RLS policy, and index from the Backend Schema is live in Supabase\.

__3__

Authentication

~2 days

Signup, login, logout, and role\-based routing work end\-to\-end\.

__4__

Creator Ingestion Pipeline

~3 days

A URL can be submitted and its content extracted and stored\.

__5__

Deterministic Scoring Engine

~3 days

A normalized audit produces a real, traceable AnswerRank Score\.

__6__

Brand Campaign Search

~4 days

A keyword query returns ranked creators by Campaign Match Probability\.

__7__

Fix\-It Copilot & Secondary Features

~3 days

Gemini optimization, saved creators, Share of Voice, billing tiers\.

__8__

UI Polish & Responsive Design

~3 days

Empty, loading, and error states applied; responsive layout complete\.

__9__

Testing, Edge Cases & Security

~3 days

All journeys verified; failure paths tested; RLS audited\.

__10__

Deployment

~2 days

Production environment live on locked TRD infrastructure\.

*Estimated durations assume two engineers working in parallel on frontend and backend tracks within the same phase\. Phases 4\-6 are the most complex and have the highest probability of expanding — build in buffer\.*

# __4\. System Dependency Graph__

The following shows the hard dependency chain across all major system components\. No component in this chain can be built before the components above it exist and are verified\.

ANSWERRANK — SYSTEM DEPENDENCY GRAPH

======================================

 

Infrastructure \(Supabase, Qdrant, Redis, AWS Secrets Manager\)

         |

         v

Database Schema \(11 tables, RLS policies, indexes, Qdrant collection\)

         |

         v

Authentication \(Supabase Auth, NextAuth\.js, JWT, role routing\)

         |

         v

Creator Ingestion Pipeline

  |\-\- URL validation \(Pydantic v2\)

  |\-\- Platform classification \(YouTube vs\. Web\)

  |\-\- Content extraction \(YouTube Transcript API / trafilatura\)

  |\-\- Normalization \(regex pipeline, header preservation\)

  |\-\- PostgreSQL storage \(content\_normalized table\)

  |\-\- WebSocket events \(queued, ingestion\_complete\)

         |

         v

Deterministic Scoring Engine \(pure Python, zero LLM calls\)

  |\-\- D1: Direct Answer Density     \(weight: 0\.22\)

  |\-\- D2: Entity Clarity            \(weight: 0\.20\)

  |\-\- D3: FAQ Coverage              \(weight: 0\.18\)

  |\-\- D4: Structured Data           \(weight: 0\.15\)

  |\-\- D5: Formatting Quality        \(weight: 0\.10\)

  |\-\- D6: Freshness                 \(weight: 0\.08\)

  |\-\- D7: Content Depth             \(weight: 0\.07\)

  |\-\- AR Composite Score \(weighted sum × 100\)

  |\-\- score\_records write

  |\-\- SentenceTransformers embed → Qdrant upsert

  |\-\- WebSocket events \(scoring\_complete, indexed\)

         |

         v

Brand Campaign Search

  |\-\- Keyword embedding \(SentenceTransformers\)

  |\-\- Qdrant ANN cosine similarity \(< 200ms\)

  |\-\- CMP calculation: cos\(V\_brand, V\_creator\) × \(1 \+ 0\.3 × AR/100\)

  |\-\- RankedCreatorSchema\[\] sorted by CMP descending

  |\-\- Creator Score Profiler \(ScoreRadar, EntityHeatmap, CampaignMatchRationale\)

         |

         v

Secondary Features \(Gemini Fix\-It, SOV, Billing, Saved Creators\)

         |

         v

UI Polish \(design system, empty states, loading states, error states\)

         |

         v

Testing & Security Audit

         |

         v

Production Deployment \(Vercel \+ Railway/Render \+ Supabase \+ Qdrant Cloud\)

## __4\.1 Creator Audit Feature Dependency Tree__

Every sub\-component of the Creator Audit feature and its internal dependencies:

Creator Audit \(end\-to\-end\)

  |

  |\-\- 1\. URL Submission

  |        |\-\- URLInputTerminal component

  |        |\-\- POST /api/v1/audit endpoint

  |        |\-\- Pydantic v2 AuditRequestSchema validation

  |        |\-\- audits row INSERT \(status='queued'\)

  |        |\-\- Celery: ingest\_and\_score\.delay\(\)

  |        |\-\- WebSocket open to /ws/audit/\{audit\_id\}

  |

  |\-\- 2\. Content Ingestion

  |        |\-\- Platform classifier \(YouTube vs\. Web\)

  |        |\-\- YouTube: youtube\-transcript\-api → pytube fallback

  |        |\-\- Web: trafilatura extraction

  |        |\-\- Normalization pipeline \(regex, header preservation, date parsing\)

  |        |\-\- content\_normalized row INSERT

  |        |\-\- WS event: \{type: 'ingestion\_complete', word\_count\}

  |

  |\-\- 3\. Deterministic Scoring

  |        |\-\- score\_engine\.calculate\(content\_normalized\_id\)

  |        |\-\- 7 heuristic functions \(D1–D7\)

  |        |\-\- AR = 100 × Σ\(wi × Di\)

  |        |\-\- score\_records row INSERT

  |        |\-\- audits\.composite\_score UPDATE

  |        |\-\- WS event: \{type: 'scoring\_complete', score, factors\}

  |

  |\-\- 4\. Vector Indexing

  |        |\-\- SentenceTransformers\.encode\(content\_chunks\)

  |        |\-\- Qdrant\.upsert\(vector, payload=\{creator\_id, niche, score\}\)

  |        |\-\- audits\.vector\_id UPDATE

  |        |\-\- creator\_profiles Postgres trigger UPDATE

  |        |\-\- WS event: \{type: 'indexed', vector\_id\}

  |

  |\-\- 5\. Frontend Render

            |\-\- Zustand auditStore update

            |\-\- ScoreProgressArc animate \(1\.2s, clockwise\)

            |\-\- DiagnosisChecklist \(7 factor cards\)

            |\-\- OptimizeWithGeminiPanel \(if score < 80\)

# __5\. Repository Architecture__

The complete file and folder structure for the AnswerRank repository\. This is the target state — the build phases below will progressively create every file in this tree\. Folders and files not listed here must not be created without explicit specification in a companion document\.

## __5\.1 Frontend \(Next\.js 15 App Router\)__

frontend/

  app/                           \# Next\.js App Router root

    \(auth\)/                      \# Auth route group \(no shared layout\)

      login/page\.tsx

      signup/page\.tsx

      onboarding/page\.tsx

    \(creator\)/                   \# Creator route group \(shared creator layout\)

      layout\.tsx                 \# NavigationRail \+ GlobalStatusBar

      dashboard/page\.tsx         \# URLInputTerminal \+ ScoreProgressArc

      audit/\[auditId\]/page\.tsx   \# Full audit result detail

      history/page\.tsx           \# Audit history table

      upgrade/page\.tsx           \# Creator Pro tier upsell

    \(brand\)/                     \# Brand route group \(shared brand layout\)

      layout\.tsx

      dashboard/page\.tsx         \# CampaignSearchBar \+ summary cards

      search/page\.tsx            \# CreatorCandidateGrid full page

      saved/page\.tsx             \# Saved creator shortlist

      sov/page\.tsx               \# Share of Voice analytics

      upgrade/page\.tsx           \# Brand Enterprise upsell

    \(admin\)/                     \# Admin route group

      dashboard/page\.tsx

    api/                         \# Next\.js API routes \(thin proxy only\)

      auth/\[\.\.\.nextauth\]/route\.ts

    layout\.tsx                   \# Root layout \(fonts, providers, Sentry\)

    not\-found\.tsx

    error\.tsx

    page\.tsx                     \# Landing page \(unauthenticated\)

 

  components/

    layout/

      NavigationRail\.tsx

      GlobalStatusBar\.tsx

    creator/

      URLInputTerminal\.tsx

      ScoreProgressArc\.tsx

      DiagnosisChecklist\.tsx

      FactorCard\.tsx

      OptimizeWithGeminiPanel\.tsx

      ContentDiffViewer\.tsx

      AuditHistoryTable\.tsx

    brand/

      CampaignSearchBar\.tsx

      FiltersDrawer\.tsx

      CreatorCandidateGrid\.tsx

      CreatorScoreProfiler\.tsx

      ScoreRadar\.tsx

      EntityHeatmap\.tsx

      CampaignMatchRationale\.tsx

      SavedCreatorsGrid\.tsx

      ShareOfVoiceChart\.tsx

    shared/

      MiniScoreArc\.tsx

      StatusPill\.tsx

      MatchProbabilityBar\.tsx

      EmptyState\.tsx

      ErrorCard\.tsx

      LoadingSkeleton\.tsx

      AIProgressStream\.tsx

 

  stores/                        \# Zustand stores

    auditStore\.ts

    campaignStore\.ts

    uiStore\.ts

    authStore\.ts

 

  hooks/

    useAuditWebSocket\.ts

    useCreatorSearch\.ts

    useScoreHistory\.ts

    useSavedCreators\.ts

 

  lib/

    api/                         \# TanStack Query hooks

      audit\.ts

      campaign\.ts

      creator\.ts

      optimize\.ts

    supabase/

      client\.ts

      server\.ts

    utils/

      score\.ts                   \# Score color/tier helpers

      format\.ts                  \# Number/date formatters

 

  types/

    audit\.ts

    creator\.ts

    campaign\.ts

    websocket\.ts

 

  public/

    logo\.svg

    favicon\.ico

 

  tailwind\.config\.ts             \# Design token extension

  next\.config\.ts

  tsconfig\.json                  \# strict: true

  \.env\.example

## __5\.2 Backend \(FastAPI \+ Celery\)__

backend/

  app/

    api/

      v1/

        audit\.py                 \# POST /audit, GET /audit/\{id\}

        campaign\.py              \# POST /campaign/search

        creator\.py               \# GET /creator/\{id\}

        optimize\.py              \# POST /optimize

        sov\.py                   \# GET /sov/\{keyword\}

        gdpr\.py                  \# DELETE /gdpr/wipe/\{creator\_id\}

        metrics\.py               \# GET /metrics \(Prometheus\)

      websocket/

        audit\_ws\.py              \# WS /ws/audit/\{audit\_id\}

      \_\_init\_\_\.py

      router\.py                  \# APIRouter aggregation

 

    core/

      config\.py                  \# Settings from AWS Secrets Manager

      security\.py                \# JWT validation, get\_current\_user

      dependencies\.py            \# FastAPI Depends\(\) factories

      exceptions\.py              \# Custom exception handlers

 

    models/                      \# Pydantic v2 schemas

      audit\.py                   \# AuditRequestSchema, ScoringResultSchema

      creator\.py                 \# CreatorSchema, RankedCreatorSchema

      campaign\.py                \# BrandQuerySchema

      optimize\.py                \# OptimizeRequestSchema, OptimizedContentSchema

 

    services/

      extractor/

        youtube\.py               \# YouTube Transcript API \+ pytube fallback

        web\.py                   \# trafilatura extraction

        classifier\.py            \# URL type classification

        normalizer\.py            \# Regex pipeline, header preservation

      scoring/

        engine\.py                \# AR composite score orchestrator

        d1\_direct\_answer\.py      \# Direct Answer Density heuristic

        d2\_entity\_clarity\.py     \# Entity Clarity heuristic

        d3\_faq\_coverage\.py       \# FAQ Coverage heuristic

        d4\_structured\_data\.py    \# Structured Data heuristic

        d5\_formatting\.py         \# Formatting Quality heuristic

        d6\_freshness\.py          \# Freshness heuristic

        d7\_content\_depth\.py      \# Content Depth heuristic

        weights\.py               \# Weight calibration constants

      embedding/

        embedder\.py              \# SentenceTransformers / OpenAI API

        qdrant\_client\.py         \# Qdrant upsert, ANN search

      campaign/

        search\.py                \# Keyword embed \+ ANN \+ CMP calculation

        cmp\.py                   \# CMP formula: cos × \(1 \+ α × AR/100\)

      gemini/

        copilot\.py               \# Gemini Fix\-It Copilot rewrite

        prompt\.py                \# System prompt \(preserve tone, add structure\)

      billing/

        webhook\.py               \# Stripe/Razorpay HMAC webhook handler

        tiers\.py                 \# Tier enforcement logic

 

    workers/

      celery\_app\.py              \# Celery application config

      ingest\_and\_score\.py        \# Main ingest\_and\_score Celery task

      optimize\_task\.py           \# Gemini optimize Celery task

 

    db/

      supabase\.py                \# Supabase client factory

      migrations/                \# SQL migration files \(numbered\)

      seed\.py                    \# Test data seed script

 

  tests/

    unit/

      test\_scoring\.py            \# All 7 heuristics \+ AR composite

      test\_cmp\.py                \# CMP formula boundary cases

      test\_extractor\.py          \# URL classifier, normalizer

    e2e/

      test\_audit\_flow\.py         \# Full audit pipeline integration test

      test\_brand\_search\.py       \# Campaign search integration test

 

  Dockerfile

  docker\-compose\.yml

  pyproject\.toml                 \# Dependencies \+ Black/Ruff config

  \.env\.example

__PHASE__

__1__

__Project Setup__

*Goal: A clean, correctly structured repo that runs locally with all tooling configured — before any feature code is written\.*

## __Why This Phase Comes First__

Every subsequent phase requires a working, correctly configured environment\. A misconfigured TypeScript setup discovered in Phase 4 creates cascading type errors that are expensive to untangle\. A missing environment variable discovered in Phase 6 can corrupt production data\. The investment made in Phase 1 pays compound dividends across all nine phases that follow\.

## __Task List__

__\#__

__Task__

__Owner__

__Prerequisite__

__1__

Initialize the Next\.js 15 \(App Router\) project with TypeScript strict mode\. Command: npx create\-next\-app@latest frontend \-\-typescript \-\-app \-\-tailwind \-\-src\-dir false \-\-import\-alias '@/\*'

Frontend

None

__2__

Initialize the FastAPI \(Python 3\.12\) backend project\. Create the folder structure exactly as specified in Section 5\.2: app/api, app/core, app/models, app/services, app/workers, app/db, tests\.

Backend

None

__3__

Install all frontend dependencies in package\.json: tailwindcss@^4, zustand@^5, jotai@^2, @tanstack/react\-query@^5, @tanstack/react\-table@^8, @tanstack/react\-virtual@^3, react\-hook\-form@^7, zod@^3, recharts@^2, framer\-motion@^11, lucide\-react, @supabase/supabase\-js, next\-auth@^5, shadcn/ui \(init\)\.

Frontend

Task 1

__4__

Install all backend dependencies in pyproject\.toml: fastapi, uvicorn\[standard\], gunicorn, pydantic\[email\]>=2, celery\[redis\]>=5, redis, supabase, qdrant\-client, trafilatura, youtube\-transcript\-api, pytube, sentence\-transformers, google\-generativeai, sentry\-sdk, opentelemetry\-sdk, prometheus\-client\.

Backend

Task 2

__5__

Configure Tailwind CSS v4 with the AnswerRank design token extension from the UI/UX Design Specification: base \(\#0D1B2A\), surface \(\#112240\), elevated \(\#1A2F4A\), accent \(\#1A7FE0\), teal \(\#00D4AA\), success, warning, danger\. Add these to tailwind\.config\.ts under theme\.extend\.colors\.

Frontend

Tasks 1, 3

__6__

Initialize shadcn/ui: npx shadcn@latest init\. Select style: Default, base color: Slate, CSS variables: yes\. Then add only the primitives needed for V1: button, input, dialog, drawer, badge, toast, tabs, dropdown\-menu, tooltip, skeleton\.

Frontend

Tasks 1, 3

__7__

Configure TypeScript strictly\. In tsconfig\.json: strict: true, noUncheckedIndexedAccess: true, exactOptionalPropertyTypes: true\. Run tsc \-\-noEmit and fix any errors in the scaffold before proceeding\.

Frontend

Task 1

__8__

Configure Python linting\. Add \[tool\.black\] and \[tool\.ruff\] sections to pyproject\.toml\. Run black \. and ruff check \. on the empty project to confirm tooling is working\.

Backend

Task 2

__9__

Create \.env\.example for the frontend with all required variable names \(no values\): NEXT\_PUBLIC\_SUPABASE\_URL, NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY, NEXTAUTH\_URL, NEXTAUTH\_SECRET, NEXT\_PUBLIC\_API\_URL, NEXT\_PUBLIC\_WS\_URL\.

Frontend

Task 1

__10__

Create \.env\.example for the backend with all required variable names: SUPABASE\_URL, SUPABASE\_SERVICE\_ROLE\_KEY, DATABASE\_URL, QDRANT\_URL, QDRANT\_API\_KEY, REDIS\_URL, GEMINI\_API\_KEY, AWS\_SECRETS\_MANAGER\_REGION, SENTRY\_DSN, ENVIRONMENT\.

Backend

Task 2

__11__

Provision all external services: \(a\) Create Supabase project — note URL and anon key and service role key\. \(b\) Create Qdrant Cloud cluster — note URL and API key\. \(c\) Create Upstash Redis instance — note connection string\. \(d\) Create AWS Secrets Manager vault and store all API keys\.

Both

Tasks 9, 10

__12__

Create docker\-compose\.yml with services: api \(FastAPI\), worker\_high \(Celery ingestion queue\), worker\_low \(Celery scoring queue\), flower \(Celery monitor\)\. External services \(Redis, Qdrant, Supabase\) are not containerized — they are managed cloud services\.

Backend

Tasks 2, 4, 11

__13__

Set up GitHub Actions CI skeleton: \.github/workflows/ci\.yml\. Jobs: \(a\) lint\-frontend: ESLint \+ tsc \-\-noEmit on push/PR\. \(b\) lint\-backend: ruff check \+ black \-\-check on push/PR\. Deploy job is wired in Phase 10\.

Both

Tasks 7, 8

__14__

Create a placeholder /health endpoint in FastAPI that returns \{status: 'ok', version: '1\.0\.0'\} with no database call\. Verify it runs locally: uvicorn app\.main:app \-\-reload, then curl http://localhost:8000/health\.

Backend

Tasks 2, 4

__15__

Create the Next\.js root layout\.tsx with: Inter and JetBrains Mono Google Fonts, QueryClientProvider \(TanStack Query\), and the Sentry initialization stub\. Verify the dev server starts: npm run dev, visit http://localhost:3000\.

Frontend

Tasks 1, 3, 5

__✓  PHASE COMPLETE — DONE CRITERIA__

__•  __Frontend dev server starts at http://localhost:3000 with zero TypeScript errors on the scaffold \(verified: npm run build exits cleanly\)\.

__•  __Backend FastAPI server starts at http://localhost:8000 and returns HTTP 200 on GET /health\.

__•  __Both \.env\.example files contain every variable from the TRD Section 8\. No real secret values exist anywhere in the repo — confirmed by running git log and grep \-r 'sk\-' \. across the project\.

__•  __Supabase, Qdrant, and Upstash are provisioned and their connection endpoints are reachable from a local test script \(Python: supabase\.table\('users'\)\.select\('\*'\)\.limit\(1\)\.execute\(\) without error\)\.

__•  __docker\-compose up \-\-build starts the api and worker\_high containers without errors\.

__•  __GitHub Actions CI passes on a push to a test branch \(lint \+ type\-check green\)\.

__•  __All npm and pip dependencies install without version conflicts \(no peer dependency warnings for major packages\)\.

__PHASE__

__2__

__Database Schema & Migrations__

*Goal: Every table, relationship, index, and RLS policy from the Backend Schema document exists in Supabase and is provably enforced\.*

## __Why This Phase Comes Second__

Authentication \(Phase 3\) requires user tables to exist\. The ingestion pipeline \(Phase 4\) requires content\_normalized and audits tables to write to\. RLS policies that are added after feature code is written are almost always incomplete — the schema is the source of truth for data access, and it must be established before any code touches the database\.

## __Tables to Create \(in dependency order\)__

__Order__

__Table__

__Key Columns__

__1__

users

Extends Supabase Auth\. role ENUM \(creator, brand, brand\_enterprise, admin\), onboarding\_completed BOOL, created\_at TIMESTAMPTZ\.

__2__

creator\_profiles

creator\_id \(FK → users\), handle, platform ENUM, follower\_count, niche, current\_answer\_rank\_score FLOAT, verified BOOL, is\_public BOOL\.

__3__

brand\_profiles

brand\_id \(FK → users\), company\_name, industry, subscription\_tier\.

__4__

subscriptions

user\_id \(FK → users\), tier ENUM, gemini\_credits\_remaining INT, audit\_count\_this\_month INT, billing\_provider, billing\_customer\_id\.

__5__

audits

audit\_id UUID PK, creator\_id FK, url TEXT, status ENUM \(queued/ingesting/scoring/complete/failed\), composite\_score FLOAT, failure\_reason TEXT, vector\_id TEXT, created\_at, completed\_at\.

__6__

content\_normalized

content\_id UUID PK, audit\_id FK, raw\_text TEXT, word\_count INT, platform, extracted\_at\.

__7__

score\_records

record\_id UUID PK, audit\_id FK, d1–d7 FLOAT\[7\], composite\_score FLOAT, weights\_version TEXT, scored\_at\.

__8__

optimization\_events

event\_id UUID PK, audit\_id FK, creator\_id FK, original\_score FLOAT, projected\_score FLOAT, approved BOOL, gemini\_tokens INT, created\_at\.

__9__

campaign\_queries

query\_id UUID PK, brand\_id FK, query\_text TEXT, result\_count INT, created\_at\.

__10__

saved\_creators

save\_id UUID PK, brand\_id FK, creator\_id FK, campaign\_query\_id FK \(nullable\), created\_at\. UNIQUE\(brand\_id, creator\_id\)\.

__11__

audit\_logs

log\_id UUID PK, action ENUM \(gdpr\_wipe, tier\_change, billing\_event\), actor\_id FK, target\_id UUID, metadata JSONB, created\_at\.

## __Task List__

__\#__

__Task__

__Owner__

__Prerequisite__

__1__

Write SQL migration 001\_users\.sql\. Extend auth\.users with a public\.users table using id FK to auth\.users\. Add role ENUM type: CREATE TYPE user\_role AS ENUM \('creator', 'brand', 'brand\_enterprise', 'admin'\)\. Add columns: role user\_role NOT NULL DEFAULT 'creator', onboarding\_completed BOOLEAN DEFAULT false, created\_at TIMESTAMPTZ DEFAULT NOW\(\)\.

Backend

Phase 1 complete

__2__

Write SQL migration 002\_creator\_brand\_profiles\.sql\. Create creator\_profiles and brand\_profiles tables with FK references to users\. Include all columns from the Backend Schema\. Add a UNIQUE constraint on creator\_profiles\.handle per platform\.

Backend

Task 1

__3__

Write SQL migration 003\_subscriptions\.sql\. Create the subscriptions table\. Add a UNIQUE constraint on user\_id \(one active subscription per user\)\. Add tier ENUM type\.

Backend

Task 1

__4__

Write SQL migration 004\_audits\.sql\. Create the audits table with status ENUM\. Add a partial index on status WHERE status IN \('queued', 'ingesting', 'scoring'\) for efficient queue polling\.

Backend

Tasks 1, 2

__5__

Write SQL migration 005\_content\_normalized\.sql and 006\_score\_records\.sql\. FK both to audits\.audit\_id ON DELETE CASCADE\.

Backend

Task 4

__6__

Write SQL migration 007\_optimization\_events\.sql, 008\_campaign\_queries\.sql, 009\_saved\_creators\.sql, 010\_audit\_logs\.sql\. Add the UNIQUE constraint on saved\_creators\(brand\_id, creator\_id\)\. All with FK references and ON DELETE CASCADE where appropriate\.

Backend

Tasks 1, 2, 4

__7__

Apply all migrations to Supabase in order\. Verify every table exists: SELECT table\_name FROM information\_schema\.tables WHERE table\_schema = 'public' ORDER BY table\_name\.

Backend

Tasks 1\-6

__8__

Enable RLS on every table: ALTER TABLE \{table\_name\} ENABLE ROW LEVEL SECURITY\. Confirm default\-deny is in effect: a JWT with no policies returns zero rows on any table\.

Backend

Task 7

__9__

Write RLS policy for users: A user can SELECT/UPDATE their own row only \(auth\.uid\(\) = id\)\. Admins can SELECT all rows \(role = 'admin'\)\.

Backend

Task 8

__10__

Write RLS policies for creator\_profiles: SELECT only if is\_public = true OR creator\_id = auth\.uid\(\)\. INSERT/UPDATE only if creator\_id = auth\.uid\(\)\. No direct brand access — brands use the search\_creators\(\) function only\.

Backend

Task 8

__11__

Write RLS policies for audits: SELECT/INSERT/UPDATE only if creator\_id = auth\.uid\(\)\. Brands cannot access audits rows directly\.

Backend

Task 8

__12__

Write RLS policies for score\_records, content\_normalized, optimization\_events: SELECT/INSERT only if the parent audit's creator\_id = auth\.uid\(\)\.

Backend

Task 8

__13__

Write RLS policies for campaign\_queries, saved\_creators: SELECT/INSERT/DELETE only if brand\_id = auth\.uid\(\)\.

Backend

Task 8

__14__

Implement the SECURITY DEFINER function search\_creators\(query\_embedding VECTOR, min\_score FLOAT, niche\_filter TEXT, max\_results INT\)\. This function bypasses RLS intentionally — it is the ONLY way brands access creator data\. It must return only: creator\_id, handle, platform, niche, follower\_count, current\_answer\_rank\_score, verified\. It must never return raw content or email\.

Backend

Tasks 8, 10

__15__

Create the Qdrant collection: POST /collections/creator\_content\_vectors with vectors config: size=384 \(all\-MiniLM\-L6\-v2\), distance=Cosine\. Create payload indexes on creator\_id \(keyword\), niche \(keyword\), score \(float\)\.

Backend

Phase 1: Qdrant provisioned

__16__

Write a Postgres trigger on score\_records INSERT that updates creator\_profiles\.current\_answer\_rank\_score = NEW\.composite\_score and creator\_profiles\.verified = true where creator\_profiles\.creator\_id matches the audit's creator\_id\.

Backend

Tasks 2, 5

__17__

Write seed script \(seed\.py\) creating: 1 creator user \(role='creator'\), 1 brand user \(role='brand'\), 1 admin user \(role='admin'\), with corresponding profile rows and a seed subscription row\. Mark all seed data with a seed=true metadata field or use clearly test handles\.

Backend

Tasks 7, 8

__18__

Run the seed script and verify RLS isolation: \(a\) Query audits as creator\_seed\_jwt — should return 0 rows \(no audits yet\)\. \(b\) Query creator\_profiles as brand\_seed\_jwt directly — should return 0 rows\. \(c\) Call search\_creators\(\) as brand\_seed\_jwt — should return 0 rows \(no verified creators yet\)\. All correct: RLS is working\.

Backend

Task 17

__✓  PHASE COMPLETE — DONE CRITERIA__

__•  __All 11 tables exist in Supabase with the exact columns, types, and constraints from the Backend Schema document \(verified by comparing CREATE TABLE output against the Backend Schema\)\.

__•  __RLS is enabled on every table\. A JWT for creator\_A cannot read audits rows belonging to creator\_B \(verified by direct API test\)\.

__•  __A JWT for brand\_A cannot read creator\_profiles rows directly — only via search\_creators\(\) \(verified by direct API test\)\.

__•  __The search\_creators\(\) function executes without error and returns the correct projected columns only \(verified by calling it with a dummy embedding vector\)\.

__•  __A vector can be upserted into the Qdrant creator\_content\_vectors collection and retrieved by ID \(verified by qdrant\-client Python script\)\.

__•  __The Postgres trigger correctly updates creator\_profiles on a manual score\_records INSERT \(verified by inserting a test row and querying creator\_profiles\)\.

__•  __Seed data exists, is clearly marked as test data, and all three seed users authenticate via Supabase Auth\.

__PHASE__

__3__

__Authentication__

*Goal: Signup, login, logout, and role\-based routing work exactly as mapped in the App Flow — before any protected feature page is built\.*

## __Why This Phase Comes Third__

Every feature in Phase 4 onwards requires a verified user identity\. Building features without auth in place means building twice — once with placeholder identity, once with real auth\. The App Flow defines exact redirect logic for every auth state; implementing auth first means every subsequent screen can be tested with real session context\.

## __Auth State Machine__

User visits any route

       |

       v

  Is user authenticated?

   No  |                Yes |

       v                    v

  Route is public?     Is onboarding\_completed = true?

  Yes |  No |           No |            Yes |

      v    v              v                 v

 Render  Redirect     Redirect to       Route by role:

  page  /login?       /onboarding       creator → /creator

        return\_to=                       brand   → /brand

        \{route\}                          admin   → /admin

## __Task List__

__\#__

__Task__

__Owner__

__Prerequisite__

__1__

Configure Supabase Auth in the Supabase dashboard: enable Google OAuth 2\.0 \(add client ID and secret from Google Cloud Console\) and enable Magic Link \(email OTP\)\. Set JWT expiry to 3600 seconds \(1 hour\)\. Enable refresh token rotation\.

Backend

Phase 2 complete

__2__

Configure NextAuth\.js v5 in frontend/auth\.ts with the Supabase Auth adapter\. Configure two providers: GoogleProvider and EmailProvider \(Magic Link\)\. Set session strategy to 'jwt'\. Set the callbacks: jwt\(\) should attach the Supabase user id and role to the token; session\(\) should expose both to the client\.

Frontend

Task 1

__3__

Create the /login page \(app/\(auth\)/login/page\.tsx\)\. Components: AnswerRank logo, 'Sign in with Google' button, email input \+ 'Send Magic Link' button, link to /signup\. Functional only — design polish in Phase 8\.

Frontend

Task 2

__4__

Create the /signup page\. Identical to /login plus an account type selector: two cards \('I am a Creator' / 'I am a Brand'\) that set the role before submission\. On signup completion, write the users row with the selected role and redirect to /onboarding\.

Frontend

Task 2

__5__

Create the /onboarding wizard page with two branches: Creator branch: niche dropdown \+ optional YouTube/blog handle\. Brand branch: company name input \+ optional first campaign keyword\. On completion, write the corresponding profile row \(creator\_profiles or brand\_profiles\), set users\.onboarding\_completed = true, and redirect to the role home\.

Frontend

Tasks 3, 4

__6__

Implement the FastAPI auth dependency in app/core/security\.py: async def get\_current\_user\(token: str = Depends\(oauth2\_scheme\)\) \-> UserModel\. Validate the Supabase JWT, extract the user\_id and role, fetch the users row, and return a UserModel\. Raise HTTP 401 on any failure\.

Backend

Phase 2: users table

__7__

Add get\_current\_user as a dependency on every protected FastAPI endpoint\. All /api/v1/\* routes require authentication\. The /health and /metrics routes are public\. The /ws/audit/\{audit\_id\} WebSocket validates the JWT from a query parameter \(?token=\) on connection open\.

Backend

Task 6

__8__

Implement session expiry handling on the frontend\. In the TanStack Query global error handler: on HTTP 401 response, attempt a silent NextAuth token refresh\. If refresh fails, redirect to /login?return\_to=\{current route\} and display a toast: 'Your session has expired\. Please sign in again\.'

Frontend

Tasks 2, 3

__9__

Implement the logout action: NextAuth signOut\(\) \+ Supabase auth\.signOut\(\) \(both, to clear both sessions\)\. Redirect to / \(landing page\) after logout\. Verify the session is fully terminated: attempt to access /creator after logout — should redirect to /login\.

Frontend

Tasks 2, 3

__10__

Create the Next\.js middleware\.ts that enforces route protection on all /\(creator\)/\*, /\(brand\)/\*, /\(admin\)/\* routes\. Read the session, check onboarding\_completed and role, and redirect accordingly per the auth state machine above\.

Frontend

Tasks 2, 4, 5

__✓  PHASE COMPLETE — DONE CRITERIA__

__•  __A new creator user can sign up via Google OAuth, select 'Creator', complete onboarding, and land on /creator/dashboard — end\-to\-end without any developer intervention\.

__•  __A new brand user can sign up via Magic Link, select 'Brand', complete onboarding, and land on /brand/dashboard\.

__•  __A logged\-in creator visiting / is redirected to /creator/dashboard\. A logged\-in brand visiting / is redirected to /brand/dashboard\.

__•  __Logging out terminates both the NextAuth and Supabase sessions\. Attempting to visit /creator after logout redirects to /login\.

__•  __Visiting /creator/dashboard while unauthenticated redirects to /login?return\_to=/creator/dashboard\. Successful login returns the user to /creator/dashboard\.

__•  __An expired JWT on a FastAPI request returns HTTP 401 with JSON \{error: 'Session expired', code: 'auth/session\_expired'\}\.

__•  __The /onboarding page is inaccessible to a user with onboarding\_completed = true — they are redirected to their role home\.

__PHASE__

__4__

__Creator Ingestion Pipeline__

*Goal: A Creator can submit a URL and the system reliably extracts and normalizes its content — the prerequisite for scoring anything\.*

## __Why This Phase Comes Fourth__

The Deterministic Scoring Engine in Phase 5 requires normalized text to score\. Normalized text requires extraction\. Extraction requires a URL submission pipeline with a working queue, worker, and WebSocket\. This phase builds the full data path from URL input to stored, normalized content — with no scoring logic yet\.

## __Task List__

__\#__

__Task__

__Owner__

__Prerequisite__

__1__

Create URLInputTerminal\.tsx component\. A dark, full\-width input field with monospace font and neon teal cursor \(Tailwind: font\-mono, border\-teal, focus:ring\-teal\)\. On form submission, call the submitAudit mutation \(TanStack Query\)\. Display inline validation errors for: empty URL, non\-HTTP URL, malformed URL\. No visual polish yet — functional only\.

Frontend

Phase 3 complete

__2__

Create the auditStore\.ts Zustand store with the interface from Master Doc Section 9\.3: auditId, status \('idle'|'ingesting'|'scoring'|'complete'\), score \(null initially\), factors \(empty initially\), wsStatus \('connecting'|'connected'|'disconnected'\)\.

Frontend

Phase 3 complete

__3__

Implement POST /api/v1/audit in FastAPI \(app/api/v1/audit\.py\)\. Steps: \(a\) Validate AuditRequestSchema with Pydantic v2 \(url: HttpUrl, creator\_id: uuid\)\. \(b\) Insert an audits row with status='queued'\. \(c\) Fire ingest\_and\_score\.delay\(url, str\(audit\_id\)\)\. \(d\) Return \{audit\_id: str, status: 'queued'\}\. Do not await the Celery task\.

Backend

Phase 2: audits table

__4__

Implement the URL platform classifier in app/services/extractor/classifier\.py\. Logic: if 'youtube\.com/watch' or 'youtu\.be/' in url → 'youtube'\. Else → 'web'\. Return a Platform enum value\. Add regex validation for both URL types\.

Backend

Task 3

__5__

Implement YouTube extraction in app/services/extractor/youtube\.py\. Primary: youtube\_transcript\_api\.YouTubeTranscriptApi\.get\_transcript\(video\_id\)\. Fallback \(if TranscriptsDisabled\): pytube\.YouTube\(url\)\.captions to extract subtitle file\. Return the raw transcript text\. Raise ExtractionError with reason='private\_video' if VideoUnavailable\.

Backend

Task 4

__6__

Implement web extraction in app/services/extractor/web\.py\. Use trafilatura\.fetch\_url\(url\) \+ trafilatura\.extract\(downloaded, include\_tables=True, include\_formatting=True\)\. Return the extracted body text\. Raise ExtractionError with reason='extraction\_failed' if trafilatura returns None\.

Backend

Task 4

__7__

Implement the normalization pipeline in app/services/extractor/normalizer\.py\. Steps: \(a\) Strip HTML entities and Unicode noise\. \(b\) Preserve header hierarchy \(H1/H2/H3 markers\)\. \(c\) Normalize whitespace \(no double newlines, no trailing spaces\)\. \(d\) Parse publication date using dateutil\.parser, normalize to ISO\-8601\. \(e\) Return NormalizedContent dataclass with cleaned\_text, word\_count, headers\_extracted, publish\_date\.

Backend

Tasks 5, 6

__8__

Implement the Celery task ingest\_and\_score in app/workers/ingest\_and\_score\.py\. Phase 4 scope \(scoring is Phase 5\): \(a\) Update audits\.status = 'ingesting'\. \(b\) Classify URL → call correct extractor\. \(c\) Normalize content\. \(d\) Write content\_normalized row\. \(e\) Update audits\.status = 'scoring'\. \(f\) Emit WebSocket event \{type: 'ingestion\_complete', word\_count\}\. Handle ExtractionError: update audits\.status = 'failed', audits\.failure\_reason = error\.reason\.

Backend

Tasks 3\-7

__9__

Configure Celery in app/workers/celery\_app\.py\. Broker: Redis URL from config\. Two queues: 'high' \(URL ingestion\) and 'low' \(scoring, embedding\)\. Route ingest\_and\_score to 'high'\. Task serializer: json\. Result backend: Redis\. Concurrency: 4 per worker\.

Backend

Task 8

__10__

Implement the WebSocket endpoint in app/api/websocket/audit\_ws\.py\. Accept connection with JWT validation from ?token= query param\. Subscribe to Redis pub/sub channel audit:\{audit\_id\}:events\. Forward events to the connected client\. On disconnect, clean up the Redis subscription\.

Backend

Tasks 8, 9

__11__

Implement the useAuditWebSocket hook in frontend/hooks/useAuditWebSocket\.ts\. Opens a WebSocket to /ws/audit/\{auditId\}?token=\{jwt\}\. On each event, updates the auditStore based on event type\. Handles reconnection \(3 retries with 2s backoff\) and emits wsStatus updates to the store\.

Frontend

Tasks 2, 10

__12__

Wire URLInputTerminal → POST /audit → WebSocket in the /creator/dashboard page\. Flow: \(1\) Submit URL → \(2\) Receive audit\_id → \(3\) Open WebSocket → \(4\) Update auditStore on events → \(5\) Show ingestion status \(basic text label: 'Extracting content\.\.\.'\)\. No score display yet\.

Frontend

Tasks 1, 2, 11

__13__

Implement the error card rendering for failed audits\. Map failure\_reason values to user\-facing messages: 'private\_video' → 'This YouTube video is private or unavailable\. Please check the URL and try again\.' | 'extraction\_failed' → 'We could not extract content from this URL\. Try a direct article or video URL\.' | 'invalid\_url' → display inline on the input field before submission\.

Frontend

Task 12

__✓  PHASE COMPLETE — DONE CRITERIA__

__•  __Submitting a real, public YouTube URL creates an audits row \(status='queued'\), triggers a Celery task on the 'high' queue, and results in a populated content\_normalized row with non\-empty cleaned\_text and a word\_count > 0\.

__•  __Submitting a real blog/article URL produces the same result via trafilatura extraction\.

__•  __The frontend receives a live WebSocket event \{type: 'ingestion\_complete', word\_count: N\} when ingestion completes, and the auditStore is updated correctly\.

__•  __Submitting an invalid URL \(e\.g\., 'not\-a\-url'\) is rejected with an inline validation error before any POST request is sent\.

__•  __Submitting a private YouTube video URL results in audits\.status = 'failed', audits\.failure\_reason = 'private\_video', and the error card renders in the frontend with the correct message\.

__•  __The WebSocket reconnects automatically after a disconnection \(test by killing the backend momentarily after audit submission\)\.

__PHASE__

__5__

__Deterministic Scoring Engine__

*Goal: A normalized audit produces a real, mathematically traceable AnswerRank Score — the core IP of the product, and a hard dependency for every Brand\-facing feature that follows\.*

## __Why This Phase Comes Fifth__

The Brand Campaign Search in Phase 6 ranks creators by their AnswerRank Score combined with cosine similarity\. Without real scores in the database and real vectors in Qdrant, Phase 6 has nothing meaningful to rank\. The scoring engine must be complete, verified against its mathematical specification, and indexed before any brand\-facing feature can be built\.

## __Formula Reference__

AR Composite Score:

  AR = 100 × Σ\(wi × Di\)   where Σwi = 1

  w1=0\.22 \(D1: Direct Answer Density\)

  w2=0\.20 \(D2: Entity Clarity\)

  w3=0\.18 \(D3: FAQ Coverage\)

  w4=0\.15 \(D4: Structured Data\)

  w5=0\.10 \(D5: Formatting Quality\)

  w6=0\.08 \(D6: Freshness\)

  w7=0\.07 \(D7: Content Depth\)

 

D1: Direct Answer Density

  D1 = |\{s ∈ S : interrogative\_match\(s\)\}| / |S|

  interrogative\_match: sentence starts with \[What|Who|Why|How|When|Is|Are|Can\]

 

D2: Entity Clarity

  D2 = \(Σ Ck\) / |W| × definition\_coverage\_ratio

  Ck = co\-occurrence count of entity k with definitional phrase

 

D3: FAQ Coverage

  D3 = min\(1\.0, N\_qa / 5\) × structural\_quality\_modifier

  structural\_quality\_modifier: 1\.0 \(interrogative\), 0\.7 \(declarative\)

 

CMP \(Phase 6, for reference\):

  CMP = cos\(V\_brand, V\_creator\) × \(1 \+ 0\.3 × AR/100\)

## __Task List__

__\#__

__Task__

__Owner__

__Prerequisite__

__1__

Implement D1 \(Direct Answer Density\) in app/services/scoring/d1\_direct\_answer\.py\. Split content into sentences using nltk\.sent\_tokenize\(\)\. Apply interrogative\_match regex: r'^\(What|Who|Why|How|When|Is|Are|Can\)\\b'\. Return ratio: matched\_count / total\_sentences\. Clamp to \[0\.0, 1\.0\]\.

Backend

Phase 4 complete

__2__

Implement D2 \(Entity Clarity\) in app/services/scoring/d2\_entity\_clarity\.py\. Use spaCy NER \(en\_core\_web\_sm\) to extract entities of type PRODUCT, ORG, PERSON, CHEMICAL\. Count co\-occurrences of each entity with definitional phrases: \['is a', 'refers to', 'defined as', 'known as', 'means', 'is used for'\]\. Return \(entity\_definition\_count / word\_count\) × definition\_coverage\_ratio\. Normalize to \[0\.0, 1\.0\]\.

Backend

Task 1

__3__

Implement D3 \(FAQ Coverage\) in app/services/scoring/d3\_faq\_coverage\.py\. Detect Q&A pairs using: \(a\) Explicit '?' characters in sentence\-tokenized content\. \(b\) Lines starting with 'Q:' pattern\. \(c\) HTML heading \+ paragraph pairs where heading ends with '?'\. Count N\_qa\. Apply structural\_quality\_modifier \(1\.0 if interrogative, 0\.7 if declarative\)\. Return min\(1\.0, N\_qa / 5\) × modifier\.

Backend

Task 1

__4__

Implement D4 \(Structured Data\) in app/services/scoring/d4\_structured\_data\.py\. Score presence of: \(a\) H2/H3 headers in extracted header\_hierarchy — 0\.4 score contribution\. \(b\) Numbered lists \(regex: r'^\\d\+\\\.\\s'\) — 0\.25 contribution\. \(c\) Tables \(if platform=web, check trafilatura's preserved table markers\) — 0\.2\. \(d\) Bold/emphasis markers — 0\.15\. Normalize weighted sum to \[0\.0, 1\.0\]\.

Backend

Task 1

__5__

Implement D5 \(Formatting Quality\) in app/services/scoring/d5\_formatting\.py\. Score: \(a\) Average sentence length < 25 words: 0\.3\. \(b\) Paragraph length < 150 words: 0\.3\. \(c\) Absence of decorative noise \(all\-caps text, excessive punctuation\): 0\.2\. \(d\) Logical reading order \(content starts with a topic sentence\): 0\.2\. Return weighted sum normalized to \[0\.0, 1\.0\]\.

Backend

Task 1

__6__

Implement D6 \(Freshness\) in app/services/scoring/d6\_freshness\.py\. Use the publish\_date from NormalizedContent \(parsed in Phase 4\)\. Score: published < 30 days ago: 1\.0\. 30–90 days: 0\.8\. 90–180 days: 0\.6\. 180–365 days: 0\.4\. > 365 days or no date: 0\.2\.

Backend

Task 1

__7__

Implement D7 \(Content Depth\) in app/services/scoring/d7\_content\_depth\.py\. Score components: \(a\) Word count: min\(1\.0, word\_count / 1500\) — 0\.5 weight\. \(b\) Unique bigrams / total bigrams \(semantic density\): 0\.3 weight\. \(c\) Number of distinct topics \(approximated by H2 count\): min\(1\.0, h2\_count / 5\) — 0\.2 weight\. Return weighted sum\.

Backend

Task 1

__8__

Implement the AR Composite Score orchestrator in app/services/scoring/engine\.py\. Call all seven heuristic functions\. Apply weights from app/services/scoring/weights\.py: W = \[0\.22, 0\.20, 0\.18, 0\.15, 0\.10, 0\.08, 0\.07\]\. Calculate AR = 100 × sum\(w × d for w, d in zip\(W, scores\)\)\. Return ScoringResult dataclass with all seven sub\-scores and composite\.

Backend

Tasks 1\-7

__9__

Complete the ingest\_and\_score Celery task \(scoring half\)\. After ingestion: \(a\) Call score\_engine\.calculate\(content\_normalized\_id\)\. \(b\) Write score\_records row with all 7 sub\-scores and weights\_version='v1\.0'\. \(c\) Update audits\.composite\_score and audits\.status='complete'\. \(d\) Emit WebSocket event \{type: 'scoring\_complete', score: AR, factors: \[\{id, name, score, weight\}\.\.\.\]\}\.

Backend

Tasks 8, Phase 4

__10__

Implement vector embedding and Qdrant indexing in app/services/embedding/embedder\.py and qdrant\_client\.py\. Steps: \(a\) Chunk content into 512\-token segments\. \(b\) SentenceTransformer\('all\-MiniLM\-L6\-v2'\)\.encode\(chunks\)\. \(c\) Aggregate chunk embeddings \(mean pooling\)\. \(d\) Qdrant client upsert: point\_id=audit\_id, vector=aggregated\_embedding, payload=\{creator\_id, niche, score, verified=true\}\. \(e\) Update audits\.vector\_id with the Qdrant point ID\. \(f\) Emit WS event \{type: 'indexed', vector\_id\}\.

Backend

Task 9

__11__

Build the ScoreProgressArc component \(functional\)\. SVG arc, 0–100 scale, fills clockwise\. Color interpolation: 0–40: danger \(\#EF4444\), 41–70: warning \(\#F59E0B\), 71–100: teal \(\#00D4AA\)\. Numeric score in center with tabular\-nums font\. Tier label below score\. Animate with Framer Motion: 1\.2 second fill on first render\. Props: score \(number\), animated \(boolean\)\.

Frontend

auditStore exists

__12__

Build the DiagnosisChecklist component \(functional\)\. Seven FactorCard components, one per D1–D7\. Each FactorCard shows: factor name, sub\-score \(0–1\.0 to 1 decimal\), horizontal fill bar, pass/fail icon \(pass: score >= 0\.6, fail: below\)\. Failing cards show one\-line remediation hint hardcoded per factor \(e\.g\. D3 fail: 'Add a structured FAQ section with at least 5 Q&A pairs'\)\. Receive factors array from auditStore\.

Frontend

Task 11

__13__

Wire ScoreProgressArc and DiagnosisChecklist into /creator/dashboard page\. Update auditStore from WebSocket scoring\_complete event\. The arc animates when score arrives\. The checklist renders all 7 cards\. If score < 80, render OptimizeWithGeminiPanel \(stub for now — implemented fully in Phase 7\)\.

Frontend

Tasks 11, 12

__14__

Write unit tests \(tests/unit/test\_scoring\.py\) for all 7 heuristic functions and the AR composite\. Cover: known input with expected output, boundary value D1=0\.0, D1=1\.0, all\-zero sub\-scores = AR 0, all\-one sub\-scores = AR 100\.

Backend

Tasks 1\-8

__✓  PHASE COMPLETE — DONE CRITERIA__

__•  __A completed audit has a score\_records row with all 7 sub\-scores populated\. Manually recalculating AR = 100 × Σ\(wi × Di\) using those values matches audits\.composite\_score to 2 decimal places\.

__•  __The scoring engine module in isolation \(excluding network time\) executes in under 200ms on a 1500\-word test input — confirmed by a time\.perf\_counter\(\) benchmark in the unit tests\.

__•  __No LLM API call occurs anywhere in the scoring code path\. Confirmed by: \(a\) Code review of engine\.py and all d\*\.py files\. \(b\) Absence of any google\.generativeai or openai import in the scoring module directory\.

__•  __A creator's first completed audit flips creator\_profiles\.verified = true and populates current\_answer\_rank\_score \(confirmed via Postgres trigger — verified by querying creator\_profiles after audit completion\)\.

__•  __The audit's content vector exists in Qdrant and is retrievable by the stored vector\_id\.

__•  __The ScoreProgressArc animates correctly to the score value and displays the correct tier label\.

__•  __All unit tests in test\_scoring\.py pass, including boundary cases\.

__PHASE__

__6__

__Brand Campaign Search__

*Goal: A Brand can search by keyword and receive creators ranked by real Campaign Match Probability — only possible now that Phase 5 produces real scores and vectors to rank against\.*

## __Why This Phase Comes Sixth__

The CMP formula requires both a creator's AR Score \(stored in score\_records\) and their content vector \(stored in Qdrant\)\. Both of those only exist after Phase 5\. Phase 6 builds the complete brand\-facing search experience on top of the now\-complete creator data pipeline\.

## __CMP Formula Reference__

Campaign Match Probability:

  CMP\(brand, creator\) = cos\(V\_brand, V\_creator\) × \(1 \+ α × AR\_creator / 100\)

  where:

    V\_brand   = SentenceTransformers embedding of brand keyword cluster

    V\_creator = Qdrant vector for creator's content

    AR\_creator = creator's AnswerRank Score \(0\-100\)

    α = 0\.3 \(AnswerRank amplification coefficient\)

 

  Interpretation: A creator with perfect semantic match \(cos=1\.0\)

  but low AR score \(30/100\) receives CMP = 1\.0 × \(1 \+ 0\.3 × 0\.30\) = 1\.09

  vs\. same match with AR=90: CMP = 1\.0 × \(1 \+ 0\.3 × 0\.90\) = 1\.27

  Results are then normalized to \[0, 100\]% range for display\.

## __Task List__

__\#__

__Task__

__Owner__

__Prerequisite__

__1__

Create the /brand/dashboard page shell \(app/\(brand\)/dashboard/page\.tsx\)\. Layout: top summary stat cards \(total creators in DB, avg AR score, search count\) \+ prominent CampaignSearchBar below\. Functional only — visual polish in Phase 8\.

Frontend

Phase 5 complete

__2__

Build CampaignSearchBar\.tsx\. A large search input with placeholder: 'Search by campaign keyword \(e\.g\., Organic Skincare, Ayurvedic Hair Oil\)'\. On submission, call the campaignSearch TanStack Query mutation\. Below the search bar: a FiltersDrawer toggle button for niche, minimum score, verified\-only, follower range filters\.

Frontend

Task 1

__3__

Build FiltersDrawer\.tsx \(shadcn/ui Drawer\)\. Filters: niche \(multi\-select from enum list\), minimum AnswerRank Score \(slider 0–100\), verified only \(checkbox\), follower range \(min/max inputs\)\. On filter change, update campaignStore\.filters\. The drawer closes and triggers a re\-search on Apply\.

Frontend

Task 2

__4__

Implement POST /api/v1/campaign/search in FastAPI\. Steps: \(a\) Validate BrandQuerySchema \(query\_text: str, niche\_filter: Optional\[str\], min\_score: float=0, max\_results: int=50\)\. \(b\) Embed query\_text using SentenceTransformers\. \(c\) Call Qdrant ANN search: collection=creator\_content\_vectors, query\_vector=V\_brand, limit=200, filter=\{niche=filter, score>=min\_score\}\. \(d\) Calculate CMP for each result\. \(e\) Sort by CMP descending, slice to max\_results\. \(f\) Insert campaign\_queries row\. \(g\) Return RankedCreatorSchema\[\]\.

Backend

Phase 5: Qdrant indexed

__5__

Implement CMP calculation in app/services/campaign/cmp\.py\. Function: calculate\_cmp\(cosine\_similarity: float, ar\_score: float, alpha: float = 0\.3\) \-> float\. Formula: cmp = cosine\_similarity × \(1 \+ alpha × ar\_score / 100\)\. Normalize the entire result set to \[0, 100\]% range: normalized\_cmp = \(cmp / max\_cmp\) × 100\.

Backend

Task 4

__6__

Build CreatorCandidateGrid\.tsx with TanStack Table v8 \+ TanStack Virtual v3\. Columns per spec: Creator \(avatar \+ handle \+ verified badge\), Followers, AnswerRank Score \(MiniScoreArc 48px\), Campaign Match Probability \(MatchProbabilityBar\), Status pill \(Highly Recommended: CMP>70%, Poor Match: CMP<30%, Moderate: else\), Actions \(Inspect button, Save button\)\. Virtualize all rows — only ~20 DOM nodes rendered at once\.

Frontend

Tasks 2, 3

__7__

Build CreatorScoreProfiler\.tsx — a right\-side slide\-over panel \(shadcn/ui Sheet, 720px wide\)\. Sections: ProfilerHeader \(creator identity \+ composite score arc \+ Campaign Match Probability badge\), ScoreRadar, EntityHeatmap, CampaignMatchRationale\. Opens on Inspect click, sets campaignStore\.selectedCreatorId\.

Frontend

Task 6

__8__

Build ScoreRadar\.tsx using Recharts RadarChart\. 7 axes, one per D1–D7\. Creator's scores plotted as filled polygon \(accent color, 60% opacity\)\. An 'ideal profile' overlay \(dashed white line at 0\.8 on all axes\)\. Include axis labels and a legend\. Data sourced from GET /api/v1/creator/\{creator\_id\} \(score breakdown\)\.

Frontend

Task 7

__9__

Build EntityHeatmap\.tsx\. A word\-cloud\-style layout where creator's named entities are sized proportionally to their frequency in the creator's content \(sourced from D2 entity extraction data in score\_records\)\. Color by entity type: PRODUCT=accent, ORG=teal, PERSON=success, CHEMICAL=warning\.

Frontend

Task 7

__10__

Build CampaignMatchRationale\.tsx\. A plain\-text card generated server\-side and returned in RankedCreatorSchema\.match\_rationale\. The backend generates this string in app/services/campaign/search\.py: identify top 3 overlapping entities between query and creator content, state the structural signals present\. E\.g\.: 'Vitamin C Serum appears 9× with clinical definitions\. FAQ section detected\. High direct\-answer density\.'

Backend

Task 4

__11__

Implement saved\_creators endpoints in FastAPI: POST /api/v1/creators/save \(INSERT into saved\_creators, return 409 on duplicate due to UNIQUE constraint\) and DELETE /api/v1/creators/save/\{save\_id\}\. Wire the 'Save to Shortlist' button in CreatorScoreProfiler to call the save mutation\.

Backend/Frontend

Tasks 6, 7

__12__

Build the /brand/saved page with SavedCreatorsGrid\.tsx — identical column layout to CreatorCandidateGrid but sourced from GET /api/v1/creators/saved\. Add an 'Unsave' action that calls DELETE /api/v1/creators/save/\{save\_id\}\.

Frontend

Task 11

__13__

Implement zero\-result empty state in CreatorCandidateGrid\. When campaign search returns 0 results: show an empty state illustration, message: 'No creators found for this keyword\. Try broadening your search or adjusting the filters\.', and 3 suggested keyword alternatives \(hardcoded for V1, e\.g\., for 'Organic Skincare' suggest 'Natural Skincare', 'Clean Beauty', 'Ayurvedic Skin'\)\.

Frontend

Task 6

__14__

Implement skeleton loading rows in CreatorCandidateGrid\. While search is in flight: render 8 skeleton rows with pulsing shimmer animation \(Tailwind animate\-pulse\)\. Each skeleton row matches the column structure but with placeholder blocks instead of data\.

Frontend

Task 6

__✓  PHASE COMPLETE — DONE CRITERIA__

__•  __A real keyword search \('Skincare', 'Finance', or any niche with verified creators in the DB\) returns creators ranked by CMP\. Manually recalculating CMP for the top result using stored cosine similarity and AR score matches the API's returned value within 0\.5%\.

__•  __A brand JWT cannot read creator\_profiles rows directly\. Only search\_creators\(\) can be called, and only via the campaign search endpoint \(verified by attempting direct Supabase query as brand JWT\)\.

__•  __Campaign search end\-to\-end latency \(embed \+ Qdrant ANN \+ CMP calculation \+ response\) is under 500ms measured at the API layer \(benchmark with 10 requests\)\.

__•  __Saving a creator inserts a saved\_creators row\. Attempting to save the same creator twice returns 409 Conflict \(UNIQUE constraint\)\. Unsaving deletes the row correctly\.

__•  __A zero\-result search renders the empty state with the correct message and suggestions — not a blank page or a loading spinner stuck indefinitely\.

__•  __The CreatorCandidateGrid renders 100\+ rows without layout jank \(TanStack Virtual confirmed working by testing with a seeded dataset of 200 creators\)\.

__PHASE__

__7__

__Fix\-It Copilot & Secondary Features__

*Goal: The remaining product surface — Gemini\-powered optimization, Share of Voice analytics, billing tiers, and GDPR compliance — is implemented on top of the now\-stable core pipeline\.*

## __Why This Phase Comes Seventh__

All secondary features in this phase are layered on top of the core pipeline\. Gemini optimization rewrites content that was scored in Phase 5\. Share of Voice aggregates score\_records that were written in Phase 5\. Billing tiers gate access to features built in Phases 4–6\. Building these earlier would mean building on an incomplete foundation\.

## __Task List__

__\#__

__Task__

__Owner__

__Prerequisite__

__1__

Implement the Gemini system prompt in app/services/gemini/prompt\.py\. The prompt must specify: \(a\) Preserve the creator's voice and tone exactly\. \(b\) Inject a structured FAQ section \(minimum 5 Q&A pairs relevant to the content topic\)\. \(c\) Add entity definitions for the top 5 named entities missing definitions\. \(d\) Add header hierarchy \(H2/H3\) where absent\. \(e\) Do not hallucinate facts — only use information present in the original content\. \(f\) Output clean Markdown\.

Backend

Phase 6 complete

__2__

Implement POST /api/v1/optimize in FastAPI\. Steps: \(a\) Check subscriptions\.gemini\_credits\_remaining > 0 \(raise HTTP 402 if exhausted\)\. \(b\) Fetch content\_normalized row for the audit\. \(c\) Call Gemini 1\.5 Flash with the system prompt \+ original content\. \(d\) Run the scoring engine on the optimized content to get projected\_score\. \(e\) Write optimization\_events row \(approved=false initially\)\. \(f\) Return \{original\_text, optimized\_text, projected\_score, diff\_summary\}\. Do NOT decrement credits yet — only on creator approval\.

Backend

Tasks 1, Phase 5

__3__

Build OptimizeWithGeminiPanel\.tsx \(full implementation\)\. Shows below DiagnosisChecklist when score < 80\. Contains: credit count badge \(e\.g\. '2 rewrites remaining'\), '✨ Optimize with Gemini' CTA button\. On click: call optimize mutation, show streaming\-style skeleton for ~3 seconds, then render ContentDiffViewer\.

Frontend

Task 2

__4__

Build ContentDiffViewer\.tsx\. Side\-by\-side panel: left = original content, right = optimized content\. A diff mode toggle highlights additions in green, deletions in red\. Below: 'Projected Score: 84 / 100' \(using projected\_score from API\)\. Two action buttons: 'Apply & Update Score' \(approve\) and 'Discard' \(reject\)\.

Frontend

Task 3

__5__

Implement the creator approval flow\. On 'Apply & Update Score' click: POST /api/v1/optimize/\{event\_id\}/approve\. Backend: \(a\) Update optimization\_events\.approved = true\. \(b\) Update audits\.composite\_score with projected\_score\. \(c\) Decrement subscriptions\.gemini\_credits\_remaining by 1\. \(d\) Update creator\_profiles\.current\_answer\_rank\_score\. \(e\) Re\-embed optimized content and upsert to Qdrant \(to keep creator's vector current\)\. Frontend: animate ScoreProgressArc to new score\.

Backend/Frontend

Tasks 2, 4

__6__

Implement the Gemini failure path\. If the Gemini API call fails \(timeout, rate limit, API error\): \(a\) Do NOT decrement gemini\_credits\_remaining\. \(b\) Do NOT alter the existing audit score\. \(c\) Return HTTP 503\. Frontend: render error card with 'Optimization failed\. Your credit was not used\. Please try again\.' and a Retry button\.

Backend/Frontend

Task 2

__7__

Implement free\-tier audit limit enforcement\. In POST /api/v1/audit: check subscriptions\.audit\_count\_this\_month\. If user is on free tier \(tier='creator\_free'\) and audit\_count\_this\_month >= 3: return HTTP 403 with \{error: 'Monthly limit reached', code: 'tier/audit\_limit\_reached'\}\. Frontend: render the inline upsell card \(not a modal\) pointing to /creator/upgrade\.

Backend/Frontend

Phase 4: POST /audit

__8__

Build /creator/upgrade and /brand/upgrade pages\. Show tier comparison table\. Include a CTA button that opens a confirmation modal before redirecting to the billing provider\. Functional only — no real billing integration in V1 \(mock the payment flow, wire the tier upgrade webhook handler in the next task\)\.

Frontend

Phase 3 complete

__9__

Implement the billing webhook handler in app/services/billing/webhook\.py\. Accept POST from billing provider \(Stripe or Razorpay\)\. Verify HMAC\-SHA256 signature from X\-Signature header using the webhook secret from AWS Secrets Manager\. On payment\_succeeded event: update subscriptions\.tier, reset audit\_count\_this\_month, reset gemini\_credits\_remaining\. Write audit\_logs row\. Return HTTP 200 immediately \(process async\)\.

Backend

Phase 2: subscriptions table

__10__

Implement GET /api/v1/sov/\{keyword\} for brand\_enterprise tier only\. Steps: \(a\) Check user role = 'brand\_enterprise'\. If not, return HTTP 403 with \{code: 'tier/enterprise\_required'\}\. \(b\) Embed keyword\. \(c\) Query Qdrant for top 10 creators by cosine similarity\. \(d\) Aggregate their AR scores and CMP values\. \(e\) Return \{keyword, creators: \[\{creator\_id, handle, sov\_share: float, cmp: float\}\.\.\.\]\} where sov\_share is normalized CMP percentage\.

Backend

Phase 6: Qdrant \+ CMP

__11__

Build /brand/sov page and ShareOfVoiceChart\.tsx\. Uses Recharts PieChart or BarChart to visualize SOV distribution\. Wire the 403 response to redirect non\-enterprise brands to /brand/upgrade\.

Frontend

Task 10

__12__

Implement GET /api/v1/audit/history for creators\. Returns all audits for the current creator, sorted by created\_at descending\. Include composite\_score and status\. Build AuditHistoryTable\.tsx on /creator/history page with columns: URL \(truncated\), Score, Status, Date, Actions \(View Full Audit\)\.

Backend/Frontend

Phase 5

__13__

Implement DELETE /api/v1/gdpr/wipe/\{creator\_id\} \(admin only, role check enforced\)\. Steps in this exact order: \(a\) Delete all Supabase Storage objects for the creator\. \(b\) Delete all Qdrant vectors for the creator \(filter by creator\_id payload\)\. \(c\) Delete optimization\_events, score\_records, content\_normalized, audits, subscriptions, creator\_profiles rows \(cascade\)\. \(d\) Soft\-delete the users row \(set deleted\_at\) rather than hard\-delete, to preserve audit\_logs FK reference\. \(e\) Write one audit\_logs row: \{action: 'gdpr\_wipe', actor\_id: admin\_id, target\_id: creator\_id, metadata: \{deleted\_vector\_count, deleted\_audit\_count\}\}\.

Backend

Phase 2: all tables

__✓  PHASE COMPLETE — DONE CRITERIA__

__•  __A creator with score < 80 can click 'Optimize with Gemini', see a diff of original vs\. optimized content, and approve the result — their composite\_score updates, gemini\_credits\_remaining decrements by 1, and the Qdrant vector is refreshed\.

__•  __A failed Gemini API call does NOT decrement gemini\_credits\_remaining and does NOT alter the audit's composite\_score \(verified by simulating a Gemini timeout in test\)\.

__•  __A free\-tier creator's 4th audit attempt in a calendar month is rejected at the API layer \(HTTP 403\) before any Celery task is queued\. The inline upsell card renders on the frontend\.

__•  __A non\-enterprise brand accessing /brand/sov or calling GET /api/v1/sov/\* receives HTTP 403 and is redirected to /brand/upgrade\.

__•  __The GDPR wipe endpoint on a test creator deletes: all Qdrant vectors \(confirmed by Qdrant query returning 0 results for that creator\_id\), all Supabase rows across all 11 tables \(confirmed by post\-wipe query sweep\), and writes exactly one audit\_logs row for the wipe action\.

__•  __The billing webhook correctly updates subscriptions\.tier on a mock payment\_succeeded event \(verified using a tool like Stripe CLI \-\-trigger payment\_intent\.succeeded\)\.

__PHASE__

__8__

__UI Polish & Responsive Design__

*Goal: Every screen handles its empty, loading, and error states gracefully, the final design system is applied, and all screens work at desktop, tablet, and mobile viewports\.*

## __Why This Phase Comes Eighth__

Visual polish applied to non\-functional features is wasted effort — it must be redone when the feature changes\. Polish applied to functional features that have not been tested may hide bugs\. Phase 8 comes after Phase 7 \(all features built\) but before Phase 9 \(testing\), so that testing is done on the exact UI that will ship\.

__⚠  Phase 8 assumes the UI/UX Design Specification document has been delivered and is available as input\. Apply the design system from that document exactly — do not invent colors, spacing, or component styles not specified there\.__

## __Task List__

__\#__

__Task__

__Owner__

__Prerequisite__

__1__

Apply the final color token system from the UI/UX Design Specification to tailwind\.config\.ts\. Replace all hardcoded hex values in components with Tailwind semantic tokens \(bg\-surface, text\-accent, border\-elevated, etc\.\)\. Run a grep for any hardcoded hex values that were used in Phases 4\-7 and replace them\.

Frontend

Phase 7 complete

__2__

Apply final typography\. Add Inter Variable and JetBrains Mono via next/font\. Apply font\-inter to all body text, font\-mono to URL input, score labels, and all numeric data fields\. Apply font\-variant\-numeric: tabular\-nums to all score numbers and follower counts\.

Frontend

Task 1

__3__

Apply final spacing system\. Audit every component for spacing consistency: cards use p\-4 \(16px\) padding, grid gaps are gap\-3 or gap\-4, section spacing uses py\-6 or py\-8\. Remove any inconsistent ad\-hoc spacing values\.

Frontend

Task 1

__4__

Apply Framer Motion animations to all components that animate: ScoreProgressArc \(1\.2s arc fill\), MatchProbabilityBar \(0\.6s bar fill on mount\), CreatorCandidateGrid rows \(staggered entry on search result load\), CreatorScoreProfiler slide\-over \(0\.25s ease\-out from right\), DiagnosisChecklist cards \(staggered entry 50ms between cards\), toast notifications \(0\.2s fade \+ slide\)\.

Frontend

Tasks 1\-3

__5__

Polish the NavigationRail\. Collapsed \(64px\): icon\-only nav items with tooltips\. Expanded \(220px\): icon \+ label\. Toggle via keyboard shortcut \[\. Highlight active route\. Live Audit Activity Indicator: animated teal pulse ring when any audit\.status is 'ingesting' or 'scoring' \(sourced from auditStore\)\.

Frontend

Tasks 1\-3

__6__

Polish the GlobalStatusBar\. 48px height, full width\. Left: breadcrumb trail \(dynamic from route\)\. Center: live active audit count badge \(only shown when > 0\)\. Right: creator database size counter \(from a cached API call that refreshes every 5 minutes\), notification bell, keyboard shortcut help overlay toggle\.

Frontend

Tasks 1\-3

__7__

Implement empty states for all screens\. Per App Flow Section 6: Creator Dashboard \(no audits yet\) — illustration, 'Submit your first URL to get your AI Visibility Score\.' Brand Dashboard \(no searches yet\) — illustration, 'Search your first campaign keyword to find AI\-visible creators\.' Saved Creators \(empty shortlist\) — 'Save creators from search results to build your shortlist\.'

Frontend

Phase 7 complete

__8__

Implement all error states per App Flow Section 7\. Each maps to a specific error card design: private\_video, extraction\_failed, invalid\_url, websocket\_disconnect \(reconnect button\), gemini\_failed \(retry, credit not consumed message\), payment\_failed \(retry, support link\), feature\_gated \(upgrade CTA\), network\_error \(generic retry\)\. Apply final styling to each error card\.

Frontend

Phase 7 complete

__9__

Implement loading skeleton states for all data\-loading screens\. CreatorCandidateGrid: 8 skeleton rows with column\-matched shimmer blocks\. CreatorScoreProfiler: skeleton for each section \(header, radar, heatmap, rationale\)\. AuditHistoryTable: 5 skeleton rows\. Stat cards on dashboards: shimmer placeholder\.

Frontend

Phase 7 complete

__10__

Apply responsive layout rules\. Desktop \(1280px\+\): full sidebar \+ full content area\. Tablet \(768\-1279px\): sidebar collapses to icon\-only automatically, content area expands\. Mobile \(< 768px\): sidebar becomes a bottom tab bar \(4 primary nav items\)\. Tables scroll horizontally\. CreatorScoreProfiler becomes a full\-screen drawer on mobile\.

Frontend

Tasks 1\-3

__11__

Implement keyboard shortcuts\. \[ to toggle sidebar\. ? to open keyboard shortcut help overlay\. / to focus the campaign search bar \(brand\)\. / to focus the URL input \(creator\)\. Escape to close any open modal, drawer, or overlay \(except mid\-confirmation dialogs\)\. Cmd/Ctrl\+K for a global command palette \(search \+ navigation\)\.

Frontend

Phase 7 complete

__12__

Polish the landing page \(/\)\. Hero section with animated background gradient \(permitted on landing, not on authenticated pages\)\. Product demo section\. Three\-tier pricing table\. CTA buttons: 'Get My Free Score' \(→ /signup?role=creator\) and 'Search Creators' \(→ /signup?role=brand\)\. Responsive: mobile\-first layout\.

Frontend

Tasks 1\-4

__✓  PHASE COMPLETE — DONE CRITERIA__

__•  __Every screen listed in the App Flow Pages List renders with the final design system applied — no hardcoded hex values remain in component files \(verified by grep\)\.

__•  __Every empty state specified in the App Flow has been manually triggered and matches the specified copy and visual design\.

__•  __Every error state has been manually triggered and displays the correct message and recovery action per the App Flow\.

__•  __All primary screens \(Creator Dashboard, Brand Dashboard, Creator Score Profiler\) are visually correct and non\-broken at viewport widths of 1440px, 1280px, 1024px, 768px, and 390px\.

__•  __Framer Motion animations run at 60fps on the target hardware \(no jank or dropped frames on a standard 2021\+ laptop\) — verified by Chrome DevTools Performance panel\.

__•  __Escape key dismisses every open modal and drawer, except the billing confirmation modal \(which requires explicit confirmation or cancel\)\.

__PHASE__

__9__

__Testing, Edge Cases & Security Audit__

*Goal: Every journey in the App Flow has been manually walked end\-to\-end, every documented edge case has been deliberately triggered and verified, and RLS is confirmed to hold under adversarial testing\.*

## __Why This Phase Comes Ninth__

Testing after all features and polish are applied means tests reflect the real product\. Testing before polish means UI changes can break tests\. Testing before all features are built means missing coverage on inter\-feature interactions \(e\.g\., how does the upgrade flow interact with the audit limit enforcement?\)\. Phase 9 tests the complete, polished product\.

## __Core User Journeys to Test End\-to\-End__

__Journey__

__Name__

__Steps__

__J1__

Creator Free Audit

Sign up → onboard → submit YouTube URL → watch WebSocket events → see score → view diagnosis → click Optimize → approve diff → score updates\.

__J2__

Brand Campaign Search

Sign up → onboard → enter keyword → view ranked results → filter → inspect creator → view radar \+ heatmap → save to shortlist → view saved creators\.

__J3__

Free\-Tier Limit

Creator submits 3 audits → 4th submission returns limit error → upsell card renders → clicks upgrade → billing flow triggered\.

__J4__

Brand SOV Gating

Brand \(non\-enterprise\) visits /brand/sov → redirected to /brand/upgrade → enterprise brand visits same page → sees SOV chart\.

__J5__

GDPR Wipe

Admin triggers wipe on test creator → all data deleted → confirmation in audit\_logs → creator account cannot be recovered\.

## __Task List__

__\#__

__Task__

__Owner__

__Prerequisite__

__1__

Manually execute Journey J1 end\-to\-end using a real YouTube URL\. Verify every WebSocket state transition fires \(queued → ingestion\_complete → scoring\_complete → indexed\)\. Verify the score arc animates correctly\. Verify the DiagnosisChecklist renders all 7 factors\. Verify Optimize with Gemini runs and the diff viewer shows real content\.

Both

Phase 8 complete

__2__

Manually execute Journey J2 end\-to\-end using real keywords\. Verify the CreatorCandidateGrid renders with real data\. Verify CMP values are plausible\. Verify the Creator Score Profiler opens with real ScoreRadar and EntityHeatmap data\. Verify saving and unsaving a creator works\.

Both

Task 1

__3__

Manually execute Journey J3\. Create a free\-tier test creator account\. Submit 3 audits to exhaust the monthly limit\. Submit a 4th — verify HTTP 403 is returned from the API and the upsell card renders on the frontend\. Verify no Celery task was queued for the 4th attempt\.

Both

Task 2

__4__

Deliberately trigger each error state from the App Flow: \(a\) Submit a private YouTube URL → verify failure\_reason='private\_video' error card\. \(b\) Submit a URL that trafilatura cannot extract → verify extraction\_failed error card\. \(c\) Kill the backend WebSocket during an active audit → verify the frontend shows the reconnect error and attempts reconnection\. \(d\) Simulate Gemini API failure \(use a bad API key in test env\) → verify the error card renders and credits are not decremented\.

Both

Tasks 1\-3

__5__

Write automated unit tests \(tests/unit/test\_scoring\.py\) covering all 7 heuristic functions with: known inputs and expected outputs, boundary values \(all\-zero input → AR=0, all\-one input → AR=100\), invalid inputs \(empty string, None → raise ValueError with clear message\)\.

Backend

Phase 5

__6__

Write automated unit tests for CMP calculation \(tests/unit/test\_cmp\.py\)\. Test cases: cosine=1\.0 \+ AR=100 → CMP=1\.3 \(before normalization\), cosine=0\.0 \+ any AR → CMP=0\.0, cosine=0\.5 \+ AR=50 → CMP=0\.5 × 1\.15 = 0\.575\.

Backend

Task 5

__7__

Write Playwright E2E tests \(tests/e2e/\) for Journeys J1 and J2\. The E2E tests should: spin up the full stack \(frontend \+ backend \+ Celery worker\), use test seed accounts, assert on rendered DOM elements \(score arc value, factor card count, grid row count\)\. These tests run in CI on every PR\.

Both

Tasks 1, 2

__8__

RLS adversarial test: Write direct Supabase API tests that attempt cross\-tenant reads\. Test cases: Creator A JWT reads audits where creator\_id = Creator B's ID \(must return 0 rows\)\. Brand A JWT reads saved\_creators where brand\_id = Brand B's ID \(must return 0 rows\)\. Brand A JWT calls creator\_profiles directly without search\_creators\(\) \(must return 0 rows\)\. Admin JWT reads all users \(must succeed\)\. All 4 tests must pass\.

Backend

Phase 2

__9__

Performance test: submit 20 concurrent audit requests using a load testing tool \(locust or k6\)\. Verify: \(a\) The FastAPI API thread is not blocked — /health endpoint responds in < 50ms during the load test\. \(b\) Celery workers process the queue without task loss\. \(c\) Scoring latency per task remains under 200ms\.

Backend

Phase 5

__10__

Run the GDPR wipe on a test creator account \(not the seed creator — create a disposable test account\)\. After the wipe: query every table for that creator\_id \(must return 0 rows\), query Qdrant for that creator\_id payload filter \(must return 0 points\), confirm exactly one audit\_logs row was written for the wipe\.

Backend

Phase 7

__11__

Security scan: run npm audit and pip\-audit on all dependencies\. Resolve any HIGH or CRITICAL severity vulnerabilities before proceeding to deployment\.

Both

Phase 7 complete

__12__

Accessibility pass: run Axe accessibility scanner on the Creator Dashboard, Brand Dashboard, and Creator Score Profiler\. Resolve any WCAG AA violations \(color contrast, missing alt text, missing ARIA labels, keyboard trap issues\)\.

Frontend

Phase 8 complete

__✓  PHASE COMPLETE — DONE CRITERIA__

__•  __All five core journeys \(J1–J5\) pass manual end\-to\-end testing with no unhandled errors in the console or network panel\.

__•  __All four error states from Task 4 reproduce the exact specified UI behavior — not a generic error message or blank screen\.

__•  __All unit tests in test\_scoring\.py and test\_cmp\.py pass, including all boundary cases\.

__•  __All four RLS adversarial tests return 0 rows for cross\-tenant reads\. No RLS policy bypass exists\.

__•  __The load test confirms the API thread is not blocked: /health responds in < 50ms even under 20 concurrent audit submissions\.

__•  __The GDPR wipe leaves zero orphaned rows in any table and exactly one audit\_logs record\.

__•  __npm audit and pip\-audit return 0 HIGH or CRITICAL severity vulnerabilities\.

__•  __Playwright E2E tests pass in CI without requiring manual intervention\.

__PHASE__

__10__

__Deployment__

*Goal: AnswerRank runs in production on the exact infrastructure locked in the TRD, with monitoring and alerting active before real users arrive\.*

## __Why This Phase Comes Last__

Deploying to production before testing is complete means shipping bugs to real users\. Deploying before polish means shipping a visually inconsistent product\. Deploying before all features are built means deploying a partial product\. Phase 10 is the reward for completing all nine prior phases correctly\.

## __Production Infrastructure Map__

ANSWERRANK PRODUCTION INFRASTRUCTURE

=====================================

 

User Browser

    |

    | HTTPS

    v

Vercel \(Next\.js frontend\)

    |\-\- Edge caching for static shell

    |\-\- Environment: NEXT\_PUBLIC\_API\_URL, NEXT\_PUBLIC\_WS\_URL

    |\-\- Domain: answerrank\.com \(or configured domain\)

    |

    | REST \+ WebSocket

    v

Railway / Render \(FastAPI \+ Celery\)

    |\-\- api container: FastAPI \+ Uvicorn \(4 workers\)

    |\-\- worker\_high container: Celery ingestion queue \(2\-10 replicas, autoscale\)

    |\-\- worker\_low container: Celery scoring queue \(2\-10 replicas, autoscale\)

    |\-\- flower container: Celery monitoring \(internal, auth\-protected\)

    |\-\- Secrets: fetched from AWS Secrets Manager at startup

    |

    |\-\- Supabase \(PostgreSQL 16 \+ Auth \+ Storage\)

    |      Same region as backend

    |

    |\-\- Qdrant Cloud \(vector search\)

    |      Same region as backend

    |

    |\-\- Upstash Redis \(Celery broker \+ cache\)

    |      Serverless, auto\-scales

    |

    |\-\- AWS Secrets Manager

           All API keys: Gemini, OpenAI \(embeddings\), Qdrant

 

Observability:

    |\-\- Sentry \(frontend \+ backend error tracking\)

    |\-\- OpenTelemetry → Grafana Tempo \(distributed tracing\)

    |\-\- Prometheus metrics → Grafana \(dashboards\)

    |\-\- Flower UI \(Celery queue visibility\)

    |\-\- PagerDuty \(alerting\)

## __Task List__

__\#__

__Task__

__Owner__

__Prerequisite__

__1__

Provision the production Supabase project \(separate from the development project used in Phases 1\-9\)\. Run all 11 database migrations on the production project\. Verify every table, index, RLS policy, and function exists in production\.

Backend

Phase 9 complete

__2__

Provision the production Qdrant Cloud cluster \(separate from development\)\. Create the creator\_content\_vectors collection with the identical configuration used in development\. Verify an empty ANN search returns a valid \(empty\) response\.

Backend

Task 1

__3__

Populate AWS Secrets Manager with all production API keys: GEMINI\_API\_KEY \(production key\), QDRANT\_URL \+ QDRANT\_API\_KEY \(production cluster\), SUPABASE\_SERVICE\_ROLE\_KEY \(production project\), WEBHOOK\_SIGNING\_SECRET \(production billing webhook\), SENTRY\_DSN\.

Backend

Tasks 1, 2

__4__

Deploy the backend services to Railway or Render\. Configure each service with its Docker container from the repo\. Set environment variables to point to AWS Secrets Manager \(the containers fetch secrets at startup\)\. Deploy the api, worker\_high, worker\_low, and flower services\.

Backend

Tasks 1\-3

__5__

Deploy the frontend to Vercel\. Connect the GitHub repo\. Set production environment variables: NEXT\_PUBLIC\_SUPABASE\_URL \(production\), NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY \(production\), NEXT\_PUBLIC\_API\_URL \(production backend URL\), NEXTAUTH\_SECRET \(production, randomly generated\)\.

Frontend

Task 4

__6__

Configure custom domains for both frontend and backend\. Ensure SSL certificates are provisioned and HTTPS is enforced on all endpoints \(HTTP → HTTPS redirect\)\. Verify WebSocket connections work over wss:// in production\.

Both

Tasks 4, 5

__7__

Configure Google OAuth for production\. Add the production domain to the Google Cloud Console OAuth 2\.0 authorized redirect URIs\. Update NEXTAUTH\_URL to the production domain\.

Frontend

Tasks 5, 6

__8__

Wire Sentry for both frontend and backend production environments\. Confirm error events are appearing in the Sentry dashboard by deliberately triggering a test error \(e\.g\., an unhandled exception in a non\-critical endpoint\)\.

Both

Tasks 4, 5

__9__

Configure Grafana dashboards: \(a\) Prometheus metrics ingested from /api/v1/metrics endpoint\. \(b\) Key metrics panels: audit throughput \(audits/hour\), scoring latency \(p50, p95, p99\), CMP calculation time, Gemini API calls/day, Celery queue depth\. \(c\) OpenTelemetry traces flowing to Grafana Tempo\.

Backend

Task 4

__10__

Configure PagerDuty alerting rules\. Alerts per the Master Project Documentation Section 16\.3: Celery dead\-letter queue depth > 10 for 5 minutes\. Sentry error rate spike > 50 errors/minute\. Qdrant query latency p95 > 500ms\. WebSocket connection error rate > 1% of connections\.

Backend

Tasks 4, 9

__11__

Complete the GitHub Actions CI/CD pipeline\. Add a deploy job to \.github/workflows/ci\.yml that triggers on merge to main: \(a\) Runs lint \+ type\-check \+ unit tests \+ E2E tests on the PR branch\. \(b\) On green, builds the Docker images and pushes to the container registry\. \(c\) Triggers a Railway/Render deployment\. \(d\) Triggers a Vercel production deployment\. Verify a test merge triggers a clean automatic deploy\.

Both

Tasks 4, 5

__12__

Production smoke test\. Using real accounts \(not test accounts\): \(a\) Register a new creator, submit a real YouTube URL, verify the full audit pipeline completes in production and a real score appears\. \(b\) Register a new brand, run a keyword search, verify real ranked results return in under 500ms\.

Both

Tasks 1\-11

__✓  PHASE COMPLETE — DONE CRITERIA__

__•  __The frontend is reachable at the production domain over HTTPS with a valid SSL certificate\.

__•  __The backend API is reachable over HTTPS\. WebSocket connections work over wss://\.

__•  __A real creator audit submitted in production completes the full pipeline \(ingest → score → Qdrant index\) with a real AR Score displayed in the frontend\.

__•  __A real brand campaign search in production returns ranked creators with real CMP values in under 500ms\.

__•  __No development or test credentials exist anywhere in the production environment \(verified by checking Railway/Render environment variables and AWS Secrets Manager — no dev keys present\)\.

__•  __Sentry shows live events from the production environment\.

__•  __Grafana dashboards show live metrics from the production backend\.

__•  __A merge to main triggers a clean automatic deploy to both Vercel and Railway/Render without manual intervention\.

__•  __PagerDuty alerts are confirmed active via a deliberate test alert \(e\.g\., temporarily spike a metric above threshold\)\.

# __6\. Overall 'Finished' Definition__

AnswerRank V1 is considered finished when all of the following hold simultaneously — not just each phase's individual criteria in isolation\. This checklist is the final sign\-off before a public launch announcement\.

__☐  __Every screen in the App Flow Pages List exists, is reachable through the documented navigation, and renders the final design system from the UI/UX Design Specification\.

__☐  __A Creator can sign up, run an audit, see a real deterministic score with full 7\-factor breakdown, run Fix\-It Copilot, approve the optimization, see their score update, and view their audit history — entirely without developer intervention\.

__☐  __A Brand can sign up, search a campaign keyword, see creators ranked by real Campaign Match Probability, filter by niche and score, inspect a creator's full radar chart and entity heatmap, save a creator to shortlist, and view the shortlist — entirely without developer intervention\.

__☐  __Every table, RLS policy, index, and function from the Backend Schema is live in the production Supabase project and provably enforced against adversarial cross\-tenant reads\.

__☐  __Every non\-functional requirement from the TRD is met in production: deterministic scoring completes in under 200ms, brand search completes in under 500ms, GDPR wipe deletes all data, zero secrets exist in source code\.

__☐  __All 5 core user journeys \(J1–J5\) and all documented error, empty, and loading states have been manually verified in production — not only in development\.

__☐  __Monitoring, distributed tracing, error tracking, and PagerDuty alerting are live in production and have been confirmed to fire correctly at least once\.

__☐  __The GitHub Actions CI/CD pipeline automatically deploys to production on every merge to main, with all tests passing\.

*This document defines build order, task lists, and completion criteria only\. Visual design specifics, exact copy, and detailed component props are intentionally absent — they are defined in the companion UI/UX Design Specification document\. Phase 8 assumes that document is delivered as a separate input and applied at that stage\.*

# __7\. Post\-V1 Technical Debt & V2 Considerations__

The following items are explicitly out of scope for V1 but should be documented for the V2 planning cycle\. They are not failures or shortcuts — they are deliberate decisions to keep V1 buildable within the team's current capacity\.

__Feature__

__V2 Notes__

__Real\-time AI citation monitoring__

V1 scores content structurally\. V2 should monitor whether creator content is actually being cited by ChatGPT/Gemini in real live queries\. Requires a web scraping / API polling layer not in V1 scope\.

__Multi\-language support__

V1 assumes English and Indian\-English content only\. V2 should extend trafilatura extraction and scoring heuristics to Hindi, Spanish, and other major markets\.

__Weight re\-calibration pipeline__

V1 ships with fixed weights \(w1\-w7\)\. V2 should expose a weight calibration job that re\-trains weights against a growing empirical citation dataset automatically\.

__Native iOS/Android apps__

V1 is web\-first\. The creator diagnostic tool has strong mobile use case \(creators often work on phones\)\. V2 native app is a high\-priority consideration\.

__Competitor creator comparison__

V1 shows a creator's absolute score\. V2 should show relative ranking against competitors in the same niche\.

__AI\-generated content brief__

The PRD mentions a '30\-day content brief' for Creator Pro tier\. V1 has the audit history but not the brief generation\. V2 Gemini call generates a structured content calendar based on audit findings\.

__Bulk creator import__

Brands want to upload a CSV of 50 creator handles and get batch audit results\. V2 feature enabled by the existing Celery pipeline\.

__API access for enterprise__

Enterprise brands want to integrate AnswerRank data into their own dashboards via API\. V2 adds a developer API tier with API key management\.

# __Appendix A: Complete Environment Variable Reference__

## __Frontend \(\.env\.local\)__

__Variable__

__Value / Description__

__Notes__

__NEXT\_PUBLIC\_SUPABASE\_URL__

Supabase project URL

Public — safe to expose to client

__NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY__

Supabase anon key

Public — RLS enforces access

__NEXTAUTH\_URL__

Full production URL \(e\.g\. https://answerrank\.com\)

Server\-side only

__NEXTAUTH\_SECRET__

Random 32\+ char string for JWT signing

SECRET — never expose

__NEXT\_PUBLIC\_API\_URL__

Backend API base URL \(e\.g\. https://api\.answerrank\.com\)

Public

__NEXT\_PUBLIC\_WS\_URL__

WebSocket base URL \(wss://api\.answerrank\.com\)

Public

__GOOGLE\_CLIENT\_ID__

Google OAuth 2\.0 client ID

Server\-side only

__GOOGLE\_CLIENT\_SECRET__

Google OAuth 2\.0 client secret

SECRET — never expose

__SENTRY\_DSN__

Sentry project DSN \(frontend\)

Server\-side only

## __Backend \(\.env\)__

__Variable__

__Value / Description__

__Notes__

__SUPABASE\_URL__

Supabase project URL

Same as frontend NEXT\_PUBLIC\_SUPABASE\_URL

__SUPABASE\_SERVICE\_ROLE\_KEY__

Supabase service role key \(bypasses RLS\)

SECRET — backend only, NEVER expose to frontend

__DATABASE\_URL__

PostgreSQL connection string

SECRET

__QDRANT\_URL__

Qdrant Cloud cluster URL

SECRET

__QDRANT\_API\_KEY__

Qdrant API key

SECRET

__REDIS\_URL__

Upstash Redis connection string

SECRET

__GEMINI\_API\_KEY__

Google Gemini API key

SECRET — fetched from AWS Secrets Manager

__AWS\_SECRETS\_MANAGER\_REGION__

AWS region \(e\.g\. ap\-south\-1\)

Server\-side only

__WEBHOOK\_SIGNING\_SECRET__

HMAC\-SHA256 secret for billing webhook verification

SECRET

__SENTRY\_DSN__

Sentry project DSN \(backend\)

Server\-side only

__ENVIRONMENT__

production | staging | development

Controls logging level and Sentry sampling

__FLOWER\_BASIC\_AUTH__

username:password for Flower UI

SECRET — internal only

# __Appendix B: Key Commands Reference__

__Command__

__Purpose__

__npm run dev__

Start Next\.js frontend dev server \(http://localhost:3000\)

__npm run build__

Production build — exits non\-zero if TypeScript errors exist

__npm run lint__

Run ESLint on all \.ts/\.tsx files

__tsc \-\-noEmit__

Type\-check without outputting files

__npx playwright test__

Run Playwright E2E tests

__uvicorn app\.main:app \-\-reload__

Start FastAPI dev server \(http://localhost:8000\)

__celery \-A app\.workers\.celery\_app worker \-Q high \-\-loglevel=info__

Start high\-priority Celery worker \(ingestion\)

__celery \-A app\.workers\.celery\_app worker \-Q low \-\-loglevel=info__

Start low\-priority Celery worker \(scoring\)

__celery \-A app\.workers\.celery\_app flower__

Start Flower monitoring UI \(http://localhost:5555\)

__pytest tests/unit/ \-v__

Run all backend unit tests

__python \-m app\.db\.seed__

Run the database seed script

__docker\-compose up \-\-build__

Start all services \(api, workers, flower\)

__black \. && ruff check \. \-\-fix__

Format and lint Python code

*— End of AnswerRank Implementation Plan v1\.0 —*

