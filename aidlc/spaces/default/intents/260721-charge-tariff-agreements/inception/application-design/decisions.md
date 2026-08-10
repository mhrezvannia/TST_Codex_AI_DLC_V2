# Architecture Decisions - W2-03 Charge Tariffs & Agreements

## Decision Index

| ADR | Decision | Status |
| --- | --- | --- |
| ADR-001 | Extend existing Charge and Booking seams; no new pricing service | Accepted |
| ADR-002 | Model immutable versioned rates and agreements with exact links | Accepted |
| ADR-003 | Agreement-first, complete-tariff fallback, all-or-nothing calculation | Accepted |
| ADR-004 | Additively evolve the sole pricing v1 contract | Accepted |
| ADR-005 | Use explicit synchronous Booking pricing/repricing and immutable snapshots | Accepted |
| ADR-006 | Use ordered service-owned Flyway migrations and transactional idempotency | Accepted |
| ADR-007 | Use Charge-local App Router/BFF pages over existing shared UI | Accepted |
| ADR-008 | Keep current isolated Compose; apply AWS guidance without new infrastructure | Accepted |

## ADR-001 - Extend Existing Bounded Contexts

### Context

The brownfield graph shows an existing Charge service with agreement lifecycle, canonical pricing, manual-case and idempotency seams, plus a Booking `PricingPort`, `ChargePricingPortAdapter`, snapshot codec, and price command.

### Decision

Extend those components in place. Charge remains commercial authority; Booking remains consumer/orchestrator; UI work remains in Charge-owned pages and the minimum existing Booking pricing region.

### Consequences

The slice preserves ports-and-adapters and current deployment boundaries. Refactoring is needed inside existing provisional models, but no umbrella service or duplicate authority is created.

### Alternatives Rejected

| Alternative | Rejection | Reversibility |
| --- | --- | --- |
| Generic pricing microservice | Duplicates Charge authority and adds runtime/ownership complexity. | Hard after contracts/data split. |
| Put calculation in Booking | Violates Charge ownership and future D&D/commercial reuse. | Hard after snapshot logic couples to rates. |

### Security and Reversibility

Existing human/service authorization boundaries remain. Internal Charge components can be refactored behind the unchanged provider boundary; a service split would require a future explicit intent.

## ADR-002 - Immutable Versioned Commercial Authority

### Context

W2-03 requires standalone tariff fallback, approved agreement versions, provenance, successor pricing, and historical immutability. Embedded copied amounts cannot represent reusable tariff authority.

### Decision

Use stable Rate and Agreement identities with immutable versions. Rate categories are BASE/OFR, SURCHARGE/BAF, and LOCAL/POL THC. An approved agreement version links exact approved rate-version IDs, one per category.

### Consequences

Approval and successor workflows become explicit; history is addressable and pricing attribution is exact. Schema, concurrency guards, and migration work increase modestly.

### Alternatives Rejected

| Alternative | Rejection | Reversibility |
| --- | --- | --- |
| Embed copied amounts only in agreements | Cannot support clean standalone fallback or source-version attribution. | Difficult data extraction later. |
| Generic rules engine | Excessive abstraction for three flat per-container categories. | High-cost operational rollback. |

### Security and Reversibility

Stable external reference IDs avoid copied master data. Additive version/link tables permit forward migration and leave prior data readable.

## ADR-003 - Deterministic Agreement-First Resolution

### Context

Pricing must prefer a customer agreement, otherwise use a complete tariff, and never expose partial/ambiguous automatic pricing.

### Decision

Evaluate only `dates.requestedDepartureDate`. The W2 agreement key is customer + lane + origin + destination + equipment; commodity/weight dimensions are deferred. The existing required commodity input may be reference-validated and legacy commodity fields remain readable, but neither participates in W2 approval uniqueness or resolution. Resolve exactly one approved agreement version first. Only zero agreement matches permits tariff resolution; tariff requires exactly one OFR, BAF, and POL THC. Calculate three ordered lines using unit rate x positive quantity, HALF_UP cents, then sum rounded lines.

### Consequences

Successful behavior is predictable and auditable. Missing authority becomes 404 `NO_RATE`; residual ambiguity becomes 422 `PRICING_VALIDATION`; both create/replay one OPEN case and no total. Approval guards reduce ambiguity but runtime remains safe for legacy/concurrent data.

### Alternatives Rejected

| Alternative | Rejection | Reversibility |
| --- | --- | --- |
| Merge agreement and tariff lines | Violates exact agreement authority and makes provenance unclear. | Moderate contract/data cleanup. |
| Partial automatic result | Unsafe commercial total and forbidden by requirements. | Hard once consumed downstream. |
| Server clock fallback | Non-deterministic and contradicts requested departure semantics. | Easy technically, unacceptable behaviorally. |

