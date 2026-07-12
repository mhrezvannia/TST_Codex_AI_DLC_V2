# W0-01 → Codex Handoff & Supervision Brief

> **Why this exists:** W0-01 (platform eventing foundation) must be built on a machine with **Docker running + Maven Central reachable** — its Definition of Done requires a live Kafka/Schema-Registry run, and the Kafka/Avro/Confluent dependencies must download. The Claude session that planned this could not satisfy either, so W0-01 is delegated to Codex, with Claude acting as reviewer/gate on the output.

## 0. Environment prerequisites (verify BEFORE starting)

- `docker version` succeeds (daemon running) and `docker compose config -q` passes for `compose.yaml`.
- Maven can resolve from Central: `mvn -q dependency:get -Dartifact=org.apache.kafka:kafka-clients:3.7.1` succeeds.
- Add the **Confluent repository** to the build (for `io.confluent:kafka-avro-serializer`): `https://packages.confluent.io/maven/`.
- Java 21 + Maven 3.9 + Node 24 available (already are).

If any prerequisite fails, stop and report — do not substitute a placeholder to "make it pass."

## 1. Kickoff prompt (paste into Codex)

```
Execute intent W0-01 (platform eventing foundation) per docs/intents/W0-01-platform-eventing-foundation.md.
Read first, in order:
  1. docs/intents/W0-01-platform-eventing-foundation.md   (the intent + answered question: A = one shared platform/messaging Maven module)
  2. docs/codex-review-findings.md                          (findings C1–C5, H1 — what to remediate and why)
  3. docs/aidlc-v2-slicing-playbook.md                      (vertical slicing + observed-done rules)
  4. docs/enterprise-technical-environment.md §5            (common Avro envelope; Kafka/SR/outbox mandates)
  5. The seams named in §3 of docs/intents/W0-01-CODEX-HANDOFF.md
Work on branch intent/W0-01-platform-eventing. Slice VERTICALLY per the units below.
An intent/unit is NOT done until its behaviour is OBSERVED on the live Docker Compose stack.
No placeholder/no-op adapter may satisfy any Definition of Done. Exit gate: aidlc-audit + erp-fidelity-audit green on a live run.
```

## 2. Hard rules (non-negotiable — these are the anti-facade guardrails)

1. **No placeholder in a production path.** Replace `PlaceholderKafkaReferenceEventPublisher` and `PlaceholderSchemaRegistryAdapter` with real implementations. A no-op publisher may exist ONLY under an explicit `local-noop` profile, and it must mark outbox rows `SKIPPED_LOCAL`, never `PUBLISHED` (fixes finding H1).
2. **Startup guard.** The service must fail to boot if a no-op publisher/SR is active outside the `local-noop` profile.
3. **Observed, not asserted.** Every unit's DoD is a behaviour you drove on the running stack. Embedded-Kafka tests are necessary but NOT sufficient — the final gate is a real Compose run with the message seen on the topic, Schema-Registry-validated.
4. **Field fidelity.** Event payload field names match the registered `.avsc` exactly (no `equipmentTypeId` vs `equipmentTypeCode` drift).
5. **Fix the dual-write (C3).** Wrap state-change + outbox enqueue in one transaction; remove the un-retried post-commit HTTP call in `BookingApiController.confirm/reconfirm` — delivery goes through the outbox → real publisher → consumer.

## 3. Precise technical scope (the seams — already analysed)

**Keep as-is (already correct):** `ReferenceDataApplicationService.publishOutboxBatch(...)` — it already does claim → `schemaRegistry.ensureRegistered` → `publisher.publish` → `outbox.save(published)` with retryable/permanent/runtime handling. Do not rewrite it; give it real adapters + a driver.

**Ports to implement against (unchanged interfaces):**
- `ReferenceEventPublisherPort.publish(ReferenceEventEnvelope, Map<String,String> payload) -> BrokerMetadata` (throws `EventPublicationException(code, msg, retryable)`).
- `SchemaRegistryPort.ensureRegistered(eventType, schemaVersion) -> SchemaSubject`.

