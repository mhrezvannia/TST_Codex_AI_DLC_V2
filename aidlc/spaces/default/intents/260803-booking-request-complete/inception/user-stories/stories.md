# User Stories — W3-04 Booking Request Completeness

Source basis: `requirements.md`, `business-overview.md`, `component-inventory.md`, and `team-practices.md`. Stories preserve the approved scope and LinerCore authority; they do not replace the detailed requirement, contract, or later Refined Mockups specifications.

## Story Plan

| ID | Vertical outcome | Primary persona | Priority |
|---|---|---|---|
| US-01 | PB-01 create/reopen request spine | Booking Desk Agent | Must |
| US-02 | Complete commercial fields and optional round-trip | Booking Desk Agent | Must |
| US-03 | Trust requested and carrier-derived schedule | Booking Desk Agent | Must |
| US-04 | Recover legacy/incomplete records safely | Customer Service Agent | Must |
| US-05 | Validate canonical current facts | Booking Desk / Customer Service | Must |
| US-06 | Price the exact request across provider outcomes | Booking Desk Agent | Must |
| US-07 | Reprice/recover without duplicate effects | Booking Desk / Supervisor | Must |
| US-08 | Confirm once and hand off pending assignment | Booking Desk / Supervisor | Must |
| US-09 | Inspect one canonical operational workflow | All operational personas | Must |
| US-10 | Enforce authorization, privacy, and safe errors | All personas | Must |
| US-11 | Prove the integrated W3-04 outcome | Operational Auditor | Must |
| US-12 | Inspect privacy-safe operational diagnostics | Booking Supervisor | Should |

PB-01 (US-01) is the first gated Construction slice. US-02 through US-11 complete the non-deferrable W3-04 outcome; Delivery Planning may group them into Bolts without changing their priority or acceptance. US-12 cannot displace a Must story.

## US-01 — Create and Reopen the PB-01 Request Spine

**Story:** As a Booking Desk Agent, I want to save and reopen an authoritative booking-request spine with a voyage schedule and equipment quantity greater than one but no physical equipment ID, so that the commercial workflow is proven across the real shell, service, and persistence layers before breadth is added.

**Priority:** Must  
**Required permission:** `create`; reopening additionally requires `read`.  
**Dependencies/owners:** Booking Driver; Shared Platform voyage facts; canonical `/booking` composition in the shared shell; additive Booking persistence. No local `packages/ui` change.

**Acceptance criteria**

1. **Given** an authorized user and current route-compatible canonical options, **when** the user saves a request with quantity `3`, a complete selected-voyage snapshot, and no `equipmentId`, **then** the live Booking stack creates one draft and returns a stable identity/revision. (FR-001, FR-008–FR-010; AC-001)
2. **Given** that draft, **when** it is reopened through `/booking`, **then** the accepted route, requested date, voyage provenance, equipment type, quantity, and null physical identifier round-trip exactly. (FR-004, FR-008–FR-010; NFR-003)
3. **Given** duplicate click/Enter/touch or an uncertain response, **when** the same create identity is reused, **then** no duplicate draft, audit transition, or outbox effect appears. (NFR-002)
4. **Given** loading, validation failure, timeout, or service error, **when** the UI resolves, **then** a stable LinerCore Skeleton or linked recovery state preserves entered values and focus behavior. (FR-025, FR-027; NFR-004, NFR-007)

**INVEST:** Independent first walking skeleton; negotiable internal composition; direct operator value; estimable bounded seams; deliberately thin; testable on live Compose.

## US-02 — Capture the Complete Commercial Request

**Story:** As a Booking Desk Agent, I want to capture all required and optional commercial fields with governed types and bounds, so that the saved request is commercially usable and no accepted fact is lost or guessed.

**Priority:** Must  
**Required permission:** `create` or `correct`, according to operation.  
**Dependencies/owners:** Booking field model/API/snapshot; Reference Data party, commodity, package, location, voyage, and equipment-type authorities; canonical form composition.

**Acceptance criteria**