### Security and Reversibility

No commercial payload is logged. The resolver/calculator remain internal strategies behind application interfaces, so later authority types can be added explicitly without altering historical snapshots.

## ADR-004 - Additive Canonical Pricing v1 Contract

### Context

`contracts/openapi/pricing.v1.yaml` and `POST /pricing-requests` already form the bilateral Booking/Charge authority. Booking currently flattens some provider lines, while W2-03 needs full itemisation and version attribution.

### Decision

Evolve v1 additively and keep the existing media type/path. Existing fields remain required/typed as today: both request dates, numeric `amount`, legacy category enum, and `pricingRef`. The provider resolves only by `requestedDepartureDate`; deprecated `effectiveDate` remains required and must equal it, with mismatch explicitly rejected as 422 rather than silently changing meaning. Add optional schema properties for enriched lines/result, but require the provider to emit that set all-or-none on every W2-03 200. OFR retains legacy `category=FREIGHT` and adds `rateCategory=BASE`. Numeric amounts/unit rates/totals are `BigDecimal` JSON numbers. Agreement `pricingRef` is the exact agreement version; tariff `pricingRef` is a deterministic SHA-256 composite of the three ordered version IDs, which also appear exactly on lines. Synchronize OpenAPI, examples, provider verification and Booking consumer/Pact evidence.

### Consequences

One authority remains and older consumers continue to decode existing fields. Booking selects legacy decode when enriched properties are absent and rejects a partially enriched success. `NO_RATE`, ambiguity, outage, denied, malformed, conflict and in-progress meanings remain distinct.

### Alternatives Rejected

| Alternative | Rejection | Reversibility |
| --- | --- | --- |
| New `/v2/pricing` endpoint | Creates parallel authorities and migration overhead without a breaking need. | Moderate but prolonged dual-run. |
| Opaque response with Booking reconstruction | Loses provider truth and version provenance. | Hard after persisted snapshots. |

### Security and Reversibility

Contract fields contain required commercial data but logs/metrics redact it. Additive optional evolution and legacy decoding provide rollback/read compatibility.

## ADR-005 - Explicit Synchronous Repricing and Append-Only Booking History

### Context

Booking already exposes `POST /api/bookings/{id}/price`; `reconfirm` is a separate lifecycle command. Pricing-affecting amendments require an operator-visible Reprice and prior/current history.

### Decision

Retain the price endpoint as both first-price and explicit Reprice command. The UI labels the action from state. A pricing-input fingerprint advances amendment sequence/marks reprice required only for pricing-affecting changes. Booking calls Charge synchronously through `PricingPort` with key `bookingRef:amendmentSeq`, then appends a typed immutable snapshot. Reconfirm never performs implicit pricing. The Booking Charge adapter composes an outer Resilience4j CircuitBreaker around Retry: Retry performs at most two two-second raw calls total for timeout/503 using the same key/body, and the breaker records one post-retry operation. Window 5/minimum 5/100% opens after exactly five consecutive failed operations; one probe follows 30 seconds, failure reopens and success closes. Exhaustion/open circuit persists Booking-local `MANUAL_PRICING_REQUIRED` outage evidence and no snapshot; this is not a Charge OPEN no-rate/ambiguity case.

### Consequences

No parallel route or workflow ambiguity is introduced. Lost responses replay safely. Prior snapshots remain immutable and comparable. Manual results block automatic confirmation and expose no total.

### Alternatives Rejected

| Alternative | Rejection | Reversibility |
| --- | --- | --- |
| New `/reprice` service route | Duplicates the existing explicit price command without semantic benefit. | Easy, but needless API surface. |
| Reprice inside reconfirm | Conflates lifecycle and commercial command/idempotency. | Moderate cleanup. |
| Async pricing event | Contradicts current critical-path bilateral contract and complicates UI completion. | High operational change. |

### Security and Reversibility

Booking BFF/session and service identity remain unchanged. Snapshot schema versioning and legacy dual-read permit forward repair and safe rollback of the writer.

## ADR-006 - Additive Flyway and Transactional Completion

### Context

Approved versions/snapshots are immutable, approval is concurrency-sensitive, and no-rate replay must not duplicate cases. Charge's older SQL-init shape is insufficient for evolving persisted production-like state; Booking already has a migration strategy.

### Decision

