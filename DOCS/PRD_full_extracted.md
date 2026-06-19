ANSWERRANK

AI\-Native Influencer Discovery & Campaign Management Platform

Master Project Documentation

Product Requirements  •  Frontend Architecture  •  Backend & System Architecture  •  DevOps & Security

Design Philosophy

AnswerRank is built on one principle: brands should never spend another rupee sponsoring a creator whose content is invisible to AI search engines\. Every score our engine produces is deterministic, explainable, and hallucination\-proof — derived from hard heuristics and semantic matching, never from an opinionated LLM judge\.

# Table of Contents

Part I: Product Requirements Document \(PRD\)

# 1\. Overview & Problem Statement

## 1\.1 Product Summary

AnswerRank is a B2B campaign intelligence platform that replaces vanity\-metric influencer selection with a mathematically rigorous AI Visibility Score\. It evaluates creators not on Instagram followers or TikTok views, but on their deterministic likelihood of being extracted, understood, and cited by Large Language Models \(LLMs\) such as ChatGPT, Gemini, and Perplexity\.

The platform operates as a dual\-sided marketplace\. Side A \(Supply\) offers creators a free Generative Engine Optimization \(GEO\) diagnostic tool, which naturally populates the brand\-facing database\. Side B \(Demand\) provides marketing agencies and consumer brands with a Campaign Studio to search, filter, and score creators by their AnswerRank Match Score before a single contract is signed\.

## 1\.2 The Problem: The ₹2 Crore Blindspot

Consumer purchase decisions have structurally shifted\. High\-intent buyers no longer scroll ten blue links — they query ChatGPT or Gemini directly \(e\.g\., “What is the best Vitamin C serum for oily skin?”\) and accept one of the two or three AI\-cited sources as authoritative\. This transition, from the Click Era to the Answer Era, has invalidated the foundational metric of influencer marketing: reach\.

The current consequence is severe:

A brand spends ₹2 Crore sponsoring a creator with 2 million followers based on engagement metrics\.

The campaign launches; traditional metrics \(views, likes, click\-through rate\) report success\.

A high\-intent buyer never opens Instagram\. They query ChatGPT and receive a recommendation citing two entirely different creators whose content was structured for AI extraction\.

The ₹2 Crore investment generated zero AI citations\. ROI is unmeasurable and effectively zero for the highest\-intent consumer segment\.

Existing tools \(Surfer SEO, Clearscope\) were architected for Google’s crawler and keyword density\. They have no concept of AI citation probability\. AnswerRank is the first platform to measure it\.

## 1\.3 The Solution

AnswerRank attacks the AI\-citation blindspot through two architectural innovations:

A Deterministic Scoring Engine — a custom Python heuristics algorithm that scores creator content across seven structural dimensions \(Direct Answer Density, Entity Clarity, FAQ Coverage, Structured Data, Formatting, Freshness, Authority\)\. No LLM is used in the scoring loop, making results millisecond\-fast and hallucination\-proof\.

A Semantic Campaign Matching Engine — using SentenceTransformers vector embeddings and cosine similarity to mathematically match brand campaign keywords against a verified creator database, yielding a Campaign Match Probability \(CMP\) score\.

## 1\.4 Goals

Provide brands with a deterministic, auditable AI Visibility Score for any creator URL within 2 seconds of submission\.

Give marketing agencies a Campaign Studio to rank creators by their probability of generating AI citations for a given keyword cluster, not by follower count\.

Use the free creator diagnostic tool as a supply\-side “Trojan Horse” to build a verified, structured creator database at zero marginal acquisition cost\.

Keep the core scoring infrastructure cost\-efficient: scoring must complete in under 200ms with no LLM calls, making the product commercially viable at enterprise scale\.

Generate a recurring B2B revenue stream via a ₹15,000/month Enterprise SaaS tier while using the creator free tier as a viral growth funnel\.

## 1\.5 Non\-Goals \(V1\)

AnswerRank does not negotiate or execute influencer contracts on behalf of brands\.

AnswerRank does not manage campaign creative assets, deliverable timelines, or payment escrow\.

AnswerRank does not provide real\-time monitoring of live AI query results \(post\-MVP consideration\)\.

Multi\-language creator content analysis \(V1 assumes English\-language and primary Indian\-English content\)\.

Native iOS/Android mobile applications \(V1 is web\-first, responsive desktop\-primary\)\.

# 2\. Target Users & Use Cases

