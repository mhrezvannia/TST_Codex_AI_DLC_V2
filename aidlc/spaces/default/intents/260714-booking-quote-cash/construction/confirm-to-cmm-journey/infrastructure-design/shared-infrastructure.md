# Shared Infrastructure - U04 Confirm to CMM Journey

## Adopted W0 Platform

U04 adopts, and does not reinvent, `services/platform-messaging`: `KafkaGenericRecordPublisher`, `ConfluentSchemaRegistrar`, `ScheduledOutboxRelay`, retry classification, noop guard, Kafka/local-noop profile pattern, and scheduling lifecycle. Current source lacks the required producer settings, millisecond timeout, and live-noop override. Code Generation must make only two shared extensions: complete producer properties plus a millisecond `Duration` send timeout, and a backward-compatible require-real overload on `NoopMessagingGuard`. Booking and CMM own only contract mapper/listener, repository implementation, configuration binding, schema resource, topic names, and business transaction.

Kafka and Schema Registry remain shared Compose services. PostgreSQL remains physically shared but service databases, roles, Flyway histories, outboxes, receipts, and backups are owner-local. The `linercore-local` bridge and generic Docker builders are unchanged.

## Ownership Matrix

| Resource | Owner | U04 boundary |
|---|---|---|
| shared publisher/registrar/relay/guard | platform-messaging | producer properties/timeouts and require-real enforcement; no business mapping |
| `booking.confirmed` + DLT | Booking/CMM contract owners | Booking publishes; CMM consumes/replays |
| Booking outbox | Booking | confirmation atomicity and durable retry |
| CMM receipt/journey/status outbox | CMM | highest-revision reconciliation |
| Schema Registry subject cutover | release harness | local allow-list/fingerprint only |
| Kafka/SR/Compose network | platform | local transport availability |

Producer internal retry is one immediate attempt inside the 2-second delivery budget; outbox alone owns durable cross-send backoff. Consumer retry belongs only to `DefaultErrorHandler`. These ownership lines prevent layered retry multiplication.

## Mandatory Shared-Module Delta

Code Generation is incomplete until all of the following source changes and tests are present:

1. `AvroProducerConfig.avroProducerProps` emits all-acks, idempotence true, max-in-flight 5, delivery timeout 2000 ms, request timeout 1000 ms, and retries 1.
2. `KafkaGenericRecordPublisher` stores `Duration`, defaults to 2500 ms, waits with millisecond precision, and preserves source compatibility for the explicit-seconds constructor.
3. `NoopMessagingGuard` adds the require-real overload; its existing two-argument method remains and delegates with false.
4. Platform tests prove exact producer properties, both publisher constructors/timeouts, local noop allowed only without require-real, local noop rejected with require-real, and non-local noop rejected.
5. Booking/CMM configurations bind `MESSAGING_REQUIRE_REAL`, call the shared guard, and Compose/live preflight set it true.

## Source Coverage

Shared mapping applies `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U04 `business-logic-model.md`.
