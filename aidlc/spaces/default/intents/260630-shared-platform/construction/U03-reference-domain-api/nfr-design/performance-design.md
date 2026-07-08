# Performance Design - U03 Reference Domain API

## Performance Goals

`reference-data-service` must keep common provider and admin list/detail reads at p95 <= 300 ms while preserving canonical ownership, validation, authorization, and deterministic response behavior. Mutation latency includes U02 authorization, domain validation, PostgreSQL persistence, audit append, and domain-fact creation, and must expose enough telemetry to explain each segment.

U03 also supports the cross-unit commit-to-publish objective by recording fact creation timestamps and correlation ids so U04 can measure p95 <= 60 seconds from committed mutation to published event.

## Query Path Design

Provider read APIs use bounded repository queries over owned PostgreSQL tables. Each list endpoint validates page size, page token or offset, sort field, search field, status, relationship filters, and `includeInactive` before query execution. Default reads are active-only. Detail endpoints address records by stable id or approved business key and return stable id, code, display, status, version, and type fields.

Indexes are required for active business-key uniqueness, reference set, status, common relationship lookups, deterministic sort fields, and history lookup by entity id/version/time. Query handlers never ask callers to join reference sets in the frontend and never expose direct database access.

## Mutation Path Design

Admin mutations follow a fixed hot path: authenticate caller context, authorize with U02, validate command and relationships, load aggregate by stable id/business key, enforce stale-version checks, apply state transition, persist aggregate, append change history, create domain change fact, and return the new version. Validation-only paths use the same validation rules but stop before persistence, audit append, or fact creation.

Duplicate active keys, invalid relationships, orphan ports, region/trade-lane violations, inactive relationship references, stale versions, and authorization denial fail before persistence. These early exits keep the write path predictable and prevent expensive compensation.

## Measurement

The service emits latency histograms for provider list/detail, admin create/update/status, validation-only checks, search/filter paths, and history reads. Traces include U02 authorization duration, repository duration, audit append duration, fact creation duration, error category, reference set, operation, and correlation id.

Structured logs and OpenTelemetry spans must preserve caller correlation id across controllers, application services, repositories, and domain-fact builders.

## Capacity and Tuning

Initial tuning focuses on indexes, bounded page sizes, stable sort plans, DTO mapping without lazy relationship expansion, and keeping audit/history queries separate from common provider reads. Cache decisions are deferred until measured load shows a specific bottleneck, because PostgreSQL-backed indexed reads are simpler and preserve immediate correctness for MVP.

## Source Trace

This design implements constraints from `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.
