# User Stories — W2-03 Charge Tariffs & Agreements

## Planning Basis

These 15 outcome stories implement the reviewed [`requirements.md`](../requirements-analysis/requirements.md) against the brownfield [`business-overview.md`](../../../../codekb/TST_Codex_W2-03/business-overview.md) and [`component-inventory.md`](../../../../codekb/TST_Codex_W2-03/component-inventory.md). They follow [`team-practices.md`](../practices-discovery/team-practices.md): risk-first real-line proof, preserved Charge/Booking boundaries, additive compatibility, 80% changed-code line coverage, and isolated Wave A acceptance. “Must” denotes a direct W2-03 outcome or release-blocking guard; Delivery Planning will decide the formal MVP boundary.

## Rate Authority Stories

### US-01 — Find and inspect Charge authority

**Story:** As a Charge Reader/Auditor, I want stable agreement and rate routes with searchable records, so that I can inspect commercial authority without mutation access.

**Priority:** Must Have  
**Requirements:** FR-003, FR-108, FR-601–FR-603, FR-606  
**Dependencies:** Existing shared shell and reference identities; no shell/navigation or `packages/ui` redesign.

**Acceptance criteria:**

- **Given** explicit Charge-read capability, **when** I directly open, reload, filter, paginate, and navigate back/forward across agreement/rate list/detail routes, **then** real API records and filter context remain stable.
- **Given** no mutation capability, **when** I inspect a record, **then** mutation commands are absent and an explanatory read-only state is present.
- **Given** no Charge-read capability, **when** I open a Charge route, **then** the existing shared denied route appears with no data disclosure.
- **Given** BASE/OFR, SURCHARGE/BAF, and LOCAL/POL THC records, **when** I inspect the unified list, **then** lane/equipment versus origin/equipment applicability is visible without three duplicate page systems.

**INVEST note:** Independently valuable as read-only inspection; testable through routed UI and API evidence; mutation behavior is covered separately.

### US-02 — Create a valid Draft rate version

**Story:** As a Pricing Analyst, I want to create a Draft OFR, BAF, or POL THC rate with exact references and applicability, so that it can become controlled pricing authority after approval.

**Priority:** Must Have  
**Requirements:** FR-001–FR-004, FR-101–FR-106  
**Dependencies:** W0-02 reference identities and authenticated Charge mutation capability.

**Acceptance criteria:**

- **Given** active stable references, **when** I save a Draft rate, **then** its stable rate ID, version identity, category/code, per-container USD unit rate, inclusive dates, applicability, lifecycle, actor, timestamp, and correlation persist and round-trip unchanged.
- **Given** OFR or BAF, **when** I enter applicability, **then** origin, destination, and equipment are required; **given** POL THC, destination is neither captured nor matched.
- **Given** an unknown/inactive reference, negative or over-precision amount, invalid window, or invalid combination, **when** I save/approve, **then** semantic validation is specific and no Approved authority is created.
- **Given** a pending save or validation failure, **when** the UI responds, **then** duplicate submission is blocked, entered values remain, and focus follows the error-summary contract.

**INVEST note:** Small enough to prove one Draft version for any supported category; category match differences remain acceptance data, not separate component tasks.

### US-03 — Approve immutable, non-overlapping rate authority

**Story:** As a Pricing Analyst, I want to approve a valid Draft rate and create successor versions for corrections, so that pricing uses one effective immutable authority while history remains auditable.

**Priority:** Must Have  
**Requirements:** FR-103–FR-108, NFR-002–NFR-003  
**Dependencies:** US-02.

**Acceptance criteria:**

