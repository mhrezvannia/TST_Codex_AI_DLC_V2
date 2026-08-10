<!-- BINDING TEMPLATE. Keep the ## headings (required-sections sensor). This template enforces VERTICAL units with end-to-end DoDs. -->

# Units of Work - W2-04 Container Journey & Track-Trace

## Source Alignment

These units implement the approved boundaries in `components.md`, typed contracts
and transaction sets in `component-methods.md`, orchestration in `services.md`,
topology in `component-dependency.md`, and choices in `decisions.md`. They cover
`requirements.md` FR-01 through FR-14/NFR-01 through NFR-10 and `stories.md`
US-01 through US-09. The units also retain the intent statement, W2-04 Context
Pack, contract repository, and LinerCore design-system authority as binding
implementation inputs.

## Slicing Rule (do not remove)

Units are **vertical increments**, not architectural layers. Each unit (after
the walking skeleton) must move one thin capability through **every layer it
needs** (UI -> API -> domain -> persistence -> any cross-module seam) and its
Definition of Done must be an **observed end-to-end behavior on the running
stack** - never "layer X tests pass," and never "without live proof." A unit
whose DoD can be met without running the app is mis-sliced; re-slice it.

## Units

| Unit | Name | Vertical scope (layers it cuts) | Definition of Done (observed on live stack) |
| --- | --- | --- | --- |
| U01 | PB-01 Journey-to-Booking Walking Skeleton | Ordered additive CMM migration ownership -> real `booking.confirmed` broker input -> validated CMM intake/domain -> DB state and seq-0 planned status -> CMM authorized list/detail -> GTOT capture API/domain/ledger/outbox -> real `containermovement.status` -> Booking receipt/projection/detail UI; one DISC-before-LOAD rejection | On the isolated running stack, the U01-owned Flyway chain upgrades and backfills preserved W1 rows without reset; after service restart, the upgraded rows remain readable, and an exercised forward-repair path preserves them. A valid confirmed one-leg booking creates one Allocated journey with expected LOAD/DISC and PLN LOAD sequence 0; replay records a successful duplicate without a second plan, while inactive-route/incompatible-assignment intake records a failed outcome and no partial journey/outbox. An authorized operator finds the journey, captures valid GTOT once, sees Gated-out and ACT GTOT sequence 1 in CMM, and Booking shows matching latest progress within 30 seconds. A DISC attempt returns HTTP 409 `OUT_OF_SEQUENCE_MOVEMENT` with LOAD-next evidence; journey/history/outbox/Booking stay unchanged and correlated rejection evidence is visible. Broker, both databases, both UIs, actor, and correlation evidence are recorded. |
| U02 | Ordered Lifecycle and Observable Rejections | CMM capture UI/API -> field/reference validation -> lifecycle policy -> immutable request/attempt/movement/rejection ledgers and snapshot -> fenced outbox/recovery -> Kafka -> Booking ordered receipt/projection -> CMM full timeline and Booking latest view | On the running stack, LOAD, DISC, and GTIN are accepted exactly once after GTOT, producing In-transit, Discharged, and Returned-empty with ACT sequence 2-4 and pending/success announcements; both UIs reflect their owned views. Invalid equipment/location/classifier/load-state/time/required input preserves entered values with field-linked validation and no accepted/outbox effect. Same-occurrence and same/conflicting-key attempts return HTTP 409 `DUPLICATE_MOVEMENT`; illegal next codes return HTTP 409 `OUT_OF_SEQUENCE_MOVEMENT`; both preserve input, focus the accessible summary, append attempt/rejection/audit evidence, and leave accepted/outbox/Booking state unchanged. CMM restart/stale-worker recovery does not double-publish. Booking receipts visibly classify applied, transport-duplicate, stale positive sequence, legacy sequence-0 fallback, and unassigned/invalid rejection outcomes, applying only the strongest valid projection; Booking detail exposes pending, applied, delayed/retry, and degraded states in plain language without raw broker internals. |
| U03 | Authorized Degraded Journey Access | Existing U01 persisted journey -> Identity authorization and exact permissions -> CMM list/detail/capture API -> persisted read model/database -> Reference Data validation/degradation -> CMM shared-shell UI and denial audit | On the running stack, Equipment Control and Customer Service can list/open the U01 journey, while Customer Service direct/deep-link capture returns 403 `CMM_AUTHORIZATION_DENIED`, records actor/reason audit, and leaves movement/lifecycle/history/outbox/Booking unchanged. With Identity unavailable, every fresh list/detail/capture request fails closed and the UI shows an actionable denied/error state. After successful Identity authorization but with Reference Data unavailable, the persisted journey remains readable with a clear degraded/last-known indicator, capture is disabled and direct capture fails without mutation. Loading, empty/not-found, retryable error, denied, and degraded states remain keyboard/screen-reader usable inside the shared shell. |

