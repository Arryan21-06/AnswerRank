__ANSWERRANK__

__AI\-Native Influencer Discovery & Campaign Management Platform__

*Backend Schema — Data Model & Auth Architecture*

*How the data is stored, structured, and secured — defined before a single migration is written*

__Team__

One Wish Willow

__Engineers__

Aryan Chaurasia | Harshit Agrawal

__Date__

June 2026

__Version__

v1\.0 — Implementation Ready

__Companion Docs__

AnswerRank Master Project Documentation; TRD; App Flow

__Database Engine__

PostgreSQL 16 via Supabase, paired with Qdrant Cloud for vectors

*Migration discipline: every table below is designed to be additive\-friendly\. New optional columns can be appended without breaking existing rows; nothing here should require a destructive migration once seeded with real data\. Treat this document as the source of truth before writing any migration file\.*

# __Table of Contents__

# __Why This Document Matters__

The backend schema is the hardest document to change after the fact\. Once AnswerRank has live creator audits, brand campaign queries, and billing records in production, restructuring tables means writing data\-preserving migrations under pressure\. This document defines every table, column, type, and security rule upfront — so the build agent writes correct migrations and API routes the first time, and so no security gap \(a Brand reading another Brand's saved creators, a Creator seeing another Creator's audit history\) ends up shipped by accident\.

# __1\. Entity Relationship Overview__

AnswerRank's relational schema lives in PostgreSQL \(Supabase\)\. High\-dimensional content vectors live separately in Qdrant Cloud, referenced from Postgres by ID only — Qdrant is never the source of truth for relational facts \(ownership, billing, audit status\)\.

