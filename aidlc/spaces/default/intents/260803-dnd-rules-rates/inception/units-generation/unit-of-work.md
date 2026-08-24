# Unit of Work - W3-01 Vertical D&D Rules and Rates

## Source Alignment

This replacement decomposition is derived from approved `requirements.md`, `stories.md`, and Application Design `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, and `decisions.md`. It also preserves the approved Refined Mockups, `team-practices.md`, the project rule requiring live vertical story slices, and the W3-01 walking-skeleton practice.

Each Unit of Work delivers an observable outcome across the layers that outcome exercises. No unit is contract-only, migration-only, backend-only, UI-only or test-only. Focused automated proof travels with every unit. Global isolated-Compose coordination, p99 owner decision, consolidated coverage, required security resolution, `aidlc-audit` and `erp-fidelity-audit` remain intent exit gates, not a release-hardening unit.

The first unit exclusively owns the ordered Charge migration foundation/files, additive bilateral contract, generated provider/consumer fixtures and signed compatibility manifest. Later units consume those artifacts without co-owning or rewriting them. All code remains embedded in existing Charge, Reference Data, Charge web, contract and `packages/ui` boundaries; no D&D deployable or database is created.

## Slicing Rule (do not remove)

Units are **vertical increments**, not architectural layers. Each unit moves one thin capability through every layer it needs - UI, API, domain, persistence and real cross-module seams - and its Definition of Done is an observed end-to-end behavior on the running isolated stack. Focused tests are required evidence but cannot satisfy a unit DoD without the named live observation. No placeholder publisher, adapter, fixture-only implementation or mocked module boundary may satisfy live proof.

## Units

| Unit | Name | Vertical scope (layers it cuts) | Definition of Done (observed on live stack) |
| --- | --- | --- | --- |
| U01 | `dnd-author-price-walking-skeleton` | Reference Data -> contract -> Charge DB/domain/API/provider -> Charge BFF/LinerCore UI -> proof | On the running guarded isolated stack, an authorised analyst creates and approves one representative term in `/charge-agreements/dnd/terms`; the persisted version is returned after service restart; direct authenticated D&D requests produce observed zero and non-zero port-local lines using that exact version; health remains green. Build and Test 3.6 records evidence at `<record>/construction/build-and-test/unit-evidence/dnd-author-price-walking-skeleton.md`. |
| U02 | `dnd-version-trigger-governance` | Charge DB/domain/admin API -> existing W2 pricing enrichment -> AgreementVersion/terms UI -> proof | On the running stack, an authorised analyst approves a successor and sees immutable predecessor/successor and AgreementVersion relationships; a fresh `/pricing-requests` response carries the successor's metadata-only trigger while replay of the older receipt remains byte-identical; persisted history remains after restart. Build and Test 3.6 records evidence at `<record>/construction/build-and-test/unit-evidence/dnd-version-trigger-governance.md`. |
| U03 | `dnd-exact-historical-calculation` | Preserved Standard receipt/Agreement/Rate evidence -> exact terms/provider -> authorised detail/evidence UI -> proof | On the running stack, direct Agreement and Tariff requests covering old/successor and UTC/local-boundary cases return the exact expected versions, days and amounts without reselection; the authorised detail/evidence composition renders the same source/timezone facts after restart. Build and Test 3.6 records evidence at `<record>/construction/build-and-test/unit-evidence/dnd-exact-historical-calculation.md`. |
| U04 | `dnd-safe-attempts-evidence` | Security filters -> provider/idempotency -> Charge DB audit/query API -> denied/scoped evidence UI -> proof | On the running stack, the exact malformed/auth/forbidden/no-rate/validation/conflict/in-progress/replay/unavailable matrix is observed; authorised attempt/correlation lookup returns disposition-specific evidence including null terms ids, denied UI/API reveals no count, and database evidence confirms no failed/duplicate calculation. Build and Test 3.6 records evidence at `<record>/construction/build-and-test/unit-evidence/dnd-safe-attempts-evidence.md`. |

Complexity is relative within W3-01: U01 XL, U02 XL, U03 L and U04 XL. U01 carries US-01 plus thin US-03/US-04 foundations; U02 completes US-01 and owns US-02; U03 owns US-03 completion; U04 owns US-04 completion.

### Unit 1 - `dnd-author-price-walking-skeleton`

### Observable outcome

An authorised Pricing Analyst creates and approves one representative `IMPORT_DEMURRAGE` term at a configured port through the binding `/charge-agreements/dnd/terms` LinerCore route. A direct authenticated `POST /dnd-pricing-requests` using the exact echoed booking-time snapshot returns explicit zero and non-zero itemised port-local results with attributable source/version evidence. The same code paths remain generic for all three fixed types, but this unit's demo uses one representative path to prove the architecture.

### Cross-layer responsibilities

- **Reference Data:** add legacy-compatible `LOCATION.attributes.timeZoneId` validation, seed `NLRTM=Europe/Amsterdam` and `SGSIN=Asia/Singapore`, and expose the bounded Charge read/validation contract.
- **Migration ownership:** own the one ordered migration chain and files for `dnd_terms`, immutable versions, lifecycle activity, `dnd_pricing_attempts`, namespace-aware `pricing_requests`, immutable Standard request evidence, exact uniqueness/check constraints, overlap locking support and audit indexes required by all four units.
- **Domain/application:** establish the `DndTerms` aggregate, fixed DCSA bounds/derived side, Draft create, one valid approval, exact version identity, pure calendar-day calculator, exact evidence ports and success-attempt evidence.
- **Provider contract:** own additive `pricing.dnd-request/result` schemas, headers, idempotency encoding, structured `applicableDndRuleTypes`, additive basis-version/effective-date evidence, generated Charge/Booking models/fixtures, W2 contract compatibility and the signed owner manifest.
- **Provider happy path:** protect the endpoint with existing provider identity/correlation and authorization, validate one exact immutable Standard receipt/terms version, resolve the port timezone, calculate and atomically complete/replay a successful D&D result.
- **UI:** deliver minimum list, create and stable detail/approval composition using the shared `PlatformShell` and `@erp/ui`; show fixed movement bounds, derived side, flat terms, exact basis/version, lifecycle and success/validation states without a calculation-preview action.
- **Proof:** focused migration-upgrade, domain, repository, contract, generated-fixture, provider zero/non-zero, and UI route/component/keyboard/accessibility tests at 375 and 1024 pixels in light/dark. These checks prepare but do not replace the running-stack observation recorded at the U01 evidence path.

### Boundary and Definition of Done

- The migration is upgrade-safe for existing W2 rows and all SQL is namespace-qualified.
- One representative end-to-end success is real, atomic, restart-safe and replayable; no current-authority historical lookup or guessed timezone exists.
- The generated fixtures retain every W2-03 required field and both owners sign the one manifest owned by this unit.
- The minimum UI uses the approved combined route family and LinerCore states; shared-shell/Dialog gaps remain W2-02 external prerequisites with no local fork.
- Focused checks are green and the slice is demonstrable without claiming the remaining rule/version/error matrix complete.
- The U01 DoD is met only when the exact UI -> API -> domain -> database -> provider -> UI live observation in the Units table passes on the running guarded stack and its evidence file records stack identity, build, correlation ids, persisted ids and screenshots/API results.

### Explicit exclusions

Full overlap/successor/trigger governance, Agreement/Tariff historical matrices, every error/idempotency disposition, full audit search, global breakpoint matrix, p99 owner decision and final exit audits belong to later units or the intent exit gate.

### Unit 2 - `dnd-version-trigger-governance`

### Observable outcome

Authorised analysts manage all three fixed rule types through immutable approval and successor history. Existing AgreementVersion detail shows exact D&D relationships. Fresh W2 `/pricing-requests` results carry deterministic metadata-only applicable D&D triggers and exact basis-version/effective-date evidence; replay bytes never drift after a successor changes.

### Cross-layer responsibilities

- **Terms governance:** complete all three rule types, exact applicability/reference validation, optimistic Draft update, immutable approval, successor creation, predecessor/successor lineage and full-key inclusive overlap serialization.
- **Administration/API:** complete stable list/detail/version/history, AgreementVersion relationship, create/edit/approve/successor, reference-option and terms-specific audit query contracts with `charge-rates` authorization and no-disclosure denial.
- **Standard pricing enrichment:** implement `DndTriggerMetadataResolver` only after current W2 authority selection, emit fixed-code metadata without free days/rates, store typed Standard evidence before completion and owner-fenced release handled enrichment failures.
- **UI:** complete all required list filters, Draft edit, approval review, successor form, immutable history, AgreementVersion read-only section and ready/empty/denied/unavailable scoped states through the approved route family.
- **Proof:** lifecycle/overlap races, AgreementVersion/version routing, field errors, successor history, trigger match/no-match/duplicate/unavailable, Standard release/immediate retry/crash takeover and exact replay regression against Unit 1's signed generated fixtures. Focused component/Playwright evidence covers approval, successor, history and AgreementVersion ready/empty/denied/unavailable states at 375 and 1024 pixels in light/dark with keyboard, focus and announcements.

### Boundary and Definition of Done

- Unit 1's schema, contract, fixtures and signoff are consumed unchanged; this unit owns runtime/replay behavior only.
- Approved versions are never edited; old and successor identities remain directly addressable.
- Trigger metadata is deterministic, ordered and commercial-term-free; existing W2 success/replay/conflict/crash behavior remains green.
- Every lifecycle action and status has text/non-color meaning, server-derived permissions and attributable activity evidence.
- W2-02 `PlatformShell`/`Dialog` revisions required by the UI are merged and package-tested before integrated UI evidence is claimed.
- The U02 DoD is met only when the running-stack successor/history/AgreementVersion and fresh-versus-replay `/pricing-requests` observation in the Units table passes and the evidence file ties UI/API responses to persisted predecessor/successor and receipt identities.

### Explicit exclusions

The full Agreement/Tariff historical calculation matrix and safe-attempt/error/concurrency matrix remain in Units 3 and 4. This unit does not regenerate contract fixtures or produce a second signoff.

### Unit 3 - `dnd-exact-historical-calculation`

### Observable outcome

Direct provider requests echoing exact Agreement or Tariff, old or successor snapshots calculate reproducibly across same-day, within-free-time, non-zero and timezone-boundary cases. A newer current authority never changes an older preserved result, and authorised detail/evidence presentation names the selected version and calculation basis.

### Cross-layer responsibilities

- **Historical evidence:** complete `DndPricingBasisEvidencePort` validation of the immutable `STANDARD_PRICING` receipt and preserved exact Agreement/Rate versions, including AgreementVersion and deterministic ordered Tariff composite evidence.
- **Applicability/version:** require exact basis/reference/version/effective-date, port side, trade lane, equipment and Approved D&D version; incomplete legacy or mismatched evidence returns `404 NO_RATE` without reconstruction/reselection.
- **Calculation:** complete the pure port-local formula and deterministic money/result evidence for zero, five-day and ten-day examples, UTC/local midnight crossings, old versions and successors.
- **Provider/UI evidence:** complete itemised version/timezone evidence in the provider result and the existing authorised detail/audit composition; no simulation/calculation-preview route is added.
- **Proof:** Agreement/Tariff, old/current/successor, local-boundary, exact numeric, restart/replay and focused warm-local latency harness with bounded metrics/log labels. Focused detail/evidence UI component and Playwright checks at 375 and 1024 pixels in light/dark verify selected/current/version/timezone text, keyboard access, focus and announcements.

### Boundary and Definition of Done

- Unit 1 contract/schema and Unit 2 lifecycle/trigger behavior are consumed; no migration or fixture ownership is reopened.
- Every success uses exact preserved evidence and returns source/version/timezone/calculation fields with no silent upgrade.
- Working-day/holiday logic, CMM calls, current-authority reuse, cache guesses and partial results remain forbidden.
- The performance harness captures host/build/concurrency/sample/distribution; final target acceptance/revision remains an intent exit decision.
- The U03 DoD is met only when the running-stack Agreement/Tariff old/successor/timezone observation in the Units table passes, survives restart and is recorded with exact request/result/version/UI evidence at the named evidence path.

### Explicit exclusions

Malformed/auth/denied/conflict/in-progress/unavailable completeness, audit search by unresolved identity and security-gate closure remain Unit 4 or final exit responsibilities.

### Unit 4 - `dnd-safe-attempts-evidence`

### Observable outcome

Every malformed, spoofed, unauthenticated, forbidden, no-rate, semantically invalid, conflicting, concurrent, replayed or unavailable attempt receives the exact deterministic status/code. No failed calculation or duplicate/partial charge is persisted. Authorised users can inspect bounded disposition-specific evidence even when no terms/source version was resolved, while denied users learn no count or identifier.

### Cross-layer responsibilities

- **Transport/security:** complete filter coverage and exact spoof -> service identity -> correlation -> controller/media/idempotency/body -> application authorization precedence for `/dnd-pricing-requests`; complete `charge-rates` admin filter coverage.
- **Idempotency/concurrency:** complete D&D replay/conflict/in-progress/takeover/fenced completion/release and Standard handled enrichment release invariants, including stale-owner winner reclassification.
- **Durable evidence:** complete nullable disposition columns, unique attempt lookup and bounded search by correlation, booking/equipment/closing event, outcome/time or terms id; preserve disposition-specific absence and never log tokens/raw payloads.
- **UI/API evidence:** complete terms/general audit queries plus loading, denied, scoped-unavailable, no-rate, validation, conflict, in-progress, replay, zero and positive evidence states through existing authorised routes without adding evaluation actions.
- **Proof:** exact FR-06 error matrix, filter precedence, authorization/no-disclosure, idempotency/concurrency races, release/immediate retry, audit-store failure fallback, null-terms evidence retrieval, bounded telemetry and focused responsive/a11y evidence-state component/Playwright tests at 375 and 1024 pixels in light/dark.

### Boundary and Definition of Done

- Every application-level attempt produces durable bounded evidence before response; filter rejections keep required status and bounded fallback logging if durable audit is unavailable.
- No handled owner remains falsely live; process crashes use lease expiry/takeover; stale work never publishes.
- All error/status codes, correlation behavior and evidence fields match the signed Unit 1 contract and approved Application Design.
- No secret, raw payload, unbounded metric label, fabricated source id, duplicate result or hidden denied count is exposed.
- The U04 DoD is met only when the running-stack disposition/audit/no-disclosure observation in the Units table passes and the evidence file records exact responses, correlation/attempt lookups and database assertions proving no failed or duplicate result.

### Explicit exclusions

Production identity/transport, cloud availability, new audit services, purge policy, Booking runtime trigger and CMM integration are outside W3-01.

## Cross-Module Seams In This Intent

| Seam | Real mechanism | Owning/consuming units | Required live exercise |
| --- | --- | --- | --- |
| Reference Data LOCATION timezone -> Charge | Authenticated synchronous Reference Data REST read/validation through `PortTimeZoneProvider`, not direct DB or placeholder adapter | U01 owns schema/backfill/first read; U03 consumes boundary breadth | U01 live creation/provider path reads the configured port; U03 live UTC/local-boundary cases prove the real seam and fail-closed mapping |
| `pricing.v1` Charge <-> Booking contract | Generated OpenAPI provider/consumer models and signed fixtures for synchronous `/pricing-requests` and `/dnd-pricing-requests`; no Booking runtime trigger | U01 exclusively owns contract/fixtures/signoff; U02-U04 consume | U01 runs real Charge provider calls plus generated fixture suites and records signoff; U02 live fresh/replay pricing proves runtime compatibility |
| Charge web/BFF -> Charge administration/provider APIs | Authenticated server-side BFF REST calls with correlation, stable routes and no browser service credentials | U01-U04 according to their UI outcome | Every unit's live DoD exercises its real Charge UI/BFF/API/domain/database path; mock handlers cannot satisfy DoD |
| W2 Standard pricing -> D&D trigger/evidence | Existing synchronous `/pricing-requests`, immutable `STANDARD_PRICING` receipt and `DndTriggerMetadataResolver` | U01 lays evidence schema/contract; U02 owns runtime enrichment/release; U03-U04 consume preserved evidence | U02 live fresh-versus-replay observation proves metadata, bytes and claim release; U03/U04 prove historical/error consumption |
| W2-02 `packages/ui` -> Charge web | Merged workspace package dependency for `PlatformShell` and `Dialog`, with package tests; no local copy | External W2-02 owner; all UI-bearing units consume | A unit can claim integrated UI DoD only against the merged package revision recorded in its live evidence |

### Cross-unit ownership and constraints

1. `dnd-author-price-walking-skeleton` exclusively owns migration files, additive contract/generated fixtures, compatibility and bilateral signoff. Units 2-4 consume them.
2. Each later unit owns only its user-observable behavior plus focused proof; none becomes a layer/release-hardening unit.
3. W2-02 exclusively owns `packages/ui` and the shared shell/Dialog prerequisites. They are external delivery dependencies, not W3-01 units.
4. Charge owns D&D data and provider behavior; Reference Data owns timezone attributes; Booking is a generated-fixture consumer only; CMM has no runtime edge.
5. Administration uses `charge-rates`; provider evaluation uses `charge-agreement:price`; browser trust remains in the Charge BFF.
6. Final isolated Compose, cross-unit p99 decision, consolidated changed-line coverage, security resolution, owner evidence collection, `aidlc-audit` and `erp-fidelity-audit` are binding exit gates applied to the integrated result, not a fifth Unit.

## Dependency DAG

The canonical direct-edge graph is maintained in `unit-of-work-dependency.md` and mirrored here:

```yaml
units:
  - name: dnd-author-price-walking-skeleton
    depends_on: []
  - name: dnd-version-trigger-governance
    depends_on: [dnd-author-price-walking-skeleton]
  - name: dnd-exact-historical-calculation
    depends_on: [dnd-version-trigger-governance]
  - name: dnd-safe-attempts-evidence
    depends_on: [dnd-exact-historical-calculation]
