# Bolt Plan - W2-03 Charge Tariffs & Agreements

## Planning Contract

This ordered plan translates the six-unit topology from `unit-of-work.md`, `unit-of-work-dependency.md`, and `unit-of-work-story-map.md` into six sequential Construction passes. It follows `team-practices.md`: one stream-aligned intent mob, a separately gated risk-first walking skeleton, tests alongside code, the isolated Wave A runtime, and no unobserved production/cloud claim. Business scope and acceptance come from `requirements.md`, `stories.md`, and refined `mockups.md`; component boundaries come from Application Design `components.md`.

A Bolt is one pass through Construction stages 3.1-3.7. B01 intentionally spans partial unit slices to prove the cross-service spine; it does not complete U01/U02/U04/U05 and is never release-ready. B02-B05 complete the approved units. B06 is the only Bolt allowed to claim W2-03 release completion after observed gates.

## Branching and Execution Stance

- Bolts execute sequentially with work-in-progress limit one under the existing `intent/W2-03-charge-tariffs-and-agreements` program branch/worktree context.
- Do not invent a trunk-to-main or parallel Bolt merge style. Any engine-created Bolt refs are merged through the intent branch under the program backlog protocol, then the intent integrates through `integ/main-reconciled`.
- U01 is the single owner of Charge V1-V4 migration files. Later Bolts consume prepared V3/V4 schema and never rewrite applied migrations.
- Each Bolt gate records incomplete dependencies honestly. Passing a component/unit test is not Compose or release evidence.

## Bolt Sequence Summary

| Bolt | Scope | Units completed | Gate purpose |
| --- | --- | --- | --- |
| B01 | One-real-rate cross-layer skeleton using thin U01/U02/U04/U05 slices | none | Validate/falsify the migration-to-Booking architecture before full capability investment. |
| B02 | Complete rate authority and Charge routing/BFF | U01, U02 | Establish the full three-category commercial/routing foundation. |
| B03 | Complete agreement authority | U03 | Establish immutable approved agreement versions and exact links. |
| B04 | Complete full pricing provider and manual commercial cases | U04 | Establish final three-line agreement/tariff authority and no-rate/ambiguity evidence. |
| B05 | Complete Booking consumption/repricing/failure fidelity | U05 | Establish typed history, Reprice and every Booking-visible outcome. |
| B06 | Complete isolated acceptance/preservation | U06 | Observe the complete release DoD, regression, browser, performance, guards and audits. |

## B01 - Real-Rate Walking Skeleton

**Marker:** Walking skeleton - yes; separate user gate; never release completion.  
**Included unit slices:** U01 Rate Authority, U02 Charge Routing/BFF, U04 Pricing Provider, U05 Booking Consumer.  
**DAG exception:** controlled partial-unit risk probe before U03. No Unit is marked complete; B04 later implements agreement-first/full-tariff behavior and absorbs the provisional one-line path.

### Scope

- U01 owns/adopts the complete ordered Charge V1-V4 migration chain and implements the minimum Draft-to-Approved real rate path for one category.
- U02 exposes one stable Charge route/BFF path with session/correlation and the selected base-path/nginx wiring needed by the demo seam.
- U04 uses the existing v1-compatible `charges minItems: 1` shape to return one attributable real line from the Approved rate through canonical `POST /pricing-requests`.
- U05 calls through the existing PricingPort, stores a typed immutable snapshot and renders that one authoritative line in the existing Booking pricing region.
- No hardcoded line, Booking reconstruction, agreement behavior, three-line completion, reprice, manual case, or release claim is included.

### Definition of Done

- A database-backed Approved rate with stable/version identity is created through the real Charge domain/repository path.
- Canonical Charge provider and Booking consumer examples/tests agree on the one enriched line and correlation/idempotency identity.
- Booking persists and returns the exact provider line; the UI renders charge code, category, quantity, unit rate, amount, currency and source version.
- Disabling/breaking Charge prevents success; no fixture/hardcoded fallback appears.
- Migration baseline/upgrade smoke, provider/consumer test, Booking adapter/snapshot test and focused UI test pass.
- On a Docker-capable runner, the thin path is observed through the isolated Wave A stack with demo guards. If that runner is unavailable, B01 remains code-complete but its skeleton gate stays blocked; evidence says so.
- User approves the separate skeleton gate before B02.

### Confidence Hypothesis

If one real Approved Charge rate can traverse persistence, the canonical HTTP contract, Booking's port/codec/database and the existing pricing region without reconstruction, then the riskiest architectural spine is viable. Failure identifies whether migration, provider contract, service authentication, snapshot mapping, UI or runtime access must change before completing the commercial model.

### Expected Demo

