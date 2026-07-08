# Code Summary - U04 Reference Event Outbox and Kafka Publication

## Files Created

| File | Purpose |
| --- | --- |
| `services/reference-data-service/application-service/src/main/java/com/linercore/platform/referencedata/applicationservice/port/OutboxRepository.java` | Outbox persistence port for enqueue, claim, save, lookup, and status projection. |
| `services/reference-data-service/application-service/src/main/java/com/linercore/platform/referencedata/applicationservice/port/ReferenceEventPublisherPort.java` | Kafka publisher seam returning broker metadata. |
| `services/reference-data-service/application-service/src/main/java/com/linercore/platform/referencedata/applicationservice/port/SchemaRegistryPort.java` | Schema Registry seam for event subject registration. |
| `services/reference-data-service/application-service/src/main/java/com/linercore/platform/referencedata/applicationservice/port/EventPublicationException.java` | Retryable/permanent publisher failure classification. |
| `services/reference-data-service/application-service/src/main/java/com/linercore/platform/referencedata/applicationservice/query/OutboxStatusQuery.java` | Status API query criteria with bounded result limit. |
| `services/reference-data-service/application-service/src/main/java/com/linercore/platform/referencedata/applicationservice/query/PublishBatchResult.java` | Publish-batch outcome projection. |
| `services/reference-data-service/dataaccess/src/main/java/com/linercore/platform/referencedata/dataaccess/inmemory/InMemoryOutboxRepository.java` | In-memory outbox adapter with claim protection and status projection. |
| `services/reference-data-service/messaging/src/main/java/com/linercore/platform/referencedata/messaging/PlaceholderKafkaReferenceEventPublisher.java` | Placeholder publisher preserving topic, partition, offset, and published timestamp metadata. |
| `services/reference-data-service/messaging/src/main/java/com/linercore/platform/referencedata/messaging/PlaceholderSchemaRegistryAdapter.java` | Placeholder Schema Registry adapter returning BACKWARD-compatible subjects. |
| `services/reference-data-service/application-service/src/test/java/com/linercore/platform/referencedata/applicationservice/ReferenceEventOutboxApplicationServiceTest.java` | Application-service outbox tests for enqueue, claim exclusivity, publish status, retryable failure, and permanent failure. |
| `services/reference-data-service/application-service/src/test/java/com/linercore/platform/referencedata/applicationservice/TestReferenceStores.java` | Local application-service test fakes for reference/change/outbox ports. |
| `contracts/avro/referencedata.*.changed.avsc` | Nine placeholder Avro schemas, one per MVP reference set. |
| `contracts/examples/referencedata.currency.changed.example.json` | Example reference-data change event envelope. |

## Files Modified

| File | Change |
| --- | --- |
| `services/reference-data-service/domain-core/src/main/java/com/linercore/platform/referencedata/domain/outbox/OutboxEvent.java` | Added recovery-required status transition helper. |
| `services/reference-data-service/application-service/src/main/java/com/linercore/platform/referencedata/applicationservice/ReferenceDataApplicationService.java` | Enqueues reference-change outbox events on create/update/deactivate and exposes claim, publish, and status flows. |
| `services/reference-data-service/container/src/main/java/com/linercore/platform/referencedata/container/ReferenceDataServiceConfiguration.java` | Wires in-memory outbox, placeholder publisher, and placeholder schema registry beans. |
| `services/reference-data-service/container/src/main/java/com/linercore/platform/referencedata/container/api/ReferenceDataController.java` | Adds event status, claim, and publish placeholder endpoints. |
| `services/reference-data-service/application-service/src/test/java/com/linercore/platform/referencedata/applicationservice/ReferenceDataApplicationServiceTest.java` | Removes cross-module dataaccess test dependency by using local port fakes. |
| `contracts/openapi/reference-data-service.yaml` | Documents event status, claim, and publish placeholder endpoints. |
| `aidlc/spaces/default/intents/260630-shared-platform/construction/U04-reference-event-outbox/code-generation/code-generation-plan.md` | Marks U04 implementation steps complete. |

## Key Implementation Decisions

- Reference mutations remain the source of truth: `create`, `update`, and `deactivate` append change history first, then enqueue a `referencedata.<entity>.changed` outbox event when an outbox repository is configured.
- Outbox claim protection is adapter-owned. The in-memory adapter only claims `PENDING` events or due `RETRYABLE` events; already `IN_PROGRESS` events are not claimed by a second worker.
- Publisher and Schema Registry integrations are placeholders behind application-service ports. They preserve the application boundary and make later Kafka/Schema Registry replacement additive.
- Status projection is intentionally read-only and filterable by event id, record id, reference set, status, and time range.
- No downstream consumer, frontend status screen, Charge, Booking, or Container Movement behavior was implemented.

## Test Coverage Summary

- Added application-service tests for pending enqueue, claim exclusivity, successful publish projection, retryable publisher failure, and permanent publisher failure.
- Existing domain mapper test continues to cover `referencedata.currency.changed` event-type mapping.
- Avro schemas and the example JSON were parsed successfully with PowerShell `ConvertFrom-Json`.

## Verification

| Check | Result |
| --- | --- |
| `java -version` | Not run: `java` is unavailable in this shell. |
| `javac -version` | Not run: `javac` is unavailable in this shell. |
| `mvn -version` | Not run: `mvn` is unavailable in this shell. |
| `node scripts/validate-skeleton.mjs` | Passed. |
| `corepack yarn typecheck` | Not completed: Turbo failed with local `spawn EPERM`. |
| `corepack yarn lint` | Not completed: Turbo failed with local `spawn EPERM`. |
| Avro schema JSON parse | Passed for all nine `contracts/avro/referencedata.*.changed.avsc` files. |
| Example event JSON parse | Passed for `contracts/examples/referencedata.currency.changed.example.json`. |
| Downstream consumer/source scan | Passed: no `charge-service`, `booking-service`, `container-movement`, `KafkaConsumer`, or `@KafkaListener` references were found in `reference-data-service`. |
| Application-service test dependency scan | Passed: no `dataaccess` or `messaging` imports remain under application-service test source. |

## Deviations and Limitations

- The configured `aidlc-developer-agent` subagent could not run because `openai.gpt-5.5` is unavailable to this Codex account, so implementation was completed inline by the orchestrator and recorded in stage memory.
- The configured `aidlc-architecture-reviewer-agent` subagent could not run because `openai.gpt-5.4` is unavailable to this Codex account, so review was completed inline and recorded in stage memory.
- Java/Maven verification could not execute in this shell because `java`, `javac`, and `mvn` are not installed or not on `PATH`.
- Turbo-backed root `typecheck` and `lint` could not execute in this shell because Turbo child-process spawn fails with local `EPERM`; the skeleton validator and source-level checks were used instead.

## Review

Verdict: READY

- The output satisfies the approved U04 plan: reference mutations enqueue typed outbox events, claim/publish/status flows are exposed through application-service ports and controller placeholders, and Kafka/Schema Registry concerns remain adapter seams.
- Contract coverage is present through nine Avro placeholder schemas, a JSON event example, and OpenAPI documentation for the status/claim/publish endpoints.
- Tests cover enqueue, claim exclusivity, successful publish projection, retryable failure, and permanent failure at the application-service boundary.
- Residual risk: Java compilation and Maven tests could not run in this shell because Java, javac, and Maven are unavailable.
- Residual risk: Turbo-backed root typecheck/lint could not run because Turbo child-process spawn fails with local `EPERM`.
