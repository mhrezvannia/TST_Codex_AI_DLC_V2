# Intent Statement — W0-01 Platform Eventing Foundation

## Intent

Every async contract in the platform can actually fire: a domain event enqueued in any service's outbox reaches the real Kafka broker, schema-validated, and is consumable by another service. This remediates findings C1–C5 of [`codex-review-findings.md`](../codex-review-findings.md) and unblocks every event seam in the program. **Driver: Shared Platform team.**

## Context Pack (read before starting)

1. `docs/codex-review-findings.md` — findings C1–C5, H1 (what to fix and why)
2. `docs/enterprise-technical-environment.md` §5 (envelope), §Kafka/SR mandates
3. `docs/enterprise-contracts/async-event-contract-booking-confirmed.md` + `...containermovement-status.md`
4. `contracts/avro/*.avsc`, `contracts/asyncapi/*.yaml`
5. Reference implementation to generalize: `services/reference-data-service` outbox relay (`publishOutboxBatch`)

## Vertical Slice Definition

Thin but end-to-end through the *infrastructure* dimension: one real event (`referencedata.currency.changed`) flows domain change → transactional outbox → **shared relay (scheduled)** → **real Kafka publisher** (Confluent Avro serializer, Schema Registry BACKWARD check) → consumed by a test consumer — observed on the live Compose stack.

- **Layers cut through:** domain event → outbox (transactional) → relay/scheduler → broker/SR → consumer.
- **Thinnest viable form:** one event type end-to-end; the shared library then adopted by all four services (enqueue-side only — their consumers come in later intents).
- **Deferred:** module-specific consumers (W1-01, W2-04), DLQ/replay tooling (W4-02).

## In Scope / Out of Scope

- **In:** shared `platform-messaging` module (real `KafkaEventPublisher`, SR client, outbox relay + `@Scheduled` worker, envelope mapper); `@Transactional` boundary around state-change+enqueue in all services; placeholder publishers demoted to a `local-noop` profile with a **startup guard that fails non-local boot if a no-op is active**; outbox rows only marked PUBLISHED on real broker ack (fixes H1); Compose wiring so services actually connect to Kafka/SR.
- **Out:** replacing the Booking→CMM sync HTTP call with the event (that's W1-01, using this foundation); Pact provider verification harness (W1-01 first use).

## Actors & Journey

Actor: platform engineer / downstream service. Journey: mutate a currency record → observe the event on the topic with valid schema → test consumer receives it → restart broker → redelivery is deduped.

## Cross-Module Seams (must be real)

All of them, generically: this intent *is* the seam infrastructure. DoD proves `referencedata.currency.changed`; the library contract (enqueue → guaranteed delivery) is what W1-01/W2-04 consume.

## Standards Alignment

Common Avro envelope (`id, source, type, time, correlationId, dataSchemaVersion`) per Enterprise §5; SR compatibility **BACKWARD**; topic naming per contracts.

## Definition of Done (observed, not "tests pass")

On live Compose (Postgres+Kafka+SR+services): (1) mutate a reference record; (2) observe the Avro message on `referencedata.events` via console consumer, SR-validated; (3) outbox row flips to PUBLISHED only after broker ack; (4) kill Kafka mid-publish → row stays retryable, recovers when broker returns; (5) boot a service with the no-op profile outside local → startup fails; (6) `aidlc-audit` green (its detectors 1–4 were built for exactly this).

## Dependencies

None — this is a root of the program DAG. Runs parallel with W0-02 and W2-02.

## Suggested Scope & Sizing

`feature`. ~4 vertical units: (U01) real publisher+SR for reference-data end-to-end; (U02) extract shared relay+scheduler library; (U03) adopt in booking/CMM/charge enqueue paths + `@Transactional`; (U04) startup guard + failure/retry proof.

## Open Questions

1. Shared messaging code as a Maven module (`platform/messaging`) or copied per service?
   - A. One shared Maven module, versioned in-repo (recommended)
   - B. Per-service copies to avoid coupling
   - X. Other
   - `[Answer]:` A — one shared `platform/messaging` Maven module, versioned in-repo.
