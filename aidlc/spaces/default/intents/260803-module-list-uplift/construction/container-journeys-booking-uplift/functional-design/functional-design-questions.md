# Functional Design Questions - U04 Container Journeys and Booking Relationship Uplift

## Source and Authority Alignment

This U04 question set consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`, plus the approved Refined Mockups interaction specification. Binding precedence is approved W4 requirements/security/accessibility, LinerCore MASTER and `@erp/ui`, `container-movement.md`, then advisory UI/UX Pro Max output. The advisory shape-stable skeletons, visible focus, persistent labels, announced errors, and reduced motion are retained. Marketing composition, new palette/fonts, charts/KPIs, spinner-only loading, generic bulk actions, a local shell/theme/Drawer framework, and any shared-component fork are rejected.

U04 is the only unit that creates a new frontend deployable (`apps/container-movement`). Source evidence establishes that the existing default CMM JSON and actor-shaped internal v1 remain compatible but are not public browser seams; that both Kafka listeners use stable consumer groups and concurrency three with **no** configured error handler, bounded retry, DLQ, poison ledger, or replay contract; and that the canonical Booking composition is `apps/shell/app/booking/[bookingId]/page.tsx`, not `apps/booking`. Identity has not yet registered `container-movement:read` or `container-movement:capture`.

## Route, Deployable, and Read Questions

### Q1. What is the canonical CMM deployable and route contract?

A. Create `apps/container-movement` with `basePath=/container-movement`, canonical `/container-movement` recent list and `/container-movement/journeys/[journeyId]` detail, the shared W2-02 `PlatformShell` at its root layout, feature-local BFF and view models, a base-path-aware internal `/api/health`, an image, a Compose service, and an Nginx prefix mount preserving the full URI and `/container-movement/_next/*` assets; module root returns 200 and **no** legacy redirect is invented (recommended)
B. Serve CMM routes from `apps/shell` to avoid a new deployable
C. Add a compatibility redirect from a plausible legacy CMM path
D. Mount CMM without a matching Next `basePath` and rewrite asset URLs at the edge
X. Other (please specify)

[Answer]: A - New `apps/container-movement` deployable with matching `basePath`, shared shell, and no invented legacy redirect (Recommended) - 2026-08-10T20:34:34Z - **Mode:** guided - User response: `A. New app, basePath, no redirect (Rec)`

### Q2. What is the recent-Journey list contract?

A. Bounded `limit` only, with UI choices 25/50/100 and default 25; the authenticated actor is derived server-side and never accepted from the browser query; fixed provider recent order; columns container, Booking, status, latest accepted event only if public ordering is confirmed, and freshness; result copy uses provider `returned` rather than a fabricated total; empty copy is `No recent Journeys returned` with no create CTA; search, filter, selectable sort, cursor, page, and bulk action remain absent (recommended)
B. Add client-side search and sorting over the returned page
C. Accept an actor identifier from the browser query for filtering
D. Show a synthetic total and a Create Journey action
X. Other (please specify)

[Answer]: A - Bounded `limit` only with server-derived actor and provider-authoritative order/`returned` (Recommended) - 2026-08-10T20:34:34Z - **Mode:** guided - User response: `A. Bounded limit only, server actor (Rec)`

### Q3. Who owns the movement timeline, and how is it composed?

A. The CMM service owns `timelineV1` and computes it from current expected/history state; the BFF and browser never merge, deduplicate, calculate next move, or invent lifecycle. Canonical order is GTOT, LOAD, DISC, GTIN; `GTOT|ACT_GTOT` map to GTOT and `ACT_LOAD|ACT_DISC|ACT_GTIN` to LOAD/DISC/GTIN; LOAD/DISC expected locations come from expected movements while GTOT inherits LOAD's and GTIN inherits DISC's; every accepted history record is retained; repeated legacy records stay separate `LEGACY_ACCEPTED` entries; unsupported legacy types become `OTHER` and never advance next-move truth; a planned item is emitted only when its canonical stage has no accepted record; `receivedAt` and `source` stay absent because current Journey state does not own them (recommended)
B. Merge and deduplicate expected and accepted evidence in the BFF
C. Compute next expected move in the browser from the visible timeline
D. Display `receivedAt` and `source` using request time and a guessed origin
X. Other (please specify)

[Answer]: A - Provider-owned `timelineV1` with deterministic merge rules and no BFF/browser composition (Recommended) - 2026-08-10T20:34:34Z - **Mode:** guided - User response: `A. Provider-owned timelineV1 (Rec)`

### Q4. How is trusted identity carried to the CMM v2 contract?

A. Add opt-in media types `application/vnd.linercore.container-journey-v2+json` on reads and `application/vnd.linercore.container-movement-command-v2+json` on capture, on the same endpoints. The BFF issues a short-lived HMAC subject assertion binding issuer, key ID, authenticated subject, HTTP method, normalized provider path, correlation ID, issued/expiry time, and nonce, following the existing Charge assertion pattern; the v2 controller verifies it with a dedicated key and maps the verified subject into existing application ports, ignoring or rejecting any actor query/body field. The v2 command body carries only `eventCode`, `locationId`, and `occurredAt`. The internal service is never exposed directly by Nginx (recommended)
B. Forward the browser session or an actor header straight to the CMM service
C. Expose the existing actor-shaped v1 contract to the browser route
D. Trust an actor field in the capture request body
X. Other (please specify)

[Answer]: A - Opt-in v2 media types with a bound short-lived HMAC subject assertion verified by the v2 controller (Recommended) - 2026-08-10T20:34:34Z - **Mode:** guided - User response: `A. Signed HMAC subject assertion (Rec)`

## Command and Recovery Questions

### Q5. How does movement capture stay idempotent and non-optimistic?

A. After read and action ALLOW, the BFF issues a signed short-lived `captureAttemptToken` binding subject, journey ID, provider `updatedAt`, action, and a server-generated random idempotency key. The browser echoes only the opaque token plus event code, location, and occurrence. The BFF verifies signature, expiry, subject, journey, and action, forwards the embedded key as `Idempotency-Key`, derives correlation from request context, and issues the bound subject assertion. Definitive validation/conflict returns a replacement token; an unknown outcome retains the original token and requires an authoritative re-read before any retry. Capture renders only with capture authority and provider `captureEnabled=true`, using `captureDisabledReason` otherwise (recommended)
B. Let the browser generate and send the idempotency key
C. Advance journey status optimistically and reconcile later
D. Automatically resubmit on timeout using the same token
X. Other (please specify)

[Answer]: A - Server-issued signed capture-attempt token with embedded idempotency key and mandatory re-read on unknown outcome (Recommended) - 2026-08-10T20:36:18Z - **Mode:** guided - User response: `A. Server-issued attempt token (Rec)`

### Q6. How do capture outcomes map, and what stays separate?

A. Define one exhaustive CMM-local result/transport union covering accepted-confirmed, accepted-unconfirmed, validation, duplicate, out-of-sequence/conflict, denied, not-found, unavailable-known-no-mutation, unavailable-unknown-outcome, and unexpected/protocol failure. Journey persistence, CMM outbox publication, broker delivery, and Booking projection application remain four separately observable truths; the UI never infers a later truth from an earlier one and never labels a write Published or Applied without matching evidence. History is append-only, with no correction, publication status, or Booking-application status shown absent an approved public contract (recommended)
B. Treat any 2xx as fully published and applied
C. Collapse duplicate and out-of-sequence into one generic rejection
D. Show a publication status derived from elapsed time
X. Other (please specify)

[Answer]: A - One exhaustive CMM-local result union with persistence, publication, delivery, and Booking application as four separate truths (Recommended) - 2026-08-10T20:36:18Z - **Mode:** guided - User response: `A. Exhaustive union, four truths (Rec)`

### Q7. How do the two implementable Booking/Journey directions behave?

A. Journey-to-Booking links to exact `/booking/[bookingId]` from the provider's verified ID, with independent target authorization; an absent ID is a provider contract failure, not a search prompt. Booking-to-Journey uses the adapter beside `apps/shell/app/booking/[bookingId]/page.tsx` and its shell Booking client, calling authorized CMM v2 by exact `bookingId`; present, not-created, denied, and unavailable stay distinct, rendering `Journey not created` before creation and a scoped Retry on dependency failure. Both directions carry a signed, URL-safe origin token capped at 512 characters and ten minutes, bound to session subject, exact source kind/record ID/canonical href, and expected target module, with canonical-root fallback on a missing, invalid, or expired token. Ownership is not moved to `apps/booking`, and no Journey ID is inferred from projected statuses (recommended)
B. Pass a plain cross-module `returnTo` between Booking and CMM
C. Move the canonical Booking page into `apps/booking` as part of W4
D. Infer the Journey from Booking projection labels when lookup fails
X. Other (please specify)

[Answer]: A - Exact provider IDs in both directions with signed bounded cross-module origin tokens and shell-retained Booking ownership (Recommended) - 2026-08-10T20:36:18Z - **Mode:** guided - User response: `A. Exact IDs + signed origin token (Rec)`

### Q8. How are Reference locations resolved, and how do failures degrade?

A. Use the bounded active-location Reference service port with exact authorization and correlation. Read surfaces may show raw authorized IDs with `Label unavailable`; capture that requires canonical active-location validation is disabled with a precise reason when that validation is unavailable. Reauthorize every read and action; DENY and Identity outage stop before CMM or Reference calls. Show stale business truth only when the owning provider returns source/time under current authorization, and disable freshness-dependent actions. Scope timeline, Booking-relationship, and location-label failures to their own regions with exact Retry ownership, retaining verified Journey truth and context without fabricating completeness (recommended)
B. Cache location labels and treat them as canonical authority
C. Hide the whole Journey when the Booking relationship or a label fails
D. Use browser fixtures when CMM or Reference is unavailable
X. Other (please specify)

[Answer]: A - Bounded active-location port with raw-ID read fallback, disabled unsafe capture, and region-scoped degradation (Recommended) - 2026-08-10T20:36:18Z - **Mode:** guided - User response: `A. Bounded port, region-scoped (Rec)`

## Frontend, Event, and Evidence Questions

### Q9. What component ownership and interaction design is binding?

A. Exactly one W2-02 `PlatformShell` at the CMM root layout from first implementation; CMM owns only module navigation, recent/detail/capture compositions, the capture form, and domain copy over shared `@erp/ui` tokens and primitives. Shape-stable Skeletons, semantic mobile records, native links/buttons, persistent labels, linked error summaries, dirty protection, focus trap/restore, live announcements, and non-color status are mandatory. Container identity is read-only, and actor subject, capability, idempotency key, correlation ID, source, classifier, publication, correction, and Journey creation are never browser-owned fields. A missing shared primitive is a W2-02 dependency and stays BLOCKED; no local shell, theme, Drawer framework, or shared-component fork (recommended)
B. Build a CMM-local shell and theme because the app is new
C. Copy shared Table/Dialog/Tabs into the CMM app to move faster
D. Put Journey workflows inside `packages/ui`
X. Other (please specify)

[Answer]: A - One W2-02 `PlatformShell` from first implementation, CMM-owned composition over shared `@erp/ui` only (Recommended) - 2026-08-10T20:37:27Z - **Mode:** guided - User response: `A. One PlatformShell from day one (Rec)`

### Q10. Which U04 scenarios define completion, and what does the poison/replay gap mean?

A. Provider-ordered recent list and stable Journey detail; provider-owned timeline with all-history retention, repeated legacy evidence, and missing expected evidence; exact Journey-to-Booking and Booking-to-Journey with present/not-created/denied/degraded outcomes and validated bidirectional origin; accepted, duplicate, validation, out-of-sequence, conflict, unknown-outcome, publication-pending, and Booking-applied fixtures with no optimistic advancement; direct refresh/assets/health; capability denial and assertion/header spoof rejection; target-scoped outage; active-location degradation; idempotent retry; absence of a CMM legacy redirect; five widths and two themes; keyboard/screen-reader/reduced-motion/zoom; a warmed 10-user route/BFF sample; and live Compose plus both audits. U04 and the intent remain **not done** while the listener poison/bounded-retry/DLQ/replay exit lacks executable owner evidence or an approved bounded replacement — truthful `BLOCKED` labelling is not completion (recommended)
B. Treat truthful BLOCKED labelling of the poison/replay gap as completion
C. Add a bounded retry, DLQ, and replay mechanism inside W4 without owner approval
D. Count container startup and unit tests as live acceptance
X. Other (please specify)

[Answer]: A - Full live evidence bar; the poison/bounded-retry/DLQ/replay exit is a hard completion condition for U04 and the intent (Recommended) - 2026-08-10T20:37:27Z - **Mode:** guided - User response: `A. Full bar; poison gap blocks done (Rec)`

## Ambiguity Analysis Placeholder

After answers are recorded, they will be checked against U04 scope, the actual CMM/Booking/Reference contracts, the Identity capability blocker, provider timeline and idempotency rules, the approved Application Design, and the LinerCore ownership map. Vague or contradictory answers must be resolved before generating `business-logic-model.md`, `business-rules.md`, `domain-entities.md`, and `frontend-components.md`.
