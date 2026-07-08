# Reliability Requirements - U03 Reference Domain API

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines mutation validation, persistence, audit metadata, domain change fact handoff, and provider reads. `business-rules.md` requires stale-version rejection, validation-only no-op behavior, one domain change fact for successful mutations, and no facts for failed validation/authorization/conflict. `requirements.md` fixes NFR-005, NFR-011, NFR-016, and the 60 second freshness target that U04 completes.

## Consistency Requirements

- A successful mutation must persist reference state, audit/change metadata, and one domain change fact for U04 handoff.
- Failed validation, authorization, duplicate key, not found, stale version, or conflict attempts must not produce reference-change domain facts.
- API responses and emitted events must be consistent for committed changes; U03 owns the synchronous state and U04 owns eventual Kafka publication.
- Validation-only operations must not persist state.

## Fault Handling Requirements

| Scenario | Required behavior |
|---|---|
| U02 authorization unavailable | Return dependency unavailable or fail protected mutation without persistence. |
| PostgreSQL unavailable | Fail read/write safely and emit correlation-linked diagnostics. |
| Duplicate active business key | Reject mutation and preserve existing record. |
| Stale version | Reject write; caller must refresh before retry. |
| Invalid relationship | Reject write before persistence and before domain fact creation. |
| U04 handoff unavailable | Preserve committed change and recover through transactional outbox/fact handoff pattern as designed with U04. |

## Health and Recovery Requirements

- Readiness must reflect database and required authorization dependency availability.
- Health checks must not perform expensive business queries.
- Change history must remain readable for authorized users after status changes.
- Inactive records must remain readable for historical references.
- Correlation id must be present in error envelopes, logs, audit/change history, and domain change facts.

## Data Durability Requirements

- PostgreSQL persistence must support encryption-at-rest requirements in later environment stages.
- Change history and reference state must be backed by service-owned storage.
- Final retention and disaster-recovery requirements remain open in `requirements.md` and must be configurable.

## Non-Goals

- No direct Kafka retry/dead-letter behavior; U04 owns publication reliability.
- No final production SLA/SLO.
- No manual database repair workflow as normal application behavior.