Use ordered additive Flyway migrations in each service-owned database and dual-read legacy Booking snapshots. Charge V1 is the exact current SQL-init catalog. A custom strategy mirrors Booking's exact-catalog fail-closed adoption before baselining V1; partial/drifted schemas abort. V2 creates stable/version rate tables. V3 adds a LEGACY/W2 discriminator to the compatibility header, makes its deferred commodity nullable for new W2 stable identities, creates agreement-version/exact-link/append-only-activity tables, backfills legacy agreements to deterministic `av-` + `md5(id:version)` history marked non-W2-authority, and leaves every existing legacy value/read intact. V4 extends pricing receipts/manual cases with terminal schema/status and a dedupe key while retaining legacy duplicates under `legacy:<caseId>`. Booking adds `booking_pricing_snapshots` keyed by Booking and pricing request. Approval serializes on `pg_advisory_xact_lock(hashtextextended(normalizedApprovalKey,0))`, performs the inclusive overlap query and state transition in one transaction. Charge atomically persists receipt plus priced/manual terminal outcome; Booking atomically appends each request identity once.

### Consequences

Upgrade/restart/fault proof is mandatory and resets are unnecessary. Migration effort rises, but integrity and rollback evidence become executable.

### Alternatives Rejected

| Alternative | Rejection | Reversibility |
| --- | --- | --- |
| Continue mutable SQL init/flattened maps | Cannot prove safe upgrades or immutable typed history. | Increasingly hard. |
| Event-source aggregates | Unjustified new persistence/operational paradigm. | Very hard. |

### Security and Reversibility

DB users remain service-specific. Migrations avoid secrets and destructive reset; restore or forward-repair is documented and tested against baseline-shaped data.

## ADR-007 - Charge-Local App Router and BFF Composition

### Context

Refined mockups require eight stable Charge routes and a Booking pricing seam. W2-02 owns shared UI/shell. Current Charge UI is a minimal workbench. UI design review identified DS-01/02/03 shared gaps.

### Decision

Implement stable App Router pages/loading/error boundaries and authenticated BFF route handlers in `apps/charge-agreements`. Rate Draft editing is canonical `/charge-agreements/rates/[rateId]?mode=edit`, not a ninth route or `/edit` segment. Compose existing `@erp/ui` and LinerCore tokens. Record Charge-only behavior in `design-system/linercore/pages/charge-and-agreements.md`. A Charge-local DS-01 focus wrapper is allowed; DS-02 combobox and DS-03 ribbon metadata remain named W2-02 dependencies. Extend only the existing Booking pricing region.

The mount is explicit: Charge Next config sets `basePath=/charge-agreements`; nginx redirects the exact un-slashed path and preserves `/charge-agreements/` when proxying to `apps-charge-agreements:3000`; Compose health-checks that base-path endpoint and already orders nginx after the app. Wave A exposes nginx on 18088. Existing nginx locations and manager port 8088 are regression-protected. This runtime wiring changes no shared navigation, shell composition, typography, palette, or `packages/ui` source.

### Consequences

URLs, refresh/back navigation, form/error state and ownership are explicit. Some shared a11y/shell proof can remain blocked pending W2-02 integration and may not be called PASS.

### Alternatives Rejected

| Alternative | Rejection | Reversibility |
| --- | --- | --- |
| Single client workbench/direct service calls | Weak route/state evidence and bypasses BFF security. | Moderate. |
| Modify `packages/ui` or shell | Violates Wave A ownership and risks sibling intents. | High merge risk. |
| Introduce RTK | No available RTK seam; project frontend standards prohibit it for this slice. | Adds needless global state. |

### Security and Reversibility

Session-derived subjects and CSRF/idempotency/correlation controls stay in BFF handlers. Charge-local pages/components can be removed without shared design-system rollback.

## ADR-008 - Preserve Runtime Topology

### Context

Acceptance must use the isolated Wave A stack and protect the manager demo on port 8088. No AWS account, region, IaC, or production topology is approved.

### Decision

Keep existing services and Compose topology. Use `scripts/wave-a-compose.mjs`, project `linercore-wave-a`, and demo guards before/after. Apply AWS Well-Architected principles only to portable least-privilege, idempotency, recovery, observability and cost-avoidance decisions.

### Consequences

The vertical slice is demonstrable without cloud expansion. The provisional local p99 target is measured honestly and not presented as a production SLO.

### Alternatives Rejected

| Alternative | Rejection | Reversibility |
| --- | --- | --- |
| New AWS resources/IaC | No approved environment or scope; cannot be accepted locally. | Potentially costly/high impact. |
| New workflow/cache/event service | No requirement and adds failure modes. | Moderate to hard. |
| Use manager stack/port 8088 | Explicitly prohibited; risks the protected demo. | Operationally unsafe. |

### Security and Reversibility

No external infrastructure mutation occurs. All acceptance mutations are confined to the named isolated project and service-owned test data.

## Cross-Decision Tradeoff