- **Given** a valid Draft, **when** I confirm approval, **then** the version becomes immutable and its Scheduled/Effective/Expired presentation derives from the inclusive window and evaluated business date.
- **Given** overlapping authority for the same matching key, **when** approval is attempted concurrently, **then** at most one version becomes usable and the other receives a deterministic conflict with no partial mutation.
- **Given** an Approved version, **when** a commercial correction is required, **then** a successor Draft is created and the prior version remains byte-for-byte unchanged and addressable.
- **Given** boundary dates, **when** the business date is before, on the first/last day, or after the window, **then** derived state and lookup eligibility match the inclusive-date rules.

**INVEST note:** Separates lifecycle authority from Draft data entry while retaining an observable approval outcome.

## Agreement Authority Stories

### US-04 — Build a Draft agreement from exact approved rate versions

**Story:** As a Pricing Analyst, I want to create a customer agreement version linked to exact approved OFR, BAF, and POL THC versions, so that its commercial basis is complete and reproducible.

**Priority:** Must Have  
**Requirements:** FR-001, FR-004, FR-201–FR-202  
**Dependencies:** US-03 and active customer/lane/equipment references.

**Acceptance criteria:**

- **Given** approved compatible rate versions, **when** I save an agreement Draft, **then** stable agreement identity, immutable version identity/number, customer, lane/equipment, inclusive validity, lifecycle, audit fields, and all three exact rate-version IDs persist.
- **Given** a missing or duplicate category, Draft rate, incompatible applicability, or insufficient effective coverage, **when** I attempt approval, **then** the version remains Draft and the invalid links are identified.
- **Given** an interrupted or invalid save, **when** I return to the form, **then** input is preserved and no partially linked agreement is exposed as approved.

**INVEST note:** Produces one complete Draft aggregate without conflating approval or Booking pricing.

### US-05 — Approve and version an agreement without rewriting history

**Story:** As a Pricing Analyst, I want to approve a unique valid agreement and create successors or suspend/expire it when authorized, so that new pricing uses controlled authority and historical prices retain their source.

**Priority:** Must Have  
**Requirements:** FR-203–FR-205, NFR-002–NFR-003  
**Dependencies:** US-04.

**Acceptance criteria:**

- **Given** a complete compatible agreement Draft, **when** I approve it, **then** validation proves customer/reference identity, applicability, coverage, category completeness, and non-overlap before one immutable Approved version is committed.
- **Given** an Approved agreement, **when** commercial terms change, **then** I create and approve a successor while the prior approved version and linked rate values remain addressable.
- **Given** an authorized suspension or expiry, **when** a later pricing request is evaluated, **then** the version is excluded from new authority resolution while stored historical snapshots retain its attribution.
- **Given** stale or concurrent approval, **when** the command loses the race, **then** the UI preserves context and reports a deterministic reload/review path.

**INVEST note:** One lifecycle outcome with successor and exclusion branches; independently verifiable before Booking integration.

## Booking Pricing Stories

### US-06 — Receive a real agreement-basis itemised price

**Story:** As a Booking Desk Operator, I want Booking to obtain a real three-line agreement price for the requested departure date, so that I can use authoritative commercial terms rather than fixtures or hardcoded values.

**Priority:** Must Have  
**Requirements:** FR-301–FR-305, FR-401–FR-403, FR-501  
**Dependencies:** US-05 and canonical `POST /pricing-requests` contract.

**Acceptance criteria:**

- **Given** one applicable Approved agreement and positive equipment quantity, **when** Booking requests pricing through its existing authenticated pricing port, **then** Charge selects that agreement before tariff authority and uses only its exact linked versions.
- **Given** quantities 1 and greater than 1, **when** Charge calculates, **then** each unit rate × quantity is rounded HALF_UP to USD cents, the total sums rounded lines, and exactly OFR/BASE, BAF/SURCHARGE, and THC/LOCAL are returned.
- **Given** the same request date under different system clocks, **when** pricing runs, **then** the result is identical; missing/invalid requested departure date returns bad-request/validation semantics and no price.
- **Given** live acceptance, **when** correlation is traced, **then** BFF → Booking → Charge uses only `/pricing-requests`, and disabling Charge prevents any fake success.