users
  |\-\-1:1\-\-> creator\_profiles        \(if role = creator\)
  |\-\-1:1\-\-> brand\_profiles          \(if role = brand\)
  |\-\-1:N\-\-> audits                  \(creator's own audits\)
  |\-\-1:N\-\-> campaign\_queries        \(brand's own searches\)
  |\-\-1:N\-\-> saved\_creators          \(brand's shortlist entries\)
  |\-\-1:N\-\-> dpo\_events \.\.\.\.\.\.\.\.\.\.\.\.\. \(not used in V1; reserved\)
  |\-\-1:N\-\-> subscriptions
  |\-\-1:N\-\-> audit\_logs              \(admin/compliance trail\)

audits
  |\-\-1:1\-\-> content\_normalized      \(extracted \+ cleaned text\)
  |\-\-1:1\-\-> score\_records           \(the 7 factor sub\-scores\)
  |\-\-1:N\-\-> optimization\_events     \(Gemini Fix\-It runs\)

creator\_profiles
  |\-\-1:N\-\-> audits
  \`\-\-\(referenced by\)\-\- campaign\_match\_cache  \(brand search results, ephemeral\)

brand\_profiles
  |\-\-1:N\-\-> campaign\_queries
  |\-\-1:N\-\-> saved\_creators \-\-> creator\_profiles\.id

subscriptions
  \`\-\-1:1\-\-  users  \(billing tier \+ Gemini credit allocation\)

# __2\. Database Tables__

All tables use uuid primary keys generated via gen\_random\_uuid\(\)\. All timestamps are timestamptz \(UTC\)\. All tables include created\_at; tables subject to updates also include updated\_at, maintained via a trigger\.

__TABLE  users__*   —  One row per authenticated person\. Supabase Auth owns the auth\.users table; this is the public\-schema profile row linked 1:1 to it\.*

__Column__

__Type__

__Constraints__

__Description__

__id__

uuid

PK, = auth\.users\.id

Matches the Supabase Auth user ID exactly \(no separate identity\)

__email__

text

NOT NULL, UNIQUE

Primary contact email, sourced from the auth provider

__full\_name__

text

NULL

Display name; optional at signup

__role__

text

NOT NULL, CHECK IN \('creator','brand','admin'\)

Set once at signup; determines which profile table applies

__avatar\_url__

text

NULL

Public URL to profile image in Supabase Storage

__onboarding\_completed__

boolean

NOT NULL, DEFAULT false

Gates redirect logic per the App Flow onboarding sequence

__created\_at__

timestamptz

NOT NULL, DEFAULT now\(\)

Account creation timestamp

__updated\_at__

timestamptz

NOT NULL, DEFAULT now\(\)

Last profile update

__TABLE  creator\_profiles__*   —  Creator\-specific profile data\. One row per user where users\.role = 'creator'\.*

__Column__

__Type__

__Constraints__

__Description__

__id__

uuid

PK, DEFAULT gen\_random\_uuid\(\)

Internal profile ID, distinct from users\.id for join clarity

__user\_id__

uuid

FK → users\.id, UNIQUE, NOT NULL

One\-to\-one link to the owning user

__primary\_niche__

text

NOT NULL

e\.g\. Skincare, Ayurveda, Finance, Fitness — set during onboarding

__handle__

text

NULL

Primary platform handle \(YouTube channel or blog domain\)

__platform__

text

NULL, CHECK IN \('youtube','blog','instagram'\)

Primary content platform

__follower\_count__

integer

NULL, DEFAULT 0

Self\-reported or scraped reach metric; never used in scoring

__current\_answer\_rank\_score__

numeric\(5,2\)

NULL

Most recent composite score \(0–100\); denormalized for fast dashboard reads

__verified__

boolean

NOT NULL, DEFAULT false

True once at least one audit has completed successfully

__created\_at__

timestamptz

NOT NULL, DEFAULT now\(\)

__updated\_at__

timestamptz

NOT NULL, DEFAULT now\(\)

__TABLE  brand\_profiles__*   —  Brand\-specific profile data\. One row per user where users\.role = 'brand'\.*

__Column__

__Type__

__Constraints__

__Description__

__id__

uuid

PK, DEFAULT gen\_random\_uuid\(\)

Internal profile ID

__user\_id__

uuid

FK → users\.id, UNIQUE, NOT NULL

One\-to\-one link to the owning user

__company\_name__

text

NOT NULL

Set during onboarding

__industry__

text

NULL

Free\-text or controlled vocabulary, e\.g\. Skincare, FMCG

__seats\_used__

integer

NOT NULL, DEFAULT 1

For future multi\-seat Enterprise accounts \(not active in V1 UI\)

__created\_at__

timestamptz

NOT NULL, DEFAULT now\(\)

__updated\_at__

timestamptz

NOT NULL, DEFAULT now\(\)

__TABLE  audits__*   —  One row per creator content audit \(a single URL submission and its lifecycle\)\.*

__Column__

__Type__

__Constraints__

__Description__

__id__

uuid

PK, DEFAULT gen\_random\_uuid\(\)

= the auditId used in /creator/audit/\[auditId\] and the WebSocket channel

__creator\_id__

uuid

FK → creator\_profiles\.id, NOT NULL

Owning creator

__source\_url__

text

NOT NULL

The submitted YouTube or blog URL

__platform__

text

NOT NULL, CHECK IN \('youtube','blog'\)

Determines extraction path \(trafilatura vs\. Transcript API\)

__status__

text

NOT NULL, DEFAULT 'queued', CHECK IN \('queued','ingesting','scoring','indexing','complete','failed'\)

Drives the WebSocket progress states from the App Flow

__failure\_reason__

text

NULL

Populated only when status = 'failed' \(e\.g\. 'private\_video', 'extraction\_error'\)

__composite\_score__

numeric\(5,2\)

NULL

Final AR score \(0–100\); null until status = 'complete'

__word\_count__

integer

NULL

Extracted content length, populated after ingestion

__vector\_id__

text

NULL

Qdrant point ID for this audit's content embedding

__created\_at__

timestamptz

NOT NULL, DEFAULT now\(\)

__completed\_at__

timestamptz

NULL

Set when status transitions to 'complete'

__TABLE  content\_normalized__*   —  The cleaned, structure\-preserved text extracted from a single audit's source URL\.*

__Column__

__Type__

__Constraints__

__Description__

__id__

uuid

PK, DEFAULT gen\_random\_uuid\(\)

__audit\_id__

uuid

FK → audits\.id, UNIQUE, NOT NULL

One\-to\-one with the parent audit

__raw\_text__

text

NOT NULL

Full extracted, normalized text \(trafilatura / transcript output\)

__storage\_uri__

text

NULL

Supabase Storage object key if content exceeds inline storage threshold

__language__

text

NOT NULL, DEFAULT 'en'

V1 assumes English; reserved for future multi\-language support

__created\_at__

timestamptz

NOT NULL, DEFAULT now\(\)

__TABLE  score\_records__*   —  The seven deterministic factor sub\-scores \(D1–D7\) behind a single audit's composite score\.*

__Column__

__Type__

__Constraints__

__Description__

__id__

uuid

PK, DEFAULT gen\_random\_uuid\(\)

__audit\_id__

uuid

FK → audits\.id, UNIQUE, NOT NULL

One\-to\-one with the parent audit

__direct\_answer\_density__

numeric\(4,3\)

NOT NULL

D1, range 0\.000–1\.000

__entity\_clarity__

numeric\(4,3\)

NOT NULL

D2, range 0\.000–1\.000

__faq\_coverage__

numeric\(4,3\)

NOT NULL

D3, range 0\.000–1\.000

__structured\_data__

numeric\(4,3\)

NOT NULL

D4, range 0\.000–1\.000

__formatting\_quality__

numeric\(4,3\)

NOT NULL

D5, range 0\.000–1\.000

__freshness__

numeric\(4,3\)

NOT NULL

D6, range 0\.000–1\.000

__content\_depth__

numeric\(4,3\)

NOT NULL

D7, range 0\.000–1\.000

__weights\_version__

text

NOT NULL, DEFAULT 'v1'

Tracks which weight calibration produced this score, for future re\-scoring audits

__created\_at__

timestamptz

NOT NULL, DEFAULT now\(\)

__TABLE  optimization\_events__*   —  One row per Gemini Fix\-It Copilot run against an audit\.*

__Column__

__Type__

__Constraints__

__Description__

__id__

uuid

PK, DEFAULT gen\_random\_uuid\(\)

__audit\_id__

uuid

FK → audits\.id, NOT NULL

An audit may have multiple optimization attempts

__creator\_id__

uuid

FK → creator\_profiles\.id, NOT NULL

Denormalized for fast credit\-usage lookups

__status__

text

NOT NULL, DEFAULT 'pending', CHECK IN \('pending','complete','failed'\)

__original\_excerpt__

text

NULL

Short excerpt for diff display \(not the full original — that's in content\_normalized\)

__optimized\_text__

text

NULL

Gemini's rewritten output, populated on success

__projected\_score__

numeric\(5,2\)

NULL

Rescored value after rewrite

__accepted__

boolean

NOT NULL, DEFAULT false

True once the creator approves the diff and the audit's composite\_score is updated

__gemini\_tokens\_used__

integer

NULL

For cost tracking and credit metering

__created\_at__

timestamptz

NOT NULL, DEFAULT now\(\)

__TABLE  campaign\_queries__*   —  One row per Brand campaign search submission\.*

__Column__

__Type__

__Constraints__

__Description__

__id__

uuid

PK, DEFAULT gen\_random\_uuid\(\)

__brand\_id__

uuid

FK → brand\_profiles\.id, NOT NULL

Owning brand account

__query\_text__

text

NOT NULL

Raw keyword input, e\.g\. 'Skincare, Vitamin C Serum, Oily Skin'

__niche\_filter__

text

NULL

Optional filter applied at search time

__min\_score\_filter__

numeric\(5,2\)

NULL

Optional minimum AnswerRank Score filter applied at search time

__result\_count__

integer

NULL

Number of creators returned, for analytics

__created\_at__

timestamptz

NOT NULL, DEFAULT now\(\)

__TABLE  saved\_creators__*   —  A Brand's shortlist — join table between brand\_profiles and creator\_profiles\.*

__Column__

__Type__

__Constraints__

__Description__

__id__

uuid

PK, DEFAULT gen\_random\_uuid\(\)

__brand\_id__

uuid

FK → brand\_profiles\.id, NOT NULL

__creator\_id__

uuid

FK → creator\_profiles\.id, NOT NULL

__campaign\_query\_id__

uuid

FK → campaign\_queries\.id, NULL

Which search this save originated from, if any

__note__

text

NULL

Optional free\-text note the brand attaches

__created\_at__

timestamptz

NOT NULL, DEFAULT now\(\)

UNIQUE \(brand\_id, creator\_id\)

A brand cannot save the same creator twice

__TABLE  subscriptions__*   —  Billing tier and usage allocation per user\.*

__Column__

__Type__

__Constraints__

__Description__

__id__

uuid

PK, DEFAULT gen\_random\_uuid\(\)

__user\_id__

uuid

FK → users\.id, UNIQUE, NOT NULL

One active subscription row per user

__tier__

text

NOT NULL, DEFAULT 'free', CHECK IN \('creator\_free','creator\_pro','brand\_trial','brand\_enterprise'\)

Determines feature gating across the App Flow

__audits\_used\_this\_period__

integer

NOT NULL, DEFAULT 0

Resets monthly; enforces the 3\-audit free\-tier limit

__gemini\_credits\_remaining__

integer

NOT NULL, DEFAULT 1

Metered Fix\-It Copilot usage

__billing\_provider\_customer\_id__

text

NULL

External payment provider reference; no card data stored here

__current\_period\_end__

timestamptz

NULL

Renewal / reset date

__created\_at__

timestamptz

NOT NULL, DEFAULT now\(\)

__updated\_at__

timestamptz

NOT NULL, DEFAULT now\(\)

__TABLE  audit\_logs__*   —  Compliance and admin trail — every sensitive or destructive action is recorded here\.*

__Column__

__Type__

__Constraints__

__Description__

__id__

uuid

PK, DEFAULT gen\_random\_uuid\(\)

__actor\_user\_id__

uuid

FK → users\.id, NULL

Who performed the action; null for system\-initiated events

__action__

text

NOT NULL

e\.g\. 'gdpr\_wipe', 'tier\_upgrade', 'admin\_override'

__target\_table__

text

NULL

Which table was affected

__target\_id__

uuid

NULL

Which row was affected

__metadata__

jsonb

NULL

Structured detail of the action

__created\_at__

timestamptz

NOT NULL, DEFAULT now\(\)

# __3\. Relationships__

__Foreign Key__

__References__

__Cardinality__

__creator\_profiles\.user\_id__

users\.id

one\-to\-one

__brand\_profiles\.user\_id__

users\.id

one\-to\-one

__audits\.creator\_id__

creator\_profiles\.id

many\-to\-one

__content\_normalized\.audit\_id__

audits\.id

one\-to\-one

__score\_records\.audit\_id__

audits\.id

one\-to\-one

__optimization\_events\.audit\_id__

audits\.id

many\-to\-one

__optimization\_events\.creator\_id__

creator\_profiles\.id

many\-to\-one

__campaign\_queries\.brand\_id__

brand\_profiles\.id

many\-to\-one

__saved\_creators\.brand\_id__

brand\_profiles\.id

many\-to\-one

__saved\_creators\.creator\_id__

creator\_profiles\.id

many\-to\-one

__saved\_creators\.campaign\_query\_id__

campaign\_queries\.id

many\-to\-one, nullable

__subscriptions\.user\_id__

users\.id

one\-to\-one

__audit\_logs\.actor\_user\_id__

users\.id

many\-to\-one, nullable

# __4\. Indexes__

Indexes are scoped to the access patterns defined in the App Flow — every dashboard list view, search filter, and lookup\-by\-foreign\-key listed below has a backing index\.

__Table__

__Indexed Column\(s\)__

__Why__

__audits__

creator\_id, created\_at DESC

Powers /creator/history — list a creator's own audits, newest first

__audits__

status

Partial index WHERE status NOT IN \('complete','failed'\) — used by background workers polling for active jobs

__score\_records__

audit\_id

Implicit via UNIQUE constraint; fast one\-to\-one lookup from an audit

__campaign\_queries__

brand\_id, created\_at DESC

Powers a brand's recent\-search history

__saved\_creators__

brand\_id

Powers the Saved Creators list screen

__saved\_creators__

\(brand\_id, creator\_id\)

UNIQUE composite index — enforces no duplicate saves and speeds existence checks

__creator\_profiles__

primary\_niche

Supports brand\-side filtering by niche category

__creator\_profiles__

current\_answer\_rank\_score

Supports minimum\-score filtering in Campaign Studio

__subscriptions__

user\_id

UNIQUE; fast tier lookup on every gated action

__users__

email

UNIQUE; required for auth lookups

*Vector search note: creator content embeddings are NOT indexed via a Postgres index\. They live in Qdrant's own HNSW index, addressed by the vector\_id stored on each audits row\. Postgres never performs the similarity search itself\.*

# __5\. Auth Model__

## __5\.1 Auth Provider__

Supabase Auth issues JWTs on successful Google OAuth or Magic Link sign\-in, exactly as locked in the TRD\. The JWT's sub claim equals users\.id, and every Row Level Security policy below keys off auth\.uid\(\) reading that claim directly — there is no separate session table to keep in sync\.

## __5\.2 Row Level Security \(RLS\) Rules__

RLS is enabled on every table below\. The default\-deny posture applies: a table with RLS enabled and no matching policy denies all access, so every table must have an explicit policy or it is unreachable by design\.

__Table__

__Policy__

__users__

Users can read and update their own row only \(auth\.uid\(\) = id\)\. No user can read another user's row directly\.

__creator\_profiles__

Creators can read and update their own profile \(auth\.uid\(\) = user\_id\)\. Brands can read creator\_profiles rows only via the campaign search RPC function \(see 5\.3\), never via a direct table query — this keeps follower\_count and internal fields out of the Brand\-facing API surface unless explicitly exposed\.

__brand\_profiles__

Brands can read and update their own profile only \(auth\.uid\(\) = user\_id\)\. No other role can read brand\_profiles\.

__audits__

Creators can read and write only their own audits \(auth\.uid\(\) maps to the owning creator\_profiles\.user\_id\)\. Brands have no direct access to this table\.

__content\_normalized__

Same ownership chain as audits — accessible only to the owning creator\. This table is never exposed to Brands, even indirectly, since it may contain unpublished draft content\.

__score\_records__

Readable by the owning creator \(via the audits ownership chain\) AND by any authenticated brand, since published scores are what Brands search on\. Not writable by either role directly — only the scoring service \(service\-role key\) writes here\.

__optimization\_events__

Creators can read and write only their own optimization events, scoped through the owning audit\.

__campaign\_queries__

Brands can read and write only their own queries \(auth\.uid\(\) maps to the owning brand\_profiles\.user\_id\)\.

__saved\_creators__

Brands can read, insert, and delete only their own saved\-creator rows\.

__subscriptions__

Users can read their own subscription row\. Only the service\-role key \(backend, never the client\) can write to this table, since it governs billing and tier enforcement\.

__audit\_logs__

No client\-side read or write access at all\. Readable only by ADMIN role through a dedicated, audited backend route — never queried directly from the frontend Supabase client\.

## __5\.3 Cross\-Role Data Access — the Campaign Search Exception__

The one deliberate exception to strict row ownership is Brand\-side creator discovery: a Brand must be able to see scores and profile summaries for creators they do not own and have no direct relationship with\. This is implemented as a Postgres function \(SECURITY DEFINER\), not a relaxed RLS policy on creator\_profiles itself:

create function search\_creators\(
  p\_niche text, p\_min\_score numeric
\) returns setof creator\_profiles
language sql security definer as $$
  select \* from creator\_profiles
  where primary\_niche = p\_niche
    and current\_answer\_rank\_score >= p\_min\_score
    and verified = true;
$$;

\-\- Granted to the 'authenticated' role generally;
\-\- the function itself enforces which COLUMNS are
\-\- returned \(a view\-like projection\), keeping
\-\- non\-public fields out of the result set\.

This keeps the underlying RLS policy on creator\_profiles strict \(owner\-only direct access\) while still allowing the one legitimate, intentional cross\-role read path the product requires — and keeps that path auditable and limited to a single function rather than a broad policy exception\.

# __6\. User Roles & Permissions__

__Role__

__Permissions__

__creator__

Submit and view own audits; run Fix\-It Copilot \(metered\); view own score history; manage own profile and subscription\. No access to any brand\_profiles, campaign\_queries, or saved\_creators data\.

__brand__

Search and view published creator scores \(via search\_creators\); save/unsave creators to own shortlist; view own campaign query history; manage own profile and subscription\. No access to creator\_profiles internal fields, audits, content\_normalized, or optimization\_events\.

__brand\_enterprise__

All brand permissions, plus access to Share of Voice analytics and bulk export\. This is a subscriptions\.tier value, not a separate users\.role — the role stays 'brand'; tier gates the extra features at the API layer\.

__admin__

Read access to audit\_logs; can trigger GDPR wipes; can override subscription tiers for support purposes\. Cannot read creator content\_normalized or optimization\_events directly without an explicit, logged support action — even admin access to sensitive creator content is exceptional, not routine\.

# __7\. Sensitive Fields & Encryption__

__Field__

__Sensitivity__

__Handling__

__users\.email__

PII

Protected by RLS \(owner\-only read\), not field\-level encrypted\. Supabase enforces TLS in transit and encryption at rest at the infrastructure level\.

__content\_normalized\.raw\_text__

Creator's unpublished/draft content

Not encrypted at the field level, but access\-restricted to the owning creator only via RLS; never exposed to Brands or other Creators under any policy\.

__billing\_provider\_customer\_id__

Payment system reference

Stores only an opaque external customer reference ID\. No card numbers, CVVs, or bank details are ever stored in AnswerRank's database — all payment instrument data lives with the payment provider, consistent with PCI\-DSS scope reduction\.

__audit\_logs\.metadata__

Mixed — may reference other sensitive rows

Table itself has no client access at all \(see 5\.2\); treated as sensitive by default regardless of contents\.

__gemini\_tokens\_used / cost fields__

Internal cost data

Not exposed to Creators or Brands in any API response; used internally for tier\-credit enforcement only\.

*No field in this schema stores a password, card number, or government ID\. Authentication is fully delegated to Supabase Auth \(OAuth/Magic Link\); payment instruments are fully delegated to the billing provider\. This is a deliberate scope\-reduction decision, not an oversight\.*

# __8\. File & Media Storage Structure__

All file storage uses Supabase Storage, organized by owner ID to keep storage\-bucket access rules aligned with the same ownership model as the database RLS policies\.

__Path Pattern__

__Access Rule__

__Contents__

__avatars/\{user\_id\}/profile\.\{ext\}__

Public read

User\-uploaded profile image; one file per user, overwritten on re\-upload

__creator\-content/\{creator\_id\}/\{audit\_id\}/raw\.txt__

Private — owning creator only

Backup of extracted raw text if it exceeds the inline content\_normalized storage threshold\. 90\-day lifecycle purge, matching the TRD's retention rule\.

__exports/\{brand\_id\}/\{export\_id\}\.csv__

Private — owning brand only, signed URL, 24h expiry

Generated shortlist/SOV export files; not retained long\-term

# __9\. Webhooks & Event Triggers__

__Trigger Event__

__Action__

__Notes__

__audits\.status changes to 'complete'__

Postgres trigger → emits a WebSocket event via the backend's existing /ws/audit/\{audit\_id\} channel

Drives the live progress UI described in the App Flow

__audits row inserted with status='complete' and creator\_profiles\.current\_answer\_rank\_score is stale__

Trigger updates creator\_profiles\.current\_answer\_rank\_score to the new value

Keeps the denormalized dashboard field in sync without a separate read\-time join

__billing\_provider webhook \(payment succeeded\)__

Inbound webhook → FastAPI endpoint → updates subscriptions\.tier and current\_period\_end

HMAC\-signature verified before any write, per the TRD's webhook security rule

__billing\_provider webhook \(payment failed\)__

Inbound webhook → FastAPI endpoint → no tier downgrade on first failure; flags subscriptions row for retry per provider's dunning schedule

Matches the App Flow's failed\-payment behavior \(no forced navigation, inline retry\)

__GDPR wipe requested \(DELETE /api/v1/gdpr/wipe/\{creator\_id\}\)__

Cascades: deletes audits, content\_normalized, score\_records, optimization\_events rows; deletes the Qdrant vector by stored vector\_id; deletes Supabase Storage objects under creator\-content/\{creator\_id\}/

A single row is written to audit\_logs recording the wipe before deletion completes, per the TRD's compliance retention rule

All foreign\-key relationships involving audits, content\_normalized, score\_records, and optimization\_events use ON DELETE CASCADE from their parent so that creator\-initiated account deletion and admin\-initiated GDPR wipes both resolve cleanly without orphaned rows\.

# __10\. API Endpoint List__

Cross\-referenced against the TRD's locked endpoint set, mapped here to the specific tables each route touches\.

__Method__

__Endpoint__

__Tables Touched__

__POST__

/api/v1/audit

audits \(insert\), content\_normalized \(insert, async\)

__GET__

/api/v1/audit/\{audit\_id\}

audits, score\_records \(read, RLS\-scoped to owning creator\)

__WS__

/ws/audit/\{audit\_id\}

audits\.status \(subscribes to trigger\-driven events\)

__POST__

/api/v1/campaign/search

campaign\_queries \(insert\), search\_creators\(\) function call

__GET__

/api/v1/creator/\{creator\_id\}

creator\_profiles, score\_records \(read, via search\_creators\-style projection for Brands; full read for the owning Creator\)

__POST__

/api/v1/optimize

optimization\_events \(insert/update\), subscriptions\.gemini\_credits\_remaining \(decrement\)

__POST__

/api/v1/saved\-creators

saved\_creators \(insert\)

__DELETE__

/api/v1/saved\-creators/\{id\}

saved\_creators \(delete, RLS\-scoped to owning brand\)

__GET__

/api/v1/sov/\{keyword\}

score\_records, creator\_profiles \(aggregate read, brand\_enterprise tier only\)

__DELETE__

/api/v1/gdpr/wipe/\{creator\_id\}

Cascading delete per Section 9; writes one audit\_logs row

__GET__

/api/v1/audit/export

audit\_logs \(admin\-only read\)

