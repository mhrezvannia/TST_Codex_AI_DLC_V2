# NFR Requirements Questions - U04 Reference Event Outbox

## Source Trace

This question record derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

## Q1. Freshness target

What event freshness target applies to U04?

A. Committed reference-data changes target p95 <= 60 seconds from successful commit to consumer-observable Kafka event (recommended)
B. Five minutes p95
C. No target until production
X. Other (please specify)

[Answer]: A. p95 <= 60 seconds (Recommended)

## Q2. Publication semantics

Which delivery behavior should U04 provide?

A. At-least-once publication with stable event ids for deduplication and retry using the same event id (recommended)
B. At-most-once publication
C. Best-effort fire-and-forget
X. Other (please specify)

[Answer]: A. At-least-once with stable event ids (Recommended)

## Q3. Outbox atomicity

How should committed reference mutations relate to outbox rows?

A. Every committed canonical-data change creates an outbox row in the same transaction; anomalies require explicit recovery (recommended)
B. Create outbox rows asynchronously later
C. Let Kafka publication define the source of truth
X. Other (please specify)

[Answer]: A. Transactional outbox row (Recommended)

## Q4. Failure visibility

How should publication failures be handled?

A. Distinguish retryable, permanent, and recovery-required states; expose safe status, retry counts, errors, and correlation id to operators/admin views (recommended)
B. Log only
C. Hide failures from users/operators
X. Other (please specify)

[Answer]: A. Visible lifecycle states (Recommended)

## Q5. Schema compatibility

What schema standard applies?

A. Avro 1.11 with Confluent Schema Registry and compatibility/message-contract checks gated later by U08 (recommended)
B. JSON payloads without schema registry
C. One generic event for all sets
X. Other (please specify)

[Answer]: A. Avro and Schema Registry (Recommended)

## Ambiguity Analysis

- `requirements.md` fixes p95 <= 60 seconds, at-least-once semantics, schema registry, operator visibility, and compatibility checks.
- Physical DLQ topic is not required for MVP; U04 models failed/recovery-required status and visibility while leaving a physical DLQ as a later infrastructure decision.
- No follow-up questions are needed for U04 because freshness, schema, and publication semantics are explicit.

