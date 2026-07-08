# Scalability Requirements - U03 Reference Domain API

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines one bounded `reference-data-service` owning nine aggregate groups, provider/admin APIs, and domain change facts for U04. `business-rules.md` requires one deployable bounded context with explicit internal aggregate modules, deterministic pagination/sorting, and no direct database consumers. `requirements.md` fixes local reproducibility, provider APIs, event contracts, and no shared databases.

## Scaling Model

U03 scales as one canonical reference-data bounded context. It must not split each reference set into a deployable service for MVP, and it must not collapse all reference rules into an ungoverned metadata blob.

## Structural Scalability Requirements

| Area | Requirement |
|---|---|
| Aggregate organization | Internal aggregate modules for Party/Customer, Location/Port, Region, Voyage, Currency, ChargeCode, EquipmentType, Commodity, and TradeLane. |
| API access | Provider/admin OpenAPI APIs are the only synchronous integration path. |
| Event handoff | Domain change facts allow U04 to publish changes asynchronously. |
| Database ownership | Service-owned PostgreSQL datastore; no shared database consumers. |
| Pagination | List/history APIs must be paginated and deterministically sorted. |
| Relationships | Relationship lookups must be indexed for Location/Port, Region, and TradeLane rules. |

## Growth Assumptions

- MVP begins with nine reference sets and configurable exact seed values.
- Inactive records remain readable for historical references and may grow over time.
- Future modules consume provider APIs/events rather than direct tables.
- Exact final load profile and data volumes are open and must remain configurable.

## Scaling Triggers

| Trigger | Later action enabled |
|---|---|
| Provider read latency approaches p95 target | Add indexes, tune query shape, or introduce approved caching without breaking canonical ownership. |
| Search/filter volume grows | Tighten filter requirements, add indexes, or introduce governed search projection. |
| Change history grows | Add partitioning/archival strategy once retention is confirmed. |
| Event handoff backlog grows | Coordinate with U04 outbox/publisher tuning; U03 still produces one fact per successful mutation. |

## Non-Goals

- No service-per-reference-set architecture in MVP.
- No downstream consumer replicas in this workflow.
- No final production autoscaling technology beyond on-prem deployment descriptors.

