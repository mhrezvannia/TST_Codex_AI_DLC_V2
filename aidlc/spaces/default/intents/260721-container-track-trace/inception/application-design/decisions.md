# Architecture Decisions - W2-04 Container Journey & Track-Trace

## Decision Register

These proposed ADRs resolve the approved choices in
`application-design-questions.md`. They trace to `requirements.md` and
`stories.md`, preserve the brownfield seams in `architecture.md` and
`component-inventory.md`, and enforce `team-practices.md`. Security/compliance
notes address least privilege, auditability, contract ownership, and evidence
integrity; the target remains the canonical on-premises Compose topology.

| ADR | Decision | Reversibility | Primary trace |
|---|---|---|---|
| ADR-001 | Evolve `ContainerJourney` with typed DCSA values and policy | Medium | FR-02, FR-04, FR-05; US-01/03 |
| ADR-002 | Hybrid snapshot plus append-only CMM ledgers on Flyway | Medium | FR-06, FR-07; NFR-04; US-03/04/05 |
| ADR-003 | Targeted sealed capture outcome and one transaction | Easy-Medium | FR-06, FR-07; NFR-02 |
| ADR-004 | Preserve PLN LOAD sequence 0; ACT movement sequences 1-4 | Medium | FR-08, FR-09; US-01/06 |
| ADR-005 | Canonicalize outbox states on the Java lifecycle | Medium | NFR-01, NFR-04; US-06/09 |
| ADR-006 | Positive-sequence Booking projection with legacy fallback | Medium | FR-09 through FR-11; US-06/07 |
| ADR-007 | Authoritative exact Identity permissions and fail-closed capture | Medium | FR-12; NFR-05; US-08 |
| ADR-008 | Server-first CMM app with focused local client state | Easy | FR-03, FR-13; US-02 through US-05 |
| ADR-009 | Label last-known reference facts; never cache authorization | Easy | FR-12, FR-13; NFR-05/06 |
| ADR-010 | Retain event choreography and serialized on-prem acceptance | Hard | FR-14; NFR-01/10; US-09 |

## ADR-001 - Evolve the Existing Journey Aggregate

### Context

The current CMM service already opens/reconciles journeys, exposes reads, and
captures generic movements. W2-04 needs exact DCSA GTOT/LOAD/DISC/GTIN rules and
five lifecycle states without discarding W1 seams. `ContainerJourney` is a
useful but concentrated aggregate boundary.

### Decision

Keep `ContainerJourney` as aggregate root. Add typed DCSA/ISO/UN/LOCODE value
objects and extract a stateless `MovementTransitionPolicy`. The aggregate owns
current state and applies only policy-issued accepted decisions.

### Consequences

- **Positive:** preserves W1 identity/routes/repositories; makes lifecycle and
  vocabulary tests deterministic; keeps domain framework-free.
- **Negative:** snapshot compatibility and adapter mapping require care; the
  aggregate remains the consistency boundary for one journey.
- **Security/compliance:** domain inputs are canonical typed values, reducing
  ambiguous/unvalidated evidence; authorization remains outside the domain.
- **Reversibility:** policy/value types can later expand to more DCSA codes or be
  extracted, but persisted snapshot evolution makes a full replacement costlier.

### Alternatives Rejected

- **Separate movement aggregate:** clearer independent identity but requires
  cross-aggregate coordination for each lifecycle change and adds consistency
  complexity with no thin-slice scaling need.
- **Replace the aggregate:** clean-slate semantics but high W1 regression and
  migration risk; violates refactor-don't-discard direction.

## ADR-002 - Hybrid Snapshot and Append-only Evidence Ledgers

### Context

CMM currently persists a JSON snapshot plus idempotency/audit/outbox tables in a
mutable SQL initializer. W2-04 requires durable accepted history, request
identity, original duplicate evidence, unchanged-state proof, and additive
upgrade of W1 data.

### Decision

Introduce an ordered Flyway baseline. Retain a versioned journey snapshot as the
rehydration source for this intent, and add append-only accepted-movement,
capture-request, and rejection-evidence records with database uniqueness and
foreign keys. Correct outbox constraints through migrations.

### Consequences

- **Positive:** minimum-risk W1 upgrade; explicit queryable evidence; supports
  atomic transaction and restart proof; later normalization remains possible.
