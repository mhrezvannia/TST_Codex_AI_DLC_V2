# Units of Work - W2-03 Charge Tariffs & Agreements

## Decomposition Contract

The approved decomposition uses six medium, business-capability vertical units embedded in existing deployables. Unit boundaries derive from Application Design `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, and `decisions.md`, with outcome coverage from `requirements.md` and `stories.md`. Units may touch multiple modules when that is required to produce one independently testable capability; they do not create services, shared UI abstractions, or cross-database ownership.

Complexity is relative within W2-03: M = established patterns with multiple states, L = domain/schema/API/UI coordination, XL = bilateral/cross-service or full live-evidence coordination. Complexity is not an implementation-order recommendation.

## U01 - Rate Authority

**Name:** `U01-rate-authority`  
**Complexity:** L  
**Deployment:** Embedded in existing `charge-agreement-service` and `apps/charge-agreements`.

### Boundary and responsibilities

- Own stable Rate and immutable RateVersion for BASE/OFR, SURCHARGE/BAF, and LOCAL/POL THC.
- Own the entire ordered Charge Flyway chain and files for its one service database: exact-catalog V1, `V2__versioned_rate_authority.sql`, `V3__versioned_agreement_authority.sql`, and `V4__pricing_terminal_evidence.sql`. U01 creates the prepared schema; downstream units must not co-own or rewrite these migration files.
- Enforce Draft edit, successor, Approved immutability, inclusive windows, category-specific applicability, Money/quantity rules, and advisory-lock overlap approval.
- Deliver unified rate list/create/detail and canonical detail `?mode=edit` pages through Charge-owned UI/BFF code.
- Validate active W0-02 references without copying reference authority.

### Delivers and proves

- Create/list one rate per category, update Draft, approve, reject overlap/concurrent approval, create successor, and retain history.
- API/database/UI identities, values, status derivation and audit provenance agree.
- No change to `packages/ui`, shared shell/navigation, typography, or palette.

### Constraints and notes

- Rate approval key: category + charge code + origin + destination-or-empty + equipment.
- Unit rate is `BigDecimal` USD scale two; basis is `PER_CONTAINER`.
- DS-01/02/03 remain named W2-02 dependencies; no local claim converts them to shared PASS.

## U02 - Charge Domain Routing and BFF

**Name:** `U02-charge-domain-routing-bff`  
**Complexity:** M  
**Deployment:** Embedded in existing Charge app, nginx configuration, and Wave A Compose health wiring.

### Boundary and responsibilities

- Set Charge Next `basePath=/charge-agreements`.
- Add exact redirect and path-preserving nginx proxy to the existing Charge app; add base-path healthcheck.
- Preserve all existing nginx locations and Wave A port 18088 while never targeting manager port 8088.
- Provide Charge-local authenticated BFF/session-derived subject, capability, correlation, idempotency and normalized error seams.
- Provide stable App Router loading/error/not-found/denied and URL-state patterns used by Charge pages.

### Delivers and proves

- Direct deep links, reload, assets, BFF calls and browser back/forward work under `/charge-agreements`.
- Spoofed/missing browser actor authority is denied; explicitly capable roles alone receive manual-case metadata.
- Route tests protect `/`, `/auth`, `/reference-data`, `/booking`, and `/bookings` behavior.

### Constraints and notes

- This is Charge domain integration, not a shell/navigation redesign.
- Charge-local dialog behavior may close DS-01 locally; DS-02/DS-03 remain upstream dependencies.
- No RTK seam exists or is introduced; state remains route/query/form-local.

## U03 - Agreement Authority

**Name:** `U03-agreement-authority`  
**Complexity:** L  
**Deployment:** Embedded in existing Charge service/app.

### Boundary and responsibilities

- Own stable Agreement and immutable AgreementVersion history.
- Consume the U01-owned V3 agreement-version/link schema and deterministic legacy `av-` + md5 history backfill; own agreement domain/repository behavior and compatibility verification, not migration-file authorship.
- Link exactly one compatible Approved OFR, BAF and POL THC rate version covering the agreement window.
- Enforce Draft edit, successor, Approved immutability, suspend/expire, exact audit provenance, and advisory-lock overlap approval.
- Deliver agreement list/create/detail/edit/version-history/lifecycle pages through the established Charge route/BFF seam.

### Delivers and proves

- Draft links expose exact rate-version identities; invalid/missing/duplicate/incompatible links fail atomically.
- Approved successor retains prior byte-for-byte authority; suspend/expire excludes only new pricing.
- Concurrent approval produces at most one usable W2 agreement authority.

### Constraints and notes

- W2 match key: customer + lane + origin + destination + equipment. Commodity/weight are deferred; legacy commodity remains readable but is not a discriminator.
- Agreement UI edit remains the approved stable route pattern and status actions require expected version/reason.

## U04 - Pricing Provider and Manual Rate Cases

**Name:** `U04-pricing-provider-manual-cases`  
**Complexity:** XL  
**Deployment:** Embedded in Charge service/app plus the existing bilateral contract catalog.

### Boundary and responsibilities

- Additively evolve the sole `pricing.v1.yaml` `POST /pricing-requests` authority without changing existing types/enums/required fields.
- Resolve exact agreement first; on zero matches resolve complete tariff; never fall through from ambiguity.
- Calculate exactly three ordered lines and total with `HALF_UP` cents using only `requestedDepartureDate`.
- Persist/replay idempotent terminal receipts and one OPEN Charge case for `NO_RATE` or authority ambiguity only.
- Deliver authorized read-only manual-case API/page with no assignment/amount/approval/resolution/closure controls.
- Synchronize OpenAPI/example/provider and Booking consumer/Pact fixtures.

### Delivers and proves

- Agreement-basis, tariff-fallback, no-rate and ambiguity examples are distinguishable and attributable.
- Existing v1 fields remain; enriched success is all-or-none, and deterministic tariff `pricingRef` plus exact source version IDs are exposed.
- Partial automatic results, clock fallback, duplicate cases and failure relabeling are impossible.

### Constraints and notes

- Existing `effectiveDate` remains compatibility input equal to requested departure; mismatch is explicit 422.
- Charge OPEN cases are limited to missing/ambiguous commercial authority, never provider outage.
- Pricing/manual completion consumes U01-owned `V4__pricing_terminal_evidence.sql` fields/dedupe and extends the claim/lease/fenced terminal behavior; U04 does not rewrite the migration.

## U05 - Booking Consumption and Repricing

**Name:** `U05-booking-consumption-repricing`  
**Complexity:** XL  
**Deployment:** Embedded in existing Booking service/app.

### Boundary and responsibilities

- Extend existing PricingPort/Charge adapter and keep `POST /api/bookings/{id}/price` as explicit first-price/Reprice.
- Append typed immutable `booking_pricing_snapshots`, retain legacy flattened decode, and never reconstruct provider amounts/versions.
- Detect pricing-input amendments, advance amendment sequence, expose Reprice, retain prior/current history and keep reconfirm lifecycle-only.
- Render ordered itemisation, total, basis/reference/source versions and historical selectors in the existing Booking pricing region.
- Implement the bilateral two-second/one-retry/operation-level five-consecutive-failure circuit and distinct negative outcome projections.
- Persist Booking-local `MANUAL_PRICING_REQUIRED` outage/no-rate/ambiguity evidence as specified, without inventing a price.

### Delivers and proves

- Known Charge result matches Booking database/API/UI field-for-field.
- Successor-window Reprice appends a new snapshot and preserves the old one.
- No-rate/ambiguity/outage block confirmation and show no total; denied/malformed/validation/conflict/in-progress retain their own semantics.

### Constraints and notes

- Idempotency remains `bookingRef:amendmentSeq`; retry reuses identical body/key.
- Timeout/503/circuit evidence is Booking-local and does not create a Charge OPEN case.
- The unit changes only the existing Booking pricing region, not Booking routes/shell/navigation.

## U06 - Isolated Acceptance and Preservation

**Name:** `U06-isolated-acceptance-preservation`  
**Complexity:** XL  
**Deployment:** Embedded in existing test/evidence scripts and isolated `linercore-wave-a` runtime; no product deployable.

### Boundary and responsibilities

- Prove baseline-shaped Charge/Booking migration, deterministic backfill, restart, forward repair/restore guidance and old snapshot reads.
- Run W0-01, W0-02, W1-01, W2-01 and W2-02 regressions without rewriting the original W1 blocked/waived record.
- Protect manager demo using `npm run demo:guard` before/after; use only `scripts/wave-a-compose.mjs` and project `linercore-wave-a`.
- Capture live agreement price, tariff fallback, successor Reprice, no-rate/manual case, Booking itemisation/history, API/database/correlation proof.
- Capture Playwright screenshots/traces/assertions at 375/768/1024/1440, light/dark, keyboard/focus and required state matrix.
- Measure at least 100 post-warm-up local calls and record raw p99 evidence/environment.
- Run blocking coverage/quality plus `aidlc-audit` and `erp-fidelity-audit`.

### Delivers and proves

- One evidence manifest links every acceptance scenario across API, DB, UI, logs/correlation and command exit codes.
- No fake/hardcoded price survives disabling Charge; no partial/manual total is rendered.
- Manager port 8088/project remain untouched, and any DS-01/02/03 dependency remains honestly blocked rather than mislabeled PASS.

### Constraints and notes

- Local p99 <=800 ms is provisional acceptance evidence, not a production SLO.
- Docker/demo guard/audit evidence is pending until observed; this unit definition makes no advance PASS claim.

## Cross-Unit Constraints

1. Every unit preserves ports-and-adapters and service-owned databases.
2. Contract changes require bilateral Charge-provider/Booking-consumer evidence.
3. Human identity is session-derived; service identity retains existing authorization behavior.
4. Commercial values and customer payloads do not enter logs/metric labels.
5. Shared UI/shell ownership remains with W2-02; W2-03 records Charge-specific behavior only in the Charge page record.
6. Unit completion is independently testable but does not substitute for U06 live release acceptance.

## Upstream Sources

- Application Design: `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, `decisions.md`
- Requirements Analysis: `requirements.md`
- User Stories: `stories.md`

