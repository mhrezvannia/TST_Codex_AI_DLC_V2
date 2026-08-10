# User Stories — W4-01 Module List-Detail Uplift

## Story Map and Source Boundary

The 15 stories follow the approved vertical sequence: shared shell and route foundations, Reference Data walking skeleton, Charge Agreements, Container Journeys, verified cross-links, and integrated live acceptance. They consume `requirements.md`, `business-overview.md`, `component-inventory.md`, and `team-practices.md`. A `BLOCKED` contract exit is a dependency, not permission to simulate behavior in the client.

## Cross-Cutting Acceptance Contract

Every story below inherits these criteria unless a stricter story criterion applies:

**Inherited trace:** FR-001, FR-010, FR-011, FR-012, FR-013, FR-019, FR-020, FR-021, FR-022; NFR-001, NFR-002, NFR-003, NFR-004, NFR-005, NFR-006, NFR-007, NFR-008, NFR-009, NFR-010, NFR-011, NFR-012

1. Given any story route, when the experience renders, then it uses the one authenticated LinerCore shell, shared tokens, and `@erp/ui`, with no domain-local shell, theme, auth fallback, or shared-component fork.
2. Given the current subject's server-side Identity decision, when a route or command is requested, then denial is fail-closed with no data flash and read-only ALLOW retains provider truth with mutation commands absent.
3. Given each applicable loading, empty, filtered-empty, populated, denied, not-found, validation, pending, success, conflict/sequence, provider-error, degraded, stale, or partial fixture, when the route or action is exercised, then the matching state appears with safe correlation evidence and no fabricated truth.
4. Given each story's core journey, when it is tested by keyboard, screen reader, reduced-motion mode, and at 375, 390, 768, 1024, and 1440 CSS pixels in light and dark themes, then it meets the approved WCAG 2.1 AA, visible-focus, announcement, reflow, and no page-level overflow checks.
5. Given a recoverable provider or mutation failure, when the user remains on or retries the route, then supported query/form/focus context survives and only authorized persisted last-known data may appear with source/time while freshness-dependent actions remain disabled with a reason.
6. Given a story is presented as accepted, when its evidence is evaluated, then the relevant route, shell integration, responsive/accessibility, performance, changed-code coverage, bounded `u02-security`, `aidlc-audit`, and `erp-fidelity-audit` checks come from the isolated `linercore-wave-a` Compose run rather than static scans, tests alone, or screenshots alone.

## Shared Foundations

### US-001 — Enter only permitted module destinations

**Story:** As a Reference Data Administrator, I want the authenticated shell to show only modules I may read, so that I can enter my operational workspace without seeing inaccessible destinations or leaked data.

- **Priority:** Must Have
- **Trace:** FR-001, FR-012, FR-020, FR-022; NFR-004, NFR-009
- **Dependencies:** Existing shell/session and Identity authorization; W2-02 ownership of shared shell and `@erp/ui`

**Acceptance criteria**

1. Given module-read ALLOW for Reference and DENY for Charge, when the user opens the shell, then Reference is present and Charge is absent from permitted navigation.
2. Given the same DENY, when the user opens a canonical Charge link directly, then the shared denied state renders without provider data flash.
3. Given Reference read ALLOW but mutation DENY, when a Reference record opens, then provider truth remains readable and mutation commands are absent with a concise explanation.

**INVEST:** Independent shell/access slice; negotiable presentation within LinerCore; valuable and estimable from current auth seams; small; testable with ALLOW/DENY fixtures.

### US-002 — Preserve canonical links, safe return context, and retired routes

**Story:** As a Booking Operations User, I want saved and related-record links to resolve predictably and return me to safe list context, so that navigation does not depend on a prior page visit or an unsafe URL.

- **Priority:** Must Have
- **Trace:** FR-002, FR-015, FR-016, FR-017, FR-018; NFR-004, NFR-010
- **Dependencies:** Approved canonical route and Legacy Route Retirement matrices; shared safe-context validator

**Acceptance criteria**

