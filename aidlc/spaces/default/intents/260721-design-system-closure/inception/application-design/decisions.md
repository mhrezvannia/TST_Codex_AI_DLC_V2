# Architecture Decisions — W2-02 Design-System Closure

## Decision Context

These ADRs translate `requirements.md` and `stories.md` into closure architecture while preserving brownfield `architecture.md`, `component-inventory.md`, and `team-practices.md`. All decisions are constrained by baseline `c2f13dd`, one authenticated shell, W2-02 ownership of `packages/ui` and the Booking reference migration, isolated local acceptance, and no backend/cloud redesign.

## ADR-001 — Canonicalize Booking Presentation in the Existing Shell

**Status:** Accepted by Q1  
**Date:** 2026-07-21

### Context

Graph evidence identifies duplicate `BookingCreateForm` implementations in `apps/shell` and `apps/booking`. nginx and the shell client chain already make `apps/shell` the canonical authenticated route owner. Keeping two presentations violates FR-001/FR-003 and the shared-shell contract.

### Options and trade-off

- **Option A — Shell UI + Booking BFF app:** Preserves canonical routing/auth and existing BFF protections; requires retiring or redirecting duplicate standalone pages. Reversible at route composition level.
- **Option B — Keep both UIs:** Lowest immediate deletion but permanently duplicates accessibility, theme, state, and test work. High drift risk.
- **Option C — Standalone Booking canonical:** Reverses W2-01 shell ownership and requires routing/auth redesign. High blast radius.

**Recommendation and decision:** Option A because it closes duplication with the smallest architecture change and preserves security/routing boundaries.

### Consequences

- Positive: one shell/UI proof target; no visual synchronization problem; BFF behavior retained.
- Negative: duplicate standalone page routes must be safely decommissioned or redirected and their tests reconciled.
- Neutral: Booking BFF remains a Next.js application deployment even when its standalone presentation is no longer canonical.

### Alternatives Rejected

Keeping both UIs, making the internal port canonical, and iframe embedding are rejected as incompatible with one shared shell.

### Reversibility

Medium/easy: route/page composition can change later without API or data migration; restoring a second UI would require a new explicit program decision.

## ADR-002 — Keep Generic UI in packages/ui and Domain Composition in the Canonical Route

**Status:** Accepted by Q2  
**Date:** 2026-07-21

### Context

`packages/ui` is low-dependency and already exports the generic tokens/primitives needed by the refined design. Domain compositions carry Booking form fields, lifecycle actions, and route-specific data; moving them into the generic package would invert ownership.

### Options and trade-off

- **Option A — Generic shared, domain local:** Maintains cohesion and package simplicity; canonical shell route owns Booking composition.
- **Option B — Booking compositions in `packages/ui`:** Simplifies imports but pollutes the generic package and couples it to domain types.
- **Option C — New `packages/booking-ui`:** Could share between two UIs but institutionalizes the duplicate frontend problem and expands scope.

**Recommendation and decision:** Option A because it preserves package boundaries and satisfies NFR-006 without premature abstraction.

### Consequences

- Positive: `@erp/ui` stays generic/testable; Booking vocabulary remains with the route.
- Negative: canonical route components remain app-owned and cannot be imported by another app.
- Neutral: a true generic gap may still be added to `packages/ui` with focused tests.

### Alternatives Rejected

Domain components in `packages/ui`, a new Booking UI package, and copied primitives are rejected.

### Reversibility

Easy for generic primitive extraction; hardening a domain package later requires demonstrated multi-consumer need.

## ADR-003 — Preserve Existing BFF, Service, Data, and Event Contracts

**Status:** Accepted by Q3  
**Date:** 2026-07-21

### Context

The current shell → BFF → Booking service path already provides auth context, correlation, idempotency, limits, timeout, validation, pricing, persistence, and async confirmation events. W2-02’s gap is presentation consumption/evidence, not business architecture.

### Decision