## 2\.1 Primary Persona: The Brand Marketing Manager

A senior marketing professional at a D2C consumer brand \(e\.g\., Mamaearth, Sugar Cosmetics\) or a media buying agency managing influencer budgets of ₹50 Lakh to ₹5 Crore annually\. They are under pressure to demonstrate ROI in a world where their C\-suite is asking why ChatGPT never mentions their brand\. They need a defensible, data\-backed methodology for creator selection that goes beyond follower counts and past engagement rates\.

Their core need: a platform that tells them, before signing a contract, whether Creator A’s content will surface in AI\-powered product searches for their campaign keyword\.

## 2\.2 Secondary Persona: The Creator

A YouTube, blog, or Instagram creator in a niche category \(Skincare, Ayurveda, Finance, Fitness\) with 10K–2M followers\. They are aware that traditional SEO is declining but have no tool to understand why their content is being ignored by AI assistants\. They use the free AnswerRank diagnostic to understand their AI Visibility Score and use the Generative “Fix\-It” Copilot to optimize their scripts and posts\.

## 2\.3 Core Use Case Walkthrough

The following describes a Brand Marketing Manager vetting creators for a “Skincare / Vitamin C Serum” campaign:

The brand logs into the AnswerRank Campaign Studio and enters the campaign keyword cluster: “Skincare, Vitamin C Serum, Oily Skin, SPF\.”

AnswerRank’s Semantic Search Engine embeds the keyword cluster into a campaign vector and queries the creator database using cosine similarity\.

The Brand Dashboard surfaces Creator A \(@glow\.with\.me, 50K followers\) with an AnswerRank Score of 91/100 and a Campaign Match Probability of 85%\.

Creator B \(@skinqueen, 1\.5M followers\) surfaces with an AnswerRank Score of 28/100 and a Campaign Match Probability of 12% — despite triple the followers\.

The brand inspects the AnswerRank Score breakdown for Creator A: high Direct Answer Density, complete FAQ sections, strong Entity definitions\. Creator B’s content lacks all three\.

The brand selects Creator A, confident that the sponsored content will have structural properties enabling AI citation\. They export the creator profile and proceed to contract negotiation\.

# 3\. Functional Requirements

The platform is a Dual\-Sided system\. The functional architecture separates Creator\-facing features \(supply\) from Brand\-facing features \(demand / monetization\)\.

## 3\.1 Side A: The Creator GEO Diagnostic \(Supply Engine\)

### 3\.1\.1 URL Ingestion

System must accept YouTube video URLs \(transcript extraction via YouTube Transcript API\) and blog/article URLs \(content extraction via trafilatura\)\.

System must return a structured AI Visibility Score within 2 seconds of URL submission\.

System must store the extracted, structured content in the creator database \(Supabase PostgreSQL\) and the content vector in Qdrant for brand search\.

### 3\.1\.2 Deterministic Heuristics Engine

The scoring engine evaluates seven structural dimensions\. No LLM call is made at this stage — the engine is a custom Python algorithm only:

### 3\.1\.3 Generative Fix\-It Copilot

System must surface itemized diagnosis \(e\.g\., “Missing FAQ section, Weak entity definitions”\) alongside the score\.

On creator opt\-in, the Gemini API must rewrite the content to inject missing structural elements \(FAQs, entity definitions, header hierarchy\) while preserving the creator’s voice and original intent\.

System must rescore the optimized content and display a before/after score delta \(e\.g\., 58 → 84\)\.

The Gemini API is called ONLY at this stage — never during core scoring\.

## 3\.2 Side B: The Brand Campaign Studio \(Demand / Monetization\)

### 3\.2\.1 Semantic Campaign Search

Brands must be able to search by natural language campaign keywords \(e\.g\., “Organic Skincare”\)\.

System must embed the keyword query using SentenceTransformers and execute cosine similarity matching against the creator vector store in Qdrant\.

Results must be ranked by AnswerRank Match Score, not follower count\.

### 3\.2\.2 Campaign Match Prediction

For each creator result, the system must display the Campaign Match Probability \(CMP\) — a scaled cosine similarity score indicating the probability that the creator’s content will trigger an AI citation for the brand’s campaign keywords\.

The dashboard must surface the primary reason for the CMP score \(e\.g\., “Entity overlap: Vitamin C Serum appears 7x with clear clinical context”\)\.

### 3\.2\.3 Share of Voice \(SOV\) Analytics