1. Given known Reference, Agreement, and Journey IDs, when each canonical detail URL is opened in a fresh authenticated context and refreshed, then the same exact record renders at the same route.
2. Given validated provider-supported list filters, page, and invoking-row focus, when a user returns from detail, then the canonical list restores that context; missing or invalid context falls back to the canonical list.
3. Given an external, protocol-relative, traversal, encoded-separator, overlong, or unknown return target, when navigation is evaluated, then it is rejected or dropped and never followed.
4. Given each inventoried Charge legacy route, when requested, then it returns the matrix-defined 308 target with only allowed validated query state; malformed, unknown, or ambiguous paths return 404.
5. Given Reference and Container Movement roots, when requested, then Reference replaces its workbench in place and Container Movement creates no fictional legacy redirect.

**INVEST:** Independent route-preservation slice; bounded by exact matrices; valuable for bookmarks and cross-links; small enough for route/redirect tests; fully testable.

## Reference Data Walking Skeleton

### US-003 — Find a Reference record with provider-supported controls

**Story:** As a Reference Data Administrator, I want to choose a reference set and page through its records, so that I can find governed data without client-simulated search or sort.

- **Priority:** Must Have
- **Trace:** FR-003, FR-009, FR-010; NFR-001, NFR-005
- **Dependencies:** Reference set and record-list provider contracts; Reference read capability

**Acceptance criteria**

1. Given provider sets, when `/reference-data` opens, then the set list uses stable `setCode` values and provider enumeration order.
2. Given a selected set, when records load, then `includeInactive`, zero-based provider page, default size 25, clamp 1..100, and fixed case-insensitive display-name order match the provider contract.
3. Given a supported filter/page URL, when refreshed, then the provider receives the same validated query and the list remains stable.
4. Given Reference search and user-selectable sort remain `BLOCKED`, when the record list renders, then those controls are absent and no partial-page client filtering is performed.
5. Given true-empty, filtered-empty, loading, denied, error, degraded/stale, and populated fixtures, when each list state is requested, then it is visibly and accessibly distinguishable from every other state.

**INVEST:** First vertical walking-skeleton list; provider contract fixes scope; user value is immediate discovery; estimable and small; testable with seeded pages/states.

### US-004 — Inspect a stable Reference record and its history

**Story:** As a Reference Data Administrator, I want a shareable record detail with readable summary, attributes, and history, so that I can verify the governed value and its changes.

- **Priority:** Must Have
- **Trace:** FR-002, FR-003, FR-011, FR-021; NFR-002, NFR-010
- **Dependencies:** US-003; provider detail/history endpoints

**Acceptance criteria**

1. Given a selected record, when the user opens `/reference-data/[setCode]/[recordId]`, then Summary, Attributes, and History use provider-owned labelled values rather than raw payload as primary content.
2. Given a direct share or refresh of a canonical Reference detail URL, when the route resolves, then stable set and record identifiers return the same record without prior list state.
3. Given a missing, denied, provider-error, partial-history, or stale fixture, when Reference detail loads, then the matching truthful state appears with safe Retry/reference evidence and preserved tab/list context.
4. Given a valid back context, when the user returns, then the prior set/page/focus is restored.

**INVEST:** Independent read-only detail after list; negotiable visual composition; valuable auditability; small and estimable; testable by route and state fixtures.

### US-005 — Create, validate, and update a Reference record safely

**Story:** As a Reference Data Administrator with the required action capability, I want to create, validate, or update a record, so that governed data changes persist with provider validation and version truth.

- **Priority:** Must Have
- **Trace:** FR-004, FR-013, FR-020; NFR-004, NFR-005, NFR-010
- **Dependencies:** US-004; action-specific `reference-data:create` / `reference-data:update`; granular Validate policy exit

**Acceptance criteria**

