# NFR Design Questions - container-movement-domain

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, and application-level `components.md` and `services.md`.

No additional human questions were required for this Construction unit. The approved NFR Requirements already define movement latency, status throughput, CMM security controls, scale baseline, deduplication, ordering, idempotency, recoverable publication, and the greenfield CMM service stack.

## Resolved Design Inputs

| Topic | Resolved input used for design |
|---|---|
| Resilience | Database-backed deduplication, ordering/staleness checks, idempotent event handling, recoverable status publication, and boundary checks. |
| Scalability | First release supports 10,000 journeys, 100,000 movement records, 25,000 status snapshots, 10,000 duplicate/out-of-order cases, and 50 concurrent users. |
| Performance | Journey/status query p95 <= 300 ms, movement capture p95 <= 500 ms, expected movement and status derivation p95 <= 1 second. |
| Security | Keycloak/JWT, capability checks, service identity for events, audit, and no Booking/Charge SQL access. |
| Logical boundaries | CMM owns movement facts, journeys, status derivation, and history; it does not decide D&D relevance, mutate Booking lifecycle, or calculate pricing. |

## Ambiguity Analysis

No blocking ambiguity was found. Exact ordering precedence, index definitions, and message-pact fixtures are implementation choices constrained by this design.
