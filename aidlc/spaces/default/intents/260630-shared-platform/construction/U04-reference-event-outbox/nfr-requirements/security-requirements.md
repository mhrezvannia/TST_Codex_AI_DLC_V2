# Security Requirements - U04 Reference Event Outbox

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines outbox persistence, event envelope fields, status APIs, safe broker metadata, and schema compatibility. `business-rules.md` requires typed events, status authorization, structured logs, and no downstream runtime consumers. `requirements.md` fixes NFR-006 through NFR-012, C-003, C-006, C-007, and C-008.

## Data Protection Requirements

- Event payloads must contain only approved reference-change data needed by consumers.
- Party/Customer payloads must respect Confidential or Restricted classification where PII or commercial sensitivity exists.
- Broker credentials, internal stack traces, and unsafe payload internals must not appear in status APIs or UI projections.
- Kafka persistence and operational backups must be compatible with encryption-at-rest requirements in later environment stages.
- Internal HTTP/event infrastructure must support TLS 1.2 or stronger where supported by the environment.

## Access Control Requirements

- Event publication status APIs require authorized admin/operator access.
- Consumers integrate through Kafka events and provider APIs, not shared databases.
- U04 must not implement downstream runtime consumers, replicas, or service stubs.
- Event schemas and topics are contracts, not shared ownership of reference data.

## Audit and Logging Requirements

- Structured logs must include service, event id, reference set, entity id, status, attempt count, and correlation id.
- Publication failures must include safe failure code and status without leaking secrets or raw stack traces.
- Correlation id must propagate from API request to audit/change history, outbox row, log entries, and Kafka event envelope.

## Threat Considerations

| Threat | Required mitigation |
|---|---|
| Duplicate delivery creates duplicate consumer effects | Stable event id supports consumer deduplication. |
| Schema leak or unsafe payload | Typed schema review, payload classification, compatibility checks. |
| Unauthorized status inspection | Authorized status APIs and safe metadata only. |
| Direct downstream coupling | No runtime consumers/stubs or shared DB reads. |
| Silent publication failure | Visible lifecycle status and structured logs/metrics. |

## Non-Goals

- No downstream runtime authorization.
- No customer-facing event exposure.
- No physical DLQ topic mandate in MVP unless approved later.

