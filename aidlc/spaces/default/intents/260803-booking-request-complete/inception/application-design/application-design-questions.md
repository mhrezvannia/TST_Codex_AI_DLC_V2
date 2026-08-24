# W3-04 Application Design Questions

## Context and constraints

These decisions specialize the approved `requirements.md`, `stories.md`, brownfield `architecture.md` and `component-inventory.md`, and `team-practices.md`. They preserve the LinerCore authority in `design-system/linercore/MASTER.md` and `SESSION-PROMPT.md`, plus the approved Refined Mockups interaction and accessibility contracts.

Non-negotiable constraints are: service-owned databases; Booking owns request state and completeness; Reference Data owns canonical reference and voyage schedule data; Charge Management owns pricing; Container Movement Management (CMM) owns post-confirmation equipment-assignment state; `/booking` is canonical; the existing on-premise Compose topology remains canonical; and W3-04 does not modify `packages/ui` or create a local design system.

## Q1. Canonical frontend ownership and route composition

Which brownfield ownership model should W3-04 use?

- **Option A — shell-composed, Booking-owned route subtree (recommended):** Keep `apps/shell/app/booking/**` as the only canonical LinerCore page composition. The UI platform continues to own the root shell/layout and `@erp/ui`; the Booking domain owns the `/booking` route subtree and workflow components. Keep `apps/booking` as the Booking BFF/edge adapter. Convert its duplicate `/bookings/**` pages, and the shell's existing plural routes, to redirects or thin delegates.
- **Option B — extracted Booking UI package:** Move Booking pages/components into a new domain UI package imported by `apps/shell`, while retaining `apps/booking` as BFF only. This makes ownership mechanically explicit but adds a new package and broader import/build changes during W3-04.

[Answer]: Option A — shell-composed, Booking-owned route subtree.

## Q2. Same-record correction route and contract

How should incomplete migrated records and user corrections replace the canonical request on the same booking ID?

- **Option A — dedicated correction route plus full replacement PUT (recommended):** Add `/booking/{bookingId}/correct` as a server-rendered route that initializes and reuses the same Booking-owned request-form composition as create. Add `PUT /api/bookings/{bookingId}` with the complete typed request, `expectedRevision`, idempotency key, actor, and correlation context. Keep W3-03 amendment semantics separate. A successful correction invalidates prior validation/pricing evidence and increments revision atomically.
- **Option B — partial PATCH:** Add a partial update contract. This is smaller on the wire but makes omitted-versus-cleared values and stale pricing invalidation harder to prove.
- **Option C — reuse `/amend`:** Extend the existing amendment endpoint. This minimizes routes but conflates correction of an incomplete request with post-booking commercial amendment behavior.

[Answer]: Option A — dedicated `/booking/{bookingId}/correct` route sharing the request form, with full replacement PUT, expected revision, and idempotency.

## Q3. Reference options and voyage schedule integration

Where should browser option reads and authoritative command validation cross the Reference Data boundary?

- **Option A — Booking facade and port (recommended):** The browser calls only the Booking BFF. The BFF calls a Booking-owned reference-options/schedule facade; the Booking application layer uses its existing Reference Data outbound port for authoritative validation. No browser fan-out, cross-database read, or copied master data is introduced.
- **Option B — browser-side Reference Data fan-out:** The Booking page calls Reference Data separately. This exposes another trust/error boundary to the browser and complicates unified correlation and permissions.
- **Option C — Booking-owned replicated masters:** Copy reference and voyage data into the Booking database. This improves read isolation but violates the approved ownership rule and adds synchronization machinery.

[Answer]: Option A — Booking facade and authoritative Reference Data port.

## Q4. Validation, pricing, and schedule interaction style

Which coordination style should the request lifecycle use before confirmation?

- **Option A — synchronous ports with Booking-owned persisted outcomes (recommended):** Reference/schedule validation and exact pricing remain bounded synchronous calls through Booking outbound ports. Booking persists terminal and uncertain outcomes, fingerprints, timestamps, correlation, and retry state. Only confirmed-booking integration is asynchronous through the outbox. No new workflow orchestrator or cache is added.
- **Option B — asynchronous validation and pricing:** Publish commands and await result events. This increases resilience isolation but adds eventual-consistency UX, correlation state, topics, consumers, and operational burden beyond W3-04.