**Build (answer A — one shared module):** create `platform/messaging` (or `services/platform-messaging`) Maven module containing:
- `KafkaEventPublisher` — spring-kafka `KafkaTemplate`, Confluent Avro serializer; builds a `GenericRecord` from the registered `.avsc` (see `contracts/avro/`) + the payload map + the common envelope (`id, source, type, time, correlationId, dataSchemaVersion`); returns real `BrokerMetadata(topic, partition, offset, timestamp)` from the send result; throws `EventPublicationException(retryable=true)` on transient broker errors.
- `ConfluentSchemaRegistryAdapter` — real `SchemaRegistryClient` (`CachedSchemaRegistryClient` in prod, `MockSchemaRegistryClient` in tests); registers/checks BACKWARD compatibility.
- `OutboxRelayWorker` — `@Scheduled` (with `@EnableScheduling`) that calls `publishOutboxBatch(workerId, batch)` on a fixed delay; leader-election optional, `claimAvailable` work-stealing already supports multiple instances.
- Envelope mapper + common config.

**Wire it up:**
- `ReferenceDataServiceConfiguration` (and the other services' configs): bean-wire the real publisher/SR behind `@Profile("!local-noop")`; the placeholder behind `@Profile("local-noop")`; add the startup guard bean.
- Add `@Transactional` around state-change + `outbox.enqueue` in each application service (or the container adapter).
- Adopt the enqueue side in booking / container-movement / charge (they enqueue today but have no relay — give them the shared `OutboxRelayWorker`).
- `compose.yaml` already runs `confluentinc/cp-kafka:7.7.1` + `cp-schema-registry:7.7.1`; ensure each service actually connects (`KAFKA_BOOTSTRAP_SERVERS`, `SCHEMA_REGISTRY_URL`) in the docker profile.

**Dependencies to add** (parent `services/pom.xml` dependency management): `org.springframework.kafka:spring-kafka`, `org.apache.kafka:kafka-clients`, `org.apache.avro:avro`, `io.confluent:kafka-avro-serializer` (+ Confluent repo). Version-align to Confluent 7.7.x / Kafka 3.7.x.

## 4. Units (vertical; each DoD observed on the live stack)

| Unit | Scope | Definition of Done (observed) |
|---|---|---|
| U01 | Real publisher + SR for reference-data, end-to-end | On live Compose: mutate a currency record → a `referencedata.currency.changed` Avro message appears on the topic (SR-validated, console-consumer confirmed); outbox row flips to PUBLISHED only on broker ack. |
| U02 | Extract shared `platform/messaging` module | reference-data uses the shared publisher/relay; module builds; U01 behaviour still observed. |
| U03 | Adopt in booking/CMM/charge + `@Transactional` | On live Compose: a booking confirm enqueues + a real event flows (no post-commit HTTP); state-change + enqueue are atomic (kill the process between DB write and publish → no lost/orphaned event on restart). |
| U04 | Startup guard + failure/retry proof | No-op profile outside local → boot fails. Kill Kafka mid-publish → row stays RETRYABLE, recovers when broker returns (observed on the running stack). |

## 5. Supervision / acceptance protocol (Claude runs this on the returned diff)

When Codex produces the branch/PR, Claude (reviewer) checks — **red on any = not accepted:**

1. `bash .claude/skills/aidlc-audit/detectors.sh` →
   - §1/§1b: **no** `Placeholder`/`Noop` publisher wired outside a `local-noop` profile.
   - §3: every `outbox.enqueue` has a matching relay.
   - §4: `@Scheduled`/`@EnableScheduling` **present** (was "NONE").
   - §6: `@Transactional` **present** (was "NONE").
2. `bash .claude/skills/erp-fidelity-audit/detectors.sh` → §4 shows DCSA/standard field names in the event code; no `equipmentTypeId`/`equipmentTypeCode` split.
3. Diff review: startup guard exists; no-op marks `SKIPPED_LOCAL` not `PUBLISHED`; `BookingApiController` post-commit HTTP call removed; transaction wraps save+enqueue.
4. **Evidence of a live run** (the real gate): a captured console-consumer / SR output (or an integration log) showing the actual message on the topic — NOT just green unit tests. Path recorded under `artifacts/`.
5. `mvn -f services/pom.xml test` green (incl. an EmbeddedKafka integration test).

Only when all pass is W0-01 marked closed in `docs/intents/00-INTENT-BACKLOG.md`.

## 6. Division of labour

- **Codex:** executes §1–§4 on a networked+Docker machine; produces the branch + the live-run evidence.
- **Claude:** wrote this brief; reviews the returned diff against §5; runs the audits; accepts or bounces with specific findings. Bring the branch/diff back into a Claude session (or share the PR) to trigger the review.
