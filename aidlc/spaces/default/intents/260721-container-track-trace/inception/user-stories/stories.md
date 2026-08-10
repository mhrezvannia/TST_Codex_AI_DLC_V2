# User Stories - W2-04 Container Journey & Track-Trace

## Story Map and Scope

The map derives from `requirements.md`, the actor outcomes in
`business-overview.md`, the existing seams in `component-inventory.md`, and the
PB-01/risk posture in `team-practices.md`.

| Journey step | Story | Persona | MoSCoW | Requirement trace |
|---|---|---|---|---|
| Prepare | US-01 Event-created journey and expected plan | Elena | Must Have | FR-01, FR-02; AC-01 |
| Understand | US-02 Find and inspect the canonical timeline | Elena | Must Have | FR-03, FR-13; AC-09 |
| Record | US-03 Capture the next valid DCSA movement | Elena | Must Have | FR-04, FR-05, FR-07, FR-08; AC-02, AC-05 |
| Recover | US-04 Understand a duplicate rejection | Elena | Must Have | FR-06; AC-03 |
| Recover | US-05 Correct an out-of-sequence move | Elena | Must Have | FR-06; AC-04 |
| Propagate | US-06 Consume ordered status into Booking | Sam | Must Have | FR-08, FR-09, FR-10; AC-05, AC-06 |
| Explain | US-07 See latest progress from Booking | Sam | Must Have | FR-11, FR-13; AC-07, AC-09 |
| Protect | US-08 Enforce read-only and capture permissions | Sam | Must Have | FR-12; AC-08 |
| Prove | US-09 Reproduce release-grade vertical evidence | Priya | Must Have | FR-14; AC-10, AC-11, AC-12 |

Named exclusions are **Won't Have for W2-04**: EDI ingestion, public DCSA APIs,
multi-leg/transshipment, fleet registry, depot stock, leasing depth, M&R, D&D,
predictive ETA, public portal, shared-shell/`packages/ui` redesign, and public
cloud expansion.

## US-01 - Event-created Journey and Expected Plan

**Story.** As Elena, I want a container journey prepared from the confirmed
booking, so that I can begin operations from an authoritative plan instead of
re-entering booking data.

**Priority:** Must Have

**Acceptance criteria**

1. Given a Schema-Registry-valid logical `booking.confirmed` on physical topic
   `booking.events` for a one-leg booking with one assigned ISO 6346 container,
   when CMM consumes the event, then exactly one journey starts as Allocated.
2. Given that journey, when Elena opens it, then expected LOAD at POL precedes
   expected DISC at POD and the next required movement is GTOT.
3. Given the same event is delivered again, when CMM consumes the replay, then
   it records a successful idempotent duplicate outcome and does not create a
   second journey or expected plan.
4. Given an inactive route reference or incompatible booking assignment, when
   intake is evaluated, then CMM records an explicit failed outcome and does not
   create a partially valid journey.

**Dependencies and relationships:** Starts PB-01; depends on the existing
Booking confirmation contract, Schema Registry, Identity service identity, and
Reference Data validation. Enables US-02 and US-03.

**INVEST:** Vertical and independently demonstrable from broker to CMM read;
negotiable in implementation, valuable to Equipment Control, estimable within
the existing intake seam, small at one booking/container/leg, and directly
testable by AC-01.

## US-02 - Find and Inspect the Canonical Timeline

**Story.** As Elena, I want to find a journey and understand its expected and
actual timeline, so that I know the current lifecycle and next operating action.

**Priority:** Must Have

**Acceptance criteria**

1. Given one or more authorized journeys, when Elena opens Container Movement,
   then the shared-shell list shows booking, equipment, route, lifecycle, next
   expected action, and a stable link to detail.
2. Given a journey detail route, when it loads, then one h1 identifies the
   journey and booking, route, equipment, lifecycle, next move, expected LOAD/
   DISC, actual history, and Booking cross-link are visible with non-color text.
3. Given no journeys, unknown detail, loading, retryable service failure, or
   denied access, when the page renders, then it shows the corresponding
   actionable empty/not-found/loading/error/denied state inside the shared shell.
4. Given 375, 768, 1024, or 1440 pixel width in light or dark theme, when Elena
   navigates by keyboard and screen reader, then the list/timeline reading order,
   focus, labels, and long operational values remain usable.

**Dependencies and relationships:** Depends on US-01 for populated data but its
empty/error/denied states are independently testable. CMM owns this timeline;
US-07 links to it but does not duplicate it in Booking.

