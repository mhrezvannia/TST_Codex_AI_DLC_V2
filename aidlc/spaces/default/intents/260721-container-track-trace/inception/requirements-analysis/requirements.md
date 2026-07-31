<!-- BINDING TEMPLATE. Keep the ## headings (required-sections sensor). -->

# Requirements - W2-04 Container Journey & Track-Trace

## Intent & Business Analysis

This brownfield feature closes the operational gap between a confirmed booking
and an observable container journey. Today, Booking can confirm work and CMM has
a generic journey/status implementation, but operations cannot rely on one
canonical, DCSA-coded lifecycle that begins from the real booking event, rejects
bad movement input visibly, and projects the latest accepted position back into
Booking.

- **Primary user outcome:** an equipment-control operator can find the journey
  created from a confirmed booking, record the four supported actual movements
  in order, understand the next required action, and see an actionable rejection
  without losing entered data.
- **Primary actor:** Equipment Control, authorized to read Container Movement
  journeys and capture movements.
- **Secondary actors:** Customer Service and Booking Desk users consume read-only
  journey/latest-status information; platform operators investigate durable
  consumer, outbox, and rejection evidence; the Booking and CMM service
  identities exchange events asynchronously.
- **Capability delta:** extend, rather than replace, the existing Booking, CMM,
  Identity, Reference Data, outbox, Schema Registry, Kafka, and shared-shell
  seams. The target adds event-created one-leg journeys, expected LOAD/DISC,
  ACT GTOT/LOAD/DISC/GTIN semantics, strict lifecycle transitions, observable
  rejection, ordered status projection, and CMM-owned timeline pages.
- **Business success:** on the isolated live stack, one confirmed booking yields
  one Allocated journey; four valid movements advance it to Returned-empty; each
  accepted movement reaches Booking within 30 seconds; duplicate and
  out-of-sequence attempts return stable 409 outcomes and leave accepted state
  unchanged; the complete path is reproducible from broker and database evidence
  plus keyboard-operable UI evidence.
- **Complexity and risk:** high integration complexity but intentionally narrow
  business breadth. The dominant risks are cross-service contract compatibility,
  at-least-once ordering/idempotency, additive CMM migration, identity
  authorization, and serialized Wave A live-stack ownership.

## Functional Requirements

1. **FR-01 - Event-created journey.** CMM shall consume a Schema-Registry-valid
   `booking.confirmed` envelope from the existing physical `booking.events`
   topic and idempotently create or reconcile exactly one journey for the
   confirmed booking revision and assigned ISO 6346 container.
2. **FR-02 - One-leg expected plan.** A newly created/reconciled journey shall
   persist exactly two ordered expected movements: LOAD at POL and DISC at POD,
   and shall start in lifecycle state Allocated.
3. **FR-03 - Canonical journey reads.** Authorized users shall list journeys
   and open a stable detail route showing booking, equipment, POL/POD, lifecycle,
   next expected movement, expected/actual timeline, and Booking link.
4. **FR-04 - DCSA ACT capture.** An authorized equipment-control user shall
   capture only GTOT, LOAD, DISC, or GTIN with
   `eventClassifierCode=ACT`, canonical equipment reference, UN/LOCODE,
   occurrence time, source, correlation, idempotency key, and empty indicator.
5. **FR-05 - Semantic lifecycle.** CMM shall accept only GTOT -> LOAD -> DISC
   -> GTIN and transition Allocated -> Gated-out -> In-transit -> Discharged ->
   Returned-empty. GTOT/LOAD/DISC use LADEN and GTIN uses EMPTY in this thin
   journey.
6. **FR-06 - Observable manual rejection.** A repeated manual occurrence or
   idempotency key shall return HTTP 409 `DUPLICATE_MOVEMENT`; an illegal next
   code shall return HTTP 409 `OUT_OF_SEQUENCE_MOVEMENT`. Both responses shall
   include stable reason/correlation and useful original/next-move evidence,
   preserve entered UI values, append rejection audit evidence, and leave
   journey, accepted history, status outbox, and Booking projection unchanged.
