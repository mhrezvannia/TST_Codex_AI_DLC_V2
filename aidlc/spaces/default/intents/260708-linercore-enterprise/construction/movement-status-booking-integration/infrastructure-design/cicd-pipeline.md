# CI/CD Pipeline - movement-status-booking-integration

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Pipeline Gates

| Gate | Blocking rule |
|---|---|
| AsyncAPI/Avro validation | `containermovement.status` schema is executable and compatible. |
| Message-pact | CMM producer and Booking consumer fixtures pass. |
| Status publication | CMM status cannot claim publish-ready state without outbox/evidence. |
| Consumer dedupe | Duplicate status events do not duplicate lifecycle updates. |
| Staleness handling | Stale/out-of-order events produce deterministic quarantine or ignore behavior. |
| Boundary | Booking does not derive movement status; CMM does not decide D&D relevance. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Tests publish and consume/update budgets. |
| `security-design.md` | Enforces event identity and boundaries. |
| `scalability-design.md` | Validates event/duplicate/stale/update scale. |
| `reliability-design.md` | Proves publication, compatibility, dedupe, staleness, lifecycle update, and retry behavior. |
| `logical-components.md` | Maps CI checks to event seam components. |
| `components.md` | Preserves CMM/Booking ownership. |
| `services.md` | Covers Kafka/Avro/AsyncAPI/message-pact seam. |
| `business-logic-model.md` | Covers status publish and Booking lifecycle evidence. |
