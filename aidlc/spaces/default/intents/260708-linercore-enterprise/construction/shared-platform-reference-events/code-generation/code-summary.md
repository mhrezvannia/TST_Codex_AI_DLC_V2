# Code Generation Summary - shared-platform-reference-events

## Files Created Or Modified

| File | Change |
|---|---|
| `services/reference-data-service/domain-core/src/main/java/com/linercore/platform/referencedata/domain/outbox/ReferenceChangedFact.java` | Added producer identity and deduplication key fields with a backward-compatible constructor. |
| `services/reference-data-service/domain-core/src/main/java/com/linercore/platform/referencedata/domain/outbox/ReferenceEventMapper.java` | Enriched outbox payloads with change id, business key, producer identity, deduplication key, schema subject, and correlation id. |
| `services/reference-data-service/domain-core/src/test/java/com/linercore/platform/referencedata/domain/outbox/ReferenceEventMapperTest.java` | Added assertions for producer, schema subject, deduplication key, and correlation evidence. |
| `services/reference-data-service/application-service/src/test/java/com/linercore/platform/referencedata/applicationservice/ReferenceEventOutboxApplicationServiceTest.java` | Added application-level outbox evidence assertions for committed reference changes. |
| `services/reference-data-service/application-service/src/test/java/com/linercore/platform/referencedata/applicationservice/ReferenceDataApplicationServiceTest.java` | Added fail-closed validation coverage for missing related references. |
| `contracts/avro/referencedata.currency.changed.avsc` | Added top-level `producer` field to match the existing event envelope/example shape. |
| `contracts/examples/referencedata.currency.changed.example.json` | Added enriched reference-event payload evidence fields. |

## Key Implementation Decisions

- Kept Reference Data Service as the source of truth for lifecycle, validation, history, and outbox behavior.
- Strengthened event evidence in the transactional outbox payload rather than introducing a new event storage model.
- Preserved the existing `ReferenceChangedFact` constructor so current callers remain compatible.
- Treated Kafka and Schema Registry as contract/runtime dependencies, not live dependencies for code-generation tests.
- Avoided downstream pricing, booking, CMM, and D&D domain logic.

## Test Coverage Summary

| Command | Result |
|---|---|
| `.local-tools/apache-maven/bin/mvn.cmd -f services/reference-data-service/pom.xml test` with `.local-tools/jdk-21` as `JAVA_HOME` | Passed: reactor build success, 16 Java tests. |
| `yarn vitest run apps/reference-data/lib/service-clients.test.ts apps/reference-data/lib/reference-data.test.ts --config vitest.config.ts` | Passed: 2 files, 9 tests. |
| `node scripts/validate-contract-catalog.mjs` | Passed: catalog status `ok`, 13 contracts, green health snapshot. |
| `yarn exec eslint scripts/validate-contract-catalog.mjs apps/reference-data/lib/service-clients.ts apps/reference-data/lib/service-clients.test.ts apps/reference-data/lib/reference-data.ts apps/reference-data/lib/reference-data.test.ts` | Passed. |
| `yarn exec tsc --noEmit -p apps/reference-data/tsconfig.json` | Passed. |

## Deviations From Plan

- No production code changes were needed in `apps/reference-data`; existing UI/service-client tests already covered the touched boundary. Verification still ran against that surface.
- Local runtime metadata did not require further change in this unit because the previous shared-platform identity/security unit added service identity metadata and runtime validation.
- Live Kafka and Schema Registry startup were not attempted during code generation; contract validation and Java outbox/publisher tests provide deterministic evidence for this stage.

## Traceability

| Story or requirement | Implemented evidence |
|---|---|
| US-SP-003 - Manage shared reference data | Validation fail-closed test and existing lifecycle mutation/change-history tests remain passing. |
| US-SP-004 - Publish reference events | Outbox payload now includes producer identity, schema subject, deduplication key, and correlation id. |
| US-CHG-001 / US-BKG-001 - Consumer validation | Reference validation failure for missing related records is covered without cross-service database joins. |
| US-CMM-004 - Consume reference changes | Currency changed contract fixture and outbox event evidence are aligned. |
| NFR security/reliability/observability | Correlation, producer identity, deduplication, schema subject, and contract validation are executable checks. |