**INVEST note:** This is the primary thin vertical proof and remains independently demonstrable with one agreement and one Booking.

### US-07 — Fall back to a complete tariff basis

**Story:** As a Booking Desk Operator, I want pricing to fall back to unique effective tariff authorities when no agreement applies, so that eligible Bookings still receive a complete automatic price.

**Priority:** Must Have  
**Requirements:** FR-302–FR-306  
**Dependencies:** US-03 and US-06 contract path.

**Acceptance criteria:**

- **Given** no applicable agreement and exactly one effective OFR, BAF, and POL THC authority, **when** pricing runs, **then** `pricingBasis` is tariff and all three exact source versions produce the itemised result.
- **Given** an applicable agreement and tariff set together, **when** pricing runs, **then** agreement authority wins.
- **Given** any missing or ambiguous tariff category, **when** pricing runs, **then** no partial/zero automatic total or priced snapshot is returned.

**INVEST note:** Negotiable implementation but fixed authority order; separable from agreement proof through controlled data.

### US-08 — Persist and display a typed immutable pricing snapshot

**Story:** As a Booking Desk Operator, I want the Booking pricing region to show and retain the complete itemised result and provenance, so that I can reconcile the commercial total and its authority.

**Priority:** Must Have  
**Requirements:** FR-402–FR-403, FR-502–FR-503, FR-605, NFR-003, NFR-005  
**Dependencies:** US-06 or US-07.

**Acceptance criteria:**

- **Given** successful pricing, **when** Booking persists the result, **then** code, category, basis, quantity, unit rate, line amount, currency, total, pricing basis/reference, source versions, requested departure date, amendment/revision, correlation, and timestamp match the provider response field-for-field.
- **Given** the existing Booking detail, **when** the operator opens pricing, **then** ordered lines and agreement/rate-version provenance are visible without changing Booking navigation ownership.
- **Given** a pre-W2-03 flattened snapshot, **when** it is loaded after migration, **then** it remains readable without destructive conversion or data loss.
- **Given** additive wire fields, **when** contract evidence runs, **then** synchronized OpenAPI/example/provider/Booking-consumer checks pass for the same example.

**INVEST note:** Valuable consumer outcome; typed persistence and rendering share one externally observable snapshot contract.

### US-09 — Reprice a pricing-affecting amendment and retain history

**Story:** As a Booking Desk Operator, I want an explicit Reprice command after a pricing-affecting amendment, so that a successor price is appended without overwriting the original commercial snapshot.

**Priority:** Must Have  
**Requirements:** FR-504–FR-506  
**Dependencies:** US-05 and US-08.

**Acceptance criteria:**

- **Given** an amendment changes a `pricing.request` field, **when** it is saved, **then** amendment sequence advances and Reprice becomes available; a non-pricing change sends no pricing request.
- **Given** approved successor agreement/rate versions effective for the amended requested-departure date, **when** Reprice runs, **then** next revision-aware idempotency identity selects them and appends a changed snapshot.
- **Given** the repriced Booking, **when** I compare current and previous snapshots, **then** both identities, values, amendment sequences, references, and source versions remain distinct and the first snapshot is unchanged.
- **Given** Reprice is pending, **when** I interact, **then** duplicate submission is blocked and `Repricing...` plus completion are announced without unexpected focus movement.

**INVEST note:** One amendment-to-history outcome with explicit negative criterion for non-pricing changes.

## Manual and Failure Stories

### US-10 — Enter manual-pricing-required state when no rate exists

**Story:** As a Booking Desk Operator, I want an explicit manual-pricing-required result when no authoritative agreement or complete tariff exists, so that Booking never treats absence as a zero or guessed price.

**Priority:** Must Have  
**Requirements:** FR-404, FR-407, FR-507  
**Dependencies:** US-06/US-07 authority resolution.

**Acceptance criteria:**