### Unit Responsibilities and Boundaries

**U01 owns** the thinnest real distributed path and the complete ordered
additive CMM Flyway chain/files: producer-compatible contracts, CMM booking
intake, one-leg journey creation, expected movements, canonical
reads, the first permitted capture, seq-0/seq-1 publication, Booking ordering
receipt/projection, CMM list/detail/capture composition, Booking latest status,
and one executable invalid transition. It introduces the schema and ports needed
by later units only where this live path exercises them, and proves existing W1
upgrade, backfill, service restart, and an exercised forward-repair path without
destructive reset.

**U02 owns** remaining lifecycle depth and explicit operator recovery. It adds
no new transport mode or business context. It completes typed GTOT -> LOAD ->
DISC -> GTIN behavior, durable disposition/attempt/rejection evidence, fenced
publication/recovery, field-linked validation, Booking receipt dispositions,
and all accepted/rejected timeline and latest-projection states. It consumes
the U01 migration chain and does not co-own or rewrite its migration files.

**U03 owns** one scenario-led capability: safely inspect an existing persisted
journey and prevent mutation when authorization or reference validation cannot
support capture. It changes and proves the real authorization, read, capture,
database, audit, and CMM UI paths. It does not own migrations, broker recovery,
global visual matrices, Compose coordination, demo guards, or release audits.

### Deployment Model and Complexity

| Unit | Existing deployment targets | Model | Relative complexity | Constraints |
| --- | --- | --- | --- | --- |
| U01 | contracts, container-movement-service, booking-service, container-movement-web, booking-web, Identity catalog | Hybrid existing-service deployment; no new service | L | Preserve topic names, producer ownership, shared shell, Booking ownership, and backward-compatible Avro defaults. |
| U02 | container-movement-service/web, contracts, booking-service/web | Hybrid existing-service deployment | L | Only DCSA ACT GTOT/LOAD/DISC/GTIN; no EDI/public API/multi-leg/fleet/depot/M&R expansion. |
| U03 | identity-service catalog/evaluator, reference-data-service, container-movement-service/web | Hybrid existing-service deployment | M | No authorization cache; last-known applies only to persisted business/reference data after fresh authorization; no new auth mechanism. |

## Cross-Module Seams In This Intent

| Seam | Owner -> consumer | Real mechanism | Unit proof |
| --- | --- | --- | --- |
| `booking.confirmed` logical event on physical `booking.events` | Booking -> CMM | Kafka + Schema Registry-valid Avro/AsyncAPI/Pact contract | U01 publishes through the real broker and proves CMM journey/plan rows. |
| `containermovement.status` | CMM -> Booking | Transactional CMM outbox -> Kafka -> Booking consumer/receipt/projection | U01 proves seq 0/1 and U02 proves seq 2-4 plus stale/duplicate ordering. |
| Journey reads and capture | CMM web -> CMM service | Authenticated REST using `container-movement:read` and `container-movement:capture-movement` | U01 proves happy/read-only/invalid basics; U02 proves all capture results; U03 proves denied/down states. |
| Booking latest progress | Booking service -> Booking web | Booking-owned REST/read model | U01 renders GTOT; U02 renders final GTIN and proves restart/redelivery stability. |
| Authorization and reference validation | CMM application -> Identity/Reference Data | Existing authenticated service APIs; no duplicate registry | U01 proves allowed reads/capture; U03 proves read-only denial, Identity fail-closed behavior, and authorized last-known reference-data reads with capture disabled. |

