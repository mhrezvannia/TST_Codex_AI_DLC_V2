# Units of Work - W4-01 Module List-Detail Uplift

## Source Alignment

This decomposition consumes the approved Application Design artifacts `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, and `decisions.md`, plus `requirements.md` and `stories.md`. It preserves ADR-001 through ADR-009, the single W2-02-owned `PlatformShell`, shared LinerCore tokens and `@erp/ui`, feature-local domain composition, service-owned persistence, and the exact provider/BFF contracts. The answered `units-generation-questions.md` selects four medium-grained outcome units, real dependency edges only, approved typed seams, and the existing hybrid brownfield deployment model.

## Slicing Rule (do not remove)

Units are **vertical increments**, not architectural layers. Each unit moves an operator-visible capability through every required layer and can close only through observed behavior on the running isolated stack. Frontend, BFF, provider contract, policy, persistence, integration, accessibility, and failure evidence remain in the same unit when they jointly produce the outcome. Passing layer-local tests is necessary but never sufficient.

U01 is a thin end-to-end platform/Reference route foundation: it proves the shared authenticated shell and route-safety contract through a real Reference Data list-to-detail read reaching the Reference service and owned database. This topology does not select a walking skeleton or implementation order; Stage 2.8 applies the team's walking-skeleton policy and chooses the economic Bolt sequence. The other units deepen distinct domain outcomes without creating a domain-local shell, theme, shared-component fork, service, database, Kafka topic, or AWS resource.

## Units

| Unit | Name | Primary operator outcome | Deployment model | Complexity | Direct dependencies |
| --- | --- | --- | --- | --- | --- |
| U01 | `platform-reference-route-foundation` | Enter a permitted module in the one authenticated shell, find one real Reference record, open/refresh it, and return safely | Embedded platform/shell, edge, Reference app/BFF, Identity, and existing Reference service changes | L | None inside W4; W2-02 shared-shell release is an external blocking prerequisite |
| U02 | `reference-data-operational-completion` | Complete provider-truthful Reference find, inspect, create/update, recovery, and history behavior | Embedded changes to existing Reference app/BFF/service seams | L | U01 |
| U03 | `charge-agreements-operational-uplift` | Find, inspect, act on, and audit Agreements/rates/manual evidence without invented controls or relationships | Embedded changes to existing Charge app/BFF/service and bounded Reference option seam | XL | None inside W4; W2-02 and provider exits are external blockers |
| U04 | `container-journeys-booking-uplift` | Discover and inspect Journeys, capture a legal movement, and navigate the verified Booking/Journey relationship | New CMM frontend deployable plus additive existing CMM service, shell Booking adapter, edge, and Compose changes | XL | None inside W4; W2-02, Identity, CMM and event-control exits are external blockers |

## U01 - Platform and Reference Route Foundation

### Boundary and responsibilities

- Consume, never fork, the W2-02-owned `PlatformShell`, route registry, session/auth plumbing, tokens, and `@erp/ui` primitives.
- Replace Reference's local shell composition for the canonical root and establish the reusable domain-root integration pattern: one landmark tree, active navigation, breadcrumbs, skip link, mobile navigation, light/dark tokens, and fail-closed Identity decisions.
- Preserve `/reference-data` at its prefix/base path and prove direct navigation, asset loading, host-wide session, exact public-edge trust-header clearing/replacement, and target-scoped failure.
- Drive one thin provider-backed path from Reference set list to record list to stable record detail and back, using the approved `ReadResult<T>`, invalid-query, and safe same-module return contract.
- Establish the architecture/contract tests that prohibit domain-app React imports, a second shell/theme, arbitrary return URLs, browser actor authority, and provider calls after DENY.

### Explicit non-responsibilities

- Does not create a W4-owned shared shell, token set, theme, general primitive, API gateway, database, or backend service.
- Does not complete all Reference mutation/degradation states; U02 owns that depth.
- Does not register unsupported controls or pre-announce a module whose route/deployable is unavailable.

### Implementation notes and constraints

- If the required shared shell/registry behavior is absent, the unit remains `BLOCKED` on W2-02 ownership; a local compatibility shell is prohibited.
- Use canonical relative return context only for Reference list/detail. Cross-module signed origin behavior is consumed by U04.
- The live path must use the real authenticated subject, current Identity policy, Reference BFF/provider, and persisted Reference fixture.

### Definition of Done - observed

On the running `linercore-wave-a` stack, an authenticated permitted subject enters `/reference-data` through the only LinerCore shell, reads a real set and record from the Reference-owned service/database, opens and refreshes the stable detail URL, and returns to its validated list/page/focus context. A denied subject sees the shared denied state with no data flash or provider call; unsafe return input is rejected; direct assets/session work under the prefix; and the exact edge trust-header policy is observed. The route is verified at 375, 390, 768, 1024, and 1440 CSS pixels in light and dark themes with keyboard, screen-reader, visible-focus, announcement, and no page-level-overflow evidence. A documented warmed 10-concurrent-user sample records host, samples, failures, percentile method, list/detail BFF p95 <= 1,000 ms, and route-readiness p95 <= 2,500 ms. The evidence names the W2-02 release consumed and contains no local shell/theme/component fork.

## U02 - Reference Data Operational Completion

### Boundary and responsibilities

- Complete provider-authoritative set, record-list, detail Summary/Attributes/History, supported create/update, conflict/version, and recovery behavior.
- Admit only `includeInactive`, provider page/size, fixed provider order, and exact create/update capabilities; keep search, selectable sort, Validate, deactivate, and reactivate absent while their contract exits remain blocked.
- Implement all applicable loading, true-empty, filtered-empty, populated, denied, not-found, validation, pending, success, conflict, provider-error, partial-history, degraded, and stale states.
- Preserve current-request authorization and show last-known data only when an authorized owning provider supplies source/time; disable freshness-dependent actions.
- Re-read provider truth after accepted commands and preserve values, tab/list context, focus, safe reference evidence, and accessible status on recoverable outcomes.

### Explicit non-responsibilities

- Does not add client-side search/sort, frontend authorization caching, a BFF cache, raw payload-first presentation, or unsupported lifecycle actions.
- Does not change shared shell, tokens, or `@erp/ui` ownership.

### Implementation notes and constraints

- Extend existing Reference routes/BFF and provider contracts additively and preserve Reference-owned persistence.
- Use U01's validated shell, route, invalid-query, and safe-return pattern rather than a module-local variant.

### Definition of Done - observed

On the running isolated stack, the administrator exercises the complete Reference list-to-detail path and every provider-supported create/update outcome against persisted provider fixtures. Supported query state survives refresh; unsupported controls are absent; read-only, validation, version-conflict, denied, outage with/without trustworthy persisted data, retry, partial history, and successful re-read outcomes are visibly distinct and accessible. Values, focus, list/tab context, source/time, and safe references are retained as specified, and no command or authorization state advances from client inference. The full Reference journey passes keyboard/screen-reader/reduced-motion checks at 375, 390, 768, 1024, and 1440 CSS pixels in both themes without page-level overflow; its documented warmed 10-user route/BFF sample records the NFR-001 method and meets both p95 thresholds.

## U03 - Charge Agreements Operational Uplift

### Boundary and responsibilities

- Deliver provider-aligned Agreement list/detail with Summary, Rates, D&D, Status history, immutable version evidence, supported lifecycle/successor commands, read-only manual-pricing evidence, and exact supporting rate-version navigation.
- Align BFF query allow-lists to `customerId`, `tradeLaneId`, `commodityId`, `status`, `validOn`, `includeInactive`, page/size, and the approved rate filters; reject duplicate/unknown keys before provider access.
- Use the typed bounded Charge-to-Reference active-option port with exact authorization, correlation, cardinality, and failure semantics; never import Reference app code or read its database.
- Admit each Approval Queue segment only after its own server Draft/pending filter and bounded pagination contract tests pass; never download and client-merge broad sets.
- Preserve the approved Agreement/Booking relationship blockers and exact stable provider IDs; never treat `agreementVersionId` as `agreementId` or reverse-search by label/customer/lane.

### Explicit non-responsibilities

- Does not create manual-pricing resolution, generic search, origin/destination/equipment Agreement filters, selectable sort, synthetic D&D, a client-composed queue, or Booking-owned UI.
- Does not fork shared shell/navigation/components or create another service/database.

### Implementation notes and constraints

- Existing Charge v2 media/contracts and service-owned persistence remain authoritative.
- Missing D&D or queue provider contracts remain explicitly unavailable/`BLOCKED` with owner and evidence path rather than fabricated.

### Definition of Done - observed

On the live stack, Pricing Analyst and Charge Reader fixtures use the same shared-shell Agreement list/detail truth with capability-appropriate actions. Supported filters/page survive refresh; unsupported controls are absent; immutable Agreement/rate history, provider-backed D&D or truthful unavailability, lifecycle success/rejection/conflict, read-only OPEN manual cases, exact rate-version return context, and the typed Reference-option failure matrix are observed. Agreement/Booking directions remain absent until their approved exits pass, and no client merge, guessed ID, false success, or local shared-component fork appears. The complete Charge journey passes keyboard/screen-reader/reduced-motion checks at 375, 390, 768, 1024, and 1440 CSS pixels in both themes without page-level overflow; its documented warmed 10-user route/BFF sample records the NFR-001 method and meets both p95 thresholds.

## U04 - Container Journeys and Booking Relationship Uplift

### Boundary and responsibilities

- Create `apps/container-movement` with canonical recent and Journey detail/capture routes, matching base path, shared shell root layout, feature-local BFF/view models, internal health, image, Compose service, and Nginx mount.
- Add the CMM v2 media contract, verified signed subject assertion, trusted capture headers, server-issued attempt token, provider-owned `timelineV1`, exact typed read/mutation outcomes, and current-request CMM read/capture policies.
- Preserve all accepted/legacy movement evidence and deterministic GTOT/LOAD/DISC/GTIN/OTHER ordering without BFF/browser merging, deduplication, next-move calculation, or invented received/source facts.
- Add the canonical shell-owned Booking relationship adapter beside `/booking/[bookingId]`; implement exact Journey-by-`bookingId`, exact Journey-to-Booking href, and signed subject/source/target-bound origin tokens in both directions.
- Distinguish Journey persistence, outbox publication, broker delivery, and Booking projection application; preserve existing Kafka topics/idempotency and disclose the listener poison/DLQ/replay dependency.
- Use bounded active Reference locations; show raw authorized IDs when labels fail and disable capture when canonical validation is unavailable.

### Explicit non-responsibilities

- Does not create a CMM backend service/database/topic, move Booking ownership to `apps/booking`, infer Journey IDs, directly write Booking, add a local shell/theme, or claim missing poison/replay controls.
- Does not implement blocked Agreement/Booking links.

### Implementation notes and constraints

- Existing default CMM JSON and actor-shaped v1 remain internal-compatible; browser routes use only the additive v2 contract.
- Identity capability registration/assertion verification, shared shell availability, Reference location validation, and poison/replay operational evidence are named blockers with exact owners and tests.

### Definition of Done - observed

On the integrated stack, an authorized Container Operations user opens the new canonical root and stable Journey detail in the one shell, sees provider-ordered timeline/history and an exact Booking link, then submits accepted, duplicate, validation, out-of-sequence, conflict, unknown-outcome, publication-pending, and Booking-applied fixtures without optimistic advancement. The Booking page resolves present/not-created/denied/degraded Journey outcomes and both directions validate bounded origin context. Direct refresh/assets/health, capability denial, assertion/header spoof rejection, target-scoped outage, active-location degradation, idempotent retry, event truth separation, and absence of a CMM legacy redirect are observed. The complete CMM/Booking journey passes keyboard/screen-reader/reduced-motion checks at 375, 390, 768, 1024, and 1440 CSS pixels in both themes without page-level overflow; its documented warmed 10-user route/BFF sample records the NFR-001 method and meets both p95 thresholds. U04 and the intent remain **not done** while the listener poison/bounded-retry/DLQ/replay exit lacks executable owner evidence or an approved bounded replacement; truthful `BLOCKED` labeling is not completion.

## Cross-Module Seams In This Intent

| Seam | Real mechanism | Owning units | Required live evidence |
| --- | --- | --- | --- |
| Domain apps to shared shell | Published W2-02 `PlatformShell`/route registry and `@erp/ui` package API | W2-02 publishes; U01-U04 independently consume | One implementation/landmark/navigation grammar across all prefixes; no domain fork |
| Public edge to canonical apps | Nginx prefix routing with base paths, host session, exact trust-header sanitation | U01 establishes; U04 adds CMM mount | Direct route refresh/assets/session, spoof rejection, target-scoped failure |
| BFFs to Identity | Current-request synchronous policy decisions | All | ALLOW/DENY/read-only/outage with no provider data flash or cached authorization |
| Charge to Reference options | Typed bounded service REST port | U03 | Valid/invalid/denied/unavailable/cardinality outcomes; no app import or shared SQL |
| CMM to Reference locations | Typed active-location service REST port | U04 | Labels when available; raw authorized ID/read-only behavior; unsafe capture disabled on outage |
| CMM BFF to CMM v2 | Versioned HTTP media, signed subject assertion, attempt-token idempotency | U04 | Contract compatibility, spoof rejection, accepted/rejected/unknown mutation outcomes |
| Booking to Journey | Exact synchronous CMM lookup by `bookingId` through shell Booking adapter | U04 | Present/not-created/denied/degraded outcomes with canonical ID only |
| Booking/CMM event choreography | Existing Avro topics, owned outboxes, idempotent consumers | U04 | Persisted/published/delivered/applied truths separate; poison/replay gap explicit |

## Dependency and Blocker Policy

The W4 unit DAG is acyclic and minimal: only U02 depends on U01 because Reference operational depth extends U01's executable Reference route/read foundation. U01, U03, and U04 are roots behind their own external platform/provider exits. No preferred implementation order or critical path is selected here; Stage 2.8 owns those economic decisions. External exits remain named blockers with owner and evidence and never authorize local substitutes.

## Dependency DAG

The canonical topology and rationale are maintained in `unit-of-work-dependency.md`. This machine-readable mirror uses the exact same unit names and direct edges:

```yaml
units:
  - name: platform-reference-route-foundation
    depends_on: []
  - name: reference-data-operational-completion
    depends_on: [platform-reference-route-foundation]
  - name: charge-agreements-operational-uplift
    depends_on: []
  - name: container-journeys-booking-uplift
    depends_on: []