Enterprise tier must provide Share of Voice analytics: for a given keyword cluster, which creators in the database collectively dominate AI citations vs\. competitors\.

SOV must be visualized as a proportional chart across the top 10 creators by combined CMP for the keyword\.

# 4\. Non\-Functional Requirements

# 5\. Success Metrics

Part II: Frontend Architecture & Component Specification

# 6\. Design System & Visual Language

## 6\.1 Design Philosophy: Dark\-Mode, Data\-Dense, Telemetry\-First

AnswerRank’s interface is inspired by Bloomberg Terminal and Vercel Dashboard aesthetics: a dark\-first, data\-dense approach where information density is the design principle\. Every visual element earns its place by surfacing a meaningful signal\. The product must communicate authority and precision to marketing professionals accustomed to enterprise SaaS dashboards\.

## 6\.2 Core Design Principles

Dark\-first\. Default color scheme: \#0D1B2A base, \#112240 surface, \#1A2F4A elevated\. No light mode in V1\. Reduces eye strain for long\-session power users\.

Neon accent system\. A single neon accent \(\#1A7FE0 — electric blue\) used exclusively for active states, live telemetry pulses, and CTA buttons\. Secondary accent \(\#00D4AA — teal\) for positive score indicators\.

Data density over whitespace\. Score cards, match probability bars, and analytics charts are packed tightly\. Whitespace is used deliberately for hierarchy, not as filler\.

Motion as data\. Animations communicate state: score arc fills, probability sparklines, and match\-ranking reorders all carry meaning, not decoration\.

Keyboard\-first affordances\. Every critical action has a keyboard shortcut shown inline\. Designed for marketing power users who move fast\.

Confidence color vocabulary\. Green \(\#22C55E\) for high match / strong AI visibility, amber \(\#F59E0B\) for mid\-tier or flagged, red \(\#EF4444\) for poor match or missing structure\.

## 6\.3 Typography

Display / Headings: Inter \(Variable\), weight 600–800\. Dashboard section headers and modal titles\.

Body / Labels: Inter weight 400\. Score breakdowns, table cells, metadata\.

Monospace / Code: JetBrains Mono\. Used in the URL input terminal, JSON panels, and score factor code labels\.

Numeric / Score: Tabular numeral feature enabled via font\-variant\-numeric: tabular\-nums for consistent alignment in score columns\.

## 6\.4 Component Token System \(Tailwind Config Extension\)

theme\.extend\.colors = \{  
  
  base: '\#0D1B2A',      // page background  
  
  surface: '\#112240',   // card / panel background  
  
  elevated: '\#1A2F4A',  // modal background  
  
  accent: '\#1A7FE0',    // primary action / live indicator  
  
  teal: '\#00D4AA',      // score indicators  
  
  success: '\#22C55E', warning: '\#F59E0B', danger: '\#EF4444'  
  
\};

# 7\. Frontend Technology Stack

# 8\. Component Specification

## 8\.1 Global Layout Shell

### NavigationRail \(Persistent Left Sidebar\)

Dark \(\#112240\) vertical sidebar, 64px wide collapsed / 220px expanded \(toggle on \[\)\. Contains: AnswerRank logo mark \(SVG\), nav items with keyboard shortcut labels, a live Audit Activity Indicator \(animated teal pulse ring when any creator URL is actively being scored\), and user avatar with org switcher at the bottom\.

### GlobalStatusBar \(Top Header\)

48px horizontal top bar\. Left: breadcrumb trail \(Dashboard → Campaign / Creator\)\. Center: live active audit count badge\. Right: creator database size counter \(updates live\), notification bell, and keyboard shortcut help overlay toggle \(?\)\.

## 8\.2 The Creator Diagnostic Dashboard

### URLInputTerminal \(Primary Input\)

A dark, terminal\-styled full\-width input field\. Styled with a neon teal cursor and monospace font\. Accepts YouTube URLs and blog URLs\. On submission: fires the /api/v1/audit endpoint, opens a WebSocket to /ws/audit/\{auditId\}, and renders the ScoreProgressArc with an animated fill\. Handles edge cases: invalid URLs \(inline error\), private YouTube videos \(graceful error card\), and rate limit exceeded \(tier upsell card\)\.

### ScoreProgressArc \(Primary Score Display\)

An animated SVG arc component \(0–100 scale\) that fills clockwise from the base to the score value\. Color is dynamically interpolated: red \(0–40\), amber \(41–70\), teal \(71–100\)\. Inside the arc: the numeric score in large tabular numerals, and a tier label \(Poor Visibility / Good Visibility / Highly Citable\)\. The arc animates over 1\.2 seconds on initial render\.

### DiagnosisChecklist \(Factor Breakdown Panel\)

Seven horizontally\-stacked factor cards, one per AnswerRank dimension \(D1–D7\)\. Each card shows the factor name, sub\-score \(0–1\.0\), a horizontal fill bar, and a pass/fail icon\. Failing factors render with an amber exclamation icon and a one\-line remediation hint \(e\.g\., “Add a structured FAQ section with at least 5 Q&A pairs”\)\. Clicking a factor card expands an explanatory popover with the mathematical definition\.

### OptimizeWithGeminiPanel \(Fix\-It Copilot\)

Appears below the DiagnosisChecklist when score < 80\. Contains a large CTA button \(✨ Optimize with Gemini\) and a preview panel\. On click: fires the Gemini API call, streams the rewritten content into a side\-by\-side diff viewer \(original | optimized\), and displays the projected new score\. The panel makes it explicit that this feature consumes a Gemini API credit from the creator’s monthly allocation\.

## 8\.3 The Brand Campaign Studio

### CampaignSearchBar

A large, prominent search input with placeholder text: “Search by campaign keyword \(e\.g\., Organic Skincare, Ayurvedic Hair Oil\)”\. On submission: embeds the query, executes Qdrant ANN search, and renders the CreatorCandidateGrid\. Includes a Filters drawer \(niche category, minimum AnswerRank Score, verified status, follower range\)\.

### CreatorCandidateGrid \(Virtualized Smart Table\)

Built with TanStack Table v8 \+ TanStack Virtual v3\. Only ~20 visible rows rendered as DOM nodes at any time\. Columns:

## 8\.4 The Creator Score Profiler \(Deep\-Dive Modal\)

Opens when a brand clicks Inspect on any creator\. Full\-screen slide\-over panel from the right, 720px wide\. This is the explainability surface — its job is to prove every number in the leaderboard to a skeptical brand manager\.

ProfilerHeader: Candidate identity card with composite score arc \(large\), niche tags, AI citation count \(from verified audit history\), and Campaign Match Probability badge\.

ScoreRadar \(Recharts Radar Chart\): A polygon radar chart with seven axes \(one per AnswerRank dimension D1–D7\)\. The creator’s scores are plotted as a filled polygon\. An ideal profile overlay \(dashed\) shows the target shape for maximum AI citation probability in the brand’s niche\.

EntityHeatmap: A word\-cloud\-style heat map of the creator’s top named entities, sized by frequency and colored by entity type \(product, ingredient, brand, person\)\. Shows the brand exactly which entities the creator’s content is authoritative on\.

ContentDiffViewer: Side\-by\-side view of the original creator content vs\. the optimized version \(if Fix\-It was run\)\. A diff mode toggle highlights added elements in green\.

CampaignMatchRationale: A plain\-text card explaining the Campaign Match Probability score: which keyword overlaps drove it, which entities matched, and which structural signals were present or absent\.

# 9\. Frontend Data Flow

## 9\.1 Creator Audit Flow \(URL\-to\-Score\)

Creator pastes URL into URLInputTerminal and submits\.

Frontend fires POST to /api/v1/audit with the URL payload\.

FastAPI acknowledges and returns an audit\_id\. Frontend opens WebSocket to /ws/audit/\{audit\_id\}\.

Celery worker begins URL ingestion \(trafilatura / YouTube Transcript API\)\. WebSocket emits: \{type: 'ingestion\_complete', word\_count: 1842\}\.

Deterministic Scoring Engine runs seven heuristic checks synchronously\. WebSocket emits: \{type: 'scoring\_complete', score: 72, factors: \{\.\.\.\}\}\.

SentenceTransformers embeds the content; vector is upserted into Qdrant\. WebSocket emits: \{type: 'indexed', creator\_id: '\.\.\.'\}\.

Zustand store updates; ScoreProgressArc animates to 72; DiagnosisChecklist renders all seven factor cards\.

If score < 80, OptimizeWithGeminiPanel fades in\.

## 9\.2 Brand Search Flow \(Keyword\-to\-Match\)

Brand enters keyword query in CampaignSearchBar\.

Frontend fires POST to /api/v1/campaign/search with the keyword payload\.

FastAPI embeds the keyword via SentenceTransformers \(200ms\), runs Qdrant ANN cosine similarity search \(150ms\), calculates CMP for top results \(50ms\)\.

Response returns array of RankedCreatorSchema objects, sorted by CMP descending\.

CreatorCandidateGrid renders with TanStack Virtual; Framer Motion animates rows in\.

Brand clicks Inspect; Creator Score Profiler slide\-over renders with full score breakdown\.

## 9\.3 State Architecture \(Zustand Stores\)

// auditStore\.ts  
interface AuditStore \{  
  auditId: string;  
  status: 'idle' | 'ingesting' | 'scoring' | 'complete';  
  score: number | null;  
  factors: FactorBreakdown\[\];  
  wsStatus: 'connecting' | 'connected' | 'disconnected';  
\}  
  
// campaignStore\.ts  
interface CampaignStore \{  
  query: string;  
  results: RankedCreatorProfile\[\];  
  selectedCreatorId: string | null;  
  filters: CampaignFilters;  
\}  
  
// uiStore\.ts  
interface UIStore \{  
  profilerOpen: boolean;  
  diffViewerOpen: boolean;  
  optimizePanelVisible: boolean;  
\}

Part III: Backend & System Architecture

# 10\. Backend Technology Stack

# 11\. The AI & Scraping Fleet

## 11\.1 Design Principle

AnswerRank’s most critical architectural decision is the strict separation between the Deterministic Layer \(Layer 1\) and the Generative Layer \(Layer 2\)\. The scoring logic never touches an LLM — meaning it can never hallucinate the AnswerRank score that brands and creators trust\. LLMs are utility tools called only on explicit opt\-in\.

## 11\.2 Extraction Layer

trafilatura \(Python\): Primary web content extraction\. Strips navigation, ads, boilerplate, and structural noise from blog/article URLs\. Returns clean body text with preserved header hierarchy\.

YouTube Transcript API: Extracts full video transcripts \(auto\-generated and human\-captioned\) from YouTube video URLs\. Falls back to pytube subtitle extraction if the primary API is unavailable\.

Processing: Extracted text is chunked into 512\-token segments, cleaned of Unicode noise, and stored in PostgreSQL \(content\_normalized table\)\.

## 11\.3 Semantic Layer

Model: SentenceTransformers \(all\-MiniLM\-L6\-v2 or text\-embedding\-3\-small via OpenAI API\)\. Converts creator content chunks into 384\-dim or 256\-dim semantic vectors\.

Purpose: Powers the brand Campaign Search \(cosine similarity match between brand keyword vector and creator content vectors\) and the creator\-side topical clustering\.

Storage: Vectors upserted into Qdrant with creator metadata payload \(creator\_id, niche, score, follower\_count\)\.

## 11\.4 Generative Layer \(Gemini API\)

Trigger: Gemini API is called ONLY when a creator clicks “Optimize for AI” on their diagnostic dashboard\.

Purpose: Rewrites the creator’s script or blog post to inject missing structural elements \(FAQ sections, entity definitions, header hierarchy\) without altering the creator’s voice\.

Implementation: Gemini 1\.5 Flash with a carefully engineered system prompt that specifies: preserve tone, add structure, do not hallucinate facts, output clean Markdown\.

Cost control: Gemini calls are metered per creator tier\. Free tier: 1 rewrite/month\. Pro tier: unlimited rewrites\.

# 12\. The Data Ingestion Pipeline

## 12\.1 Stage A: URL Submission \(Client\)

Creator/Brand submits a URL via the frontend URLInputTerminal\.

Frontend fires POST /api/v1/audit with \{url, creator\_id, job\_id\}\.

FastAPI validates the URL schema with Pydantic v2 and immediately returns \{audit\_id, status: queued\}\.

WebSocket connection established to /ws/audit/\{audit\_id\}\.

## 12\.2 Stage B: Storage & Queue \(FastAPI\)

FastAPI fires one Celery task: ingest\_and\_score\.delay\(url, audit\_id\)\.

Audit progress tracked in Redis key: audit:\{audit\_id\}:status\.

WebSocket event emitted: \{type: 'queued', audit\_id: '\.\.\.'\}\.

## 12\.3 Stage C: Async Worker Processing \(Celery\)

Celery worker pulls ingest\_and\_score task\.

URL classification: YouTube \(transcript API\) or Web \(trafilatura\)\.

Content extraction and normalization \(regex noise removal, header hierarchy preservation, ISO\-8601 date normalization\)\.

Normalized text stored in PostgreSQL \(content\_normalized table\)\.

Deterministic Scoring Engine runs seven heuristic functions \(pure Python, no LLM\)\. WebSocket event emitted: \{type: scoring\_complete\}\.

SentenceTransformers embeds the content; vector upserted into Qdrant\. WebSocket event emitted: \{type: indexed\}\.

Creator profile updated in PostgreSQL with new score and factor breakdown\.

# 13\. Core Algorithmic Mathematics

This section defines the rigorous mathematical formulas underpinning every score and probability value displayed in the AnswerRank platform\. These formulas are deterministic: given the same input text, they will always produce the same output score\. No generative model is involved\.

## 13\.1 The AnswerRank Composite Score \(AR\)

The master AI Visibility Score\. A weighted sum of seven heuristic dimensions \(D1–D7\), normalized to a 0–100 scale\. Weights w1–w7 are calibrated against a ground\-truth dataset of 500 creator URLs where AI citation was empirically verified:

AR = 100 × Σ\(wi × Di\)   where   Σwi = 1, i ∈ \{1,\.\.\.,7\}

Default weight calibration:

## 13\.2 Direct Answer Density \(D1\)

Quantifies the ratio of sentences that begin with or directly respond to interrogative patterns:

D1 = |\{s ∈ S : interrogative\_match\(s\) = true\}| / |S|

where S is the set of all sentences in the content\. interrogative\_match returns true if the sentence pattern is: \[What|Who|Why|How|When|Is|Are|Can\] \.\.\. \[\.\]

## 13\.3 Entity Clarity Score \(D2\)

Measures named entity density with a definition\-quality modifier:

D2 = \(Σk∈E  Ck\) / |W|  ×  definition\_coverage\_ratio

where E is the set of recognized named entities \(products, ingredients, brands, chemicals\), Ck is the co\-occurrence count of entity k with a definitional phrase \(e\.g\., “is a”, “refers to”, “defined as”\), and |W| is total word count\.

## 13\.4 Campaign Match Probability \(CMP\)

The core brand\-facing score\. Calculated as cosine similarity between the brand’s campaign keyword vector and the creator’s content vector, modulated by the creator’s AnswerRank score:

CMP\(brand, creator\) = cos\(V\_brand, V\_creator\) × α\(AR\_creator / 100\) \+ \(1 \- α\) × cos\(V\_brand, V\_creator\)

Simplified:

CMP\(brand, creator\) = cos\(V\_brand, V\_creator\) × \(1 \+ α × AR\_creator / 100\)

where V\_brand is the SentenceTransformers embedding of the brand’s campaign keyword cluster, V\_creator is the aggregated embedding of the creator’s last 10 pieces of content, AR\_creator is the creator’s AnswerRank Composite Score \(0–100\), and α = 0\.3 is the AnswerRank amplification coefficient \(calibrated empirically\)\.

Interpretation: A creator with perfect semantic relevance \(cosine similarity = 1\.0\) but a low AnswerRank score \(30/100\) will have their CMP modulated downward, correctly reflecting that even topically relevant content may not get cited if it lacks structural properties\.

## 13\.5 FAQ Coverage Score \(D3\)

D3 = min\(1\.0,  N\_qa / T\_qa\)  ×  structural\_quality\_modifier

where N\_qa is the number of detected question\-answer pairs in the content, T\_qa = 5 is the minimum target for strong FAQ coverage, and structural\_quality\_modifier is 1\.0 if questions use proper interrogative phrasing, 0\.7 if questions are in plain declarative form\.

# 14\. Backend Code Architecture

## 14\.1 Asynchronous Design Principle

The backend is a fully async FastAPI application\. Every function touching a network resource \(Qdrant, Supabase PostgreSQL, Gemini API, embedding model\) uses async/await\. CPU\-bound tasks \(regex normalization, heuristic scoring\) are offloaded to a thread pool via asyncio\.to\_thread\(\)\. This ensures the API thread is never blocked, even during peak ingestion\.

## 14\.2 Core Pydantic v2 Schemas

## 14\.3 FastAPI Endpoint Routing

Part IV: Security, DevOps & Deployment Architecture

# 15\. Security Architecture

## 15\.1 Authentication & Authorization

Frontend: NextAuth\.js with Supabase Auth adapter\. Supports Google OAuth 2\.0 and Magic Link \(email\)\. JWTs issued with 1\-hour expiry; refresh tokens rotated on every use\.

Backend: FastAPI dependency Depends\(get\_current\_user\) validates JWT on every protected endpoint\. Row\-Level Security \(RLS\) in Supabase ensures creators can only access their own audit history; brands can only access their own campaign queries\.

Roles: CREATOR \(audit submission, Fix\-It access\), BRAND \(campaign search, profiler access\), BRAND\_ENTERPRISE \(SOV analytics, bulk export\), ADMIN \(settings, GDPR wipe, billing\)\.

## 15\.2 Secrets Management

All API keys \(Gemini, OpenAI embeddings, Qdrant\) stored in AWS Secrets Manager\. Fetched at container startup; cached in process memory\.

Zero secrets in source code, environment files, or Docker images\. CI/CD pipeline uses GitHub Actions OIDC to assume an AWS IAM role with scoped Secrets Manager access\.

Webhook signatures use HMAC\-SHA256: X\-AnswerRank\-Signature header verified server\-side for all outbound webhook events\.

## 15\.3 Data Privacy & GDPR Compliance

Creator content extracted from URLs is stored in Supabase Storage with a 90\-day lifecycle purge policy\.

GDPR wipe endpoint \(DELETE /api/v1/gdpr/wipe/\{creator\_id\}\) hard\-deletes: Supabase Storage objects, Qdrant collection vectors, PostgreSQL creator rows, Redis keys\. Audit log of the wipe is retained \(required by law\)\.

No raw PII beyond creator handle and platform URL is retained\. Email addresses are hashed before storage\.

# 16\. Infrastructure & Deployment

## 16\.1 Container Architecture

\# docker\-compose\.yml \(production equivalent\)  
services:  
  api:           \# FastAPI \+ Uvicorn \(4 workers\)  
  worker\_high:   \# Celery worker \-\- URL ingestion queue  
  worker\_low:    \# Celery worker \-\- scoring \+ embedding  
  flower:        \# Celery monitoring UI  
  next\_app:      \# Next\.js 15 \(standalone output mode\)  
  
\# External managed services:  
\# \- Upstash Redis \(Celery broker \+ cache\)  
\# \- Qdrant Cloud \(vector database\)  
\# \- Supabase \(PostgreSQL \+ Auth \+ Storage\)  
\# \- AWS Secrets Manager \(API keys\)

## 16\.2 Deployment Platform

Frontend: Vercel — automatic preview deployments per branch; edge caching for the Next\.js shell\.

Backend \(FastAPI \+ Celery\): Railway or Render \(containerized\)\. Auto\-scales Celery worker replicas based on Redis queue depth \(0–10 workers per queue\)\.

Database: Supabase \(managed PostgreSQL 16\) in the same region as the backend to minimize latency\.

CI/CD: GitHub Actions — lint, type\-check, unit tests, E2E smoke tests \(Playwright\) on every PR; Docker build \+ push on merge to main\.

## 16\.3 Monitoring & Observability

Error tracking: Sentry \(both Next\.js frontend and FastAPI backend\) — full stack traces, source map uploads\.

Distributed tracing: OpenTelemetry SDK instrumentation; traces exported to Grafana Tempo\.

Metrics: custom Prometheus metrics \(audit throughput, scoring latency, CMP calculation time, Gemini API cost/day\) exposed at /metrics; Grafana dashboards\.

Celery monitoring: Flower UI \(internal, auth\-protected\) showing live task queues, worker status, and retry counts\.

Alerting: PagerDuty integration for: Celery dead\-letter queue growth, Sentry error rate spike, Qdrant latency > 500ms, WebSocket connection error rate > 1%\.

# 17\. End\-to\-End Pipeline Summary

A complete step\-by\-step trace of a Brand submitting a keyword and the system returning ranked creators, followed by a Creator submitting a URL and receiving a score\.

## 17\.1 Brand Campaign Search — Full System Flow

ANSWERRANK \-\- BRAND CAMPAIGN SEARCH FLOW  
=========================================  
  
\[BROWSER\]  
CampaignSearchBar: brand enters 'Vitamin C Serum, Oily Skin'  
\-> POST /api/v1/campaign/search \{query\_text, niche\_filter\}  
  
\[FASTAPI\]  
\-> Pydantic v2 validates BrandQuerySchema  
\-> SentenceTransformers embeds keyword cluster  
   \-> V\_brand \(256\-dim vector\)  
  
\[QDRANT ANN SEARCH\]  
\-> cosine similarity: V\_brand vs all creator vectors  
\-> Top\-50 candidates returned with similarity scores  
  
\[CMP CALCULATION\]  
\-> For each candidate:  
   CMP = cos\(V\_brand, V\_creator\) x \(1 \+ 0\.3 x AR/100\)  
\-> Results sorted by CMP descending  
  
\[FASTAPI RESPONSE\]  
\-> RankedCreatorSchema\[\] returned to frontend  
\-> Total latency: <500ms  
  
\[FRONTEND\]  
\-> CreatorCandidateGrid renders with TanStack Virtual  
\-> Framer Motion animates rows in  
\-> Brand clicks Inspect \-> Creator Score Profiler opens  
\-> PersonaRadar, EntityHeatmap, CampaignMatchRationale  
\-> Brand selects Creator A \(CMP: 85%, AR: 91/100\)

## 17\.2 Creator Audit — Full System Flow

ANSWERRANK \-\- CREATOR AUDIT FLOW  
=================================  
  
\[BROWSER\]  
URLInputTerminal: creator pastes YouTube URL  
\-> POST /api/v1/audit \{url, creator\_id\}  
\-> WebSocket opens /ws/audit/\{audit\_id\}  
  
\[FASTAPI \-\- Stage B\]  
\-> Pydantic v2 validates AuditRequestSchema  
\-> Celery: fire ingest\_and\_score\.delay\(url, audit\_id\)  
\-> WS emit: \{type: 'queued'\}  
  
\[CELERY WORKER \-\- Stage C\]  
\-> URL type: YouTube  
\-> YouTube Transcript API: extract transcript  
\-> Normalization pipeline \(regex \+ header preservation\)  
\-> PostgreSQL: store content\_normalized  
\-> WS emit: \{type: 'ingestion\_complete', word\_count: 2340\}  
  
\[DETERMINISTIC SCORING ENGINE\]  
\-> D1: Direct Answer Density   \-> 0\.81  
\-> D2: Entity Clarity          \-> 0\.74  
\-> D3: FAQ Coverage            \-> 0\.33  \[FAIL\]  
\-> D4: Structured Data         \-> 0\.68  
\-> D5: Formatting Quality      \-> 0\.72  
\-> D6: Freshness               \-> 0\.90  
\-> D7: Content Depth           \-> 0\.76  
\-> AR = 100 x \(0\.22x0\.81 \+ 0\.20x0\.74 \+ \.\.\. \) = 72  
\-> WS emit: \{type: 'scoring\_complete', score: 72\}  
  
\[SEMANTIC INDEXING\]  
\-> SentenceTransformers embeds content  
\-> Qdrant upsert: creator vector \+ metadata payload  
\-> WS emit: \{type: 'indexed'\}  
  
\[FRONTEND \-\- Post\-Scoring\]  
\-> ScoreProgressArc animates to 72 \(amber\)  
\-> DiagnosisChecklist renders 7 factor cards  
\-> D3 \(FAQ Coverage\) shows FAIL \+ hint: 'Add 5\+ Q&A pairs'  
\-> OptimizeWithGeminiPanel fades in  
\-> Creator clicks 'Optimize with Gemini'  
\-> Gemini API call: inject FAQ section  
\-> Projected score: 84/100 displayed  
\-> Creator reviews diff; approves; score updates to 84

# Appendix A: Business Model Summary

Revenue projections:

# Appendix B: Glossary of Key Terms

# Appendix C: WebSocket Event Schema Reference

// All WebSocket events \-\- discriminated union on 'type'  
type AuditEvent =  
  | \{ type: 'queued';          audit\_id: string \}  
  | \{ type: 'ingestion\_complete'; word\_count: number;  
                              platform: 'youtube' | 'web' \}  
  | \{ type: 'scoring\_complete'; score: number;  
                              factors: FactorBreakdown\[\];  
                              ar\_composite: number \}  
  | \{ type: 'indexed';         creator\_id: string;  
                              vector\_id: string \}  
  | \{ type: 'optimize\_start'; gemini\_tokens\_used: number \}  
  | \{ type: 'optimize\_complete'; projected\_score: number;  
                              diff\_summary: string \}  
  | \{ type: 'error';           code: string;  
                              message: string;  
                              retrying: boolean \}

All events are emitted over a persistent WebSocket connection established at audit submission time\. The frontend’s Zustand auditStore subscribes to each event type and updates the UI incrementally, ensuring the creator sees live progress rather than a loading spinner\.