- **Given** neither authority resolves, **when** Charge handles the request, **then** one idempotent OPEN manual case is persisted and HTTP 404 standard code `NO_RATE` is returned.
- **Given** Booking receives `NO_RATE`, **when** it projects the result, **then** exact state `MANUAL_PRICING_REQUIRED`, reason, request/correlation evidence, and no total are visible and automatic confirmation is blocked.
- **Given** identical `bookingRef:amendmentSeq` and body, **when** retried, **then** the terminal outcome replays without duplicate case; conflicting body and live in-progress claim retain their existing conflict/retry semantics.
- **Given** the manual state, **when** the operator inspects actions, **then** no manual quote entry, approval, closure, or resolution is available.

**INVEST note:** Small, testable absence outcome; intentionally excludes a full manual-resolution workflow.

### US-11 — Preserve ambiguity and provider-failure meaning

**Story:** As a Booking Desk Operator, I want ambiguous authority and provider failures to remain distinguishable, so that I can take the safe recovery path without mistaking them for no-rate or success.

**Priority:** Must Have  
**Requirements:** FR-307, FR-405–FR-406, NFR-002  
**Dependencies:** US-10 manual projection and existing bilateral error contract.

**Acceptance criteria:**

- **Given** residual multiple authorities despite approval guards, **when** pricing runs, **then** one OPEN case and HTTP 422 `PRICING_VALIDATION` with ambiguity reason are produced, Booking projects manual state, and the event is not labeled `NO_RATE`.
- **Given** each preserved non-success response, **when** Booking handles it, **then** the following observable state/action contract applies and no row may expose a price or permit automatic confirmation:

  | Provider condition | Booking-visible state/code | Retry or manual action | Confirmation/result rule |
  |---|---|---|---|
  | Consumer timeout | Manual-required outage state with timeout reason | At most one idempotent retry, then queue/flag manual | Block automatic confirmation; no price/snapshot |
  | HTTP 503 | Manual-required outage state with `PRICING_UNAVAILABLE`/503 reason | At most one idempotent retry, then queue/flag manual | Block automatic confirmation; no price/snapshot |
  | Circuit open | Manual-required outage state with circuit-open reason | Skip Charge call; queue/flag manual until half-open policy permits a probe | Block automatic confirmation; no price/snapshot |
  | Denied | Denied state retaining the provider denial code/correlation | Do not retry or label `NO_RATE`; surface authorization recovery | Block confirmation; no price/snapshot/manual-rate case |
  | Malformed request | `PRICING_BAD_REQUEST` integration-error state | Do not retry; require request/client correction | Block confirmation; no price/snapshot/manual-rate case |
  | Semantic validation / commodity eligibility | `PRICING_VALIDATION` or `COMMODITY_NOT_ELIGIBLE` validation state | Do not retry; expose the validation reason | Block confirmation; no price/snapshot; ambiguity alone creates the OPEN case described above |
  | Idempotency body conflict | `IDEMPOTENCY_CONFLICT` conflict state | Do not automatically retry with the conflicting body; preserve current snapshot/context | Block the new confirmation/result; append nothing |
  | Existing request in progress | `PRICING_IN_PROGRESS` pending state with `Retry-After` guidance | Retry only after the supplied guidance; do not start a duplicate claim | No confirmation/new snapshot while pending |
- **Given** restart/fault during terminal completion, **when** processing resumes, **then** atomic claim/result rules prevent partial price, lost result, or duplicate snapshot/case.

**INVEST note:** Groups preserved negative outcomes by shared user value—correct recovery meaning—without redesigning the bilateral contract.

### US-12 — Inspect OPEN manual-case evidence

**Story:** As an authorized Pricing Analyst, I want an evidence-only manual-pricing queue and detail, so that I can investigate missing authority and correlate the affected Booking without an invented resolution workflow.

