# Bolt Plan - W1-01 Booking Quote-to-Cash

## Source Alignment

This plan consumes `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and `team-practices.md`, plus the approved `delivery-planning-questions.md`. It preserves the seven-unit DAG and chooses an economic path without changing unit boundaries.

## Planning Stance

- Heuristic: mandatory walking-skeleton-first for B01, risk-first for B02, merge-confidence-first for B03.
- Comparison: ordinal user value, time criticality, risk reduction, and relative size; no fabricated numeric WSJF score.
- Execution: one stream-aligned W1 mob, strictly sequential Bolts.
- Branching: Construction follows the affirmed short-lived Bolt/squash policy with `integ/main-reconciled` as the program target; the current intent worktree remains the conductor/audit record and branch mechanics must preserve the approved Inception artifacts.
- Gates: B01 is always gated. After B01 approval, the standard autonomy ladder selects gated or autonomous execution for B02-B03; failures always halt and ask.

## Bolt Sequence

| Bolt | Name | Units | Walking skeleton | Relative size | Primary economic purpose |
|---|---|---|---|---|---|
| B01 | Real Bidirectional Journey | U01-U05 | Yes, mandatory gate | XL | Retire architecture, schema, migration, consumer, transaction, and minimal UI integration risk while delivering the thin user journey. |
| B02 | Replay and Restart Safety | U06 | No | L | Prove at-least-once delivery, migration, and restart behavior preserve exactly-once business effects. |
| B03 | Live Release Acceptance | U07 | No | M | Convert the working journey into repeatable merge-grade quality, performance, browser, database, topic, and audit evidence. |

## B01 - Real Bidirectional Journey

**Included Units:**

- U01 `booking-draft-skeleton`
- U02 `reference-validation`
- U03 `agreement-pricing`
- U04 `confirm-to-cmm-journey`
- U05 `returned-status-detail`

**Walking skeleton:** Yes. Units execute inside the Bolt in their approved DAG order; the Bolt does not gate until the returned CMM status is visible through the minimal Booking detail path.

**Definition of Done:**

- Compose uses PostgreSQL host port 55432 and passes Docker/image/disk/port/seed preflight.
- The agent creates and reopens one contract-shaped draft, validates against live Reference Data, and receives one real Charge agreement quote or an explicit manual outcome.
- Confirm commits one revision plus canonical outbox event, publishes `booking.confirmed` through the real broker/Schema Registry, and makes no synchronous CMM delivery call.
- CMM deduplicates and opens exactly one journey, then commits and publishes canonical `containermovement.status`.
- Booking consumes and orders the status projection; the stable detail route renders it within the p95 target with pending/unavailable/retry behavior.
- V1/V2 migrations preserve existing data; exact contract/provider/serde and focused backend/frontend tests are green for touched behavior.
- The approved schema rebaseline exception and local broker waiver are evidenced without widening to non-local deployment claims.

**Confidence hypothesis:**

Shipping B01 will prove the frozen pricing and event contracts, brownfield migrations, adopted shared messaging publisher/relay, two service-local consumers, three service databases, and minimal Booking UI can interoperate as one user-visible round trip without Booking-CMM synchronous coupling.

**Expected demo:**

Create, validate, price, confirm, inspect both exact topic records and CMM journey row, then watch returned status appear on `/bookings/{bookingId}` with one correlation chain.

## B02 - Replay and Restart Safety

**Included Unit:** U06 `replay-restart-safety`.

**Walking skeleton:** No.

**Definition of Done:**

- Duplicate and stale `booking.confirmed` deliveries retain one journey and the highest revision.
- Duplicate, late, and out-of-order status events retain one projection and do not regress business state.
- Injected failures roll back receipt/business/outbox state atomically; bounded retries and seven-day service DLT paths are observable.
- Replay preserves event identity and requires the controlled replay authority; DLT backlog limits/alerts are evidenced.
- Charge claim fencing and Booking confirmation idempotency reject conflicting/stale owners and produce one immutable result/event.
- Booking and CMM restart twice with persisted detail intact; V1-to-V2 checksums, backfill, restore/forward-repair, and no-destructive-reset evidence are captured.

**Confidence hypothesis:**

Shipping B02 will prove real at-least-once delivery and process/database restarts preserve exactly-once business effects, rather than relying on happy-path uniqueness.

**Expected demo:**

Replay duplicate/stale records, inject one transactional failure, restart Booking/CMM, and show unchanged logical row counts plus the latest rendered status.

## B03 - Live Release Acceptance

**Included Unit:** U07 `live-release-acceptance`.

**Walking skeleton:** No.

**Definition of Done:**

- Maven suites, Booking frontend lint/typecheck/tests/coverage, Booking/CMM domain-purity checks, contract catalog/provider/schema checks, and root readiness gates are blocking and green.
- Changed backend/frontend line coverage is at least 80 percent and exact contract field names match all executable artifacts.
- Pricing p99 uses 100 warm-up plus 1000 measured requests at concurrency 10; confirm-to-visible-status p95 uses 10 warm-up plus 100 measured journeys at concurrency 5; errors fail the run.
- Browser interactions and desktop/mobile screenshots prove stable routes, keyboard/focus/live-region behavior, responsive text/layout, and no overlap.
- Exact topic JSON, database effects, health/log correlation, restart/replay outcomes, and a no-noop assertion are indexed under `artifacts/w1-01-live/`.
- `.claude/skills/aidlc-audit` and `.claude/skills/erp-fidelity-audit` detectors are green before merge.

**Confidence hypothesis:**

Shipping B03 will prove W1-01 is reproducibly merge-ready on the real local runtime, not merely unit-test green or container-start green.

**Expected demo:**

Run one command/runbook from clean preflight through the full agent journey, performance samples, restart/replay, browser proof, evidence index, and both green detectors.

## Construction Gate Posture

- B01 is the required walking-skeleton gate and must remain interactive.
- Immediately after B01 approval, ask the standard autonomy ladder exactly once.
- B02 and B03 follow that recorded autonomy mode; any failure halts and asks.
- No Bolt may claim completion from mocks, local-noop messaging, outbox rows alone, or container startup.

## Source Coverage

The Bolt DoDs carry acceptance from `requirements.md`, user outcomes from `stories.md`, interaction states from `mockups.md`, ownership from `components.md`, vertical scopes from `unit-of-work.md`, hard edges from `unit-of-work-dependency.md`, exact story mapping from `unit-of-work-story-map.md`, and branch/walking-skeleton/deployment rules from `team-practices.md`.