1. **Given** valid maximum/boundary text and numeric inputs, **when** the request is saved and reopened, **then** normalized customer reference/cargo description, package count/type, KGM gross weight, optional MTQ volume, parties, locations, requested date, voyage, equipment type, and quantity round-trip exactly. (FR-001–FR-005; AC-001, AC-002)
2. **Given** consignee, notify party, or volume is blank, **when** all required fields are valid, **then** the draft remains saveable and those fields do not block completeness; when supplied, each optional value round-trips exactly. (FR-001, FR-004, FR-005)
3. **Given** controls, excess length/precision, zero/negative/non-integer counts, mismatched units, unsupported units, or unknown free-text package/commodity values, **when** validation runs, **then** stable linked field errors appear without clearing unrelated input. (FR-002–FR-007; AC-002, AC-003)
4. **Given** quantity greater than one, **when** the request is read through UI and API, **then** quantity remains the requested count and is never collapsed to one or expanded into fabricated physical assignments. (FR-004, FR-021; NFR-003)

**INVEST:** Independent commercial-completeness outcome; value and bounds fixed; cross-layer but focused; objectively testable.

## US-03 — Trust the Requested and Carrier-Derived Schedule

**Story:** As a Booking Desk Agent, I want to compare my requested departure with an authoritative confirmation-grade voyage schedule, so that I understand variance and never confirm guessed or stale milestones.

**Priority:** Must  
**Required permission:** `create`/`correct` for selection and `read` for inspection.  
**Dependencies/owners:** Shared Platform owns versioned voyage authority; Booking owns selection validation and minimum schedule snapshot; UI renders provenance.

**Acceptance criteria**

1. **Given** a requested POL-local date and a route-compatible voyage whose ETD-local date differs, **when** the voyage is selected, **then** both values and their variance are shown and persisted without overwriting or invented tolerance. (FR-008, FR-010; AC-004)
2. **Given** current carrier voyage number, timezone-aware ETD/ETA, cargo cutoff, and documentation deadline, **when** the request is reopened after save/confirm, **then** the displayed snapshot matches the selected voyage ID/version and preserves correct temporal order. (FR-009, FR-010; AC-004)
3. **Given** an absent, partial, stale, route-incompatible, or temporally inconsistent voyage, **when** the user saves and later attempts a dependent action, **then** the draft remains recoverable, the exact safe reason is shown, and confirmation is blocked with no guessed milestone. (FR-009; AC-005)
4. **Given** one Reference Data subset is degraded, **when** the user corrects another unaffected section, **then** unrelated values remain usable and only the dependent action blocks. (FR-027; NFR-004)

**INVEST:** One trusted-schedule outcome; Shared contribution explicit; measurable through source/version and negative cases.

## US-04 — Correct Legacy and Incomplete Requests Safely

**Story:** As a Customer Service Agent, I want legacy or incomplete requests to explain missing authority and remain correctable on the same record, so that migration never fabricates customer, cargo, schedule, equipment, or pricing facts.

**Priority:** Must  
**Required permission:** `read` and `correct`.  
**Dependencies/owners:** Booking versioned snapshot/projections/Flyway ledger and UI correction flow; no Reference Data value may be inferred unless authoritative.

**Acceptance criteria**

1. **Given** representative pre-W3 snapshots, **when** additive readers/upcasters run, **then** authoritative facts are preserved, unsupported facts carry explicit incompleteness reasons, and no W3 default or synthetic identifier is introduced. (FR-011–FR-013; AC-006)
2. **Given** migration/backfill executes twice and the service restarts, **when** ledger/projection results are compared, **then** outcomes are restartable, idempotent, and stable with source/target version, safe reason, and baseline-drift protection. (FR-011, FR-013, FR-014; AC-006)
3. **Given** a legacy-incomplete record, **when** an authorized agent corrects required facts, **then** the same booking identity/revision chain becomes eligible for validation rather than a replacement draft being created. (FR-012, FR-014; AC-006)
4. **Given** a migration or correction conflict, **when** the latest revision is refreshed, **then** non-sensitive conflict context is shown and no silent overwrite occurs. (FR-015, FR-027; NFR-002)

**INVEST:** Independently valuable recovery path; additive technical means negotiable; bounded by one record lineage; migration and UI cases executable.

## US-05 — Validate Canonical Current Facts