7. **FR-07 - Atomic accepted effects.** One accepted movement transaction shall
   atomically persist actual history, lifecycle, audit evidence, movement
   idempotency/request identity, and a pending status outbox row. Retry/restart
   shall not double-advance state.
8. **FR-08 - Status publication.** Each accepted movement shall publish one
   Schema-Registry-valid `containermovement.status` with the producer-owned v1
   envelope, `moveCode`, ACT classifier, occurrence/received times, derived
   status, empty indicator, location, correlation, and non-negative
   `sequenceNumber`. Accepted movement sequences are 1-4.
9. **FR-09 - Backward-compatible ordering.** The v1 Avro/AsyncAPI/Pact field
   `sequenceNumber` shall have a compatible default of 0. Booking shall use
   positive sequence as primary ordering for new events and retain the existing
   occurrence/classifier fallback for legacy sequence-0 events.
10. **FR-10 - Booking consumption.** Booking shall validate container
    assignment, insert a durable event receipt, classify duplicate/stale/applied
    outcomes, and update only its latest per-container projection without
    querying CMM data or duplicating the full CMM timeline.
11. **FR-11 - Booking presentation.** Booking detail shall show the latest
    applied code, classifier, readable lifecycle, equipment, location,
    occurrence time, and pending/applied state. It shall link to the canonical
    CMM journey when authorized.
12. **FR-12 - Authorization.** Journey list/detail shall require the Identity
    catalog tuple `container-movement:read` (`perm-container-movement-read`),
    while movement capture shall require the distinct tuple
    `container-movement:capture-movement`
    (`perm-container-movement-capture`). `EQUIPMENT_CONTROL` shall receive both
    permissions and `CUSTOMER_SERVICE` shall receive read only through the
    authoritative Identity role catalog/assignment evaluator. Request actor
    query/body fallbacks are not authority. Unauthorized capture shall return
    403, audit denial, and create no movement/outbox state.
13. **FR-13 - Operational states.** Container Movement list/detail/capture shall
    provide populated, loading, empty/not-found, retryable error, denied,
    validation, duplicate/sequence rejection, success/pending, and degraded
    states inside the shared shell.
14. **FR-14 - Acceptance evidence.** The release reviewer shall reproduce the
    complete broker-to-CMM-database-to-status-broker-to-Booking-database/UI
    journey plus duplicate/out-of-sequence unchanged-state proof on the
    isolated Wave A stack.

## Requirements Traceability

`Q1` through `Q6` refer to the approved Guide Me decisions recorded in
`requirements-analysis-questions.md`.

| Requirement | Originating need / source | Approved decision |
|---|---|---|
| FR-01 | `intent-statement.md` journey creation; `scope-document.md` event-to-journey boundary; `architecture.md` existing async seam | Q2 physical `booking.events` with logical `booking.confirmed` mapping |
| FR-02 | `intent-statement.md` expected LOAD/DISC and Allocated start; `business-overview.md` one-leg operating outcome | - |
| FR-03 | `intent-statement.md` timeline UI; `scope-document.md` CMM page ownership; `code-structure.md` existing reads/routes | Q4 canonical full timeline remains CMM-owned |
| FR-04 | `intent-statement.md` DCSA capture; `scope-document.md` supported-code boundary; `team-practices.md` explicit validation | Q6 authenticated capture permission |
| FR-05 | `intent-statement.md` lifecycle transitions; `business-overview.md` operator workflow | - |
| FR-06 | `intent-statement.md` observable rejection; `scope-document.md` unchanged-state proof; `team-practices.md` explicit domain outcomes | Q3 manual duplicate is HTTP 409 with original evidence |
| FR-07 | `architecture.md` transaction/outbox seams; `code-structure.md` current idempotency and persistence ports; `team-practices.md` boundary error discipline | Q3 rejection must not mutate accepted state |
| FR-08 | `intent-statement.md` status publication; `architecture.md` CMM-to-Booking broker path | Q1 defaulted non-negative v1 `sequenceNumber` |
| FR-09 | `scope-document.md` compatibility constraint; `code-structure.md` current Booking fallback ordering | Q1 BACKWARD-compatible default 0 and positive-sequence ordering |
| FR-10 | `intent-statement.md` Booking consumption; `architecture.md` Booking projection seam | Q4 latest projection plus durable receipts/sequence, not full timeline |
| FR-11 | `intent-statement.md` Booking presentation; `scope-document.md` ownership boundary; `business-overview.md` customer-service visibility | Q4 Booking owns latest-only projection |
| FR-12 | `scope-document.md` authorization boundary; `code-structure.md` CMM `AuthorizationPort`; `team-practices.md` fail-closed security | Q6 separate authenticated read/capture permissions |
| FR-13 | `intent-statement.md` timeline/capture UI; `scope-document.md` owned states; `team-practices.md` UI evidence matrix | Q3 preserve rejected input; Q6 denied state |
| FR-14 | `intent-statement.md` exit proof; `scope-document.md` serialized Wave A acceptance; `team-practices.md` live-gate policy | Q5 healthy-stack propagation at most 30 seconds |

