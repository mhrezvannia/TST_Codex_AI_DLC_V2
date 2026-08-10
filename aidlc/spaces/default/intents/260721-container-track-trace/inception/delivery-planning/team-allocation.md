# Team Allocation - W2-04 Container Journey & Track-Trace

## Source Alignment

Allocation follows `requirements.md`, `stories.md`, refined `mockups.md`,
application `components.md`, `unit-of-work.md`,
`unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and
`team-practices.md`. It uses the approved one stream-aligned W2-04 intent mob
from Team Formation; role coverage is required, but no named availability,
headcount, utilization, location, or timezone is invented.

## Program Board

| Bolt/gate | Accountable driver | Required navigator/review hats | Consulted owner | Concurrency |
| --- | --- | --- | --- | --- |
| B01 U01 | W2-04 intent mob / CMM domain lead | Java/Spring, Kafka/Avro, PostgreSQL/Flyway, CMM UI/UX, quality/release, platform/security | Booking contract/consumer owner; Identity/Reference Data; W2-02 UI owner for shared-primitives questions | Must gate before B02/B03 |
| B02 U02 | W2-04 intent mob / CMM domain lead | Lifecycle/domain, persistence/outbox, contract, Booking consumer/projection, CMM/Booking UI evidence, quality | Booking owner co-signs consumer-impacting contract/projection changes | May run beside B03 after B01; live stack serialized |
| B03 U03 | W2-04 intent mob / CMM domain lead | Identity authorization, Reference Data degradation, audit/security, CMM UI accessibility, quality | Identity and Reference Data owners; W2-02 UI owner only for shared-system questions | May run beside B02 after B01; live stack serialized |
| Final intent gate | Quality/release reviewer | CMM, Booking, UI/UX, platform/security, audit reviewers | W2-02 integration owner; stack-slot coordinator | Exclusive `linercore-wave-a`; no concurrent controller |

## Mob Responsibilities

- **Intent driver/product navigator:** protect scope, DAG, merge order, and evidence completeness.
- **CMM domain lead:** own journey invariants, DCSA code/load-state meaning, lifecycle, producer status semantics, and migration chain.
- **Booking reviewer:** co-sign status compatibility, receipt ordering, latest projection, and bounded UI change.
- **UI/UX reviewer:** enforce MASTER/session/page record, Container Movement ownership, shared shell, responsive/a11y states, and no `packages/ui` redesign.
- **Quality/release reviewer:** write tests alongside code, preserve evidence integrity, reserve live stack, run demo guards and audits.
- **Platform/security reviewer:** validate Kafka/Schema Registry/outbox health, exact Identity permissions, fail-closed behavior, and actor/correlation audit.
- **W2-02 owner:** owns shared UI primitives/master and provides synchronization sign-off; does not delegate shared-system ownership to W2-04.

## Collaboration Rules

The mob may rotate driver/navigator roles and use focused specialist review, but
no horizontal team may accept a partial layer as a Bolt. Contract providers and
consumers may implement concurrently behind a reviewed schema; the Bolt closes
only when the real seam is observed. B02/B03 can have concurrent implementation
sessions, but the release reviewer serializes all isolated-stack evidence.

W2-03 remains informed about overlapping integration/stack timing. It neither
owns W2-04 files nor blocks W2-04 except through the shared one-controller stack
reservation applied equally to every Wave A session.

## Handoffs and Sign-offs

| Handoff | Evidence required | Blocks |
| --- | --- | --- |
| B01 -> B02/B03 | Approved B01 live DoD, exact contracts, migration ownership, user gate | Dependent Bolt completion |
| CMM producer -> Booking consumer | Avro/AsyncAPI/Pact compatibility plus receipt/projection tests and owner co-sign | B01/B02 contract closure |
| W2-02 -> W2-04 | W2-02 merged integration commit and resolved UI synchronization | Final visual/live acceptance and W2-04 merge |
| Bolt implementation -> release reviewer | Fast checks, focused Playwright, database/broker/audit probes, known risks | Live slot use |
| Release reviewer -> merge | Full Exit Gate evidence and green audits | W2-04 completion |

## Capacity and Escalation

Availability remains a dependency to confirm, not an assumed percentage. If a
required owner or the stack slot is unavailable, continue safe independent
work that does not cross that decision boundary and escalate the exact gate.
Do not invent an AWS/vendor dependency; use focused enabling support only for
an observed gap.