**Story:** As an authorized Booking Desk or Customer Service Agent, I want to validate the current request against live governed references and completeness rules, so that pricing and confirmation use current authoritative facts.

**Priority:** Must  
**Required permission:** `validate` independently of read/create/correct/price/confirm.  
**Dependencies/owners:** Booking completeness/authorization; Reference Data OHS for party roles, commodity, package, location, voyage, and equipment type.

**Acceptance criteria**

1. **Given** complete active references with permitted party roles and current versions, **when** Validate is invoked, **then** every governed reference and schedule precondition passes for the exact current revision. (FR-006–FR-010, FR-019; AC-003)
2. **Given** inactive, stale, unknown, role-incompatible, or route-incompatible references, **when** validation runs, **then** exact field/reason errors link to persistent labels, the draft remains, and pricing/confirmation remain blocked. (FR-007, FR-009, FR-030; AC-003, AC-005)
3. **Given** a user with read but no validate permission, **when** Validate is attempted through UI or API, **then** the action is absent or denied server-side before protected dependency work, without revealing additional record/provider facts. (FR-028–FR-030; AC-012)
4. **Given** a validated revision changes in a pricing-determining field, **when** detail reloads, **then** validation/pricing currency is invalidated and FR-015 selects Validate or Correct as applicable. (FR-015, FR-017)

**INVEST:** One lifecycle decision; authority clear; narrow command; testable positive/negative/permission/staleness cases.

## US-06 — Price the Exact Current Request

**Story:** As a Booking Desk Agent, I want Charge to price the exact validated request and return a state-specific recovery, so that I can trust the itemised total and never accept a guessed commercial result.

**Priority:** Must  
**Required permission:** `price`.  
**Dependencies/owners:** Booking pricing fingerprint/snapshot and BFF; Charge provider authority; executable Booking→Charge contract verification.

**Acceptance criteria**

1. **Given** a complete validated request with quantity `3`, **when** Price is invoked, **then** captured Charge input exactly matches customer, commodity, POL/POD, equipment type, requested date, quantity, USD, and required trade-lane authority, with no `NA-EU`, `commodity-general`, or other fallback. (FR-016; AC-007)
2. **Given** a priced response, **when** Booking stores/displays it, **then** itemised lines scale by quantity and the immutable authority, basis, currency, total, fingerprint, and correlation are preserved. (FR-018; AC-007)
3. **Given** pending/outcome-unknown, explicit unavailable/timeout, manual/no-rate/validation, denied, malformed, conflict, or replay, **when** each outcome is exercised, **then** the UI exposes exactly Refresh, Retry-once, Correct, safe denied, Inspect-correlated-block, Refresh-latest, or prior-recorded outcome as specified in FR-018, reusing the identity and creating no duplicate request. (FR-015, FR-018; AC-008)
4. **Given** provider error or degraded state, **when** recovery is attempted, **then** request/tab/list context remains and no guessed total is visible. (FR-018, FR-027; NFR-004)

**INVEST:** User-trust outcome; provider implementation negotiable behind contract; bounded lifecycle command; acceptance covers every approved outcome.

## US-07 — Reprice and Recover Without Duplicate Effects

**Story:** As a Booking Desk Agent or Supervisor, I want changed, conflicted, or uncertain pricing work to resolve deterministically, so that only the current request revision can be confirmed and retries never create a second commercial effect.

**Priority:** Must  
**Required permission:** Depends on the exact next action: `correct`, `validate`, or `price`; no bundle is implied.  
**Dependencies/owners:** Booking revision/idempotency/fingerprint authority; Charge replay/conflict semantics; canonical UI action precedence.

**Acceptance criteria**

1. **Given** an authoritative price and a change to customer, commodity, POL/POD, equipment type, requested date, quantity, currency, or required trade-lane fact, **when** the revision saves, **then** the prior price is invalidated and confirmation is blocked until revalidation/repricing. (FR-017, FR-019)
2. **Given** an outcome-unknown request, **when** Refresh is used repeatedly, **then** status resolves against the same identity and no new provider request is issued. (FR-015, FR-018; AC-008)
3. **Given** an explicit unavailable/timeout with no accepted operation, **when** Retry is selected, **then** one bounded retry uses the same request identity and any further uncertain result returns to Refresh rather than duplicating work. (FR-018; NFR-002)
4. **Given** an optimistic conflict, **when** Refresh latest completes, **then** the authoritative revision is shown, input context is preserved where safe, and correction/retry requires an explicit user action against that revision. (FR-015, FR-027; AC-011)

