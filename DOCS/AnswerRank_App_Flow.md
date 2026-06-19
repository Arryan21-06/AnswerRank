__ANSWERRANK__

__AI\-Native Influencer Discovery & Campaign Management Platform__

*App Flow — Navigation & User Journey Map*

*Every page, every click, every path — mapped before a single screen is built*

__Team__

One Wish Willow

__Engineers__

Aryan Chaurasia | Harshit Agrawal

__Date__

June 2026

__Version__

v1\.0 — Implementation Ready

__Companion Docs__

AnswerRank Master Project Documentation; AnswerRank TRD

__Status__

Navigation & flow locked\. Visual design deferred\.

*Scope note: this document maps screens, navigation, and logic — not visual design\. Layout density, color, and component styling are intentionally out of scope here and will be defined in a separate design pass, consistent with the AnswerRank TRD\.*

# __Table of Contents__

# __Why This Document Matters__

AnswerRank is a dual\-sided platform: Creators run free diagnostics, Brands run paid campaign searches, and the two sides never see each other's interface\. Without an explicit flow map, an AI build agent will construct each screen in isolation — a Creator Dashboard that doesn't know what happens after a score is generated, a Brand Studio that doesn't know where the Profiler modal hands off to\. This document fixes every navigation path, entry point, and redirect so the two sides of the platform connect into one coherent product\.

# __1\. Pages List__

Every screen in AnswerRank V1, grouped by which side of the platform it serves\.

## __1\.1 Public / Shared Pages__

__Route__

__Description__

__/__

Marketing landing page\. Explains the AI Visibility Score concept\. Two CTAs: “Audit my content” \(Creator\) and “Find creators” \(Brand\)\.

__/login__

Unified sign\-in screen for both Creators and Brands\. Google OAuth \+ Magic Link\.

__/signup__

Account creation\. Asks for account type \(Creator or Brand\) before proceeding to onboarding\.

__/onboarding__

Short, role\-specific setup wizard\. Branches based on account type selected at signup\.

__/settings__

Account settings: profile info, billing tier, API usage \(Gemini credits for Creators\), notification preferences\.

__/logout__

Session termination route\. Not a rendered page — redirects immediately\.

## __1\.2 Creator\-Side Pages__

__Route__

__Description__

__/creator__

Creator home\. Shows past audits, current AnswerRank Score trend, and the URL submission input\.

__/creator/audit/\[auditId\]__

Creator Diagnostic Dashboard\. Live scoring view: URL input, ScoreProgressArc, DiagnosisChecklist, Optimize\-with\-Gemini panel\.

__/creator/history__

List of all past audits with scores, sortable by date or score\.

__/creator/upgrade__

Pro tier upsell page \(₹499/month\)\. Shown when free tier limits \(3 audits/month\) are reached\.

## __1\.3 Brand\-Side Pages__

__Route__

__Description__

__/brand__

Brand home\. Campaign search bar front and center, plus recent searches and saved creator lists\.

__/brand/campaign__

Brand Campaign Studio\. Search results grid \(CreatorCandidateGrid\) with filters and sort\.

__/brand/creator/\[creatorId\]__

Creator Score Profiler — full\-screen deep\-dive on a single creator's score breakdown, opened as a slide\-over from the Campaign Studio\.

__/brand/sov__

Share of Voice analytics — Enterprise tier only\. Visualizes citation dominance across top creators for a keyword cluster\.

__/brand/upgrade__

Enterprise tier upsell page \(₹15,000/month\)\. Shown when a Brand free\-trial user attempts a gated action \(e\.g\. opening SOV analytics\)\.

## __1\.4 Compliance / Admin__

__Route__

__Description__

__/admin__

Internal\-only\. GDPR wipe tool, billing overrides, support tooling\. Not linked from any public nav\.

# __2\. Navigation Structure__

## __2\.1 Logged\-Out Navigation__

A simple top navbar: logo \(links to /\), “How it Works,” “Pricing,” and a single “Sign In” button on the right\. No sidebar\. No persistent chrome beyond the navbar and a footer\.

## __2\.2 Logged\-In Navigation — Creator__