**INVEST:** Delivers a complete read journey without capture; UI composition is
negotiable within the approved page record, value and test outcomes are clear,
and the bounded list/detail states are estimable and automatable.

## US-03 - Capture the Next Valid DCSA Movement

**Story.** As Elena, I want to record the next physical container movement, so
that the canonical journey and downstream booking progress match operations.

**Priority:** Must Have

**Acceptance criteria**

1. Given an Allocated journey and Elena's capture permission, when she submits
   ACT GTOT with canonical equipment, active UN/LOCODE, occurrence time, source,
   correlation, idempotency key, and LADEN, then CMM atomically records sequence
   1 and transitions to Gated-out.
2. Given the preceding accepted state, when Elena submits ACT LOAD/LADEN, then
   ACT DISC/LADEN, then ACT GTIN/EMPTY, then sequences 2/3/4 transition the
   journey to In-transit, Discharged, and Returned-empty respectively.
3. Given an accepted movement, when its transaction commits, then actual
   history, lifecycle, audit, request identity, and one pending status outbox row
   agree; a retry or restart does not double-advance them.
4. Given capture is pending or succeeds, when the UI updates, then it announces
   progress/success, focuses the appropriate summary, shows the next action, and
   never relies on color alone.
5. Given invalid equipment, location, classifier, empty indicator, time, or
   required input, when Elena submits, then field-linked validation preserves
   entered values and no accepted movement/outbox effect is created.

**Dependencies and relationships:** Depends on US-01 and permission setup in
US-08. Produces the facts consumed by US-06 and visible in US-02/US-07. US-04
and US-05 specify distinct conflict paths.

**INVEST:** One reusable capture behavior spans four deliberately tiny state
variations; each transition is independently testable even though the complete
release scenario executes them in order.

## US-04 - Understand a Duplicate Rejection

**Story.** As Elena, I want a repeated movement attempt identified as a
duplicate, so that I can trust the original accepted record and avoid accidental
double advancement.

**Priority:** Must Have

**Acceptance criteria**

1. Given an accepted GTOT, when Elena resubmits the same manual occurrence or
   idempotency key, then the API returns HTTP 409 `DUPLICATE_MOVEMENT` with the
   original evidence, stable reason, and correlation.
2. Given that response, when the capture UI renders it, then Elena's entered
   values remain present, focus reaches the error summary, and a link/description
   identifies the original accepted move and recovery action.
3. Given pre-attempt counts/hashes for journey, accepted history, status outbox,
   and Booking projection, when the duplicate is rejected, then all remain
   unchanged while an explicit rejection audit row is durable.
4. Given the broker re-delivers an already applied status event, when Booking
   consumes it, then that transport replay remains a successful idempotent
   duplicate disposition rather than an HTTP-style manual rejection.

**Dependencies and relationships:** Depends on one accepted US-03 movement;
parallel to US-05 and intentionally separate because its evidence and recovery
differ.

**INVEST:** A single business-rule variation with unique user value, stable
observable outcomes, bounded effort, and independent negative-path automation.

## US-05 - Correct an Out-of-Sequence Move

**Story.** As Elena, I want an illegal next move rejected with the required
next action, so that I can correct the operational record without corrupting the
journey.

**Priority:** Must Have

**Acceptance criteria**

1. Given GTOT is the latest accepted move, when Elena submits DISC, then the API
   returns HTTP 409 `OUT_OF_SEQUENCE_MOVEMENT`, the current lifecycle, and
   actionable evidence that LOAD is required next.
2. Given that rejection, when the capture UI renders it, then entered values are
   preserved, error summary and field guidance are keyboard/screen-reader
   reachable, and the next expected action is stated in text.
3. Given pre-attempt accepted-state evidence, when the illegal move is rejected,
   then journey lifecycle/history, status outbox, and Booking projection remain
   unchanged while a correlated rejection audit row is durable.
4. Given Elena corrects the code to LOAD without re-entering unaffected fields,
   when she submits the valid move, then US-03 acceptance behavior applies once.

**Dependencies and relationships:** Depends on one accepted US-03 movement;
parallel to US-04. Feeds the unchanged-state proof in US-09.

**INVEST:** Isolates one state-machine guard and recovery path; valuable,
estimable, small, and testable without combining unrelated duplicate semantics.

## US-06 - Consume Ordered Status into Booking

