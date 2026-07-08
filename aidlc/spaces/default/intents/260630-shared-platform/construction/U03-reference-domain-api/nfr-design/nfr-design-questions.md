# NFR Design Questions - U03 Reference Domain API

## Scope

This file records design questions resolved during NFR Design for `U03-reference-domain-api`.

## Resolved Questions

### Q1. How should provider reads meet the p95 target without creating frontend-side joins?

Provider list and detail endpoints use owned PostgreSQL query models through repository ports, with indexes for set, status, business key, relationship filters, and deterministic sort keys. All list and history endpoints require bounded pagination, validated filters, and default active-only behavior unless `includeInactive` is explicitly requested.

The service does not expose raw tables or rely on consumers to join reference sets. Provider DTOs carry stable ids, codes, display names, status, versions, and type fields needed by callers.

### Q2. How should admin mutations preserve consistency across state, audit, and U04 handoff?

Admin mutation flows authorize through U02, validate command shape and relationship invariants, reject stale versions, then persist aggregate state, append change history, and create one domain change fact in the same unit of work. Failed authorization, validation, duplicate-key, conflict, and stale-version outcomes do not persist state and do not create domain facts.

U03 records timestamps and correlation ids on facts so U04 can measure and recover the commit-to-publish path, but Kafka retry behavior and schema publication are not implemented inside U03.

### Q3. What security controls apply to canonical reference data?

U03 is the only writer and API owner for canonical reference state. Admin mutations require identity-service authorization; provider reads are authorized where the functional model requires it. Party and Customer records are classified for PII and commercial sensitivity, and DTOs omit internal database keys or unsafe persistence details.

All filters, search inputs, relationship references, versions, and status transitions are validated before repository calls to prevent unbounded queries and unsafe data access.

### Q4. How should the service scale across nine reference sets?

U03 remains one deployable bounded context with internal aggregate modules for Party/Customer, Location/Port, Region, Voyage, Currency, ChargeCode, EquipmentType, Commodity, and TradeLane. The design rejects both service-per-set fragmentation and a generic key/value metadata blob.

Growth is handled through module-local invariants, indexed owned tables, paginated history, configurable seed data, and stable provider/admin APIs.

### Q5. What failure behavior should callers observe?

U02 dependency uncertainty fails protected mutations before persistence. PostgreSQL unavailability returns safe dependency errors. Duplicate keys, invalid relationships, stale versions, inactive relationship violations, and authorization denials are explicit non-mutating failures. Successful mutations remain recoverable for publication through the stored domain fact consumed by U04.

## Open Questions

No blocking questions remain for this stage. Retention windows for long-running change history and final field-level sensitivity labels can be specialized in later compliance and schema stages without changing this design.

## Source Trace

This decision set traces to `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.