- **Negative:** some data is duplicated between snapshot and ledgers; adapters
  must assert consistency and migrations need compatibility readers/backfill.
- **Security/compliance:** append-only rejection/request rows improve audit
  integrity; actor/correlation is stored without secrets/raw tokens.
- **Reversibility:** normalized ledgers can become the future source of truth;
  dropping snapshot duplication is a later controlled migration.

### Alternatives Rejected

- **Full normalization now:** removes duplication but broadens migration and
  query rewrite risk beyond the vertical slice.
- **Expanded JSON only:** fastest schema work but weak uniqueness/queryable
  rejection evidence and insufficient live unchanged-state proof.

## ADR-003 - Explicit Capture Outcome in One Transaction

### Context

The baseline silently returns the existing journey for a repeated idempotency
key. Requirements demand stable 409 duplicate/out-of-sequence outcomes, durable
rejection evidence, and no accepted-state/outbox/Booking mutation. Expected
business conflicts are not infrastructure failures.

### Decision

Return a targeted sealed `CaptureMovementResult` from the transactional
application use case, with an explicit authenticated `CaptureRequestContext`.
The application atomically claims the idempotency key/fingerprint before domain
evaluation. A same-request accepted result returns duplicate, a stored rejected
result also returns `DUPLICATE_MOVEMENT` while embedding its original rejection
as evidence, and a different fingerprint returns duplicate with
`IDEMPOTENCY_KEY_REUSED`; concurrent claimers serialize on the unique key.
Every invocation appends attempt/rejection/audit evidence. The accepted branch
commits snapshot, ledger, new request disposition, attempt, audit, and outbox.
A new rejected branch commits new request disposition, attempt, rejection, and
audit; same/conflicting-key duplicates leave the stored request immutable and
commit attempt/rejection/audit only.
The REST adapter maps rejected results to 409 after the transaction commits.

### Consequences

- **Positive:** one explicit atomic boundary; evidence survives; business
  conflicts are testable without rollback tricks; entered UI values map cleanly.
- **Negative:** callers and controller require explicit branching; this creates
  one new targeted result type and an immutable stored-disposition shape.
- **Security/compliance:** denial remains 403 and never becomes a business 409;
  rejection evidence has stable correlation and does not leak infrastructure.
- **Reversibility:** the result can later be converted to an exception or common
  error model locally; it does not mandate a universal project migration.

### Alternatives Rejected

- **Exception plus `REQUIRES_NEW`:** can persist evidence, but splits reasoning
  across transactions and risks audit/accepted-state divergence.
- **Controller pre-validation:** duplicates domain rules, races the transaction,
  and places business semantics in an adapter.

## ADR-004 - Planned Sequence 0 and Actual Sequences 1-4

### Context

W1 emits a status when a journey opens, but its current generic planned-
departure mapping can produce a transport code outside the CMM equipment-event
boundary. W2-04 requires defaulted v1 sequence compatibility and actual
movement sequences 1-4.

### Decision

Preserve journey-created publication as a valid `PLN LOAD` at POL with Allocated
lifecycle and `sequenceNumber=0`. Publish each accepted GTOT/LOAD/DISC/GTIN as
ACT with sequence 1/2/3/4. The event factory maps a specific planned/accepted
fact rather than inferring from the latest snapshot.

### Consequences

- **Positive:** preserves W1 observable behavior; eliminates invalid DEPA-like
  equipment mapping; planned and actual facts are unambiguous; BACKWARD readers
  receive the default 0.
- **Negative:** Booking may display a planned status before the first actual and
  must not let it outrank positive sequences.
- **Security/compliance:** producer owns the field and coordinates consumer,
  Avro, AsyncAPI, Pact, fixtures, and Schema Registry proof.
- **Reversibility:** suppressing planned publication later is possible, but
  historical sequence-0 facts remain valid time-retained events.

### Alternatives Rejected

- **Publish ACT only:** simpler semantics but regresses the W1 creation fact and
  weakens pending/planned Booking evidence.
- **Keep generic planned departure:** preserves code but violates the contract's
  equipment-event boundary and executable DCSA fidelity.

## ADR-005 - Canonical Java Outbox State Lifecycle

### Context

Java, repository logic, and mutable SQL use different claimed/retry state names.
The initializer can reset legitimate rows, undermining retry, restart, and
evidence integrity.

### Decision