**INVEST:** Separate concurrency/idempotency value; small state machine; no new business scope; deterministic tests.

## US-08 — Confirm Once and Start Pending Assignment

**Story:** As a Booking Desk Agent, I want to confirm a complete, currently priced request exactly once and hand requested equipment to operations without physical IDs, so that CMM can prepare pending assignment truthfully.

**Priority:** Must  
**Required permission:** `confirm`.  
**Dependencies/owners:** Booking confirmation/outbox/event; canonical `booking.confirmed` contract and inventoried channel migration; CMM pending-assignment consumer; Schema Registry compatibility.

**Acceptance criteria**

1. **Given** current completeness, valid references, confirmation-grade schedule, authoritative current price, expected revision, authorization, and idempotency identity, **when** the impact dialog is accepted, **then** it summarizes the booking/customer/route/schedule/equipment count/type/no-ID/revision/price authority before one confirmation. (FR-019)
2. **Given** quantity `3` and no equipment ID, **when** confirmation succeeds or the same command is repeated after uncertainty, **then** one state transition, outbox record, audit transition, and schema-valid `booking.confirmed` event exists. (FR-020, FR-022, FR-023; AC-009)
3. **Given** the event reaches CMM, **when** it is consumed, **then** CMM stores pending requested count/type, creates no synthetic container ID or journey, and awaits later assignment. (FR-022; AC-009)
4. **Given** the inventoried producer/consumer/Compose/verification rollout, **when** compatibility deployment executes, **then** tolerant consumers survive the transition, all authorities converge on `booking.confirmed`, and no indefinite dual publication or undiscovered-consumer PASS is claimed. (FR-020–FR-022; AC-010)
5. **Given** a user without confirm permission, **when** confirmation is attempted, **then** server denial precedes mutation/outbox work and reveals no protected confirmation detail. (FR-028–FR-030; AC-012)

**INVEST:** Clear business handoff; contract and rollout dependencies explicit; one confirmation outcome; exhaustively testable.

## US-09 — Inspect One Canonical Operational Workflow

**Story:** As an operational user, I want one canonical Booking detail experience with exactly one permitted next action and complete recovery states, so that I can understand and progress the request without choosing between divergent frontends.

**Priority:** Must  
**Required permission:** `read`; the selected mutation also requires its own action permission.  
**Dependencies/owners:** Shared shell owns chrome/navigation; Booking owns `/booking` composition and view model; `/bookings` is only redirect/thin delegate; `@erp/ui` owns primitives.

**Acceptance criteria**

1. **Given** `/booking` or a legacy `/bookings` link, **when** a user creates, corrects, validates, prices, confirms, or inspects, **then** one shared-shell composition owns behavior and no second form/detail implementation appears. (FR-024; AC-011)
2. **Given** the current record/provider condition, **when** detail resolves, **then** FR-015 precedence exposes exactly one authorized action—Inspect, Refresh status, Retry once, Correct, Validate, Price, Confirm, or the safe session/list path—and no lower-precedence mutation is substituted. (FR-015, FR-027; AC-011)
3. **Given** Overview, Charges, Journey, or Activity, **when** the user navigates tabs, **then** request completeness, requested/derived schedule provenance, equipment request, reference state, detailed price evidence, lifecycle activity, and privacy-safe collapsed diagnostics appear in their owning section without losing context. (FR-025, FR-026)
4. **Given** every FR-027 state at 375, 390, 768, 1024, and 1440 px and 200% zoom, **when** exercised by keyboard in light/dark themes, **then** the exact mapped recovery/terminal path, visible focus, persistent labels, linked/announced errors, stable layout, reduced motion, and non-color state meaning are observed. (FR-027; NFR-007; AC-011)

**INVEST:** One coherent operator workspace; platform/domain ownership bounded; every state observable and browser-testable.

