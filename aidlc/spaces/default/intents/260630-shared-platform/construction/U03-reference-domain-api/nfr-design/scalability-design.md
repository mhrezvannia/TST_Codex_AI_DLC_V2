# Scalability Design - U03 Reference Domain API

## Scalability Goals

U03 scales as one canonical reference-data bounded context rather than nine services or a generic metadata store. The service keeps each reference set in an internal aggregate module while sharing common API, validation, persistence, audit, domain-fact, and observability patterns.

The design supports growth in records, inactive history, configurable seed values, and consumer count without allowing direct table readers or duplicate canonical owners.

## Service Boundary

External integration is limited to REST/OpenAPI provider and admin APIs plus persisted domain change facts for U04. U03 owns the PostgreSQL schema and canonical invariants for Party/Customer, Location/Port, Region, Voyage, Currency, ChargeCode, EquipmentType, Commodity, and TradeLane.

Internal modules can evolve independently around their invariants, but they deploy together and share correlation, authorization, error, and audit infrastructure.

## Data Growth

List and history endpoints require bounded pagination and deterministic sort order. Active/default reads are separated from history-heavy reads. Indexes cover active status, business-key uniqueness, set/status filters, relationship filters, and history lookup. Inactive records remain readable but are not included by default.

Seed and configuration changes use approved admin/import paths so they produce the same validation, audit, and domain-fact evidence as manual changes.

## Consumer Growth

Provider APIs expose stable contracts and media-type versioning. Consumers do not query U03 tables, join reference sets client-side, or depend on internal aggregate structure. U06 and later frontends consume the same provider APIs used by other services, while U04 observes domain facts for event publication.

## Extension Hooks

Future scale features can add read replicas, materialized provider views, per-set retention policies, and targeted caching after measurement. Those changes must preserve authoritative writes, version checks, audit append, and one domain fact per successful mutation.

## Source Trace

This design implements constraints from `scalability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.