**Story.** As Sam, I want Booking to apply the strongest latest container status
from its own durable receipts, so that the progress I see is ordered and
trustworthy under retries.

**Priority:** Must Have

**Acceptance criteria**

1. Given an accepted CMM movement, when the outbox relay publishes
   `containermovement.status`, then the registered v1 record contains exact
   DCSA code/classifier/load-state/location/correlation and positive
   `sequenceNumber` matching CMM persistence.
2. Given Booking consumes a valid status for the assigned container, when its
   transaction commits, then one durable receipt records the disposition and
   only the latest per-container projection is updated.
3. Given duplicate or lower positive sequence events, when consumed, then
   receipts classify duplicate/stale outcomes and the stronger projection is
   unchanged.
4. Given a legacy v1 event with default sequence 0, when consumed, then Booking
   uses the occurrence/classifier fallback and remains BACKWARD compatible.
5. Given the event targets an unassigned container or invalid booking, when
   consumed, then the receipt/audit records rejection and no projection is
   incorrectly applied.

**Dependencies and relationships:** Depends on accepted US-03 moves and the
producer-owned Avro/AsyncAPI/Pact compatibility change. Enables US-07; full
timeline ownership remains with CMM/US-02.

**INVEST:** Bounded to the asynchronous receipt/projection transaction, valuable
to Customer Service, independently testable with event variants, and avoids
expanding the Booking aggregate or controller beyond the projection seam.

## US-07 - See Latest Progress from Booking

**Story.** As Sam, I want Booking detail to show the latest applied movement and
link to its canonical journey, so that I can answer progress questions without
rebuilding CMM history.

**Priority:** Must Have

**Acceptance criteria**

1. Given a confirmed booking awaiting a CMM status, when Sam opens detail, then
   the existing panel communicates pending, delayed/retry, or degraded state in
   plain language without exposing raw transport details.
2. Given a healthy isolated stack and accepted movement, when Booking consumes
   it, then within 30 seconds detail shows the matching latest code, readable
   lifecycle, equipment, location, occurrence time, and applied state.
3. Given Sam has CMM read permission, when the canonical journey link is
   activated, then it opens the stable CMM detail route; without read permission,
   the UI does not promise inaccessible history.
4. Given required viewports/themes and keyboard/screen-reader use, when pending,
   applied, retry, and degraded states render, then status is non-color-only and
   focus/read order remains usable.

**Dependencies and relationships:** Depends on US-06. Links to US-02 without
synchronous Booking-to-CMM data delivery or duplicating the expected/actual
timeline.

**INVEST:** A bounded Booking-owned presentation slice with measurable 30-second
behavior, independent UI states, and clear cross-link ownership.

## US-08 - Enforce Read-only and Capture Permissions

**Story.** As Sam, I want my read-only access separated from movement capture,
so that I can inspect progress without being able to change operational state.

**Priority:** Must Have

**Acceptance criteria**

1. Given authoritative Identity assignments for
   `w2-04-equipment-control`/`EQUIPMENT_CONTROL` and
   `w2-04-customer-service`/`CUSTOMER_SERVICE`, when both subjects list or open a
   journey, then `container-movement:read` authorizes both.
2. Given Sam's read-only subject, when capture is attempted through a deep link
   or direct API request, then the UI/API returns denied/403 with
   `CMM_AUTHORIZATION_DENIED` and an audit record.
3. Given the denied attempt, when database and broker evidence is inspected,
   then movement, lifecycle, accepted history, outbox, and Booking projection
   are unchanged.
4. Given Elena's Equipment Control assignment, when she submits the same valid
   next move, then `container-movement:capture-movement` authorizes US-03.
5. Given a non-local profile or unknown/blank/untrusted request actor fallback,
   when authorization is evaluated, then it fails closed rather than accepting
   any nonblank subject.

**Dependencies and relationships:** Identity catalog/role-assignment work is a
vertical prerequisite for protected US-02/US-03 routes; acceptance identities
are reused by US-09.

**INVEST:** One least-privilege outcome with explicit allowed/denied subjects,
stable effects, and independent security/UI/API verification.

## US-09 - Reproduce Release-grade Vertical Evidence

**Story.** As Priya, I want one reproducible acceptance record across broker,
databases, APIs, and UIs, so that I can release W2-04 without hiding integration
or evidence failures.

**Priority:** Must Have

**Acceptance criteria**

