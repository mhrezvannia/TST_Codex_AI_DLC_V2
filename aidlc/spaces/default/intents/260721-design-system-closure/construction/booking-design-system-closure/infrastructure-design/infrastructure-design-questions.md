# Infrastructure Design Questions — booking-design-system-closure

## Context

These questions translate `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, and `logical-components.md` onto the existing application `components.md`, runtime `services.md`, and canonical flow in `business-logic-model.md`. The approved Unit has no cloud or production infrastructure change.

## Q1 — Deployment Architecture

Should acceptance remain a local containerized topology operated only through `scripts/wave-a-compose.mjs` as `linercore-wave-a`, with nginx/shared shell/Keycloak/BFF/services/datastores preserved and no AWS, staging, production, or new IaC?

- **A (recommended):** Document and verify the existing isolated local topology.
- **B:** Design and provision new cloud environments.

[Answer]: A — Preserve and verify the existing isolated local container topology; add no cloud environment or IaC.

## Q2 — Infrastructure Services

Should all current nginx, Next.js apps, Java services, PostgreSQL stores, Kafka/Schema Registry, and Keycloak services retain their existing ownership/configuration, with no cache, queue, database, replica, DNS, CDN, or load-balancer addition?

- **A (recommended):** Preserve existing services; change only directly traced compatibility/configuration gaps.
- **B:** Add new infrastructure services for speculative scale/resilience.

[Answer]: A — Preserve existing services/ownership; permit only directly traced compatibility/configuration corrections.

## Q3 — Monitoring and Evidence

Should monitoring for this closure be run-scoped: wrapper health/logs, browser errors/network/correlation, guard results, sanitizer output, command exits, and evidence manifest—with no production dashboard, alert, retention, or incident-response claim?

- **A (recommended):** Use deterministic acceptance observability only.
- **B:** Add a production monitoring/alerting platform.

[Answer]: A — Use deterministic run-scoped wrapper/browser/correlation/guard/sanitizer/exit evidence only.

## Q4 — CI/CD and Promotion

Should Infrastructure Design specify blocking static/focused/build/live/audit stages and durable artifacts while deferring any workflow mutation to the later CI Pipeline stage, with no deployment/promotion/rollback claim beyond isolated local cleanup?

- **A (recommended):** Define gates and handoff only; no deployment pipeline.
- **B:** Add staging/production deployment and rollback stages.

[Answer]: A — Define blocking gates/artifact handoff and defer workflow mutation; add no deployment/promotion/rollback pipeline.

## Q5 — Shared and Protected Runtime

Should shared infrastructure document existing cross-service dependencies and ports while treating `linercore-shared-platform`/port 8088 as an untouched external runtime whose pre/post `demo:guard` results are mandatory closure gates?

- **A (recommended):** Preserve strict project/port isolation and mandatory guards.
- **B:** Reuse the manager-demo project as the acceptance environment.

[Answer]: A — Keep the manager-demo runtime untouched and outside acceptance operations while requiring green pre/post guards.

## Ambiguity Analysis

All answers select explicit local preservation boundaries. No cloud, service, monitoring, deployment, rollback, or shared-runtime decision remains open, and the mandatory guard dependency is consistent with the untouched manager-demo runtime.