- Persistent left sidebar \(collapsible\): Home, New Audit, History, Settings\.
- Top status bar: shows remaining free audits this month \(e\.g\. “2 of 3 audits used”\) and a persistent “Upgrade” button if on the free tier\.
- No bottom tab bar in V1 \(web\-first, desktop\-primary; mobile is responsive but not optimized as a distinct nav pattern\)\.

## __2\.3 Logged\-In Navigation — Brand__

- Persistent left sidebar \(collapsible\): Home, Campaign Studio, Saved Creators, Share of Voice \(locked/greyed for non\-Enterprise\), Settings\.
- Top status bar: shows current billing tier and a live count of creators in the database \(“1,204 verified creators”\)\.
- Breadcrumb trail appears inside Campaign Studio only \(Campaign Studio → Search Results → Creator Profiler\), since this is the one multi\-depth flow on the Brand side\.

## __2\.4 Back Button & Modal Dismissal Logic__

- The Creator Score Profiler and the Optimize\-with\-Gemini diff viewer are both slide\-over panels, not new routes — browser back\-button press closes the panel and returns to the underlying grid/dashboard rather than navigating away\.
- All confirmation dialogs \(e\.g\. “Send to Brand” equivalents, tier upgrade confirmations\) use a centered modal with an explicit close \(×\) and an “Esc” key dismissal; clicking outside the modal also dismisses it unless a destructive action is in progress\.

# __3\. Entry Points__

## __3\.1 First\-Time Visitor \(Not Logged In\)__

Every new visitor lands on / regardless of how they arrived \(organic search, paid ad, direct link\)\. The landing page immediately asks them to self\-select: “Are you a Creator or a Brand?” via two large CTA buttons\. This selection pre\-fills the account type field on /signup so the onboarding wizard can branch correctly without asking twice\.

## __3\.2 Returning Visitor \(Logged In, Direct Link\)__

If a logged\-in user's session is valid and they land on /, they are immediately redirected to their role\-appropriate home \(/creator or /brand\) rather than seeing the marketing page again\.

## __3\.3 Shared / Referral Links__

A Brand sharing a specific creator profile link \(/brand/creator/\[creatorId\]\) with a logged\-out colleague triggers a login wall: the colleague is redirected to /login with a return\_to query parameter, and lands directly on the intended creator profile after authenticating\.

# __4\. Auth Flow__

## __4\.1 Signup → Onboarding → Dashboard Sequence__

/ \(landing\)
  \-> user clicks 'I'm a Creator' or 'I'm a Brand'
  \-> /signup?type=creator   \(or ?type=brand\)

/signup
  \-> Google OAuth or Magic Link
  \-> NextAuth\.js session created; Supabase Auth user record created
  \-> account\_type stored on the user profile \(creator | brand\)

/onboarding \(branches on account\_type\)
  CREATOR path:
    Step 1: Primary niche selection \(Skincare, Ayurveda, Finance, Fitness, etc\.\)
    Step 2: Connect first platform handle \(YouTube or blog URL\) \-\- optional, skippable
    Step 3: Confirmation \-> redirect to /creator

  BRAND path:
    Step 1: Company name \+ industry
    Step 2: First campaign keyword \(optional, skippable\) \-\- pre\-fills first search
    Step 3: Confirmation \-> redirect to /brand

/creator  or  /brand   \(Dashboard \-\- final landing state\)

## __4\.2 Email Verification__

Magic Link sign\-in inherently verifies email as part of the auth mechanism — there is no separate “verify your email” step\. Google OAuth sign\-in is considered pre\-verified\. This removes a full step from the funnel compared to traditional password \+ verification\-email flows\.

## __4\.3 Session Expiry Mid\-Flow__

If a JWT expires while a user is mid\-action \(e\.g\., mid\-way through a creator audit submission\), the frontend silently attempts a token refresh via NextAuth\. If the refresh fails, the user is redirected to /login with a return\_to parameter pointing back to their exact prior screen, and a toast notification reads: “Your session expired\. Please sign in again to continue\.” In\-progress, unsaved form input \(e\.g\. a partially typed campaign query\) is preserved in local component state where feasible and restored after re\-authentication\.

# __5\. Core User Journeys__

## __Journey 1 — Creator Runs a Free Diagnostic Audit__

Goal: A Creator wants to know their AI Visibility Score for a recent YouTube video\.

