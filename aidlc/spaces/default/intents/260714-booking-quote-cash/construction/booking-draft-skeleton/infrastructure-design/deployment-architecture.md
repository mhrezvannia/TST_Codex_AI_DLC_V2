# Deployment Architecture - U01 Booking Draft Skeleton

## Local Compose Topology

U01 extends the checked-in `compose.yaml`; it does not create a parallel stack or cloud resources. `apps-booking` is a Next.js container behind nginx host port `8088`, and `booking-service` is a Java 21/Spring Boot container on the internal `linercore-local` bridge. Only nginx is a user entry point. The BFF reaches `booking-service:8085`; the browser never receives that internal URL.

PostgreSQL 15 remains one container with service-owned databases and roles. Containers use `postgres:5432`; the only host mapping is `${POSTGRES_HOST_PORT:-55432}:5432`. Booking owns `linercore_booking`; no other service reads its schema. The named volume preserves committed data across restart, while pre-upgrade logical dumps under the controlled evidence directory define host/volume-loss recovery.

## Startup and Configuration

`booking-service` starts under `local,kafka` for the full stack, with SQL init disabled, Flyway enabled, and `baseline-on-migrate=false`. A pre-migration strategy accepts valid history, an empty schema, or an exact checked-in Booking V1 catalog fingerprint before explicit baseline. Unknown/partial catalogs abort startup and keep readiness false. The app starts only after Booking readiness, not merely container creation.

Booking receives database credentials, `AUTH_MODE=local`, target-specific service token, body/pool limits, and observability endpoints through environment variables. Secrets have no image defaults and never use `NEXT_PUBLIC_*`. Non-local profiles fail closed until W2-01. Container limits for acceptance are 1 CPU and 768 MiB for Booking JVM, 0.5 CPU and 512 MiB for the Booking app; Hikari remains max 10.

## Recovery and Scale

HTTP/API and BFF processes are stateless and restartable; PostgreSQL uniqueness, command receipts, and row locks are the concurrency authority. Compose runs one instance for deterministic W1 evidence. Horizontal scaling is a documented later action after connection and latency evidence; it requires no sticky session but must preserve the ten-connection cap per instance and aggregate DB capacity.

Restart order is PostgreSQL health, Booking Flyway/readiness, Booking app readiness, then nginx. Graceful stop allows 30 seconds for HTTP completion and closes Hikari. Two sequential service restarts must recover within 60 seconds without volume reset and preserve row counts, IDs, revisions, snapshots, Flyway checksums, and receipt uniqueness.

## Source Coverage

Architecture maps `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U01 `business-logic-model.md` onto the existing local deployment.