## US-10 — Protect Actions, Data, and Error Evidence

**Story:** As any Booking user or Auditor, I want every action and diagnostic surface to enforce least privilege and minimize sensitive data, so that recovery and evidence do not disclose customer or cargo information.

**Priority:** Must  
**Required permission:** Independently exercise `read`, `create`, `correct`, `validate`, `price`, and `confirm`; Auditor behavior is read-only unless separately authorized.  
**Dependencies/owners:** Identity/Booking authorization policy; BFF same-origin/session/service-identity boundary; Booking snapshot/event/error/log/evidence shaping.

**Acceptance criteria**

1. **Given** every independent permission combination, **when** the corresponding route/action is attempted, **then** the server enforces the specific permission before protected lookup/mutation and the UI exposes only permitted actions. (FR-028; AC-012)
2. **Given** denied, expired-session, or not-found conditions, **when** the response renders, **then** it exposes no protected existence/payload/provider hint and offers only the safe sign-in/list terminal path. (FR-027–FR-030; AC-012)
3. **Given** a persisted/confirmed request, **when** snapshots/events are inspected, **then** only canonical IDs and the minimum approved code/display/version audit snapshot exist; raw source records are not copied. (FR-029; NFR-005)
4. **Given** validation/provider/conflict/contract failures, **when** logs, traces, metrics, errors, and evidence are captured, **then** safe codes, field identifiers, correlation, retry classification, and status are present while raw party/customer/cargo values and secrets are absent. (FR-030; NFR-005, NFR-006; AC-012)

**INVEST:** Cross-cutting user trust outcome; bounded controls; directly negative-testable; no new policy duration invented.

## US-11 — Prove W3-04 on the Integrated Stack

**Story:** As an Operational Auditor, I want current, intent-tagged evidence for the complete Booking journey and its failure matrix, so that W3-04 cannot be accepted from stale, skipped, mocked, or partial proof.

**Priority:** Must  
**Required permission:** Approved test identities spanning the independent action matrix; evidence review is read-only.  
**Dependencies/owners:** Every contributing owner; isolated Compose environment; contract/migration/browser/security/quality/audit harnesses.

**Acceptance criteria**

1. **Given** the isolated live Compose stack, **when** create→reopen→invalidate/correct→validate→price→confirm→consume→detail and the negative/degraded matrix execute, **then** zero duplicate effects and zero fabricated/lost facts are observed and correlation spans every seam. (NFR-002–NFR-006; AC-013)
2. **Given** every W3-touched module, **when** tests run alongside the changes, **then** evidence records at least 80% line coverage of changed executable production lines plus required domain, mapping, migration/restart, contract, auth/privacy, idempotency/conflict, provider, browser/a11y, and live cases. (NFR-008, NFR-009)
3. **Given** the UI journey, **when** browser evidence runs at 375/390/768/1024/1440 px, 200% zoom, keyboard-only, reduced motion, and light/dark themes, **then** WCAG 2.1 AA behavior and no page-level overflow/overlap/clipping are observed on the real route. (NFR-007; AC-013)
4. **Given** create/read/validate/price/confirm/provider-timeout/UI-recovery paths, **when** evidence is finalized, **then** observed durations and 2.5-second BFF timeout outcomes are recorded as local/non-production without an invented SLO/capacity claim. (NFR-001; AC-014)
5. **Given** any missing live/security/contract/browser/audit prerequisite, **when** the W3-04 manifest is evaluated, **then** the result is BLOCKED rather than PASS; otherwise contract/migration/security/`aidlc-audit`/`erp-fidelity-audit` gates are green and no prior-intent PASS is reused. (NFR-005, NFR-010; AC-013)

**INVEST:** Independent evidence outcome and exit gate; implementation tools negotiable; scope fixed; binary acceptance.

## US-12 — Inspect Privacy-Safe Diagnostics

**Story:** As a Booking Supervisor, I want concise privacy-safe diagnostics for recoverable exceptions, so that I can coordinate support without exposing raw business payloads or turning technical details into the primary workflow.