```

## Exit Gate

W4-01 is not complete until all four unit outcomes and US-001 through US-015 are observed together through the approved `linercore-wave-a` wrapper. The full matrix must cover five widths, both themes, keyboard/screen-reader/reduced-motion behavior, local performance targets, changed-frontend line coverage of at least 80 percent, required tests/type/lint/build/routes, bounded W4 security aggregation, manager-demo guards, and truthful blocker status. `aidlc-audit` and `erp-fidelity-audit` must be green. Static scans, screenshots, mockups, startup, or unit tests alone are not live acceptance.

## Open Questions

None. The five decomposition choices and the four-unit plan were approved on 2026-08-10. Provider, platform, shared-primitive, Approval Queue, relationship, Identity, and poison/replay exits remain implementation blockers governed by their existing contracts, not unanswered unit-boundary questions.

## Review - Iteration 1

**Verdict: NOT-READY**

### Validation evidence

- Reviewed the Stage 2.7 definition, Q&A, all declared Application Design inputs, `requirements.md`, `stories.md`, and all three candidate outputs.
- The YAML is structurally valid: four uniquely named nodes, three resolved direct edges, no self-reference, and no cycle. Unit names match the primary artifact.
- Inventory coverage is complete at the identifier level: US-001 through US-015, FR-001 through FR-022, and NFR-001 through NFR-012 all appear. The units are otherwise vertical and their outcome DoDs require running-stack behavior rather than layer-local tests.
- The prose consistently prohibits domain-owned shell, theme, token, and `@erp/ui` forks and identifies W2-02 as the shared platform owner.

### Blocking findings

1. **The DAG is acyclic but not minimal, and it embeds Stage 2.8's economic choice.** U01 is named and declared as the walking skeleton, the text explicitly cites a `Reference-first walking-skeleton policy`, and U03/U04 are forced behind U01. However, upstream `component-dependency.md`, `services.md`, ADR-002, and ADR-008 say Reference, Charge, and CMM each consume the W2-02-owned `PlatformShell`/registry/`@erp/ui` contract directly; they do not depend on a Reference implementation. The dependency artifact simultaneously lists W2-02 as the external producer and credits U01 with producing that same shared contract. This converts the preferred Reference-first delivery sequence into false source dependencies and obscures W2-02 ownership. Remove walking-skeleton/Reference-first selection from all Stage 2.7 outputs; keep U02 -> U01 for Reference depth, but make U03 and U04 roots subject to their named external blockers unless a concrete U01-owned executable artifact from the approved Application Design can be named. Stage 2.8 must select the walking skeleton and Bolt order.

2. **The FR/NFR allocation is not exact enough to implement or audit.** The story map assigns all twelve NFRs to every unit even though NFR-006 through NFR-008 and the combined audit/Compose evidence are handled in the intent exit gate, not in every unit DoD. It also omits FR-002 from U02 despite US-004 tracing directly to it, omits FR-011 from U01's thin US-004 responsibility, and assigns FR-017 to U04 even though FR-017 is exclusively the Reference/Charge retirement contract (CMM uses FR-018). Replace the broad lists with a requirement-to-unit ledger that marks `primary`, `partial/shared`, `blocked`, or `intent-exit`, and make every unit DoD name the evidence for each unit-level NFR it claims.

3. **U04's live DoD has an unresolved completion contradiction.** Its Definition of Done permits missing listener poison/DLQ/replay evidence to remain `BLOCKED`, while the upstream design says event-path acceptance remains blocked until owners provide verified controls or approve a bounded change. The overall Exit Gate also requires all four unit outcomes. State unambiguously that U04 and the intent remain not done while this dependency is open, or narrow the unit outcome so the blocked event-path claim is outside its completion boundary; truthful blocker labeling alone cannot satisfy a Definition of Done.

## Review Resolution - Iteration 1

1. The DAG now contains one real W4 edge only: U02 depends on U01's executable Reference route/read foundation. U01, U03, and U04 are roots behind their respective external W2-02/provider blockers. Walking-skeleton selection, critical-path language, and Reference-first economic sequencing were removed from Stage 2.7.
2. `unit-of-work-story-map.md` now uses a requirement-to-unit ledger with `primary`, `partial/shared`, `blocked`, and `intent-exit` dispositions. FR-002 and FR-011 coverage was corrected, FR-017 was removed from U04, and NFR-006 through NFR-008 are explicitly release gates with per-unit contributions rather than indiscriminate unit ownership.
3. U04's DoD now states that U04 and the intent remain not done until executable poison/bounded-retry/DLQ/replay evidence exists or an approved bounded replacement closes the exit.

## Review - Iteration 2

**Verdict: NOT-READY**

### Verified resolutions

- The machine-readable DAG is now minimal and acyclic: four declared units, one direct edge (`reference-data-operational-completion` depends on `platform-reference-route-foundation`), three roots, no unresolved name, and matching YAML in both topology artifacts.
- The requirement ledger now contains exactly FR-001 through FR-022 and NFR-001 through NFR-012. FR-002 includes U02, FR-011 includes U01's partial detail responsibility, FR-017 is limited to U01/U03, and NFR-006 through NFR-008 are correctly identified as intent-exit gates with unit contributions.
- U04's DoD now makes poison/bounded-retry/DLQ/replay closure a hard completion condition: U04 and the intent remain not done while that exit is open.
- W2-02 remains the sole owner/publisher of `PlatformShell`, the route registry, shared tokens, and `@erp/ui`; the revised dependency artifact says U01-U04 consume that contract independently and authorizes no domain fork.

### Remaining blocking findings

1. **Stage 2.8 sequencing and the removed U01 dependency still leak through `unit-of-work-story-map.md`.** US-003 is still labelled `U01 thin walking-skeleton path`, which selects the walking skeleton in Stage 2.7. More materially, US-007 through US-014 still name U01 as the supporting `platform contract`, `policy/state grammar`, `safe-origin foundation`, or `shell Booking ownership`. That contradicts the one-edge DAG, U01's explicit non-responsibility for cross-module origin, U04's ownership of the Booking adapter/origin contract, and the revised statement that U03/U04 consume W2-02 and approved Application Design contracts independently. Replace `walking-skeleton` with neutral thin-slice language and remove U01 as a supporting unit from U03/U04 stories; cite W2-02 or `external platform contract` as a dependency where useful, and keep U04 as owner of safe-origin/Booking work.

2. **The live unit DoDs do not yet support every unit-level NFR claim in the new ledger.** The ledger says every unit proves WCAG behavior (NFR-002), all five widths and both themes (NFR-003), and contributes route/BFF samples (NFR-001). U02's DoD names accessibility but no responsive/theme or performance evidence; U03's DoD names none of those exact checks; U01 refers only to `approved core viewports`; and no unit DoD names its route/BFF sample. Either add the exact per-unit evidence claimed by the ledger to each DoD, or classify those portions as intent-exit-only. The ledger and DoDs must describe the same acceptance boundary so Construction can close units without guessing.

## Review Resolution - Iteration 2

1. `unit-of-work-story-map.md` now removes the stale walking-skeleton label and every U01 support claim for Charge/CMM platform, policy, safe-origin, and Booking responsibilities. W2-02 is the external platform producer; U03 and U04 implement their own approved adapters without a W4 dependency on U01.
2. Every unit DoD now names its exact 375/390/768/1024/1440, light/dark, keyboard/screen-reader/reduced-motion/no-overflow evidence and its documented warmed 10-user route/BFF sample with the NFR-001 p95 thresholds and method fields.
3. The configured reviewer maximum of two iterations is exhausted. These resolutions are therefore validated by the deterministic required-sections/upstream-coverage sensors and presented transparently at the user gate; no third review is claimed.
