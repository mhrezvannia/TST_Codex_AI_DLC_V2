# NFR Requirements Questions - U10 Observability Deployment

## Source Trace

This question record derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

## Q1. Correlation continuity

What correlation behavior is required?

A. One generated or accepted correlation id propagates through BFFs, services, authorization, audit/change history, outbox, Kafka events, logs, traces, and error/status envelopes (recommended)
B. Each component generates its own id
C. Correlation ids are optional
X. Other (please specify)

[Answer]: A. End-to-end correlation continuity (Recommended)

## Q2. Observability stack

Which stack must U10 target?

A. ELK-compatible JSON logs, Prometheus/Grafana metrics, Jaeger traces through OpenTelemetry, on-prem only (recommended)
B. Public-cloud managed observability
C. Custom observability app
X. Other (please specify)

[Answer]: A. Approved on-prem stack (Recommended)

## Q3. Event health targets

What event metrics are required?

A. Outbox depth, oldest pending age, retry/failure counts, last publish time, and event freshness p95 <= 60 seconds (recommended)
B. Publish count only
C. No event metrics
X. Other (please specify)

[Answer]: A. Full publication health metrics (Recommended)

## Q4. Readiness

What gates promotion readiness?

A. Liveness/readiness plus smoke checks that exercise auth, reference path, persistence, event/outbox evidence, and correlation evidence (recommended)
B. Container started status only
C. Manual inspection only
X. Other (please specify)

[Answer]: A. Health plus smoke readiness (Recommended)

## Q5. Sensitive telemetry

How should telemetry treat secrets and sensitive data?

A. Mask secrets/tokens/restricted payloads; avoid high-cardinality/sensitive metric labels; expose safe correlation ids for support (recommended)
B. Log full payloads for diagnostics
C. Let each component decide
X. Other (please specify)

[Answer]: A. Safe telemetry controls (Recommended)

## Ambiguity Analysis

- `business-rules.md` fixes stack, correlation, metric families, health/smoke, deployment descriptor, and no public-cloud requirements.
- Final data-residency, disaster-recovery, and production load profiles remain open; U10 must keep descriptors configurable.
- No follow-up questions are needed for U10.

