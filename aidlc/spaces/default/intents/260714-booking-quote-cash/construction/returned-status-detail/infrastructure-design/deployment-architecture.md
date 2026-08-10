# Deployment Architecture - U05 Returned Status Detail

## Reverse Event Path

CMM commits initial movement status and an outbox row in `linercore_container_movement`. Its shared relay publishes keyed `containermovement.status`; Booking group `booking-container-movement-status-v1` consumes and atomically writes envelope receipt plus latest projection in `linercore_booking`. The Booking detail endpoint reads aggregate, pricing, outbox state, and projection locally; the browser reaches it only through nginx and the Booking BFF.

`containermovement.status` and `.DLT` have three partitions; source key is `bookingRef + ':' + containerRef`. Schema Registry uses the canonical W1 record as local version 1 with BACKWARD after the governed legacy-subject cutover. Source/DLT, producer, listener, scheduler, profile, and noop-guard startup order matches U04.

## Relay, Consumer, and Read Capacity

CMM relay fixed delay is 250 ms, atomic batch 50, lease 30 seconds. It consumes the shared `AvroProducerConfig` properties and `KafkaGenericRecordPublisher` `Duration.ofMillis(2500)` default added by U04: all-acks/idempotent, max in-flight 5, request timeout 1 second, delivery timeout 2 seconds, and one immediate retry. CMM outbox alone owns durable backoff 250 ms/1 s/5 s/capped 30 s. The W1 live profile binds `MESSAGING_REQUIRE_REAL=true` for CMM and Booking guard calls.

Booking consumer concurrency is three, max poll 50, auto-commit false, record ack after transaction. Transient retries are 250 ms and 1 s; permanent records recover to Booking-owned DLT with original key/value and origin/error headers. Booking Hikari remains max 10 and projection/indexed detail are one local transaction/query path.

The browser polls once/second for at most 30 attempts, pauses while hidden, aborts prior requests, and allows no overlap. At most 100 active pollers are accepted; BFF/API fail controlled overload rather than queue. Matching event ID stops polling and visibility never becomes transport authority.

## Failure Isolation

Kafka/CMM outage leaves persisted Booking detail available and journey status pending/delayed. Booking listener failure cannot mutate CMM; stale/duplicate status cannot replace the latest projection. No browser call reaches CMM, Kafka, or Schema Registry, and no sync callback/fallback is introduced.

## Source Coverage

Deployment maps `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U05 `business-logic-model.md`.