**Priority:** Must Have  
**Requirements:** FR-003–FR-004, FR-604, FR-606  
**Dependencies:** US-10 or US-11.

**Acceptance criteria:**

- **Given** Pricing Analyst manual-evidence capability, **when** I open `/charge-agreements/manual-pricing` for a no-rate or ambiguity case, **then** one OPEN case exposes Booking/request, reason, matched context, correlation, timestamps, and responsible role queue.
- **Given** an authenticated actor without that explicit capability, **when** the manual-evidence route/API is requested, **then** access is denied with no case disclosure; Charge-read alone does not implicitly grant this entitlement.
- **Given** repeated identical requests, **when** I filter/search the queue, **then** one case appears with stable identity and readable non-color reason/state.
- **Given** the selected case, **when** I inspect commands, **then** only evidence and owned navigation/search links exist; assignment, manual amount, approval, resolution, and closure controls are absent.
- **Given** loading, empty, error, denied, and filter-update states, **when** they occur, **then** the affected region preserves selection/context and announces updates accessibly.

**INVEST note:** Evidence visibility is independently useful and explicitly bounded away from workflow management.

## Cross-Cutting Assurance Stories

### US-13 — Enforce authorization and trace commercial provenance

**Story:** As a Charge Reader/Auditor, I want least-privilege actions and correlation-safe audit provenance, so that every commercial and pricing outcome is attributable without leaking commercial secrets.

**Priority:** Must Have  
**Requirements:** FR-002–FR-004, NFR-004, NFR-009  
**Dependencies:** All mutation and pricing command stories.

**Acceptance criteria:**

- **Given** a valid Pricing Analyst session, **when** a BFF command executes, **then** the actor comes from the signed session; browser-supplied, missing, spoofed, or unauthorized subjects are denied and audited with no mutation.
- **Given** an existing authenticated service boundary, **when** Booking calls Charge, **then** service identity/authorization and non-local fail-closed bypass/secret controls remain intact.
- **Given** commercial mutations and price/manual outcomes, **when** I trace a correlation, **then** stable IDs/versions, actor/service, timestamps, basis, latency, and safe outcome metrics align across API, DB, logs, and UI.
- **Given** observability output, **when** redaction is tested, **then** no customer/commercial secrets or prohibited payload values appear.

**INVEST note:** Cross-cutting but independently verifiable through allowed/denied/spoofed and correlation scenarios.

### US-14 — Complete changed workflows with accessible interaction

**Story:** As any W2-03 operator, I want every changed Charge and Booking pricing interaction to be keyboard- and assistive-technology operable, so that I can complete the workflow and recover from errors without relying on a pointer or color.

**Priority:** Must Have  
**Requirements:** FR-606, FR-705, NFR-006  
**Dependencies:** US-01–US-12 UI outcomes and the existing shared design system.

**Acceptance criteria:**

- **Given** keyboard-only use, **when** I complete create, approve, reprice, filter, and evidence flows, **then** focus is visible/logical, dialogs trap/restore focus, and every command is reachable.
- **Given** invalid input or an asynchronous outcome, **when** the UI updates, **then** persistent labels/error associations, summary focus, non-color state text, and polite live announcements make the result perceivable.
- **Given** loading/skeleton, empty, validation, pending, success, service error/retry, denied/read-only, and manual/no-rate states, **when** each is rendered, **then** semantic structure and recovery actions are testable without hidden content.
- **Given** automated accessibility plus keyboard Playwright checks, **when** the gate runs, **then** no critical/serious violations remain or the story fails.

**INVEST note:** One independently testable interaction outcome across the already-scoped workflows; responsive layout and release evidence are separate.

### US-15 — Use changed views at every required viewport and theme

**Story:** As any W2-03 operator, I want changed Charge and Booking pricing views to retain their primary task across required widths and themes, so that dense commercial data remains usable without hidden actions.

