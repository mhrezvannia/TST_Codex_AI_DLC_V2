# Infrastructure Services - U01 Booking Draft Skeleton

## Service Inventory

| Service | Configuration | Ownership and failure boundary |
|---|---|---|
| nginx 1.27 | Host `8088`, Booking routes to `apps-booking` | Public local ingress; no domain state |
| `apps-booking` | Next.js 15 image, internal port 3000 | BFF/header/origin boundary; stateless |
| `booking-service` | Java 21/Spring Boot 3.3.7, internal/host 8085 | Booking API/domain/application; stateless above DB |
| PostgreSQL 15 | Internal 5432, host `${POSTGRES_HOST_PORT:-55432}` | `linercore_booking` canonical state and Flyway history |
| Prometheus/Grafana/OTel/Jaeger | Existing observability profile | Metrics/traces only; never business authority |

No cache, search engine, object store, additional queue, or service registry is added for U01. Indexed JDBC reads are authoritative and satisfy the latency target without invalidation risk. Compose DNS provides discovery on the isolated bridge.

## Database and Migration

Booking V1 reproduces the current schema byte-faithfully; additive V2 adds canonical booking/query fields, command receipts, audit/outbox constraints, snapshot versioning, and indexes. The checked-in catalog fingerprint includes tables, columns, PostgreSQL types, nullability/defaults, PK/FK/unique constraints, and indexes. The migration strategy runs validate/migrate for known history, V1/V2 for empty schema, explicit baseline(1)+V2 only for an exact legacy fingerprint, and aborts before mutation otherwise.

Indexes support unique booking number/idempotency and deterministic list order `(updated_at DESC, booking_id DESC)` plus bounded customer/status lookup. Hikari uses min 2/max 10 and 2-second acquisition timeout. PostgreSQL statements use server-side constraints and parameterized SQL; no cross-database grants are introduced.

## Security and Data Handling

The local BFF strips spoofable identity headers and supplies `X-LinerCore-Actor-Id: local-user`, service ID, correlation, idempotency, and the Booking-specific token. The Booking local auth filter compares tokens in constant time and maps fixed roles. Same-origin, method/content-type, 256 KiB body, typed DTO, field cardinality, and log-redaction controls apply before persistence.

Booking data is internal business data; customer names/contact data are excluded from events, audit, traces, and infrastructure logs. Dumps and traces remain controlled evidence and are not committed when sensitive. Local plaintext network traffic is covered only by the approved W1 local waiver; non-local startup remains blocked.

## Source Coverage

Services realize `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U01 `business-logic-model.md` without new shared infrastructure.
