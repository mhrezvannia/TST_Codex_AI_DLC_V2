# Logical Components - U03 Reference Domain API

## Component Overview

`reference-data-service` is a Java 21 / Spring Boot 3.3 deployable using hexagonal modules around the canonical reference-data domain. The public surface is REST/OpenAPI with media-type versioning and camelCase JSON. PostgreSQL is the owned store. U02 supplies authorization decisions. U04 consumes stored domain facts for event publication.

## Components

### Provider API Controllers

Expose list, detail, search, and lookup endpoints for approved consumers. Controllers validate pagination, filters, sort fields, active/inactive flags, and correlation id, then call provider query application services. They return stable provider DTOs and standard error envelopes.

### Admin API Controllers

Expose create, update, deactivate, reactivate, validation-only, and history endpoints. Controllers require authenticated caller context, operation, target reference set, reason where applicable, expected version for updates, and correlation id.

### Authorization Adapter

Wraps identity-service calls from U02. It converts U03 operation context into authorization requests and maps denial, unavailable, and uncertain responses into fail-closed application outcomes for protected operations.

### Aggregate Modules

Implement invariants for Party/Customer, Location/Port, Region, Voyage, Currency, ChargeCode, EquipmentType, Commodity, and TradeLane. Each module owns command validation, status transitions, relationship rules, duplicate-key checks, stale-version checks, and provider DTO mapping for its set.

### Application Services

Coordinate provider reads, admin mutation flows, validation-only checks, history reads, and error mapping. Mutation services enforce the order: authorize, validate, load, check version, apply domain change, persist state/audit/fact, return committed version.

### Repository Ports and PostgreSQL Adapters

Provide typed query criteria and mutation persistence over owned PostgreSQL tables. Adapters implement indexed list/detail/history access, active business-key uniqueness, deterministic sorting, relationship lookups, and durable writes for aggregate state, change history, and domain facts.

### Change History Component

Builds append-only audit records for successful mutations, including actor, operation, timestamp, before/after, reason, record id, version, and correlation id. It supports authorized admin history queries without joining through provider paths.

### Domain Fact Builder

Creates one domain change fact per successful mutation with reference set, entity id, business key, operation, changed fields, version, occurredAt, and correlation id. The fact is stored durably for U04; U03 does not publish to Kafka directly.

### Error and Correlation Layer

Normalizes validation, duplicate-key, not-found, conflict, authorization, dependency, and stale-version errors into standard envelopes. It propagates correlation id through logs, traces, audit records, and domain facts.

### Observability Emitters

Emit metrics, structured logs, and OpenTelemetry spans for provider reads, admin mutations, validation-only checks, history reads, U02 authorization, PostgreSQL calls, audit append, fact creation, and result categories.

## Dependency Direction

Controllers depend on application services. Application services depend on domain modules and ports. PostgreSQL, U02, and observability are adapters behind ports. Domain modules do not depend on Spring, persistence schemas, Kafka, or frontend contracts.

## Source Trace

This design implements constraints from `business-logic-model.md`, `tech-stack-decisions.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, and `reliability-requirements.md`.