Use existing Java states `PENDING`, `IN_PROGRESS`, `PUBLISHED`, `RETRYABLE`, and
`FAILED_PERMANENT` as the canonical persisted vocabulary. Flyway normalizes
known safe legacy synonyms and installs matching constraints/indexes. Unknown
states fail migration/repair visibly rather than being reset silently.
Each claim increments a fencing version and receives a random token; every
publish/retry/permanent-failure completion conditionally matches event ID,
`IN_PROGRESS`, worker, token, and version.

### Consequences

- **Positive:** aligns domain, repository, DB, and evidence; preserves current
  application vocabulary; makes restart behavior deterministic; prevents an
  expired worker from overwriting a reclaimed row.
- **Negative:** migration/backfill and legacy-state tests are mandatory; ops
  queries using old names must change.
- **Security/compliance:** no failed row is hidden by reset; permanent/retryable
  evidence remains truthful.
- **Reversibility:** a later rename is possible through another additive
  migration, but operational dashboards/contracts must coordinate.

### Alternatives Rejected

- **Rename Java to SQL vocabulary:** also coherent but larger code/test/runtime
  churn for no semantic benefit.
- **Translate forever:** avoids migration but perpetuates two vocabularies and
  leaves direct SQL evidence ambiguous.

## ADR-006 - Sequence-aware Booking Latest Projection

### Context

Booking already owns durable receipts and a latest per-container projection,
ordered by occurred/classifier/received/event fields. W2-04 adds positive
producer sequence while legacy v1 records default to 0. Booking must not copy
the CMM timeline or query CMM.

### Decision

Add sequence to Booking receipt/projection persistence. Higher positive sequence
wins. A positive sequence outranks planned/legacy sequence 0 for the same
journey/container. When both are 0, retain the existing fallback comparator.
Duplicates and stale facts still receive durable dispositions.

### Consequences

- **Positive:** semantic order survives messy timestamps; legacy compatibility
  remains; Booking stays latest-only and service-owned.
- **Negative:** comparator and SQL upsert become more complex; positive sequence
  conflicts require explicit stale/invalid handling.
- **Security/compliance:** assignment validation precedes projection; receipts
  preserve provenance/correlation.
- **Reversibility:** sequence columns are additive; fallback can be retired only
  after an explicit legacy horizon decision.

### Alternatives Rejected

- **Timestamp-only:** baseline-compatible but cannot guarantee lifecycle order.
- **Full Booking timeline:** duplicates CMM ownership and broadens schema/UI.

## ADR-007 - Exact Identity Permissions and Fail-closed Capture

### Context

Current CMM authorization can accept any nonblank subject in shallow local
behavior. Requirements name exact read/capture tuples and role grants, prohibit
actor fallbacks, and require observable denied unchanged-state proof.

### Decision

Extend the authoritative Identity catalog/evaluator with exact read and
capture-movement permissions. Equipment Control receives both; Customer Service
read only. CMM BFF forwards authenticated session identity, the REST adapter
constructs an explicit request context, and the CMM use case accepts that
subject as a parameter and alone invokes `AuthorizationPort` before evaluating
every action. REST authenticates/maps but does not authorize. No adapter-global or
thread-local subject is permitted. Non-local unknown/unavailable evaluation
fails closed.

### Consequences

- **Positive:** least privilege, consistent audit, direct-API safety, executable
  acceptance assignments.
- **Negative:** Identity/catalog and service adapter changes are coordinated;
  dependency outage disables capture.
- **Security/compliance:** satisfies explicit separation of duties and denial
  evidence; no body/query actor is authority.
- **Reversibility:** permission grants can change in the catalog; collapsing read
  and capture later would be a deliberate security decision.

### Alternatives Rejected

- **Map capture to generic update:** avoids a new action but violates the exact
  tuple and weakens least privilege.
- **UI-only enforcement/local nonblank allow:** bypassable and prohibited.

## ADR-008 - Server-first CMM App with Local Interaction State

### Context

The CMM app is absent. The design master requires shared shell/tokens, Next.js
App Router, server-rendered reads, focused clients, stable loading, and no
app-to-app imports. Enterprise standards prohibit RTK for this project.

### Decision

Create `apps/container-movement` with server-rendered list/detail routes and BFF
session/API adapters. Use focused client components for filters, responsive
capture, retry, and persistent live feedback; keep form state local. Consume
existing `@erp/ui` primitives and mount under the integration-owned shell.