```

The graph is topology only. U01 remains a solo, separately gated walking-skeleton Bolt; Bolt grouping for U02-U04 is deferred entirely to Delivery Planning and must respect the chain.

## Exit Gate

The intent is not complete until all four unit live-evidence files exist and the integrated guarded isolated stack proves the full vertical path. The integrated evidence record is `<record>/verification/w3-01-live-acceptance.md` and must include the effective Compose project/edge URL/build, full 375/768/1024/1440 light/dark Playwright matrix, accepted/revised p99 record, consolidated changed-line coverage, required security resolution, verification of Unit 1's signed fixture manifest and Unit 2's runtime regression, and green `aidlc-audit` plus `erp-fidelity-audit`. Focused unit evidence cannot substitute for this gate, and this gate is not a fifth Unit.

## Open Questions

1. Is U01's path the right thinnest real end-to-end walking skeleton?
   - A. Yes (recommended)
   - B. Narrow it further
   - C. Widen it
   - X. Other
   - `[Answer]: A - approved in the vertical-redo decomposition plan`

No unresolved unit-boundary question remains. Delivery Planning must still assign Bolt/mob sequence and external dependency timing without changing these unit boundaries.

## Completeness check

The four units collectively cover every production component and story outcome in the approved Application Design. Each has a named live outcome, cross-layer responsibilities, focused proof, explicit exclusions and a direct dependency in `unit-of-work-dependency.md`. No orphan technical layer, UI-only unit, test-only unit, new deployable or out-of-scope integration exists.
