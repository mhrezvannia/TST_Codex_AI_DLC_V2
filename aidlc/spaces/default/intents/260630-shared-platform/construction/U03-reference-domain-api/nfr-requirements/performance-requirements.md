# Performance Requirements - U03 Reference Domain API

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines admin lifecycle, provider read, search/filter, aggregate invariant, change history, domain change fact, and API surface workflows. `business-rules.md` fixes canonical ownership, deterministic pagination/sorting, bounded search/filter inputs, stale-version rejection, and OpenAPI contracts. `requirements.md` fixes NFR-001, NFR-002, NFR-003, NFR-004, NFR-012, NFR-016, and constraints C-003 and C-008.

## Target Requirements

| Requirement | U03 obligation |
|---|---|
| Provider list/detail reads | Common internal reads target p95 <= 300 ms under expected MVP admin/consumer load. |
| Admin reads | Detail, history, and validation-support reads must use bounded filters and pagination where applicable. |
| Admin writes | Create/update/deactivate/reactivate may include validation and authorization overhead but must remain measurable and traceable. |
| Event freshness support | Successful mutations must record timestamps and domain change facts so U04 can measure p95 <= 60 second commit-to-publish freshness. |
| Coverage | `reference-data-service` targets at least 85 percent line coverage. |

## Query Performance Requirements

- Provider reads must use deterministic pagination and sorting.
- Default reads exclude inactive records unless `includeInactive=true`.
- Search/filter inputs must be validated to prevent unbounded queries.
- Queries must avoid frontend-side joins by returning stable ids, business codes, relationship labels, status, and version where needed.
- Index strategy must support business key uniqueness, active/default filters, reference set, status, and relationship lookups.

## Mutation Performance Requirements

- Validation must fail before persistence and before domain change fact creation.
- Duplicate key, relationship, stale version, and authorization failures must be distinguishable without expensive recovery work.
- Successful writes must persist audit/change metadata and produce one domain change fact for U04.
- Validation-only operations must not persist data or create event facts.

## Measurement Requirements

- Emit latency histograms for provider list/detail, admin create/update/status change, validation-only, search/filter, and history query paths.
- Trace calls to U02 authorization, database repositories, and U04 domain fact handoff.
- Record correlation id in logs and traces for slow or failed requests.
- Final load profile remains open in `requirements.md`; performance tests must be parameterized for later validation.

## Non-Goals

- U03 does not implement Kafka publisher performance tuning; U04 owns publication.
- U03 does not define frontend rendering performance; U06 owns UI NFRs.
- U03 does not build downstream consumer caches or replicas.