[Answer]: Option A — synchronous ports with Booking-owned persisted outcomes.

## Q5. Snapshot evolution and relational projection

How should W3-04 make the complete request durable without breaking existing snapshots?

- **Option A — explicit versioned snapshot v2 plus additive projection (recommended):** Treat legacy flat snapshots as v0 and current unversioned `routing`/`equipment` snapshots as v1 during read. Write new complete requests with `schemaVersion: 2`, typed value objects, and an additive relational projection/migration ledger. Upcast on read; never silently fabricate missing required values. Persisted incomplete records remain correctable on the same ID.
- **Option B — continue structural detection and attribute-map expansion:** Add fields to the current JSON/attribute map without an explicit version. This is lower effort but perpetuates ambiguous shape detection and weakens migration/restart evidence.

[Answer]: Option A — explicit versioned snapshot v2 plus additive projection.

## Q6. Confirmation event and CMM handoff

How should the existing `booking.events` journey-creating flow transition to the required `booking.confirmed` pending-assignment contract?

- **Option A — additive versioned handoff (recommended):** Booking atomically commits state, audit, idempotency, snapshot, and outbox. Publish a versioned confirmed-booking payload only on canonical `booking.confirmed`. Add a CMM consumer/application path that stores pending equipment-assignment rows for quantity greater than one with `equipmentId = null`; it creates no journey or synthetic container. Inventory consumers, deploy the new topic/consumer before enabling W3-04 confirmation, never dual-publish one confirmation to the legacy journey path, and retire the legacy topic/path after evidence.
- **Option B — mutate the existing event and consumer in place:** Change `booking.events` payload/behavior directly. This is quicker but creates a rollback and compatibility hazard for unidentified consumers.

[Answer]: Option A — additive versioned `booking.confirmed` handoff.

## Q7. UI state and security boundaries

Should W3-04 retain the established Next.js and BFF security pattern?

- **Option A — retain and extend it (recommended):** Use server-rendered reads and focused client components with local form/action state. Reuse `forwardToBookingBff` and `proxyBooking`, extending explicit route-to-permission checks for read/create/correct/validate/price/confirm. Preserve origin, body-size, timeout, cookie, actor, idempotency, correlation, safe-error, focus, and status-region behavior. Use LinerCore tokens and released `@erp/ui` primitives. Record the approved shared multiline `TextArea`/counter as a W2-02 dependency; W3-04 neither edits `packages/ui` nor creates a local substitute.
- **Option B — introduce a client data/state framework:** Add a query/store framework for the request workflow. This duplicates established server-read behavior and adds a cross-application dependency with no approved need.

[Answer]: Option A — retain and extend the established Next.js/BFF pattern, consuming the W2-02-owned shared `TextArea`/counter when released and never forking it locally.

## Q8. Deployment target and cloud posture

Which infrastructure posture should Application Design assume?

- **Option A — existing Compose topology, no AWS expansion (recommended):** Reuse the current services, PostgreSQL ownership, Kafka/outbox, BFFs, health checks, and observability seams. Specify AWS portability only as a review concern; create no AWS resources or cloud-only dependencies.
- **Option B — introduce managed-cloud dependencies:** Add cloud queues, databases, or orchestration. This contradicts the approved local/on-premise target and expands scope.

[Answer]: Option A — existing Compose topology, no AWS expansion.

## Interaction mode

Choose how to resolve the questions above:

- **Guided recommendations:** accept all recommended Option A answers, then review the completed architecture at the stage gate.
- **Question-by-question:** decide each item interactively before artifacts are generated.
- **Self-guided:** edit each `[Answer]:` line and return when complete.

[Answer]: Guided recommendations — all recommended Option A decisions accepted and revalidated after the Refined Mockups rerun; Q2 and Q7 incorporate the approved correction route and shared `TextArea` dependency.