1. Creator logs in and lands on /creator\.
2. They paste a YouTube URL into the audit input and click “Run Audit\.”
3. They are navigated to /creator/audit/\[auditId\], where a WebSocket connection opens immediately\.
4. They watch live status updates: “Extracting transcript…” → “Scoring content…” → “Indexing…”
5. The ScoreProgressArc animates to the final score \(e\.g\., 58/100\) and the DiagnosisChecklist renders seven factor cards, with failing factors flagged in amber\.
6. Since the score is below 80, the Optimize\-with\-Gemini panel fades in automatically\.
7. Creator clicks “Optimize with Gemini\.” A side\-by\-side diff viewer streams in the rewritten content and a projected new score \(84/100\)\.
8. Creator reviews the diff, approves it, and the audit record updates to reflect the new score\. They are returned to /creator, where the updated audit now appears at the top of their history\.

## __Journey 2 — Brand Vets Creators for a New Campaign__

Goal: A Brand Marketing Manager wants to shortlist creators for a Vitamin C Serum campaign\.

1. Brand logs in and lands on /brand\.
2. They type “Skincare, Vitamin C Serum, Oily Skin” into the Campaign Search Bar and press Enter\.
3. They are navigated to /brand/campaign, where the CreatorCandidateGrid populates with ranked results \(sorted by Campaign Match Probability\) within 500ms\.
4. They apply a filter: minimum AnswerRank Score of 70\.
5. They click “Inspect” on the top result, Creator A\. A slide\-over panel opens \(visually /brand/creator/\[creatorId\], but rendered as an overlay rather than a full navigation\) showing the ScoreRadar, EntityHeatmap, and CampaignMatchRationale\.
6. Satisfied, the Brand clicks “Save to Shortlist\.” A toast confirms: “Creator A added to your shortlist\.” The slide\-over remains open so they can continue reviewing, or they close it \(Esc / ×\) to return to the grid\.
7. They repeat the Inspect → Save pattern for two more creators, then navigate to their saved list to export it\.

## __Journey 3 — Free\-Tier Creator Hits the Audit Limit__

Goal: A Creator on the free tier tries to run a 4th audit in the same month\.

1. Creator pastes a new URL on /creator and clicks “Run Audit\.”
2. The backend rejects the request with a 429\-equivalent tier\-limit response before any Celery task is queued — no WebSocket connection is opened, and no partial UI state is shown\.
3. Instead of the audit dashboard, the Creator is shown an inline upsell card directly below the input: “You’ve used all 3 free audits this month\. Upgrade to Pro for unlimited audits\.”
4. Clicking “Upgrade” navigates to /creator/upgrade\. Declining \(closing the card\) leaves them on /creator with the input still populated, so they don’t lose their URL if they decide to wait until next month\.

# __6\. Empty States__

__Screen / State__

__Empty State Behavior__

__/creator \(no audits yet\)__

Centered illustration\-style placeholder with copy: “Run your first audit to see your AI Visibility Score\.” The URL input is emphasized as the primary action; no history table is shown\.

__/creator/history \(no audits yet\)__

Same empty message as above, with a single CTA button linking back to the audit input on /creator\.

__/brand/campaign \(no search yet\)__

Search bar is shown full\-width and centered, with example queries as clickable suggestions \(e\.g\. “Try: Ayurvedic Hair Oil”\) instead of a results grid\.

__/brand/campaign \(search returns zero results\)__

Message: “No creators matched this campaign keyword yet\. Try a broader term, or check back as our creator database grows\.” Suggests 2–3 adjacent keyword terms\.

__Saved Creators list \(empty\)__

Prompt: “You haven’t saved any creators yet\. Inspect a creator from your search results and click ‘Save to Shortlist\.’”

__Share of Voice \(no data for keyword\)__

Message: “Not enough verified creators in this niche yet to calculate Share of Voice\.” No chart is rendered in place of an empty/zeroed chart\.

# __7\. Error States__

__Trigger__

__Behavior & Destination__

__Invalid URL submitted \(Creator audit\)__

Inline validation error directly under the input field before any network call is made: “Please enter a valid YouTube or blog URL\.”

__Private / inaccessible YouTube video__

Audit dashboard renders an error card in place of the score arc: “We couldn’t access this video\. Make sure it’s public and try again\.” A “Try another URL” button returns to /creator\.