Preserve synchronous shell-to-BFF-to-service calls, service-owned databases, support-service adapters, and existing async outbox/Kafka choreography. Do not add a direct service call, shared UI database, new event schema, or presentation-specific backend branch.

Only one option is viable within the named ownership and closure scope. Any observed compatibility defect must be separately traced to a requirement before a minimal correction.

### Consequences

- Positive: smallest blast radius; prior W0/W1/W2-01 behavior remains intact; live evidence exercises the real seam.
- Negative: UI must handle distributed failures rather than bypass them.
- Neutral: existing service performance/scaling remains the baseline; no new SLO is claimed.

### Alternatives Rejected

Direct shell-to-service calls, a new UI read database, and event-driven UI commands are rejected because they bypass security/ownership and add unrequested architecture.

### Reversibility

Locked for this intent; future contract changes belong to separately owned vertical intents.

## ADR-004 — Root-Level Isolated Live Acceptance Harness

**Status:** Accepted by Q4  
**Date:** 2026-07-21

### Context

W2-02 requires Playwright proof, controlled difficult states, responsive/theme/accessibility evidence, negative lint probes, demo protection, and two audits. Production packages should not own environment orchestration or durable release evidence.

### Options and trade-off

- **Option A — Root acceptance harness:** Keeps proof near repository scripts/artifacts, drives the canonical route, and can enforce the Wave A wrapper/guards. Adds focused test-support code only.
- **Option B — Harness inside `packages/ui`:** Couples a generic production package to Compose, routes, and Booking evidence.
- **Option C — Cloud acceptance environment:** Adds credentials, cost, deployment topology, and risk with no requirement.

**Recommendation and decision:** Option A because it is local, reproducible, reversible, and aligned with `team-practices.md`.

### Consequences

- Positive: durable requirement-indexed evidence; production dependencies remain clean; manager-demo checks are explicit.
- Negative: local Compose/browser prerequisites must be documented and failures retained.
- Neutral: controlled request interception is allowed only for rare state variants; happy path stays fully live.

### Alternatives Rejected

Package-owned acceptance, detached component-only evidence, raw Compose commands, and a new AWS environment are rejected.

### Reversibility

Easy: root test/config/evidence helpers can evolve or be removed without production API/data migration.

## ADR-005 — Enforce Presentation Ownership as a Hard Gate

**Status:** Accepted by upstream requirements Q3 and carried forward  
**Date:** 2026-07-21

### Context

Current lint detects Booking TS/TSX hex values but can miss CSS and local `CSSProperties` style systems. A declared `@erp/ui` dependency without rendered consumption is insufficient proof.

### Decision

Extend application presentation enforcement across applicable TS/TSX/CSS, retain explicit exclusions for the owning token package and documented semantic-native elements, verify manifest hygiene, and supply non-writing negative probes. Gate failure is blocking.

### Consequences

- Positive: prevents recurrence; converts design ownership into executable evidence.
- Negative: legacy application debt may surface and must be scoped carefully rather than globally rewritten.
- Neutral: no blanket ban on correct native semantics and no invented formatting/coverage/security policy.

### Alternatives Rejected

Booking-TSX-only checks and reviewer inspection are rejected because they leave the observed loopholes open.

### Reversibility

Easy at rule configuration level, but relaxing the gate requires explicit requirement change because it protects W2-02 closure.

## Decision Summary

| ADR | Decision | Requirement/story trace | Reversibility |
|---|---|---|---|
| 001 | Shell is sole canonical Booking UI; Booking app retains BFF | FR-001–FR-003; US-001–US-003 | Medium/easy |
| 002 | Generic UI shared; Booking composition route-owned | FR-002, FR-007; US-003 | Easy |
| 003 | Preserve BFF/services/data/events | FR-006; NFR-005; US-002 | Locked for intent |
| 004 | Root isolated acceptance harness | FR-009–FR-012; US-004–US-006 | Easy |
| 005 | Hard anti-drift enforcement | FR-008; US-003 | Easy/configured |
