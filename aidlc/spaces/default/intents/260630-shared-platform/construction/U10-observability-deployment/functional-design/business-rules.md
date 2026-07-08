# Business Rules - U10 Observability Deployment

## Source Trace

These rules derive from US-011, US-012, US-014, US-019, US-020, US-023, FR-022, FR-027, FR-050, NFR-002, NFR-005, NFR-009 through NFR-012, NFR-016, NFR-017, C-002, C-003, C-006, and the U10 functional design questions.

## Correlation Rules

BR-U10-001: Every trusted inbound platform boundary must accept an approved correlation id header and must generate a correlation id when the header is absent.

BR-U10-002: Generated correlation ids must be unique enough for operational search and must be safe to display to internal users and support staff.

BR-U10-003: The same correlation id must propagate through BFF routes, backend service calls, authorization decisions, audit/change-history records, outbox records, Kafka event envelopes, JSON logs, trace spans, and standard error/status envelopes.

BR-U10-004: A malformed inbound correlation id must not break a protected action; the platform must replace it with a valid generated id and emit a safe warning log.

BR-U10-005: Components must not generate a new correlation id for an already-correlated request unless starting an explicit new root workflow.

## Logging Rules

BR-U10-006: Services and BFF apps must emit structured JSON logs compatible with ELK ingestion.

BR-U10-007: Required log fields are timestamp, level, service or app name, environment, operation, correlationId, message, result, and error code where applicable.

BR-U10-008: Logs for authorization decisions must include safe decision outcome and reason code, but must not expose raw tokens, secret claims, or unauthorized role details.

BR-U10-009: Administrative actions, role changes, failed authorization attempts, sensitive reads, publication failures, and smoke-check failures must produce structured access or operational logs.

BR-U10-010: Logs must mask secrets, tokens, credentials, and restricted payload values before emission.

## Metrics and Trace Rules

BR-U10-011: Services and BFF apps must emit OpenTelemetry traces and metrics where runtime support exists.

BR-U10-012: Metrics must be consumable by Prometheus/Grafana through the approved on-prem collection path.

BR-U10-013: Traces must be consumable by Jaeger through the OpenTelemetry collector or approved equivalent.

BR-U10-014: Common reference read metrics must support measuring p95 <= 300 ms against the final NFR load profile.

BR-U10-015: Event freshness metrics must measure time from successful reference-change commit to consumer-observable Kafka publication, targeting p95 <= 60 seconds.

BR-U10-016: Metric labels must avoid high-cardinality or sensitive values; correlation ids may appear in logs/traces but must not be unbounded metric labels.

## Event Publication Health Rules

BR-U10-017: Outbox telemetry must expose pending, in-progress, retrying, published, permanent-failure, and recovery-required states or their approved equivalents.

BR-U10-018: Publication health must expose outbox depth, oldest pending age, retry count, failure count, last successful publish time, and event freshness p95.

BR-U10-019: Publication failures must expose a safe reason code and affected event id without leaking payload secrets or stack traces.

BR-U10-020: Retryable publication failures must keep the same event id and correlation id across retries.

BR-U10-021: Repeated publication failure or freshness p95 above 60 seconds must create an operator-visible alert or dashboard signal.

## Health and Smoke Rules

BR-U10-022: Every deployable service and BFF app must expose liveness and readiness behavior appropriate to its runtime.

BR-U10-023: Readiness checks must validate required runtime dependencies rather than only process availability.

BR-U10-024: Smoke checks must exercise at least one approved path through auth, reference API/BFF access, persistence, event/outbox publication evidence, and correlation evidence.

BR-U10-025: Staging deployment must require successful health and smoke checks before production promotion is considered.

BR-U10-026: Smoke failures must return actionable diagnostics with correlation id, failing check, and service/app boundary.

## Deployment Rules

BR-U10-027: Deployment descriptors must target the on-prem Docker Compose, Nginx, Vault, registry, Kafka, Schema Registry, PostgreSQL, ELK, Prometheus/Grafana, and Jaeger profile.

BR-U10-028: U10 must not introduce AWS/public-cloud infrastructure, Kubernetes-only deployment assumptions, or managed observability services for this MVP.

BR-U10-029: Non-local secrets must be represented as Vault references, not literal secret values.

BR-U10-030: Image names, tags, and registry references must be deterministic enough for deployment traceability and rollback.

BR-U10-031: Optional observability components in local Compose may be profile-gated, but staging readiness must include the approved observability evidence required by NFR-012.

## Frontend and BFF Rules

BR-U10-032: `apps/auth` and `apps/reference-data` BFF routes must create or propagate correlation ids before calling backend services.

BR-U10-033: Frontend-visible error, denied, publication-status, and dependency-unavailable states must include a safe support correlation id where available.

BR-U10-034: Browser code must not receive raw token material, secret claims, broker credentials, or operational stack credentials.

BR-U10-035: U10 frontend scope is limited to BFF observability, app health/smoke hooks, safe status surfaces, and links or references to approved external dashboards where authorized.

## Scope Rules

BR-U10-036: U10 must not implement downstream Charge, Booking, or Container Movement runtime behavior.

BR-U10-037: U10 must not replace U04 outbox status APIs or U06 reference-admin UI; it standardizes how their status, failure, and freshness signals are observable.

BR-U10-038: Final data-residency, disaster-recovery, and production load profiles remain upstream open questions and must be configurable rather than hard-coded into the functional model.