1. Given create ALLOW, when valid values are submitted once, then duplicate submission is prevented, provider success is announced, and the created record is re-read from the provider.
2. Given update ALLOW and current provider version, when valid changes are submitted, then the provider persists them and detail/history reflect the new version.
3. Given field validation, version conflict, denial, timeout, or provider rejection, when create or update is submitted, then entered values and logical focus are retained, no false success appears, and the user receives an actionable next step/reference.
4. Given granular Validate and lifecycle authorization remain `BLOCKED`, when the mutation surface renders, then Validate, deactivate, and reactivate commands are absent and their named owner/evidence/exit remains visible in delivery dependencies rather than current implementation scope.

**INVEST:** Each command can be split during delivery but shares one safe mutation grammar; valuable governance outcome; bounded/estimable; testable with capability and provider fixtures.

### US-006 — Recover Reference work without fabricated fallback truth

**Story:** As a Reference Data Administrator, I want a truthful degraded or unavailable state that preserves safe context, so that I can retry my work without mistaking fallback or stale authorization for provider truth.

- **Priority:** Must Have
- **Trace:** FR-011, FR-019, FR-020, FR-021; NFR-004, NFR-005, NFR-010, NFR-011
- **Dependencies:** US-004–US-005; persisted-view metadata contract; current-request Identity decision

**Acceptance criteria**

1. Given the Reference provider is unavailable and an authorized persisted view exists, when record detail loads, then the last-known values show their source/time and all freshness-dependent commands are disabled with a concise reason and Retry.
2. Given the Reference provider is unavailable and no trustworthy persisted view exists, when list or detail loads, then provider error and Retry appear without local fallback records or a fabricated success state.
3. Given Identity is unavailable or denies the current request, when a Reference route is requested, then access fails closed and neither last-known business data nor cached frontend permission grants access.
4. Given a recoverable provider failure followed by service recovery, when the administrator activates Retry, then fresh provider truth replaces the degraded state while supported route, tab, query, and logical focus context are preserved.

**INVEST:** Independent recovery slice; negotiable presentation but fixed truth boundary; valuable continuity; bounded and estimable from current resilience contracts; testable with persisted/no-persisted/Identity fixtures.

## Charge Agreements

### US-007 — Find an Agreement with aligned provider filters

**Story:** As a Pricing Analyst, I want to filter and page Agreements using the current provider contract, so that I can find commercial authority without relying on mismatched BFF controls.

- **Priority:** Must Have
- **Trace:** FR-005, FR-009, FR-010; NFR-001, NFR-005
- **Dependencies:** Reference walking skeleton accepted; Charge list BFF/provider query alignment

**Acceptance criteria**

1. Given seeded Agreements, when the analyst applies `customerId`, `tradeLaneId`, `commodityId`, `status`, `validOn`, or `includeInactive`, then the BFF forwards the validated provider-supported query.
2. Given no explicit page or size, when the Agreement list loads, then it requests provider page 0 and size 25, clamps size 1..100, and retains fixed agreement-number then ID order.
3. Given generic `q`, origin/destination/equipment filters, and selectable sort remain `BLOCKED`, when the Agreement list renders, then those controls are absent and no client substitute is offered.
4. Given a supported query URL and each true-empty, filtered-empty, loading, denied, provider-error, stale/degraded, or populated fixture, when the URL loads or refreshes, then query state survives and the matching result state is distinct.

**INVEST:** Independent Agreement discovery slice; provider-aligned boundary is negotiable only through contract change; valuable and estimable; testable with list fixtures.

### US-008 — Inspect Agreement, version, rate, D&D, and status truth

**Story:** As a Charge Reader, I want a stable Agreement detail that separates current authority from immutable history, so that I can understand commercial terms without changing them.

- **Priority:** Must Have
- **Trace:** FR-002, FR-005, FR-011, FR-012, FR-021; NFR-002, NFR-010
- **Dependencies:** US-007; Charge detail/version/rate contracts; provider-backed D&D mapping or recorded blocker

**Acceptance criteria**