No placeholder publisher, local-noop adapter, synthetic database insert, or
mock UI response satisfies a unit DoD.

## Dependency DAG

The topology contains only hard behavioral prerequisites. It deliberately
does not recommend a build order or name a critical path; Delivery Planning
selects the economic Bolt path.

```yaml
units:
  - name: U01-pb01-journey-to-booking-walking-skeleton
    depends_on: []
  - name: U02-ordered-lifecycle-and-observable-rejections
    depends_on: [U01-pb01-journey-to-booking-walking-skeleton]
  - name: U03-authorized-degraded-journey-access
    depends_on: [U01-pb01-journey-to-booking-walking-skeleton]
```

## Exit Gate

The intent is not `complete` until all three units have been driven as one full
vertical path on `linercore-wave-a` through `scripts/wave-a-compose.mjs`, with
exclusive stack control and `npm run demo:guard` green before and after. The
evidence must show broker -> CMM database -> CMM UI -> broker -> Booking
database -> Booking UI, explicit duplicate/out-of-sequence unchanged-state
proof, Playwright viewport/theme/accessibility states, and green `aidlc-audit`
plus `erp-fidelity-audit`. Evidence lives under the intent-approved artifact
path and must keep the W1 waiver explicit rather than converting it to PASS.

## Open Questions

1. Is U01's PB-01 walking-skeleton path the right thinnest end-to-end route?
   - A. Yes (recommended)
   - B. Narrow it further
   - C. Widen it
   - X. Other
   - `[Answer]:` A. Yes; approved in `units-generation-questions.md`.

## Review Iteration 1

**Verdict: NOT-READY**

The real broker-to-database-to-Booking walking skeleton, explicit module seams,
scope exclusions, and machine-readable unit graph are directionally correct.
The YAML declares each unit once, all targets exist, and the graph is acyclic;
the prose does not choose an economic build order or critical path. The
following corrections are required before approval:

1. **Restore exact rejection-code fidelity.** U01 and U02 currently call the
   sequence rejection `OUT_OF_SEQUENCE`, while `requirements.md`, `stories.md`,
   and the application design require wire-visible
   `OUT_OF_SEQUENCE_MOVEMENT`. Replace both shortened names and require the
   exact code in live API/UI evidence.
2. **Give the CMM migration chain one owner.** U01 says it may introduce the
   additive schema needed by the walking skeleton, while U03 says it owns the
   ordered Flyway upgrade/backfill. That co-owns the same database evolution and
   conflicts with the project correction requiring one explicit migration-file
   owner. Assign the ordered additive migration chain and files to U01, where
   persistence is first exercised; state that U02 consumes them and U03 only
   proves existing-data upgrade/backfill/restart/forward-repair without rewriting
   or co-owning those files.
3. **Make the claimed story/FR coverage observable in unit DoDs.** The story map
   marks stories Full/Covered, but no unit DoD currently proves several approved
   behaviors: idempotent `booking.confirmed` replay and invalid/inactive intake;
   field/reference validation with preserved capture input; Booking duplicate,
   stale, legacy-sequence-0, and unassigned-container receipt dispositions; and
   the required loading, empty/not-found, retryable error, pending/degraded,
   denied, validation, and accessible responsive UI states. Allocate each case
   to the vertical unit that owns the production behavior and name its observed
   unchanged/applied database, broker, API, and UI result in that unit's DoD.
   Update the story map to match those allocations rather than relying on a
   blanket coverage assertion.
4. **Re-slice U03 so it is not a horizontal release/QA hardening bucket.** Its
   current scope combines migration verification, consumer/outbox recovery,
   authorization, two dependency-outage policies, responsive/accessibility
   coverage, stack coordination, demo guards, and both final audits. Merely
   saying it changes production paths does not make that collection one thin
   user journey. Keep global four-viewport/theme evidence, serialized Compose
   execution, demo guards, and final audits in the intent Exit Gate. Recast U03
   as one scenario-led vertical increment (for example, an authorized persisted
   journey remains safely usable across restart/redelivery, with Identity
   failing fresh reads/capture closed and Reference Data allowing only an
   already-authorized persisted read while disabling capture), crossing the
   real API/domain/database/broker/UI seams and producing observable behavior.
   If the remaining independent behaviors cannot fit that single outcome, split
   them into additional vertical units rather than a release-hardening unit.