## Architecture Review - Iteration 1

Verdict: **NOT-READY**

Blocking findings preserved from the mandatory reviewer:

1. Numbered within-unit story precedence and recommended parallel development crossed the topology-only boundary into sequencing.
2. U01/U03 migration ownership conflicted with the previously combined Application Design V2 migration.
3. U06's proposed-plan dependency list omitted U01 while the canonical YAML declared it.

### Remediation for Iteration 2

- Replaced ordered story lists with unordered coverage/logical constraints and converted parallel language to a non-prescriptive DAG antichain.
- Revised Application Design and all unit artifacts consistently to V1 baseline, U01-owned V2 rate authority, U03-owned V3 agreement authority/backfill, and U04-owned V4 terminal evidence.
- Aligned the questions/plan table and YAML so U06 directly depends on U01-U05.

Iteration 2 verdict is pending; this verdict will not be rewritten.

## Architecture Review - Iteration 2

Verdict: **READY**

No blocking findings. The reviewer confirmed:

- sequencing recommendations were removed in favor of non-prescriptive topology and unordered coverage constraints;
- the reviewed migration split was coherent across Application Design and units at review time (U01 V2, U03 V3, U04 V4);
- U06 direct dependencies match across questions, prose, diagram, and YAML;
- the six-unit DAG is cycle-free and all 15 stories plus QC-01-QC-03 are covered;
- shared UI/shell ownership and the W1 blocked/waived history remain explicit;
- no pending live evidence is called PASS.

Non-blocking risks remain DS-01/02/03 integrated evidence, date compatibility fixtures, Docker/demo guards, Playwright, performance, and both audits.

### Post-Review Binding-Rule Correction

The reviewer verdict remains READY and is not rewritten. A final rule-layer check found the pre-existing project rule that one explicit unit must own the ordered migration chain/files when multiple vertical slices change one service database. Ownership is therefore tightened without changing migration numbering, schema content, or DAG edges: U01 owns Charge V1-V4 migration files; U03 and U04 consume the prepared V3/V4 schema and own their domain/application behavior. This removes co-ownership and prevents downstream mutation of applied files.