1. Given W2-02 has merged, W2-04 has synchronized with integration, exclusive
   `linercore-wave-a` stack control is reserved, and the pre-run
   `npm run demo:guard` is green, when acceptance starts through
   `scripts/wave-a-compose.mjs`, then no command targets the manager demo at
   port 8088.
2. Given one real confirmed booking, when GTOT/LOAD/DISC/GTIN are accepted, then
   correlated broker records, Schema Registry contracts, CMM database rows,
   Booking receipts/projection, and both owned UI surfaces agree through
   Returned-empty within the stated propagation bound.
3. Given duplicate and out-of-sequence probes, when unchanged-state evidence is
   captured, then API/UI rejections and audit rows agree and no accepted/outbox/
   Booking state changes.
4. Given existing W1 CMM data, when the additive migration and restart are
   exercised, then data remains readable and no destructive volume reset is
   used as proof.
5. Given UI evidence collection, when Playwright covers populated and required
   loading/empty/error/denied/rejection/degraded states at 375/768/1024/1440 in
   light/dark plus keyboard/a11y checks, then artifacts reference only W2-04
   Container Movement page ownership and the bounded Booking projection change.
6. Given the post-run demo guard, `aidlc-audit`, and `erp-fidelity-audit`, when
   all are executed, then they are green and the historical W1 BLOCKED record,
   waiver, and later separate PASS retain their original meanings.

**Dependencies and relationships:** Demonstrates US-01 through US-08 as one
serialized release scenario. One evidence-preserving retry is allowed only for
an environmental failure; deterministic failure remains blocking.

**INVEST:** Although cross-cutting, this is an independently repeatable reviewer
outcome rather than an implementation epic. It is bounded to the stated slice,
estimable as the final live gate, and testable by explicit artifact/result
criteria.

## Dependency and Delivery Relationships

PB-01 is the first gated walking skeleton: US-01 creates the plan, the first
GTOT instance of US-03 publishes through US-06, and US-07 renders the Booking
projection; one US-05 rejection proves the invalid-transition seam. Remaining
transition depth and page/evidence states build after that path is green.

| Story | Requires | Enables |
|---|---|---|
| US-01 | Existing Booking/Reference Data/Kafka seams | US-02, US-03 |
| US-02 | US-01 for populated state | US-07 canonical cross-link |
| US-03 | US-01, US-08 capture permission | US-04, US-05, US-06 |
| US-04 | One US-03 acceptance | US-09 unchanged-state proof |
| US-05 | One US-03 acceptance | PB-01 invalid path, US-09 |
| US-06 | US-03 status contract/outbox | US-07 |
| US-07 | US-06 | US-09 visual proof |
| US-08 | Identity catalog and assignments | Protected US-02/US-03, US-09 |
| US-09 | US-01 through US-08, W2-02 sync, stack reservation | Release decision |

Dependencies express demo/build order, not permission to deliver horizontal
database, broker, or UI-only stories. Units Generation remains responsible for
mapping these vertical outcomes to implementation units.

## INVEST and Definition-of-Ready Summary

All nine stories identify a defined persona, action, and value; have 3-6
Given/When/Then criteria; trace to approved requirements; name accepted
dependencies; and retain negotiable implementation detail. No story authorizes
scope outside the stated intent. UI stories reuse the shared shell and
`@erp/ui`, and CMM/Booking stories preserve bounded ownership and Kafka-only
normal delivery.

## Review

**Verdict: READY**

- The Execute assessment is justified by the user-facing, multi-persona,
  cross-service workflow; the three personas have distinct goals, permissions,
  relationships, and priority without inventing new business actors.
- All nine Must Have stories use persona/action/value form, contain 3-6
  Given/When/Then criteria, state dependencies and INVEST fitness, and remain
  bounded vertical outcomes. Named exclusions are explicitly Won't Have.
- Traceability is complete across FR-01 through FR-14 and AC-01 through AC-12.
  UI loading/empty/error/denied/rejection/degraded, responsive, theme, keyboard,
  and screen-reader states are testable without expanding shared-shell or
  `packages/ui` ownership.
- CMM retains canonical journey/timeline and status-production ownership;
  Booking retains its durable latest-only projection, with Kafka as the normal
  delivery path. Historical W1 BLOCKED, waiver, and later PASS evidence remain
  explicitly separate.
- `required-sections`, `upstream-coverage`, and `git diff --check` passed for the
  primary `stories.md` artifact.
