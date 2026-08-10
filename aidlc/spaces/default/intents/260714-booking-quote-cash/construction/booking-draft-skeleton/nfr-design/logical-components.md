# Logical Components - U01 Booking Draft Skeleton

## Component Inventory

| Component | NFR responsibility | Failure domain |
|---|---|---|
| Booking Next.js/BFF | Origin/header control, bounded requests, stable routes | UI/BFF only; no domain authority |
| Booking API/auth filter | Local identity/role, DTO/error mapping, health | HTTP instance |
| Booking application/domain | Atomic command and invariants | Transaction rollback |
| JDBC repositories/codec | Indexed persistence, idempotency, V1/V2 upcast | Booking database |
| Flyway | Exclusive schema history/migration | Startup/readiness |
| PostgreSQL volume | Canonical Booking data | Shared Booking instance blast radius |
| Metrics/audit/evidence | Timers, safe trace, release proof | Advisory except blocking gate |

## Isolation

No component reads another service database. Browser cannot reach internal services directly. Horizontal API failure does not corrupt committed data; PostgreSQL loss affects Booking only and is bounded by captured backup, not hidden replication claims.

## Source Coverage

Inventory bridges `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and U01 `business-logic-model.md` to Infrastructure Design.
