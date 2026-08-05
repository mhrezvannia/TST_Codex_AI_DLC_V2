# Deployment Architecture - W2-03

## Upstream Coverage

This design consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Canonical Local Topology

W2-03 runs in the existing `compose.yaml` `app`/`full` profiles. Nginx on port 8088 is the only browser entry. The Charge UI calls `charge-agreement-service` through its BFF; Booking calls Charge over the internal Compose network. Charge owns only the `linercore_pricing` database. Reference data, identity, Booking, Kafka, and Schema Registry remain separately owned services.

## Required Compose Changes

| Resource | Required design | Current gap to close |
| --- | --- | --- |
| PostgreSQL | Named volume mounted at `/var/lib/postgresql/data`; backup/restore evidence for pricing schema | Current Compose has no data volume |
| Charge service | `/actuator/health` healthcheck, graceful shutdown, CPU/memory limit, bounded JDBC pool, log rotation | No healthcheck or resource/log policy |
| Charge UI | `/api/health` healthcheck, auth/session configuration, CPU/memory limit, log rotation | No healthcheck, auth handoff, or limits |
| Booking dependency | Wait for healthy Charge service, not merely process start | Uses `service_started` |
| Nginx | Preserve correlation ID and authenticated session headers for Charge route | Route exists but acceptance must prove subject propagation |
| Images | Pinned base images, multi-stage build, non-root runtime, reproducible commit-SHA tags | Shared Dockerfiles require verification |

## Environment Model

Local and CI use the same Compose/service topology with different secrets and ports. Staging uses the same versioned container artifacts and configuration schema on self-hosted on-prem infrastructure. Production remains a later approved target and requires an explicit topology/RTO/RPO decision; it cannot be inferred from AWS guidance.

## Networking and Security

Expose only Nginx and developer/observability ports needed by the selected profile. Database, Kafka, Schema Registry, and backend service traffic remain on the Compose network. Non-local profiles require TLS, real JWT validation, secret injection outside source control, and fail-closed local-bypass checks.

## Rollout and Recovery

Use backward-compatible schema expansion, application rollout, verification, then later cleanup. Roll back application images only while schema compatibility is preserved. Monetary migrations require forward-repair or tested restore; destructive database reset is not rollback evidence.
