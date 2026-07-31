# Reliability Design - U02 Ordered Lifecycle and Observable Rejections

## Inputs and Atomic Rejections

This design implements `reliability-requirements.md`,
`business-logic-model.md`, and `tech-stack-decisions.md`. The application
locks the journey and claims request identity in one local transaction. Accepted
effects or rejection-only attempt/disposition/rejection/audit effects commit
atomically; no intermediate claim is visible.

## Event-Targeted Fencing

Acceptance-only publisher and Booking-consumer seams target one run-scoped event
ID, fail once, expose due/health evidence, and auto-disarm. Relay completion
conditionally matches event ID, IN_PROGRESS, worker, token, and fencing version;
expired leases increment the version so old workers cannot complete. Booking
consumer retry owns PROCESSING/RETRYABLE/APPLIED receipt and health transitions;
pre-broker CMM pending remains invisible to Booking.

The Booking repository exposes an owned `appendDuplicateDeliveryEvidence`
operation keyed by event ID, delivery attempt, correlation, partition, and
offset. It appends duplicate delivery/audit evidence without changing the
original APPLIED receipt or latest projection, aligning the immutable receipt
contract with the functional Booking consumer model.

## Recovery and Degradation

Kafka/schema/Booking failures map to retryable or permanent states as specified;
accepted CMM truth is not rolled back. Independent 500 ms DB/UI observations
measure each 30-second recovery endpoint from one controller clock. At-least-
once redelivery produces one logical projection.