Open one Booking, invoke Price, and show one correlated itemised line whose rate-version identity matches Charge API/database evidence. Display the explicit “walking skeleton / not release-ready” label in the evidence record, not in product UI.

## B02 - Complete Rate Authority and Charge Route Foundation

**Marker:** Walking skeleton - no.  
**Included units:** Complete U01 and U02.

### Scope

- Complete BASE/OFR, SURCHARGE/BAF and LOCAL/POL THC version models, applicability, approval overlap/concurrency, successor/history and reference validation.
- Complete unified rate list/create/detail `?mode=edit` pages and all route/loading/error/denied/accessibility states.
- Complete Charge basePath/nginx 18088 mount, authenticated BFF helpers and regression protection for existing routes.
- Retain U01 ownership of V1-V4 migration files; later units consume schema only.

### Definition of Done

- All three categories can be created, edited as Draft, approved, inspected and succeeded without mutating prior versions.
- Category-specific matching, inclusive dates, Money/quantity checks and concurrent-overlap rejection pass at domain/repository/API levels.
- Charge rate routes deep-link/reload/back-forward correctly with session-derived authorization and real API data.
- Nginx/base-path tests protect shell, auth, reference and Booking routes; Wave A port is 18088 and manager 8088 is never targeted.
- Changed code meets the unit coverage/quality threshold; DS-01/02/03 cells remain explicit dependencies where not integrated.

### Confidence Hypothesis

If three commercial rate categories and the Charge-owned route/BFF foundation operate with immutable history and safe approval, downstream agreement and pricing work can consume stable authority without shared-shell or migration churn.

### Expected Demo

Use the Charge rate pages to create/approve OFR, BAF and THC, inspect version history/provenance, and show an overlap conflict plus a successful successor.

## B03 - Agreement Authority

**Marker:** Walking skeleton - no.  
**Included unit:** Complete U03; consumes U01/U02.

### Scope

- Consume U01-owned V3 agreement/link schema without rewriting migration files.
- Complete stable agreement/version domain, exact Approved rate-version links, W2 match key, overlap guard, successor, suspend/expire and legacy history read.
- Complete agreement list/create/detail/edit/history/lifecycle pages through U02 BFF/routes.

### Definition of Done

- A Draft agreement links exactly one compatible Approved OFR, BAF and THC version covering the validity window.
- Approval rejects missing/duplicate/Draft/incompatible/overlap cases atomically and freezes the Approved version.
- Successor and suspend/expire behavior retain old attribution and exclude only new pricing.
- API/database/UI show identical stable/version/link/audit identities with authorization and accessibility states.
- Legacy agreement rows remain readable and non-W2-authoritative as designed.

### Confidence Hypothesis

If an Approved customer agreement can bind exact immutable rate versions and survive successor/lifecycle changes without ambiguity or history rewrite, Charge can become the authoritative agreement-first pricing source.

### Expected Demo

Create and approve an agreement from the three B02 rates, show exact links/history, create a successor, and demonstrate a rejected invalid or overlapping approval.

## B04 - Full Pricing Provider and Manual Commercial Cases

**Marker:** Walking skeleton - no.  
**Included unit:** Complete U04; consumes U01-U03.

### Scope

- Replace the provisional one-line skeleton behavior with final agreement-first and complete three-rate tariff fallback behavior.
- Finalize additive pricing v1 fields, all-or-none enriched decode contract, requested-date rule, deterministic references and provider/consumer fixtures.
- Complete idempotent/fenced terminal receipts and Charge OPEN cases only for no-rate/ambiguity.
- Complete authorized read-only manual evidence API/page with no resolution workflow.

### Definition of Done

- Agreement-basis and tariff-basis calls return exactly three ordered, rounded, attributable USD lines and correct total.
- Missing authority returns 404 `NO_RATE`; residual ambiguity returns 422 `PRICING_VALIDATION`; each creates/replays one OPEN case with no partial result.
- Timeout/503/circuit/denied/malformed/validation/conflict/in-progress meanings are not rewritten.
- Old v1 fixtures validate; equal-date compatibility and partial-enrichment rejection tests pass.
- Provider example, OpenAPI, provider verification and Booking consumer/Pact evidence are synchronized and explicitly reviewed by Charge and Booking hats.
- Manual evidence page enforces explicit capability and exposes no assignment/amount/approval/resolution/closure action.

### Confidence Hypothesis

If Charge deterministically produces the same three-line authority from approved versions and safely persists distinct manual commercial outcomes under replay/concurrency, Booking can consume pricing without commercial inference or partial totals.

### Expected Demo

Call the same context for agreement precedence and tariff fallback, compare exact API/database line/version evidence, then show distinct no-rate and ambiguity cases in the read-only queue.

