# Deployment Architecture - U04 Confirm to CMM Journey

## Event Topology and Startup

Booking confirms in `booking-service` and commits aggregate, receipt/audit, and outbox in `linercore_booking`; no Kafka wait or CMM HTTP call occurs in the command transaction. `ScheduledOutboxRelay` publishes `booking.confirmed` through the shared `platform-messaging` `KafkaGenericRecordPublisher` and `ConfluentSchemaRegistrar`. CMM consumes in group `container-movement-booking-confirmed-v1`, validates/maps, and commits receipt/journey/status outbox in `linercore_container_movement`.

Compose starts PostgreSQL, Kafka, Schema Registry, guarded Booking/CMM Flyway, schema preflight/cutover, producer registrar checks, CMM listener assignment, relays, then user-facing readiness. Code Generation must make the W1 live profile set `MESSAGING_REQUIRE_REAL=true`. It must extend the shared guard with `NoopMessagingGuard.assertNoopAllowed(Environment, noopActive, realMessagingRequired)`, make each service pass the bound value, reject noop when it is true even under `local`, and retain the existing two-argument method as a backward-compatible delegate with `realMessagingRequired=false`. Kafka/consumer/relay beans activate only under the Kafka profile; `@EnableScheduling` and the existing shared relay are the only scheduler.

## Topic and Schema Layout

`booking.confirmed` and `booking.confirmed.DLT` each have three partitions, key `bookingId`, seven-day DLT retention, and source retention sufficient for the 30-day receipt/outbox evidence window. The source value subject is the canonical W1 Avro record with BACKWARD compatibility. Local preflight exports the unreleased flat subject/fingerprint, proves the exact allow-listed legacy fingerprint and no external/released consumers, retires only that disposable-local subject, registers canonical version 1, restores BACKWARD, and blocks all producers on any unknown/non-local registry.

Kafka is single-broker PLAINTEXT only on `linercore-local` under `WAIVER-W1-01-001`; no production durability/ACL/TLS claim is made. Non-local profiles fail pending W2-01. Host ports remain Kafka 9092, Schema Registry 8081, nginx 8088, and PostgreSQL 55432.

## Relay and Consumer Capacity

The Booking relay runs fixed delay 250 ms and atomically claims batch 50 with `FOR UPDATE SKIP LOCKED`, stamps `claimed_at`, and recovers `IN_PROGRESS` after a 30-second lease. Code Generation must extend shared `AvroProducerConfig.avroProducerProps` to set `acks=all`, `enable.idempotence=true`, max in-flight 5, delivery timeout 2 seconds, request timeout 1 second, and retries 1 for every adopter. It must change shared `KafkaGenericRecordPublisher` from its current integer 10-second default to `Duration.ofMillis(2500)` with millisecond precision while retaining an explicit-seconds compatibility constructor. These are tracked source deltas, not current-state claims. Outbox owns durable retries at 250 ms, 1 s, 5 s, then <=30 s.

CMM listener concurrency is three with `max.poll.records=50`, auto-commit false, and `AckMode.RECORD`. `DefaultErrorHandler` owns transient retries at 250 ms then 1 s; permanent contract/invariant failures go directly through `DeadLetterPublishingRecoverer`. Source acknowledgement follows application commit or completed DLT recovery.

## Source Coverage

Deployment implements `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U04 `business-logic-model.md`.