The design accepts more schema, domain, contract and test work to preserve authoritative version history, bilateral compatibility, and failure fidelity. It deliberately avoids a more general pricing platform, async workflow, shared UI redesign, or cloud rollout. The result is the smallest end-to-end slice that can prove real Charge-owned itemisation in Booking.

## Upstream Trace

| ADRs | Requirements | Stories/constraints |
| --- | --- | --- |
| ADR-001-ADR-003 | FR-101-FR-307, NFR-003/NFR-010 | US-01-US-07, US-10-US-13 |
| ADR-004-ADR-005 | FR-401-FR-507, NFR-002/NFR-005/NFR-009 | US-06-US-11 |
| ADR-006 | FR-701, NFR-002-NFR-005 | QC-01 |
| ADR-007 | FR-601-FR-606, NFR-004/NFR-006-NFR-008/NFR-010 | US-01-US-05, US-08-US-10, US-12-US-15 |
| ADR-008 | FR-702-FR-706, NFR-001/NFR-009 | QC-02-QC-03 |

## Architecture Review - Iteration 1

Verdict: **NOT-READY**

Blocking findings preserved from the mandatory reviewer:

1. The exact additive v1 wire shape, date/category/numeric compatibility, enriched decode rule, and tariff reference were underspecified.
2. `/charge-agreements` lacked a selected stable edge/proxy mount and regression-protected Compose wiring.
3. Timeout/503/circuit behavior stopped at transient retry instead of the approved Booking-local manual-required outage projection.
4. Flyway adoption, concrete tables/backfill, overlap serialization, and terminal constraints were not implementable enough.
5. Rate Draft edit incorrectly implied an `/edit` path instead of approved `?mode=edit` state.

### Remediation for Iteration 2

- Specified every retained/additive v1 field rule, all-or-none enrichment, dual decode, requested-date compatibility handling, legacy category mapping, numeric representation, and deterministic tariff reference.
- Selected Next `basePath` plus path-preserving nginx mount, Compose health/dependency behavior, isolated port 18088, and regression coverage without shell/navigation redesign.
- Added the exact bounded retry/circuit policy and Booking-local outage evidence/state, explicitly excluding Charge OPEN cases.
- Selected exact Flyway adoption order, tables/keys, deterministic legacy identity/eligibility, advisory-lock approval transactions, receipt/manual dedupe, and Booking snapshot storage.
- Corrected the canonical rate edit state to `/charge-agreements/rates/[rateId]?mode=edit` everywhere.

## Architecture Review - Iteration 2

Verdict: **NOT-READY**

The reviewer confirmed the five iteration-1 blockers were otherwise materially resolved, then found two remaining contradictions:

1. The selected 10-call/50% circuit did not match the binding five-consecutive-post-retry operation rule and left decorator order ambiguous.
2. Commodity incorrectly participated in the W2 agreement key even though the thin slice defers commodity classes.

### Final Correction After Review Limit

- Replaced the breaker with an outer operation-level circuit around the one-retry/two-second call: window 5, minimum 5, 100% threshold, five consecutive post-retry failures, 30-second open interval, one half-open probe, explicit reopen/close behavior.
- Removed commodity from W2 agreement approval and resolution keys. The existing v1 commodity input may still be reference-validated and legacy fields remain readable, but they cannot create distinct W2 authorities.

The configured two-review limit is exhausted, so both NOT-READY verdicts remain explicit. A final lead consistency check and human gate determine whether the corrected design may advance; no verdict is rewritten as READY.

## Lead Consistency Check After Review Limit

The lead checked the final text against the binding bilateral contract and thin-slice intent without issuing a third reviewer verdict:

| Check | Result |
| --- | --- |
| Retry/circuit order and threshold | Exact: two-second call, one retry, outer breaker sees one operation, five consecutive failures, 30-second one-probe half-open. |
| W2 agreement discriminator | Exact: customer/lane/origin/destination/equipment; commodity/weight deferred and legacy-only. |
| Pricing v1 compatibility | Existing required/type/enum fields retained; optional enriched set is runtime all-or-none with legacy/partial decode rules. |
| Edge/runtime ownership | Charge base path and nginx/Compose wiring selected; existing locations and manager port 8088 protected. |
| Failure/case ownership | Charge OPEN cases only for no-rate/ambiguity; outage evidence remains Booking-local. |
| UI ownership/dependencies | Canonical `?mode=edit`; no shared UI/shell redesign; DS-01/02/03 remain honest dependencies. |
| Historical governance | Both NOT-READY reviews and original W1 blocked/waived history remain explicit; no release evidence is called passed. |

Required-section and upstream-coverage sensors pass after these corrections. Human approval is still required to advance.