__WebSocket disconnects mid\-audit__

Frontend attempts automatic reconnection \(up to 3 attempts with backoff\)\. If reconnection fails, a banner reads: “Connection lost\. Reconnecting…” and then, on final failure, “We lost the connection\. Refresh to check your audit status” with a manual refresh button — the audit itself continues processing server\-side regardless of client connection state\.

__Gemini API failure during Optimize__

Diff viewer shows: “Optimization failed\. Your Gemini credit was not consumed\. Please try again\.” Retry button re\-fires the request; failure is logged but does not affect the underlying AnswerRank Score, which remains the last successfully computed value\.

__Failed payment \(tier upgrade\)__

User remains on /creator/upgrade or /brand/upgrade; a red inline banner reads: “Your payment couldn’t be processed\. Please check your card details and try again\.” No navigation occurs and no tier change is applied until payment succeeds\.

__Network error \(general API failure\)__

A non\-blocking toast notification appears: “Something went wrong\. Please try again\.” The triggering action is not silently retried; the user must re\-initiate it\.

__Brand attempts to access Enterprise\-only feature on a lower tier__

Clicking a locked nav item \(e\.g\. Share of Voice\) opens the /brand/upgrade page directly rather than showing a dead\-end permission error\.

# __8\. Loading States__

- Creator audit submission: immediately on click, the input transitions to a disabled/loading visual state and the page navigates to /creator/audit/\[auditId\], where the WebSocket\-driven progress states \(“Extracting…”, “Scoring…”, “Indexing…”\) serve as the loading sequence — there is no separate generic spinner screen\.
- Brand campaign search: a skeleton\-row grid \(matching the shape of CreatorCandidateGrid\) renders immediately on search submission and is replaced row\-by\-row as results stream in, rather than blocking on the full result set\.
- Creator Score Profiler slide\-over: opens immediately with skeleton placeholders for the ScoreRadar and EntityHeatmap, which populate once their respective data resolves \(these can arrive at different times since they come from different backend calls\)\.
- Optimize\-with\-Gemini: the diff viewer shows a streaming\-text effect as the rewritten content arrives, rather than a blank loading state followed by a sudden full reveal\.

# __9\. Modal, Drawer & Overlay Interactions__

__Element__

__Pattern__

__Behavior__

__Creator Score Profiler__

Right\-side slide\-over drawer

Opened from CreatorCandidateGrid ‘Inspect’ action\. Closing returns focus to the grid row that opened it \(no full navigation\)\.

__Optimize\-with\-Gemini Diff Viewer__

In\-page expanding panel \(not a modal\)

Expands below the DiagnosisChecklist on the same /creator/audit/\[auditId\] page\. Collapsing it does not discard the optimization result\.

__Tier Upgrade Confirmation__

Centered modal

Triggered from any ‘Upgrade’ CTA\. Confirms billing change before redirecting to the payment provider; cancel returns to the originating page unchanged\.

__GDPR Account Deletion Confirmation__

Centered modal, destructive style

Requires the user to type their email address to confirm before the delete action is enabled, given the irreversible nature of the action\.

__Keyboard Shortcut Help__

Centered overlay

Opened via ‘?’ key from any logged\-in screen\. Dismissed via Esc, ×, or clicking outside\.

# __10\. Redirect Logic__

__Trigger__

__Destination__

__Successful login \(Creator\)__

/creator

__Successful login \(Brand\)__

/brand

__Successful login with return\_to param__

The return\_to destination, not the default role home

__Logout \(any role\)__

/ \(landing page\)

__Signup complete → onboarding complete__

/creator or /brand, matching the account type

__Session expiry mid\-action__

/login?return\_to=\{prior screen\}

__Free\-tier limit hit \(Creator\)__

Remains on /creator with inline upsell card \(no forced navigation\)

__Gated feature click \(Brand, non\-Enterprise\)__

/brand/upgrade

__Logged\-in user visits / directly__

/creator or /brand, matching their account type

__Logged\-out user visits a protected route__

/login?return\_to=\{attempted route\}

__Successful tier upgrade payment__

Originating dashboard \(/creator or /brand\) with a success toast

__GDPR account deletion confirmed__

/ \(landing page\), with session fully terminated

