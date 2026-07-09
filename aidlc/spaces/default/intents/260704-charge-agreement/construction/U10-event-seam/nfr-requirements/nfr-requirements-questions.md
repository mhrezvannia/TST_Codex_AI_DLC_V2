# NFR Requirements Questions - U10 Event Seam

## Questions

### Q1. What reliability target applies?

A. Event fact creation is testable when Kafka is unavailable; enterprise enablement requires durable outbox handoff with RPO 0 after domain commit.
B. Event publishing can be best-effort without durability.
C. Events are out of scope for lifecycle mutations.
X. Other (please specify)

[Answer]: A

### Q2. What security applies?

A. Facts contain operational identifiers, lifecycle event type, correlation ID, and occurred-at timestamp, but no secrets or sensitive free text.
B. Event facts may include full user tokens.
C. Event facts may include unrestricted comments.
X. Other (please specify)

[Answer]: A

### Q3. What scalability applies?

A. Messaging adapter can be added without changing application use cases; production target is at least 100 lifecycle events per minute with p95 publish latency under 250 ms after broker enablement.
B. Messaging requires rewriting use cases.
C. Throughput is intentionally undefined.
X. Other (please specify)

[Answer]: A

## Source Alignment

Answered from `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.
