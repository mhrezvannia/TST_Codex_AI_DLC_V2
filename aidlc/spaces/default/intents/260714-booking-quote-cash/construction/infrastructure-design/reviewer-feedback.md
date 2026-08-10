# Infrastructure Design Architecture Review

## Review Execution

- The named reviewer failed because its pinned `openai.gpt-5.4` model is unavailable on the ChatGPT-backed Codex account.
- The approved independent default-agent fallback loaded the same reviewer persona and reviewed all seven unit Infrastructure Design sets.

## Iteration 1 - Not Ready

| Severity | Finding | Resolution |
|---|---|---|
| High | Current shared `AvroProducerConfig` sets only all-acks and `KafkaGenericRecordPublisher` defaults to integer ten seconds, so the designed producer/idempotence/2.5-second contract had no implementation owner. | Assigned backward-compatible shared-module extensions: complete producer properties, `Duration.ofMillis(2500)` default, millisecond wait, compatibility constructor, and exact shared tests. |
| High | Current `NoopMessagingGuard` allows noop whenever `local` is active, so live Compose could not enforce real adapters through that guard. | Added a backward-compatible `realMessagingRequired` overload, required `MESSAGING_REQUIRE_REAL=true` in W1 live Compose, and specified negative local-live noop startup tests plus concrete bean readiness proof. |

## Iteration 2 - Source Delta Still Pending

The targeted reviewer found that current `platform-messaging` source and tests still lack the designed extensions. That is expected before Code Generation, but earlier prose could be read as a current-state claim. The corrected design now says explicitly that these are mandatory Code Generation deltas, records current source as lacking them, provides a five-item implementation checklist, and blocks live acceptance until source/tests prove each item.

Reviewer iterations are exhausted. Present the human gate with this disclosed implementation dependency; Infrastructure Design does not claim current-source release readiness.
