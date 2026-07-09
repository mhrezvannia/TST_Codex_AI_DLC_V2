# NFR Design Questions - shared-platform-reference-events

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, and application-level `components.md` and `services.md`.

No additional human questions were required for this Construction unit. The approved NFR Requirements already define API latency, outbox throughput, security controls, scale baseline, transactional outbox reliability, Schema Registry behavior, and brownfield Reference Data Service stack.

## Resolved Design Inputs

| Topic | Resolved input used for design |
|---|---|
| Resilience | Reference mutations commit state and outbox atomically; publisher failures retry and surface outbox health. |
| Scalability | First release supports 50 reference sets, 10,000 active records, 100,000 history rows, 10,000 changed events, and Charge/Booking/CMM/UI/operations consumers. |
| Performance | Lookup and validation p95 <= 150 ms; mutation p95 <= 300 ms excluding downstream publish; outbox enqueue p95 <= 100 ms. |
| Security | Keycloak/JWT, capability checks, audit, service identity, event producer identity, correlation ID, schema version, and no direct database joins. |
| Logical boundaries | Reference Data owns lifecycle, validation APIs, events, outbox, and health; consumers use APIs/events only. |

## Ambiguity Analysis

No blocking ambiguity was found. Exact query indexes, outbox lease durations, and publisher batch sizes are implementation choices constrained by this design.