1. Given a known `agreementId`, when detail opens or refreshes, then Summary, Rates, provider-backed D&D, and Status history show labelled provider values and current version selection.
2. Given approved historical versions, when the reader changes version selection or refreshes detail, then history remains visibly immutable and current-state presentation does not rewrite it.
3. Given D&D is absent from the verified provider response, when the D&D section renders, then it shows unavailable/`BLOCKED` and does not synthesize terms from unrelated data.
4. Given missing, denied, partial, stale, or provider-error fixtures, when Agreement detail loads, then record/tab context is preserved and only the matching safe recovery is offered.
5. Given Agreement-to-Booking lacks authoritative `bookingId`, when the related-Booking region renders, then it states `Related bookings unavailable` and performs no reverse search by label, customer, or lane.

**INVEST:** Read-only detail is independently valuable; presentation is negotiable within the contract; bounded and estimable; fixture-testable.

### US-009 — Execute legal Agreement lifecycle and version actions

**Story:** As a Pricing Analyst, I want only legal update, approve, successor, suspend, or expire actions, so that commercial authority changes with provider version and lifecycle safeguards.

- **Priority:** Must Have
- **Trace:** FR-006, FR-013, FR-020; NFR-004, NFR-005, NFR-010
- **Dependencies:** US-008; action capabilities `charge-agreements:update|approve|create-successor|suspend|expire`

**Acceptance criteria**

1. Given action ALLOW and a valid provider lifecycle/version, when the analyst submits the command once, then pending state prevents duplicates and the provider result is announced and re-read.
2. Given an approvable version or valid successor source, when approve or successor is submitted, then the command uses current expected row/version evidence and approved history remains immutable.
3. Given validation, conflict, stale version, denial, timeout, or provider rejection, when a lifecycle command is submitted, then form values/reason and focus remain recoverable with no optimistic lifecycle advance.
4. Given an action capability or provider lifecycle precondition is false, when Agreement detail renders, then the command is absent or disabled with a truthful provider reason and the client does not infer legality.

**INVEST:** Cohesive lifecycle goal with commands splittable in delivery; high user value; current endpoints make it estimable; typed outcomes make it testable.

### US-010 — Review Charge and manual-pricing evidence without mutation

**Story:** As a Charge Reader, I want read-only Agreement and OPEN manual-pricing evidence, so that I can investigate pricing authority without being offered a resolution workflow I do not own.

- **Priority:** Must Have
- **Trace:** FR-006, FR-012, FR-021; NFR-004, NFR-010
- **Dependencies:** US-008; `charge-manual-cases:read`

**Acceptance criteria**

1. Given read ALLOW and mutation DENY, when the Charge Reader opens the same Agreement as an analyst, then provider truth is identical but lifecycle/edit commands are absent.
2. Given OPEN manual cases, when evidence is filtered by reason, Booking reference, and opened range and paged, then the read-only provider ordering and evidence fields are preserved.
3. Given a manual-pricing evidence page, when the Charge Reader inspects a case, then no resolve, close, repricing, or zero-price command appears and `MANUAL_PRICING_REQUIRED` remains evidence rather than invented resolution.
4. Given provider technical evidence and a safe correlation/reference, when a Charge failure or case renders, then technical detail stays collapsed/access-appropriate while actionable text and the safe reference remain available.

**INVEST:** Independent read-only investigation slice; explicitly excludes resolution; valuable to readers; bounded and testable.

## Container Journeys

### US-011 — Discover recent Journeys without simulated controls

**Story:** As a Container Operations User, I want to scan the provider's recent Journeys, so that I can open current work even though search and pagination are not yet supported.

- **Priority:** Must Have
- **Trace:** FR-007, FR-009, FR-010; NFR-001, NFR-005
- **Dependencies:** Reference and Charge sequences accepted; new shell-composed Container Movement frontend; CMM read capability

**Acceptance criteria**

