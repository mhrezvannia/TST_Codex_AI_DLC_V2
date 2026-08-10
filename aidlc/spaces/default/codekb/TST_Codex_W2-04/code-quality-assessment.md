# Code Quality Assessment

## Executive Assessment

The repository has strong architectural foundations: service-owned data, hexagonal module boundaries, domain invariants, transactional application seams, idempotency/receipt storage, transactional outboxes, registered Avro contracts, and durable audit adapters. W2-04 is nevertheless **at risk** because the current CMM semantics, persistence vocabulary, executable contracts, and UI do not yet implement the requested DCSA sequence or observable rejection behavior.

This is a static source/configuration assessment at branch `intent/W2-04-container-journey-track-trace`, HEAD `c2f13dd9c2ca2fe754a075f6688c74d7bdb90b0f`. No build, test, Compose run, broker observation, or database query was performed in this pass.

## Tests and Coverage

| Area | Present | Material gap |
|---|---|---|
| CMM domain/application | JUnit tests for aggregate/application behavior and event/Avro mapping | No complete GTOT/LOAD/DISC/GTIN transition matrix, five-state lifecycle, semantic out-of-sequence cases, or unchanged-state rejection proof. |
| CMM REST | Controller exists with 400/403/404/409 mapping | No controller integration suite proving DCSA request shape, correlation fidelity, stable duplicate/sequence codes, and error fields. |
| CMM persistence | JDBC adapters and schema initializer exist | No PostgreSQL-backed migration/restart/existing-data suite; no Flyway chain; request-hash idempotency conflict is absent. |
| Booking return path | Application, mapper, API, Flyway, and projection tests exist | Latest-only projection lacks sequence/history; no full live CMM-to-Booking progression proof. |
| Frontend | Vitest coverage includes Booking `JourneyStatusPanel` | No CMM application/page tests because the app is absent; no expected-versus-actual timeline or capture/rejection UI coverage. |
| Browser acceptance | Playwright 1.61.1 is installed | Current CI does not run Playwright; W2-04 needs live list/detail/capture/rejection and Booking-consumption evidence. |

No enforced JaCoCo or other numeric backend coverage threshold was observed. Passing existing tests therefore cannot substitute for risk-based coverage of movement sequencing, persistence restart, and cross-service contracts.

## Static Analysis, Build, and CI/CD

- Frontend lint/type/test/build tasks exist through Yarn/Turbo, with ESLint 9.17.0 and strict TypeScript 5.7.2.
- Backend tests run through Maven/JUnit 5.11.3.
- Contract catalog and Schema Registry compatibility tooling exist.
- Current CI does not enforce Playwright acceptance, a numeric coverage floor, or an observed security-scanning gate.
- `aidlc-audit` and `erp-fidelity-audit` are required delivery gates, but audit output remains a lead until exact source/runtime evidence confirms it.
- Manager-demo protection and isolated Wave A orchestration are explicit operational safeguards, not ordinary unit-test coverage.

## Documentation and Contract Quality

The repository has substantial intent, workflow, design-system, AsyncAPI, Avro, Pact, and enterprise-contract documentation. Quality is reduced by executable/document drift:

- documentation calls the inbound channel `booking.confirmed`, while executable configuration uses topic `booking.events` plus envelope type `booking.confirmed`;
- the CMM OpenAPI surface is absent;
- the enterprise CMM status appendix and executable Avro omit `sequenceNumber`;
- the status Pact fixture remains pending rather than signed proof;
- runtime profiles name a CMM app that source, Compose, Nginx, and shell navigation do not yet provide.

These discrepancies should be corrected through one coordinated contract change, not by treating prose as executable truth.

## Technical Debt and Risk Register

| Severity | Finding | Consequence / required response |
|---|---|---|
| Critical | CMM Java and SQL outbox status vocabularies disagree. | Relay rows may be normalized incorrectly after restart; introduce an additive migration and prove claim/retry/restart behavior. |
| High | `ContainerJourney` uses generic movement types and `PLANNED/IN_TRANSIT/ARRIVED/DELIVERED/EXCEPTION`. | Cannot satisfy GTOT/LOAD/DISC/GTIN or the target five-state lifecycle without domain-model changes. |
| High | Duplicate capture silently returns an existing journey; out-of-order validation is timestamp-only and unaudited. | Rejections are not operationally observable and may conceal conflicting payloads; add semantic result codes, request identity/hash, audit evidence, and unchanged-state tests. |
| High | Status mapper hardcodes `LADEN`, lacks sequence, and maps generic events lossily. | Booking receives facts that are not faithful to the accepted command; evolve contract and mapping together. |
| High | Booking projection is latest-only and sequence-free. | It cannot prove or display full movement progression; add ordered history or an explicitly scoped projection evolution. |
| High | CMM UI is absent while runtime profile claims it exists. | No owned operational list/detail/timeline/capture surface; add only the W2-04 module and minimum mount seams. |
| Medium | CMM uses mutable SQL initialization and no Flyway chain. | Upgrade/restart behavior is hard to reason about; follow Booking's ordered migration precedent. |
| Medium | Large application/controller hotspots exist. | Avoid adding domain conditionals to `ContainerMovementApplicationService`, Booking controller, or `packages/ui`; keep policy in focused domain/application collaborators. |
| Medium | Controller substitutes `local-correlation`. | Operational rejection evidence can lose causality; propagate caller correlation without leaking infrastructure detail. |
| Medium | Graph indexes are incomplete/noisy for the cross-service path. | Continue graph-first discovery, but confirm exact qualified symbols and source/contracts before decisions. |

## Recommended Quality Gates for W2-04

1. Domain table tests cover every allowed and rejected GTOT/LOAD/DISC/GTIN transition and all five lifecycle states.
2. Duplicate and out-of-sequence API tests assert stable codes/correlation and unchanged journey, outbox, and Booking projection state.
3. PostgreSQL-backed tests cover migrations, outbox state vocabulary, claim/retry/restart, idempotency conflict, and ordered history.
4. Avro compatibility, AsyncAPI/examples, Pact fixtures, producer/consumer mappers, SQL, and UI types evolve together with `sequenceNumber`.
5. Live isolated acceptance proves `booking.confirmed -> CMM DB -> containermovement.status -> Booking DB`, then Playwright proves CMM and Booking UI behavior.
6. Run `npm run demo:guard` before and after `scripts/wave-a-compose.mjs`; final `aidlc-audit` and `erp-fidelity-audit` must be green.

## Historical Evidence Integrity

W1 evidence is chronological and must remain distinct:

- `artifacts/w1-01-live/codegen-live-blocked-image-pull/index.md` is `BLOCKED`.
- `artifacts/w1-01-live/w1-test-acceptance-waiver-20260717/acceptance-waiver.md` authorizes test-project integration only and explicitly does **not** convert blocked live acceptance to PASS.
- `artifacts/w1-01-live/w1-real-pass-20260720-verified/index.md` is a separate later `PASSED` run; it does not rewrite the blocked record or waiver and lacks complete branch/dirty-tree provenance for this W2-04 snapshot.

W2-04 must create new evidence rather than editing or relabeling any of these records.