## Data & Standards Alignment

| Concept | Standard / canonical name | Requirement |
|---|---|---|
| Container | ISO 6346 `equipmentReference` | Validate and display the assigned reference; do not invent a fleet registry |
| Movement code | DCSA T&T v2.2 `equipmentEventTypeCode`; v1 wire `moveCode` | GTOT, LOAD, DISC, GTIN only |
| Classifier | DCSA `eventClassifierCode` | ACT only for manual actual capture |
| Load state | DCSA `emptyIndicatorCode` | LADEN for GTOT/LOAD/DISC; EMPTY for GTIN |
| Location | UN/LOCODE `location.unLocationCode` | POL/POD and movement location use active reference identifiers |
| Time | `occurredDateTime`, `receivedDateTime` | UTC ISO-8601 instants; occurrence is business ordering evidence |
| Ordering | `sequenceNumber` | Default 0 for legacy; positive monotonically increasing actual movement sequence |
| Correlation | `correlationId` | Propagated across request, audit, outbox, broker, receipt, and evidence |

The domain may use richer typed value objects, but executable Avro field names
win at the wire boundary. Status meaning is never conveyed by color alone.

## Cross-Module Contracts

- **`booking.confirmed`** - Booking produces and CMM consumes asynchronously.
  The logical event remains the `type` discriminator carried on physical topic
  `booking.events`. `contracts/avro/booking.confirmed.avsc`, AsyncAPI, Pact,
  examples, mapper tests, and observed broker evidence must agree.
- **`containermovement.status`** - CMM produces and Booking consumes
  asynchronously on physical topic `containermovement.status`.
  `contracts/avro/containermovement.status.avsc`,
  `contracts/asyncapi/container-movement-events.yaml`, the enterprise
  contract, fixtures, producer/consumer mappers, and provider verification must
  add defaulted `sequenceNumber` together and pass BACKWARD compatibility.
- **Reference Data HTTP** - CMM validates active UN/LOCODE/equipment references
  through existing ports; unavailable and invalid outcomes remain distinct.
- **Identity/authorization** - The existing Identity catalog is authoritative.
  Add `perm-container-movement-read` for resource/action
  `container-movement:read` and `perm-container-movement-capture` for
  `container-movement:capture-movement`; grant both to `EQUIPMENT_CONTROL` and
  read only to `CUSTOMER_SERVICE`. Shell/API/consumers use authenticated subject
  and service identities. Actor query/body fallbacks are not authority.
- **UI integration** - W2-04 owns Container Movement composition; W2-02 owns
  `packages/ui` and shell. Booking owns its detail projection.

No synchronous Booking-to-CMM or CMM-to-Booking shortcut may replace either
asynchronous normal path.

## Non-Functional Requirements

1. **NFR-01 Reliability:** Both consumers shall tolerate at-least-once delivery;
   duplicates and stale events are durable, observable outcomes.
2. **NFR-02 Atomicity:** Accepted state/audit/outbox effects share one database
   transaction; rejected capture commits only permitted rejection evidence.
3. **NFR-03 Propagation:** On a healthy isolated local stack, an accepted
   movement shall appear in Booking's database and detail UI within 30 seconds.