1. Given recent journeys, when `/container-movement` opens, then the BFF derives the actor from the authenticated request and asks the provider for default limit 25, clamp 1..100.
2. Given the provider returns recent journeys, when the list renders, then it preserves fixed provider recent order and stable `journeyId`, and browser input never supplies a local actor.
3. Given search, filter, selectable sort, cursor, and pagination remain `BLOCKED`, when the recent list renders, then those controls are absent and no client simulation is offered.
4. Given loading, true-empty, denied, provider-error, degraded/stale, and populated fixtures, when each recent-list state is requested, then it is distinct and accessible.

**INVEST:** Small discovery slice for the absent frontend; provider contract fixes scope; immediate operator value; estimable/testable with current endpoint.

### US-012 — Inspect a Journey timeline and exact Booking

**Story:** As a Container Operations User, I want a stable Journey detail with one ordered movement timeline and exact linked Booking, so that I can understand shipment progress and its source record.

- **Priority:** Must Have
- **Trace:** FR-002, FR-007, FR-011, FR-014, FR-021; NFR-002, NFR-010
- **Dependencies:** US-011; CMM detail contract and Booking canonical route registry

**Acceptance criteria**

1. Given a known `journeyId`, when detail opens directly or refreshes, then Summary and one ordered Movement timeline show provider `bookingId`, container identity, readable GTOT/LOAD/DISC/GTIN labels, occurred/received time, location/source, and current/required-next meaning.
2. Given verified `bookingId`, when Linked Booking is activated, then exact `/booking/[bookingId]` opens with validated bounded origin context and independent target authorization.
3. Given missing, denied, partial, provider-error, stale, or freshness/dependency fixtures, when Journey detail loads, then it shows the matching provider truth and preserves record context.
4. Given the provider returns movement history and derived state, when Journey detail renders, then it creates no second event timeline or UI-derived status.

**INVEST:** Independent read-only detail/link slice; valuable operational visibility; bounded by current response; estimable and route/state testable.

### US-013 — Capture a movement without optimistic advancement

**Story:** As a Container Operations User with capture authority, I want to submit the next legal movement and understand any rejection, so that Journey and Booking truth advance only after provider acceptance.

- **Priority:** Must Have
- **Trace:** FR-008, FR-013, FR-019, FR-020; NFR-004, NFR-005, NFR-010
- **Dependencies:** US-012; capture action policy; provider `captureEnabled` and `captureDisabledReason`

**Acceptance criteria**

1. Given capture ALLOW, fresh dependencies, and the next legal GTOT/LOAD/DISC/GTIN event, when valid data is submitted once, then duplicate submission is prevented, provider acceptance is announced, and re-read detail contains the persisted movement.
2. Given duplicate idempotency, out-of-sequence event, invalid value, or conflict, when movement capture is submitted, then current status and required next move remain unchanged and the typed reason/reference is announced.
3. Given publication pending or Booking projection lag, when an accepted capture result renders, then the UI distinguishes committed Journey truth from pending downstream application and never reports false end-to-end success.
4. Given capture DENY, `captureEnabled=false`, unavailable/stale Reference data, or another freshness blocker, when Journey detail renders, then the command is absent or disabled with `captureDisabledReason` and Retry where safe.

**INVEST:** Small operator command slice with high value; provider codes constrain negotiation; current contract makes it estimable; accepted/rejected fixtures make it testable.

## Cross-Module Completion

### US-014 — Navigate from Booking only to verified related records

**Story:** As a Booking Operations User, I want the Booking page to link only to relationships that resolve to canonical provider IDs, so that I never land on a guessed Agreement or Journey.

- **Priority:** Must Have
- **Trace:** FR-014, FR-015, FR-016; NFR-004, NFR-005, NFR-011
- **Dependencies:** Existing CMM lookup by `bookingId`; Booking and CMM BFF authorization; Agreement cross-link blockers

**Acceptance criteria**

