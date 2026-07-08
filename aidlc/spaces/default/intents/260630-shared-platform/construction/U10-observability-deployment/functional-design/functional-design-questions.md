# Functional Design Questions - U10 Observability Deployment

## Source Trace

This question set derives from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `stories.md`, `bolt-plan.md`, `components.md`, `component-methods.md`, and `services.md`.

## Q1. Observability scope

Which runtime observability behavior should U10 define?

A. Structured JSON logs, correlation propagation, OpenTelemetry metrics/traces, health checks, smoke checks, deployment descriptors, and approved-stack dashboard signals (recommended)
B. Only application logs
C. Only infrastructure health checks
X. Other (please specify)

[Answer]: A. Full on-prem observability and readiness behavior (Recommended)

Rationale: US-019, US-020, US-023, NFR-012, and Bolt 10 require logs, metrics, traces, health, smoke, and deployment readiness evidence across services and BFF apps.

## Q2. Correlation id policy

How should correlation ids behave when callers do not provide one?

A. Generate at the platform edge or first inbound service boundary, then propagate the same id through BFF, service, audit, outbox, logs, traces, and Kafka event envelope (recommended)
B. Require every caller to provide one and reject missing ids
C. Generate a new id in each service
X. Other (please specify)

[Answer]: A. Generate once and propagate (Recommended)

Rationale: US-020 and FR-027 require a missing correlation id to be created and reused across the full request path.

## Q3. Approved observability stack

Which observability stack should the design target?

A. ELK for logs, Prometheus/Grafana for metrics and dashboards, Jaeger through OpenTelemetry traces (recommended)
B. Public-cloud managed observability services
C. A custom operational dashboard built into `apps/reference-data`
X. Other (please specify)

[Answer]: A. Approved on-prem stack (Recommended)

Rationale: C-002 and C-006 exclude AWS/public cloud and identify ELK, Prometheus/Grafana, and Jaeger as expected integrations.

## Q4. Health and smoke checks

What should be considered sufficient readiness evidence?

A. Liveness/readiness endpoints per deployable plus smoke checks that exercise auth, reference read/write, event publication, correlation evidence, and frontend/BFF access where applicable (recommended)
B. Container started status only
C. Manual operator sign-off without automated checks
X. Other (please specify)

[Answer]: A. Health endpoints plus functional smoke checks (Recommended)

Rationale: NFR-005 and US-023 require health and smoke checks before production promotion is considered.

## Q5. Event publication health

How should operators detect delayed or failed reference-change events?

A. Expose publication status, outbox lag, event freshness, retry/failure counts, and safe failure reasons as metrics/log fields and status APIs for authorized views (recommended)
B. Only inspect database rows manually
C. Only rely on Kafka topic inspection
X. Other (please specify)

[Answer]: A. Observable status and metrics (Recommended)

Rationale: US-019, NFR-002, NFR-011, and NFR-016 require visibility into failed, stale, or delayed publication.

## Q6. Deployment descriptor boundary

Which deployment artifacts belong to U10?

A. Docker Compose profiles, Nginx routing/readiness wiring, Vault secret references, registry naming conventions, and environment readiness contracts for on-prem stages (recommended)
B. Kubernetes manifests
C. AWS infrastructure templates
X. Other (please specify)

[Answer]: A. On-prem deployment readiness descriptors (Recommended)

Rationale: The MVP target is on-prem Docker Compose with Nginx, Vault, registry conventions, and no public-cloud infrastructure.

## Q7. Frontend responsibility

What frontend behavior should U10 own?

A. BFF correlation propagation, structured server-side logs, health/smoke routes, safe correlation id display in error/status states, and external dashboard links where authorized (recommended)
B. Full custom observability dashboard UI
C. No frontend or BFF observability behavior
X. Other (please specify)

[Answer]: A. BFF and app readiness integration (Recommended)

Rationale: `apps/auth` and `apps/reference-data` are deployables in the request path, but the operational dashboard surface remains the approved observability stack.