### Consequences

- **Positive:** low client bundle, secure server session propagation, shareable
  routes, accessible loading/error boundaries, preserved form conflicts.
- **Negative:** server refresh/client outcome coordination needs explicit DTOs;
  missing shared primitives wait for W2-02/integration ownership.
- **Security/compliance:** backend remains authority; raw token/event data stays
  server/collapsed; WCAG/responsive evidence is explicit.
- **Reversibility:** focused clients can adopt another approved state mechanism
  later without changing route/data ownership.

### Alternatives Rejected

- **Global client store:** unnecessary shared state and prohibited RTK pressure.
- **Shell-owned page composition:** violates W2-04 page ownership and couples
  domain UI to shared chrome.

## ADR-009 - Last-known Reference Facts without Cached Authorization

### Context

Operators benefit from persisted journey visibility during dependency trouble,
but capture requires current Identity and Reference Data authority. The refined
interaction design already specifies labelled last-known data, disabled capture,
and Retry.

### Decision

Allow CMM-owned persisted detail/list reads when the CMM read transaction is
available **and Identity has authorized that read request**. Identity denial or
unavailability serves no new journey data; there is no authorization cache. A
browser may retain already-rendered data visibly stale but cannot refresh or
act. After successful authorization, Reference Data unavailability may label
persisted route/reference facts last-known and disables capture. CMM DB failure
fails the page; Kafka/Booking delay changes publication/projection labels only.
Backend checks always fail closed.

### Consequences

- **Positive:** useful operational visibility without accepting unsafe writes;
  clear recovery and lower outage blast radius.
- **Negative:** UI/API DTOs need freshness/dependency metadata and careful
  distinction between denied, unavailable, and stale.
- **Security/compliance:** stale display never becomes authorization; capture
  cannot queue unvalidated business facts.
- **Reversibility:** whole-page failure can be selected later if policy demands,
  without changing accepted-state persistence.

### Alternatives Rejected

- **Fail whole page:** secure but unnecessarily removes CMM-owned persisted
  visibility.
- **Queue unvalidated capture:** risks invalid/unauthorized accepted facts and
  violates atomic authoritative validation.

## ADR-010 - Event Choreography and Serialized On-prem Acceptance

### Context

The vertical slice crosses Booking, Kafka/SR, CMM, Identity, Reference Data,
PostgreSQL, shared shell, and both UIs. The program requires real broker/database/
UI evidence and one controller for `linercore-wave-a`, while port 8088 remains a
protected manager demo. Public-cloud expansion is out of scope.

### Decision

Retain outbox-driven event choreography and existing on-prem Compose topology.
Use PB-01 as the first gated slice. Wait for W2-02 merge and integration sync
before final visual/live acceptance; reserve the isolated stack, use
`scripts/wave-a-compose.mjs`, run demo guard before/after, and run both audits.

### Consequences

- **Positive:** proves the actual delivery architecture; protects the manager
  demo; prevents concurrent evidence corruption; no cloud cost/vendor expansion.
- **Negative:** eventual consistency and serialized acceptance increase elapsed
  test time; environment failures require preserved evidence and controlled retry.
- **Security/compliance:** observed Identity/Kafka/database evidence and honest
  audit history are release inputs; W1 BLOCKED/waiver is never relabelled PASS.
- **Reversibility:** deploy topology can evolve later, but replacing event
  choreography is a hard cross-program contract change.

### Alternatives Rejected

- **Synchronous Booking/CMM shortcuts:** easier demo but violate service/event
  ownership and do not prove broker delivery.
- **Per-session Compose stacks or manager-demo reuse:** break serialized resource
  control or risk port 8088.
- **AWS expansion now:** unrelated to the approved slice and increases cost,
  security, and operational scope.

## Cross-Decision Trade-offs

The design deliberately accepts limited duplication (snapshot plus ledgers,
Booking latest projection) and eventual consistency in exchange for bounded
ownership, replay safety, and W1 preservation. Irreversible pressure is
concentrated in contracts and migrations, so both remain additive and jointly
verified. Easily reversible UI composition and degradation behavior remain
inside the CMM app, while security and event-delivery invariants stay server-side.

## Review Iteration 1

**Verdict: NOT-READY**

- All five required artifact shapes are present, cross-reference the confirmed
  Q&A, and consistently preserve Booking's latest-only ownership, W2-02's shell/
  `packages/ui` ownership, Kafka-only normal delivery, and the named exclusions.