1. Given a Booking with an existing Journey, when the authorized server/BFF lookup by `bookingId` succeeds, then the UI renders `/container-movement/journeys/[journeyId]` from the provider result.
2. Given no Journey yet or a CMM dependency failure, when the Booking relationship region renders, then it states `Journey not created` for absence or shows Retry for failure without guessing an ID.
3. Given Agreement pricing exposes only `agreementVersionId`, when Booking pricing evidence renders, then it retains that evidence, states `Agreement link unavailable`, and never treats the version ID as `agreementId`.
4. Given Booking-to-Agreement and Agreement-to-Booking exit conditions have not passed, when either owning surface renders, then no link is offered and the additive identifier/projection, scope approval, dual sign-off, and live link-test dependency remains `BLOCKED`.
5. Given target-denial, not-found, direct-link, valid-return, and unsafe-return fixtures, when each related-record navigation is exercised, then it follows the shared shell and safe-context outcome defined by US-001–US-002.

**INVEST:** Independently valuable relationship-safety slice; contract additions remain negotiable blockers; current Journey lookup is estimable; exact/absent/denied/degraded fixtures are testable.

### US-015 — Inspect exact supporting rate-version evidence

**Story:** As a Pricing Analyst, I want to inspect the exact provider rate versions linked from an Agreement, so that I can verify its commercial basis without losing Agreement context.

- **Priority:** Must Have
- **Trace:** FR-005, FR-006, FR-009, FR-011, FR-015; NFR-002, NFR-005, NFR-010
- **Dependencies:** US-008; existing Charge rate list/detail/history contracts; `charge-rates:read`

**Acceptance criteria**

1. Given an Agreement version with provider-owned rate links, when the analyst activates one linked rate, then the exact stable rate/version detail opens with validated Agreement return context.
2. Given the supporting rate list, when the analyst applies provider-supported `q`, `category`, `lifecycle`, `asOf`, `originId`, `destinationId`, `equipmentTypeId`, `page`, or `size`, then the BFF forwards only those validated values and refresh preserves them.
3. Given user-selectable rate sort is unsupported, when the supporting list renders, then no selectable sort control appears and provider ordering remains authoritative.
4. Given a linked rate version and history, when detail loads or refreshes, then labelled provider values, lifecycle, validity, source-version evidence, and immutable approved history render without a UI-derived commercial status.
5. Given denied, missing, provider-error, stale, or safe-return failure fixtures, when linked-rate navigation is exercised, then the matching truthful state appears and Agreement context is preserved or falls back safely.

**INVEST:** Independent read-only rate-evidence slice; presentation remains negotiable within existing contracts; valuable to the Pricing Analyst; bounded/estimable; testable with linked/unlinked/denied/error fixtures.

## Intent Exit Gate (Not a User Story)

This release-wide matrix verifies the combined intent but is excluded from the 15-story INVEST count.

1. Given all five persona/capability fixtures and US-001 through US-015 are individually accepted, when the complete find → inspect → act/recover → cross-link matrix runs, then the three modules share shell/tokens/primitives and interaction grammar while retaining domain vocabulary, sections, controls, and state rules.
2. Given the five approved widths, both themes, keyboard-only, screen-reader, zoom/reflow, reduced-motion, and touch fixtures, when the complete matrix is tested, then every core journey passes the inherited accessibility/responsive contract.
3. Given 10 concurrent local users after documented warm-up, when the recorded performance fixture runs, then p95 BFF list/detail is at most 1,000 ms and p95 route operational readiness is at most 2,500 ms with raw method evidence and no production SLO claim.
4. Given the final W4 change set, when merge gates run, then changed frontend line coverage is at least 80 percent and every required test/type/lint/build/route/shell/Playwright/accessibility/bounded-security/audit gate returns a blocking pass.
5. Given final live acceptance through the approved Compose wrapper, when the manager demo guard, canonical/retired routes, accepted/rejected mutations, and both audits are evaluated before and after, then all required evidence is green or every unresolved capability/link dependency keeps the affected row and intent `BLOCKED`.

## Priority and Dependency Summary