## B05 - Booking Repricing and Failure Fidelity

**Marker:** Walking skeleton - no.  
**Included unit:** Complete U05; consumes U04.

### Scope

- Complete typed `booking_pricing_snapshots`, legacy decode, full enriched mapping and prior/current history.
- Complete pricing-input fingerprint/amendment sequence, explicit Reprice via existing `/price`, successor-window behavior and reconfirm separation.
- Complete two-second/one-retry/five-consecutive-operation circuit and all Booking-visible negative outcomes.
- Complete existing Booking pricing-region itemisation/history/manual/outage/denied/invalid/pending interactions.

### Definition of Done

- Booking database/API/UI match all Charge lines, total, basis/ref, source versions, requested date, amendment sequence, timestamp and correlation.
- A pricing-affecting amendment exposes Reprice and appends a changed successor snapshot; non-pricing changes do not request price; prior data is unchanged.
- No-rate/ambiguity/outage project `MANUAL_PRICING_REQUIRED` with correct origin/reason and no total; only no-rate/ambiguity link to Charge cases.
- Denied, bad request, other validation, conflict and in-progress remain distinct and block new confirmation/snapshot as specified.
- Circuit composition/order/threshold and retry identity tests pass; reconfirm never prices implicitly.
- Existing Booking route/shell/navigation remains unchanged and the changed pricing region meets focused accessibility/responsive tests.

### Confidence Hypothesis

If Booking can append and compare authoritative snapshots across amendments while preserving every negative outcome's recovery meaning, the bilateral pricing integration is commercially safe and operationally actionable.

### Expected Demo

Show current/prior Booking snapshots before and after a successor-window Reprice, then exercise no-rate and one outage/failure variant with confirmation blocked and no fabricated total.

## B06 - Isolated Release Acceptance and Preservation

**Marker:** Walking skeleton - no; sole release-completion Bolt.  
**Included unit:** Complete U06; consumes U01-U05.

### Scope

- Execute additive migration upgrade/backfill/restart/restore-forward-repair evidence against baseline-shaped data.
- Execute W0-01/W0-02/W1-01/W2-01/W2-02 regressions without altering the historical W1 blocked/waived record.
- Run only `scripts/wave-a-compose.mjs` with project `linercore-wave-a`; run `npm run demo:guard` before and after.
- Observe live agreement, tariff, successor Reprice, no-rate/manual case and Booking breakdown/history with API/DB/UI/correlation evidence.
- Capture Playwright at 375/768/1024/1440 in light/dark with keyboard/focus and the required state matrix.
- Record 100+ post-warm-up raw timings and provisional local p99; run blocking quality/coverage plus `aidlc-audit` and `erp-fidelity-audit`.

### Definition of Done

- Every FR-701-FR-706 and NFR-001-NFR-010 release obligation has linked observed evidence or the Bolt fails.
- Known price and no-rate paths meet provisional local performance evidence with environment/sample/concurrency recorded.
- Both demo guards pass and evidence shows manager port 8088/project were not mutated.
- Playwright/axe/keyboard/theme/viewport evidence is complete; unresolved DS-01/02/03 cells fail or remain blocking, never waived silently.
- All required tests/coverage/contract/migration/regression commands and both audits exit zero.
- The W1 waiver remains a historical waiver; any new live verification is a separate evidence record, not a rewritten PASS.
- User approves the final release gate.

### Confidence Hypothesis

If the complete W2-03 workflow survives baseline migration, isolated runtime, cross-service correlation, browser/accessibility matrices, failure scenarios, performance sampling and both audits without touching the manager demo or prior-wave truth, the intent is genuinely releasable.

### Expected Demo

Run the evidence manifest end to end: administer rates/agreement, price and Reprice a Booking with breakdown/history, produce and inspect one no-rate case, show DB/correlation links, then present guard, Playwright, performance, regression and audit reports.

## Bolt Gate Rules

- B01 has an explicit user gate because it is a walking skeleton and partial-unit DAG exception.
- B02-B05 gates accept completed units but cannot claim intent release.
- Any contract red, destructive migration, shared-owner expansion, unauthorized UI edit, demo-guard failure or missing mandatory reviewer blocks its Bolt.
- B06 cannot start live acceptance without a Docker-capable release-review owner and serialized Wave A window.
- No dates or throughput commitment exist until system/human owners, capacity and environment access are confirmed.

## Upstream Sources

- `requirements.md`
- `stories.md`
- refined `mockups.md`
- Application Design `components.md`
- `unit-of-work.md`
- `unit-of-work-dependency.md`
- `unit-of-work-story-map.md`
- `team-practices.md`

