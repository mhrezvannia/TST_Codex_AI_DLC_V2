# Code Generation Plan - UOW-07 Outbox Publication and Event Status

## Scope

Preserve the event-status boundary for the walking skeleton and defer Kafka/outbox implementation until backend runtime prerequisites are available.

## Steps

- [x] Step 1: Keep BFF record normalization event status explicit as `unknown` until reference-data-service returns publication status with records. Traceability: FR-025 through FR-027.
- [x] Step 2: Preserve correlation ids on mutation calls so outbox events can be traced once enabled. Traceability: NFR-006.
- [ ] Step 3: Implement Kafka publisher and Schema Registry adapter in reference-data-service. Traceability: ADR-004.
- [ ] Step 4: Persist outbox status and expose it to BFF/UI. Traceability: FR-025 through FR-027.
- [ ] Step 5: Add Java and contract/message tests after Java/Maven/Docker are available. Traceability: NFR-004.

## Review

PARTIAL for B01: mutation calls now carry correlation metadata, but outbox publication remains the next backend implementation task.