**Priority:** Must Have  
**Requirements:** FR-705, NFR-007  
**Dependencies:** US-01–US-12 rendered outcomes and US-14 semantics.

**Acceptance criteria:**

- **Given** 375, 768, 1024, and 1440 px in light and dark themes, **when** each changed view is exercised, **then** identity, status, evidence, and primary actions remain reachable without page-level horizontal scroll.
- **Given** a dense table at a narrow width, **when** it cannot reflow safely, **then** it uses a labelled keyboard-reachable horizontal region or semantic compact records, never a hidden primary action.
- **Given** long identifiers, reasons, and validation copy, **when** they render at each width/theme, **then** content wraps or scrolls within the named region and shared semantic tokens retain required contrast.
- **Given** the viewport/theme Playwright matrix, **when** any required cell lacks assertion and visual evidence, **then** the story fails rather than recording an implicit pass.

**INVEST note:** Independently estimable responsive-usability outcome with a finite eight-cell viewport/theme matrix.

## Mandatory Release Quality Constraints — Not User Stories

These constraints remain Must-pass release conditions from `requirements.md`. They are deliberately not presented as INVEST user stories or an invented release persona.

### QC-01 — Additive migration, integrity, and compatibility

- **Requirements:** FR-701–FR-702, NFR-002–NFR-005, NFR-010.
- Baseline-shaped data must pass ordered additive Flyway migration, deterministic backfill, restart, and documented restore/forward-repair checks; approved versions and snapshots remain immutable exact decimals; old flattened Booking snapshots and existing consumers remain readable.
- W0-01, W0-02, W1-01, W2-01, and W2-02 contracts/behavior/evidence remain preserved. The original W1 blocked/waived record stays explicitly blocked/waived and separately addressable from any later verified W2-03 proof; new evidence must live in the W2-03 evidence path and must neither replace nor merge into the W1 record.
- Ports-and-adapters, service-owned databases, strict TypeScript, Charge-local UI composition, and additive v1 compatibility remain; no generic pricing service or shared design-system abstraction is introduced.

### QC-02 — Isolated live scenario proof and manager-demo protection

- **Requirements:** FR-703–FR-705.
- Only `scripts/wave-a-compose.mjs` and Compose project `linercore-wave-a` may control acceptance. `npm run demo:guard` runs before and after; port 8088 and the manager project are not targeted or mutated.
- Known agreement pricing, tariff fallback, successor-version reprice, no-rate/manual case, Booking-visible breakdown/history, and required API/database correlation evidence must be linked by one W2-03 manifest.
- Playwright must satisfy US-14 and US-15 with stored assertions/traces/screenshots; missing evidence fails the constraint.

### QC-03 — Measured performance and blocking quality gates

- **Requirements:** FR-706, NFR-001, NFR-008–NFR-009.
- At least 100 post-warm-up known/no-rate calls must retain raw timings, host, concurrency, and sample size and demonstrate provisional local p99 ≤800 ms without claiming a production SLO.
- Changed Charge/Booking code must meet ≥80% line coverage; required domain, migration, contract, integration, UI/browser/live tests and Charge lint/build remain blocking.
- Correlation-safe outcome/latency/basis/manual-fallback telemetry must be evidenced and redaction-tested. `aidlc-audit` and `erp-fidelity-audit` must both exit zero against the observed W2-03 live evidence.

## Dependency and Workflow Map

```text
US-02 -> US-03 -> US-04 -> US-05 -> US-06 -> US-08 -> US-09
             \                   \-> US-07 ----/
              \                              \-> US-10 -> US-12
               \--------------------------------> US-11
US-01 + US-13 + US-14 + US-15 apply across operator paths
QC-01 + QC-02 + QC-03 close only after all direct outcomes are observed live
```

Text fallback: approved rate authority enables agreement authority; agreement and tariff paths feed typed Booking snapshots; snapshots enable repricing; missing/ambiguous authority feeds manual evidence; authorization, accessibility, and isolated acceptance cross-cut every path.