4. **NFR-04 Migration:** CMM database change shall be additive and ordered,
   preserve W1 data, and prove upgrade, restart, and forward-repair behavior
   without destructive volume reset.
5. **NFR-05 Security:** Non-local profiles fail closed against the authoritative
   Identity evaluator. The CMM adapter shall no longer treat any nonblank
   subject as authorized. Read, capture, and service-consumer permissions are
   least privilege; secrets and raw payloads do not enter UI or evidence.
6. **NFR-06 Observability:** Audit records include actor/source, action, target,
   time, correlation, and applied/duplicate/stale/rejected outcome. Operator
   screens keep transport details collapsed.
7. **NFR-07 Accessibility:** Changed UI meets WCAG 2.2 AA intent with one h1,
   semantic table/list/timeline, labelled controls, error summary/field links,
   keyboard focus management, live announcements, reduced motion, and
   non-color status.
8. **NFR-08 Responsive/themes:** Playwright evidence covers 375, 768, 1024, and
   1440 pixels in light and dark themes for all required states.
9. **NFR-09 Quality:** Risk-based tests are written alongside code; contract,
   serde, lifecycle, rejection, migration, consumer, UI, and live acceptance
   failures block the applicable gate.
10. **NFR-10 Isolation:** Final live acceptance uses
    `scripts/wave-a-compose.mjs`/`linercore-wave-a` under one controller,
    with `npm run demo:guard` green before and after.

## Acceptance Criteria (live behavior)

1. **AC-01 (FR-01/02):** Given a confirmed one-leg booking with one assigned
   container, when the real registered event is delivered, then exactly one CMM
   journey is retrievable with Allocated state and expected LOAD@POL/DISC@POD.
2. **AC-02 (FR-04/05):** Given that journey, when GTOT, LOAD, DISC, and GTIN ACT
   movements are submitted in order, then each response/timeline/database state
   shows the corresponding lifecycle and sequence 1, 2, 3, and 4.
3. **AC-03 (FR-06):** Given accepted GTOT, when the same manual occurrence is
   resubmitted, then API/UI show `DUPLICATE_MOVEMENT`, original evidence and
   preserved input, while journey/history/outbox/Booking remain unchanged.
4. **AC-04 (FR-06):** Given GTOT is latest, when DISC is submitted, then API/UI
   show `OUT_OF_SEQUENCE_MOVEMENT` and “record LOAD next,” with an audit denial
   and no accepted state/publication/projection change.
5. **AC-05 (FR-07/08):** Given an accepted movement commit, when the relay runs,
   then one Avro-compatible status is observed on the broker with exact DCSA
   fields, correlation, and the matching positive sequence.
6. **AC-06 (FR-09/10):** Given duplicate, stale, legacy sequence-0, and positive
   sequence events, when Booking consumes them, then receipts record the correct
   disposition and only the strongest/latest valid projection is applied.
7. **AC-07 (FR-11/NFR-03):** Given a healthy isolated stack and accepted
   movement, when Booking detail is observed, then pending changes to applied
   within 30 seconds and displays the same current code/lifecycle.
8. **AC-08 (FR-12):** Given isolated-stack Identity assignments created through
   the authoritative role-assignment API by the local seed security admin for
   `w2-04-equipment-control` (`EQUIPMENT_CONTROL`) and
   `w2-04-customer-service` (`CUSTOMER_SERVICE`), when both subjects list/detail
   and the read-only customer-service subject attempts capture, then both reads
   succeed, capture returns 403 with `CMM_AUTHORIZATION_DENIED`, and movement,
   lifecycle, accepted history, status outbox, and Booking projection row counts
   are unchanged. The equipment-control subject can capture the same valid move.
9. **AC-09 (FR-13):** Given each required data/error/permission condition, when
   list/detail/capture renders at the four widths and two themes, then the
   specified state is keyboard and screen-reader operable without color-only
   meaning.
10. **AC-10 (NFR-04):** Given existing W1 CMM data, when additive migration and
    restart run, then the journey remains readable, relay statuses remain valid,
    and no destructive reset is used as evidence.
11. **AC-11 (FR-14/NFR-10):** Given exclusive Wave A stack control and a green
    pre-guard, when the complete journey and rejection probes run, then broker,
    both databases, both UIs, and evidence manifest agree and the post-guard is
    green.