- The capture authorization contract is not implementable as written:
  `MovementCaptureUseCase.capture` accepts only `CaptureMovementCommand`, while
  the use case is said to authorize the authenticated subject. Define an explicit
  subject/request-context parameter or port; do not leave authority in an
  adapter-global or thread-local implicit dependency.
- Rejected-request idempotency is incomplete. `CaptureRequestRepository` stores a
  fingerprint and disposition, but `evaluateCapture` can receive only an
  `Optional<AcceptedMovement>`. Specify replay of a prior rejected key, same-key/
  different-fingerprint behavior, concurrent insert handling, and whether repeat
  conflicts reuse or append rejection evidence.
- ADR-009 promises last-known reads during dependency trouble, but reads require
  authoritative Identity evaluation and no cache/freshness source or policy is
  defined. State the dependency matrix explicitly: which outage permits which
  already-authorized read, how freshness is derived, and when read must fail
  closed; Reference Data and Identity failure cannot share an undefined path.
- Outbox lease recovery lacks fencing. `claimBatch` returns events, while all
  completion methods update by `eventId` alone, allowing an expired worker to
  mark a row after another worker reclaims it. Return a claim token/version and
  require conditional owner/state transitions for publish, retry, and permanent
  failure.
- Resolve these contract-level gaps across components, methods, services,
  dependencies, and the relevant ADRs before implementation; they materially
  affect transaction correctness, authorization, and failure blast radius.

## Review Iteration 1 Resolution

- Added explicit `CaptureRequestContext`/subject parameters from verified REST
  session through the application use case; removed implicit authority.
- Defined atomic idempotency claim outcomes, immutable stored accepted/rejected
  dispositions, same/different fingerprint replay behavior, concurrent
  serialization, and per-attempt evidence.
- Split Identity denial/unavailability from Reference Data freshness and CMM/
  Kafka/Booking failure behavior; last-known never represents cached authority.
- Added worker/token/version outbox fencing and conditional completion semantics,
  while retaining safe at-least-once redelivery.

## Review

**Verdict: NOT-READY**

- The Reference Data/Identity failure matrix and outbox claim fencing now resolve
  their iteration-1 findings, and `CaptureRequestContext` makes the subject
  explicit.
- Authorization ownership remains contradictory: `components.md` and ADR-007
  place Identity evaluation in the application use case, while
  `component-dependency.md` says the REST adapter authorizes and gives both REST
  and application direct Identity dependencies. Select one authoritative
  enforcement boundary for read and capture and align the matrix and flows.
- `components.md` names `CaptureMovementResult` variants as `MovementAccepted` /
  `MovementRejected`, but `component-methods.md` defines `CaptureAccepted` /
  `CaptureRejected`; the former are domain-decision types, not capture results.
- Idempotency semantics conflict: `components.md` and the dependency flow say a
  same-key/same-fingerprint request replays its stored result, while the methods,
  services, and ADR say a previously accepted request becomes a new 409 duplicate.
  Choose one wire-visible outcome. Also, the frontend `duplicate` variant requires
  `original`, although `IDEMPOTENCY_KEY_REUSED` has no guaranteed original
  movement; define a distinct or optional contract.
- `CaptureAttemptRepository` is said to record every invocation, but the accepted
  and rejected atomic write sets omit it in several artifacts. Specify its
  transaction membership and the exact request/rejection/attempt writes for new,
  replayed, and conflicting-fingerprint branches.

## Builder Remediation after Reviewer Iteration Limit

- Selected the application use case as the sole authorization enforcement
  boundary; REST authenticates, creates explicit context, maps, and delegates.
- Corrected application capture-result variants to `CaptureAccepted` and
  `CaptureRejected`, leaving `MovementAccepted`/`MovementRejected` in the domain.
- Standardized every same/conflicting idempotency-key attempt on wire-visible
  `DUPLICATE_MOVEMENT` without aggregate re-evaluation; the response carries
  optional original movement/rejection evidence and a required reason code.
- Added capture-attempt membership and exact new/replay/conflicting write sets to
  accepted/rejected transactions across all five artifacts.
- The configured two independent review iterations are exhausted, so these
  corrections are builder-verified and sensor-checked but do not replace the
  recorded final independent `NOT-READY` verdict.