5. **Recompute only hard DAG edges after correcting U03.** The present U03 ->
   U02 edge is justified by the full-release replay placed inside U03, but
   authorization/degradation and migration-upgrade behavior do not inherently
   require the complete four-movement lifecycle. After re-slicing, retain an
   edge only where the dependent unit's business behavior truly requires the
   predecessor; mirror the corrected, minimal acyclic topology identically in
   both YAML blocks and the dependency artifact. Do not add priority, economic
   sequencing, or a critical-path recommendation.

## Builder Remediation after Review Iteration 1

- Replaced every active shortened rejection code with wire-visible
  `OUT_OF_SEQUENCE_MOVEMENT` and required API/UI/unchanged-state evidence.
- Assigned the ordered additive Flyway chain and migration files solely to U01;
  U02 consumes them and U03 no longer owns migration behavior.
- Added live U01 intake replay/failure cases and live U02 capture validation,
  outbox recovery, Booking disposition, pending/success, and rejection states.
- Re-sliced U03 as the single user scenario "Authorized Degraded Journey
  Access" across Identity, Reference Data, CMM API/database/audit, and CMM UI.
- Moved the global viewport/theme matrix, serialized Compose run, demo guards,
  final audits, and W1 waiver distinction back to the intent Exit Gate.
- Recomputed the minimal DAG so U02 and U03 independently depend on U01 and may
  proceed in parallel; both YAML mirrors and the prose dependency artifact agree.

## Review

**Verdict: NOT-READY**

Iteration-one corrections are substantially resolved: both active rejection
paths use exact `OUT_OF_SEQUENCE_MOVEMENT`; U01 solely owns the migration chain;
the previously missing intake, validation, Booking disposition/presentation,
and CMM state cases now have live unit allocations; U03 is a scenario-led
authorization/degradation slice; and the matching YAML DAG is valid, acyclic,
minimal, and free of economic-order or critical-path claims.

The following active-text corrections remain:

1. U01's DoD proves only that preserved W1 rows upgrade without reset, while its
   responsibility permits "upgrade/backfill/restart **or documented**
   forward-repair." NFR-04 requires observable upgrade, restart, and
   forward-repair behavior. Make U01's live DoD require the backfill, service
   restart, and an exercised forward-repair path to preserve/read the upgraded
   journey; documentation alone and an `or` alternative do not satisfy the
   vertical live gate.
2. The `Booking latest progress` seam still says U03 proves restart/redelivery
   stability, even though corrected U03 expressly owns neither broker recovery
   nor Booking UI and U02 now owns recovery/dispositions. Assign that proof to
   U02. In `unit-of-work-dependency.md`, likewise change Booking -> CMM intake
   from "U01, re-proved U03" to U01 only (U03 consumes the persisted U01
   journey; it does not re-drive the intake event).
3. `unit-of-work-story-map.md` still says NFR release-level closure occurs in
   U03, contradicting the corrected U03 boundary and the intent Exit Gate.
   State that release-level closure occurs at the intent Exit Gate across all
   completed units.

No additional reslicing or DAG change is required after those corrections.

## Builder Remediation after Reviewer Iteration Limit

- U01 now requires live upgrade, backfill, service restart, and an exercised
  forward-repair path for preserved W1 rows; documentation alone cannot satisfy
  its DoD.
- Booking projection restart/redelivery ownership is assigned to U02, and the
  dependency artifact assigns Booking intake only to U01.
- Release-level NFR closure is assigned to the intent Exit Gate across all
  units, never to U03.

These corrections and the required sensors are builder-verified after the
configured two-review limit. They do not replace or rewrite the final
independent NOT-READY verdict above.