| Sequence | Stories | MoSCoW | Exit condition |
|---|---|---|---|
| Shared foundation | US-001–US-002 | Must Have | Shell access, direct routes, safe context, and retirement matrix proven |
| Reference walking skeleton | US-003–US-006 | Must Have | Real list/detail and supported actions proven; blocked lifecycle controls remain absent |
| Charge Agreements | US-007–US-010 and US-015 | Must Have | Provider-aligned list/detail/action/read-only/rate evidence proven |
| Container Journeys | US-011–US-013 | Must Have | Recent list, stable detail, exact Booking, and capture outcomes proven |
| Cross-module navigation | US-014 | Must Have | Verified links proven; blocked Agreement directions remain explicit |
| Intent exit (not a story) | Combined gate | Must Have | Full live/gate evidence proven; blockers remain explicit |

No Should Have or Could Have story is admitted because the approved W4 slice is already the minimum three-module operational uplift. Saved views, bulk operations, global search, new business behavior, manual-pricing resolution, and production/platform modernization remain Won't Have for this intent.

## Upstream Traceability

- Requirements: `aidlc/spaces/default/intents/260803-module-list-uplift/inception/requirements-analysis/requirements.md`
- Business context: `aidlc/spaces/default/codekb/TST_Codex_W4-01/business-overview.md`
- Components and ownership: `aidlc/spaces/default/codekb/TST_Codex_W4-01/component-inventory.md`
- Team practices: `aidlc/spaces/default/intents/260803-module-list-uplift/inception/practices-discovery/team-practices.md`

## Review — Iteration 1

**Verdict: NOT-READY**

The Execute assessment is justified, and the artifacts honor the selected five personas, 15-story vertical plan, MoSCoW labeling, full FR-001–FR-022/NFR-001–NFR-012 trace coverage, one LinerCore shell/`@erp/ui` ownership, and Reference → Charge → Container order. Provider-control and Agreement-link blockers are generally preserved honestly. Three changes are required before the stories are ready for engineering and QA:

1. **Acceptance criteria do not consistently use the required Given/When/Then form.** Numerous numbered criteria omit the precondition, user/system action, or observable result—for example US-003 AC4–5, US-008 AC2–5, US-011 AC2–4, and US-014 AC4–5. Convert every numbered criterion into a complete, independently executable Given/When/Then scenario; a declarative policy statement alone is not a test case.
2. **US-015 does not satisfy the approved small-story plan or INVEST.** It depends on US-001 through US-014, traces all 34 requirements, covers every persona and product gate, and its Booking Operations actor does not represent the five-persona acceptance matrix. Treat this as release/intent acceptance outside the story count, or replace it with a small actor-valued story and retain the integrated matrix as a separate exit gate.
3. **US-006 turns a blocked contract exit into an implementation story.** Its primary lifecycle commands are unavailable, yet AC2 specifies their post-exit implementation. The approved Q3 plan says blocked exits remain dependencies rather than implementation stories. Keep current truthful command absence in the owning Reference detail/mutation acceptance, and place post-exit deactivate/reactivate behavior in dependency/backlog scope unless change control admits it.

The reported `required-sections` and `upstream-coverage` sensor passes are consistent with the artifacts, but those structural checks do not resolve the testability and INVEST findings above.

## Review — Iteration 2

**Verdict: READY**

All iteration-one findings are resolved. The artifact contains 15 unique standard-format stories, each with MoSCoW priority, dependencies, requirement traceability, an INVEST assessment, and complete Given/When/Then acceptance; all 75 numbered scenarios before the historical review contain an explicit precondition, action, and observable result. FR-001 through FR-022 and NFR-001 through NFR-012 have trace coverage.

US-006 is now a current actor-valued degraded-recovery slice, with blocked Validate/deactivate/reactivate controls kept absent under US-005 and no post-exit implementation admitted. US-015 is a small linked-rate evidence story, while the integrated release matrix is correctly separated as an Intent Exit Gate outside the 15-story INVEST count. The five personas, single LinerCore shell and `@erp/ui` ownership, honest provider/Agreement-link blockers, and Reference → Charge → Container sequence remain consistent with the approved Q&A, requirements, and upstream context. The reported `required-sections` and `upstream-coverage` passes are corroborated by the artifact structure and explicit upstream references.