12. **AC-12:** Given final evidence, when `aidlc-audit` and
    `erp-fidelity-audit` run, then both are green, ERP detector 4 finds DCSA in
    executable seams, and historical W1 waiver/BLOCKED records remain unchanged.

## Assumptions & Constraints

- Brownfield baseline is `c2f13dd`, descended from reconciled integration
  `c96b5b3`; prior merged intent behavior is preserved.
- W2-02 merges first. W2-04 synchronizes with integration before final visual/
  live acceptance; W2-03 remains parallel and disjoint.
- CMM owns journey/history/status production/database and Container Movement
  pages; Booking owns its projection/database/detail; shared UI owners retain
  shell and `packages/ui`.
- Only one Wave A session controls the isolated live stack at a time.
- One evidence-preserving retry is permitted for an environmental live failure;
  deterministic failures fail closed, and a blocker/waiver is never called PASS.
- The historical W1 BLOCKED manifest, waiver, and later separate PASS retain
  their original meanings.
- RTK is used only if available and already compatible; its absence does not
  authorize a new state-management framework.
- No production volume or latency baseline beyond the approved local 30-second
  projection target is asserted.
- EDI ingestion, public DCSA APIs, multi-leg/transshipment, fleet registry,
  depot stock, condition/lease breadth, M&R, D&D, predictive ETA, public portal,
  shared-shell redesign, and public-cloud expansion are out of scope.

## Open Questions

1. Any requirement blocked on a deferred enterprise decision?
   - A. None - all inputs required for this slice are available (recommended)
   - B. Yes (list the blocking decisions and owner)
   - X. Other
   - `[Answer]:` A. None; W2-02 synchronization and stack reservation are execution gates, not unresolved requirements.

## Review

**Verdict: NEEDS_REVISION**

- Add the stage-required intent analysis/business context: state the user outcome,
  primary and secondary actors, brownfield-to-target capability delta, and the
  measurable business success represented by this slice. The current artifact
  begins with implementation-facing FRs and does not itself complete the
  business-context dimension.
- Replace the aggregate traceability sentence with per-FR traceability to the
  applicable intent/scope/brownfield source and Q1-Q6 decision. Acceptance
  criteria already trace to FRs; individual FRs do not yet identify their
  originating need or decision.
- Make FR-12/AC-08 executable by naming the read and capture entitlement
  semantics (and the test-subject setup or authoritative identity source).
  "Distinct capabilities" is not enough for engineering or QA to determine
  who may list/detail versus capture without guessing.
- Q1-Q6 are otherwise reflected exactly: defaulted v1 `sequenceNumber`, the
  physical `booking.events` mapping, manual HTTP 409 duplicate handling,
  Booking latest-only projection, the 30-second local target, and separate
  read/capture authorization. DCSA code/classifier/load-state terminology,
  async ownership, scope exclusions, W1 waiver/BLOCKED evidence honesty, and
  serialized broker-to-database-to-Booking live acceptance are coherent and
  testable.
- `required-sections` and `upstream-coverage` passed for both primary outputs;
  `git diff --check` passed, and the two untracked outputs contain no trailing
  whitespace.

## Review - Iteration 2

**Verdict: READY**

- The intent and business analysis now states the brownfield capability gap,
  actors, user outcome, measurable success, and integration risks without
  broadening the approved slice.
- Every FR has explicit upstream and Q1-Q6 traceability, and the acceptance
  criteria remain behaviorally linked to the requirements.
- Authorization is executable: canonical read/capture permission tuples, role
  grants, authoritative Identity evaluation, seeded test subjects, denial code,
  and unchanged-state assertions are all specified.
- DCSA/ISO/UN/LOCODE terminology, defaulted v1 sequence compatibility,
  producer/consumer ownership, HTTP 409 rejection behavior, and latest-only
  Booking projection remain internally consistent and testable.
- Live acceptance retains serialized Wave A stack ownership, both demo guards,
  broker/database/UI evidence, audit gates, and honest separation of the W1
  waiver/BLOCKED records from the later real PASS.
