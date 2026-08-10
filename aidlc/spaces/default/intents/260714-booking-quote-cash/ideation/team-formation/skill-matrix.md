# Skill Matrix - W1-01 Booking Quote-to-Cash

## Source And Scale

Required capabilities derive from `ideation/scope-definition/scope-document.md`, `ideation/scope-definition/intent-backlog.md`, and `ideation/feasibility/feasibility-assessment.md`.

Scale: **Required depth** is Working, Advanced, or Specialist. **Coverage** describes how the user/Codex operating model obtains evidence; it is not a personnel proficiency claim.

## Required Skills And Coverage

| Capability | Required depth | Proto-Units | Primary role hat | Coverage and verification | Gap status |
|---|---|---|---|---|---|
| Booking domain/state modeling | Advanced | PU-01-PU-06 | Booking driver | Existing state-machine source, contract mapping, domain tests | Covered with brownfield verification |
| PostgreSQL/JDBC migration and transactionality | Advanced | PU-01, PU-04, PU-05 | Booking/CMM data reviewer | Legacy fixture, migration integration tests, rollback tests | High-risk; verify early |
| Spring Boot HTTP integration | Working | PU-02, PU-03 | Booking + provider reviewers | Consumer/provider tests and live Compose calls | Covered by existing seams |
| Kafka consumer semantics | Specialist | PU-04, PU-05, PU-06 | Messaging reviewer | Official API research, acknowledgement/rollback/redelivery tests | Current repository gap |
| Avro and Schema Registry | Advanced | PU-04, PU-05 | Contract reviewer | Authoritative `.avsc`, generated records, serde tests, live subject/topic proof | Producer base exists; consumer work missing |
| Shared outbox relay | Advanced | PU-04-PU-06 | Shared Platform reviewer | Reuse W0 module/configuration and source audit | Covered; modification discouraged |
| CMM journey/idempotency model | Advanced | PU-04-PU-06 | CMM reviewer | Revision upsert, dedupe, stale/replay tests | Partial existing coverage |
| Charge pricing contract | Advanced | PU-03 | Charge reviewer | Frozen bilateral tests and live quote | Existing provider; mapping update risk |
| Next.js/React/TypeScript | Advanced | PU-01-PU-05 | UI reviewer | Restore baseline, component/API tests, typecheck/lint, browser proof | Current source tree incomplete |
| Docker Compose/runtime diagnosis | Advanced | PU-02-PU-06 | Live-proof reviewer | Preflight, service health/logs, restart/redelivery runbook | W0 proven; W1 rerun required |
| Contract and integration testing | Specialist | All | Quality reviewer | Domain, repository, provider/consumer, serde, duplicate/stale, browser tests | Required throughout |
| ERP fidelity and AI-DLC audit | Working | PU-06 | Quality/approval owner | Detector outputs linked in evidence bundle | Established repository practice |

## Gap Analysis

### Release-critical gaps

1. **Kafka consumer implementation:** no repository consumer pattern exists. Resolve through official library guidance, focused adapter design, and transaction/redelivery tests before HTTP cutover.
2. **Compatible Booking migration:** flat snapshots and indexes must evolve without dropping existing records. Resolve with executable legacy fixtures before new fields become mandatory.
3. **Booking frontend baseline:** missing page/data/test files must be restored in PU-01 before later journey states are layered on.
4. **Cross-contract mapping:** both event schemas currently diverge from frozen contracts. Resolve schema, mapping, serde, producer, and consumer changes as one reviewed set.

### Non-blocking gaps

- Production AWS architecture and operations staffing are intentionally unknown and deferred.
- Broader tariff, T&T, auth, shell, D&D, amendment, multi-leg, and special-cargo expertise belongs to later intents.

## Remediation And Review Triggers

| Trigger | Required action | Reviewer hat |
|---|---|---|
| Shared messaging source must change | Demonstrate why service-local adoption is insufficient and protect W0 consumers | Shared Platform |
| `.avsc` field/type change | Trace to frozen contract and obtain both producer/consumer review | Booking + CMM contract owners |
| Charge request/result semantic change | Re-run bilateral consumer/provider suite and preserve timeout/idempotency behavior | Charge |
| Snapshot/index schema change | Run legacy migration fixture and rollback-safe integration tests | Booking data |
| UI route/data contract change | Run frontend tests/typecheck and browser-state proof | UI + quality |
| Compose-only failure | Diagnose image, port, health, topic, registry, and database state; do not replace with mocks | Live-proof |

## Skill Sufficiency Decision

Proceed with the confirmed role-based coverage. No external staffing is required now. A gap becomes a delivery blocker when focused research and executable verification cannot establish the required behavior; at that point the user receives the exact evidence and escalation choice rather than an assumed workaround.