## Requirement Coverage Summary

| Requirement set | Primary stories |
|---|---|
| FR-001–FR-004 | US-02, US-04, US-12, US-13 |
| FR-101–FR-108 | US-01–US-03 |
| FR-201–FR-205 | US-04–US-05 |
| FR-301–FR-307 | US-06–US-07, US-11 |
| FR-401–FR-407 | US-06, US-08, US-10–US-11 |
| FR-501–FR-507 | US-06, US-08–US-10 |
| FR-601–FR-606 | US-01, US-08, US-12, US-14 |
| FR-701–FR-706 | QC-01–QC-03 |
| NFR-001–NFR-010 | US-03, US-05, US-08, US-11, US-13–US-15, QC-01–QC-03 |

No story adds manual quote/resolution, commodity/weight/volume/index/FX pricing, shared-shell/navigation changes, `packages/ui` redesign, production deployment, or a production SLO.

## Review

Iteration: 1  
Verdict: NOT-READY

Findings:

1. **Priority conflicts with the approved release boundary.** `requirements.md` makes every requirement Must Have, but US-01 and US-12 are Should Have while carrying required history/routes and manual-case UI behavior (FR-108, FR-601–FR-604, FR-606). Reclassify them or move every mandatory acceptance outcome into Must stories; an indivisible release cannot defer these requirements.
2. **US-11 does not make the preserved error distinctions testable.** Timeout, 503, circuit-open, denied, malformed, validation, idempotency-conflict, and in-progress are collapsed into “existing distinct status/code/retry/manual behavior.” State the observable Booking state, retry/manual action, confirmation rule, and absence of price for each path required by FR-406.
3. **US-12 introduces an unresolved authorization boundary.** FR-003 authorizes the Pricing Analyst to inspect manual-case evidence, while US-12 also grants it to the Charge Reader/Auditor without a traced capability requirement. Constrain the actor or explicitly trace the read capability and denied behavior; do not create an implicit entitlement.
4. **US-14 and especially US-15 are not Small or independently estimable.** They bundle accessibility matrices, migration, performance, regression, live evidence, coverage, audits, and architecture checks behind dependencies on nearly the whole backlog. Split them into independently testable outcome stories or identify them as release-quality constraints rather than claiming story-level INVEST compliance.
5. **The W1 waiver safeguard is incomplete.** US-15 prevents relabeling the original blocked/waived history as PASS, but FR-702 also requires that record to remain explicitly separate from any later verified proof. Add that separation as an observable acceptance condition.

## Revision After Review Iteration 1

- Reclassified US-01 and US-12 as Must Have because their routed history and manual-evidence outcomes are indivisible requirements.
- Expanded US-11 into an eight-row observable Booking failure matrix covering state/code, retry/manual action, confirmation rule, and absence of price/snapshot.
- Constrained US-12 to the explicitly capable Pricing Analyst and added denied/no-disclosure behavior; Charge Reader/Auditor receives no implicit manual-case entitlement.
- Split accessibility and responsive behavior into independently estimable US-14 and US-15, and moved migration/live/performance/audit obligations into mandatory release quality constraints explicitly not claimed as INVEST stories.
- Required the original W1 blocked/waived record and any later W2-03 verified evidence to remain separately addressable; later proof cannot replace, merge into, or relabel the W1 record.

## Review — Iteration 2

Verdict: READY

No remaining material findings. US-01 and US-12 are Must Have; US-11 defines all eight FR-406 paths with observable state, action, and result rules; US-12 limits manual-case evidence to the explicit Pricing Analyst capability with denied/no-disclosure coverage; US-14 and US-15 are focused accessibility/responsive stories while migration, live proof, performance, and audit obligations are mandatory non-story quality constraints; and QC-01 keeps the original W1 blocked/waived record separately addressable from later W2-03 proof without replacement, merge, or relabeling.