**Priority:** Should  
**Required permission:** `read`; no additional diagnostics entitlement is introduced by W3-04.  
**Dependencies/owners:** Booking view model/log/error contract and existing LinerCore disclosure primitives; missing shared primitive is a UI Platform dependency and remains BLOCKED.

**Acceptance criteria**

1. **Given** a provider, reference, conflict, migration, or contract exception, **when** diagnostics are expanded, **then** safe reason code, correlation, revision/provider state, and next owner are shown without raw party/customer/cargo payloads, credentials, Kafka body, or schema dump. (FR-026, FR-030; NFR-005, NFR-006)
2. **Given** diagnostics are collapsed, **when** the main page is scanned or navigated by keyboard, **then** the business status and one next action remain primary and focus restore works.
3. **Given** a user lacks `read`, **when** detail or its diagnostics are requested, **then** the existing denied/session boundary applies before protected lookup and exposes no record-existence, payload, provider, or hidden-content hint. (FR-028–FR-030; AC-012)

**INVEST:** Support-speed value separate from core flow; uses existing primitives; small disclosure behavior; privacy/a11y testable.

## Requirements and Acceptance Traceability

| Requirement / acceptance range | Stories |
|---|---|
| FR-001–FR-005; AC-001–AC-002 | US-01, US-02 |
| FR-006–FR-007; AC-003 | US-02, US-05 |
| FR-008–FR-010; AC-004–AC-005 | US-01, US-03, US-05 |
| FR-011–FR-014; AC-006 | US-04 |
| FR-015–FR-019; AC-007–AC-008 | US-05, US-06, US-07, US-09 |
| FR-020–FR-023; AC-009–AC-010 | US-08 |
| FR-024–FR-027; AC-011 | US-01, US-03, US-06, US-07, US-09 |
| FR-028–FR-030; AC-012 | US-05, US-08, US-09, US-10 |
| NFR-001; AC-014 | US-11 |
| NFR-002–NFR-010; AC-013 | US-01, US-04, US-06–US-11 |
| FR-026, FR-028–FR-030; NFR-005–NFR-006; AC-012 | US-12 |

No story covers a Won't-Have item. Physical assignment/amendment/reconfirmation, cancellation, multi-leg routing, reefer/DG, multi-currency, special equipment, shipping documentation, allocation policy, external portals, AWS, program compliance decisions, local themes, a second Booking frontend, guessed schedule facts, fabricated identifiers, and weakened live gates remain out of scope.

The efficient-prefill/provenance-help Should candidates and recent-choice Could candidate named in `scope-document.md` are not decomposed into executable User Stories because `requirements.md` does not yet define their product behavior or acceptance. They remain deferred backlog candidates and require a future Requirements approval before implementation; they cannot enter W3-04 Delivery Planning by implication.

## Dependency and Ownership Rules

- Booking remains the Driver and owns request/completeness/persistence/lifecycle/UI composition.
- Shared Platform contributes canonical party/package/voyage facts; Charge owns pricing authority; CMM owns pending-assignment consumption; UI Platform owns shell and shared primitives.
- Dependencies are contributions inside vertical operator outcomes, not horizontal user stories or invented service personas.
- A missing shared primitive, Shared Platform fact, Charge behavior, CMM contract, or external consumer inventory is BLOCKED and returns to an approval gate; no local copy, guessed value, silent dual publication, or second canonical UI is permitted.

## Review

**Verdict: READY**

- The 12-story backlog is buildable, INVEST-aligned, vertically sliced, correctly prioritized, and bounded to approved W3-04 requirements; unapproved prefill/help and recent-choice candidates are explicitly deferred from Delivery Planning.
- Personas are goal-based and operationally credible without inventing role bundles. Each protected outcome states approved action permissions, contributing owners/contracts, degraded-state behavior, and a testable customer or control benefit.
- Requirement and acceptance coverage is complete enough for engineering and QA: Must outcomes cover the full request-to-confirmation/live-proof path, diagnostics remains a traced Should refinement under `read`, and responsive/a11y evidence consistently includes 375, 390, 768, 1024, and 1440 px plus 200% zoom.
- `required-sections` and `upstream-coverage` passed for `stories.md`, `personas.md`, and `user-stories-assessment.md`.
