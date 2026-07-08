# Business Logic Model - U10 Observability Deployment

## Source Trace

This U10 functional design derives from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `stories.md`, `bolt-plan.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

It covers US-011, US-012, US-014, US-019, US-020, and US-023. It supports FR-022, FR-027, FR-050, NFR-002, NFR-005, NFR-009 through NFR-012, NFR-016, NFR-017, and constraints C-002 through C-006.

## Unit Purpose

U10 defines the cross-cutting runtime behavior that lets Shared Platform be operated, traced, diagnosed, and promoted through on-prem environments. It applies to `identity-service`, `reference-data-service`, event/outbox publishing, `apps/auth`, `apps/reference-data`, Docker Compose profiles, Nginx routing, Vault secret references, registry conventions, and the approved observability stack.

U10 does not create new business capabilities, downstream module runtimes, or a custom operations portal. It supplies consistent observability contracts and readiness hooks used by other units and surfaced through ELK, Prometheus/Grafana, Jaeger, health endpoints, smoke checks, and authorized status APIs.

## Correlation Propagation Workflow

```text
Inbound browser, BFF, service, or smoke request arrives
  -> read correlation id from approved header if present
  -> generate a new correlation id if absent
  -> attach correlation context to request scope
  -> propagate id to BFF-to-service calls
  -> persist id in audit and change-history records
  -> persist id in outbox item
  -> include id in Kafka event envelope
  -> include id in JSON logs, trace spans, and metrics labels where allowed
  -> return id in standard error/status envelopes
```

Decision points:

| Decision | Rule |
|---|---|
| Missing inbound id? | Generate one at the first trusted platform boundary. |
| Malformed inbound id? | Replace with a generated id and log a safe warning. |
| Service call crosses a boundary? | Forward the same id using the approved header and trace context. |
| Request fails before persistence? | Emit error log and trace span with correlation id. |
| Audit or outbox write occurs? | Persist the same id as part of the durable record. |
| Event publishes? | Include the same id in the event envelope. |

## Structured Logging Workflow

```text
Runtime action starts
  -> create log context with service/app, environment, operation, correlation id, and actor summary where safe
  -> emit JSON log records at meaningful boundaries
  -> mask secrets, tokens, PII, and restricted payload fields
  -> send logs to ELK-compatible collection path
  -> allow operator search by correlation id, event id, record id, and safe operation fields
```

Log records support US-012 authorization decisions, US-014 role/permission audit investigations, US-019 publication health, and US-020 cross-boundary traceability.

## Metrics and Trace Workflow

```text
Service or BFF handles request
  -> start or join OpenTelemetry trace context
  -> record request latency, result, error class, and dependency timings
  -> record domain metrics for authorization decisions, reference API reads, outbox lag, publication attempts, and event freshness
  -> export metrics to Prometheus-compatible endpoint or collector
  -> export traces to Jaeger through OpenTelemetry collector
  -> render operational signals in Grafana dashboards
```

Required metric families:

| Metric family | Functional purpose |
|---|---|
| Request latency | Validate NFR-001 p95 <= 300 ms target for common reference reads. |
| Error rate | Detect service, BFF, authorization, dependency, and publication failure trends. |
| Authorization decisions | Count allow/deny/fail-closed outcomes without exposing secret claims. |
| Outbox lag | Show oldest pending/retrying item age and queue depth. |
| Event freshness | Measure p95 time from committed change to consumer-observable Kafka publish; target p95 <= 60 seconds. |
| Publication attempts | Show retry, permanent failure, and recovery-required counts. |
| Health/smoke status | Show latest readiness and promotion-blocking failure signals. |

## Event Publication Health Workflow

```text
Reference change commits
  -> U04 creates outbox item with event id and correlation id
  -> publisher records pending, in-progress, retrying, published, failed, or recovery-required status
  -> status changes emit structured logs and metrics
  -> successful publish records topic, partition, offset, and published-at timestamp
  -> failed publish records safe reason code, retry count, and next action
  -> operator inspects Grafana/ELK/status API by event id, record id, status, or correlation id
```

Failure handling:

| Failure | Behavior |
|---|---|
| Retryable broker or network failure | Keep event id stable, increment retry count, expose retrying state and lag. |
| Serialization or schema failure | Stop infinite retries, mark permanent failure or recovery required, expose safe reason. |
| Status API unavailable | UI and smoke checks show non-blocking status-unavailable state with correlation id. |
| Freshness p95 exceeds 60 seconds | Expose alert/dashboard signal for operator action. |

## Health and Smoke Workflow

```text
Environment deployment starts
  -> containers and services expose liveness/readiness checks
  -> Nginx routes only to ready frontend/BFF services
  -> smoke runner signs in or uses approved local auth equivalent
  -> smoke runner performs one reference read/write path
  -> smoke runner verifies audit/outbox/event publication evidence
  -> smoke runner verifies correlation id appears across logs/status/trace evidence
  -> promotion gate consumes health and smoke result
```

Health checks prove process and dependency readiness. Smoke checks prove a minimal business path through auth, reference data, persistence, event publication, frontend/BFF access, CI evidence, and observability basics.

## Deployment Readiness Workflow

```text
Environment stage is prepared
  -> Docker Compose profiles define core and observability services
  -> Nginx routing maps app/BFF/service paths
  -> Vault paths are referenced for non-local secrets
  -> image registry names and tags follow environment convention
  -> health/smoke commands are declared for the stage
  -> deployment record captures version, config, check results, and promotion decision
```

U10 readiness artifacts target the approved on-prem profile: Docker Compose, Nginx, Vault references, self-managed Kafka/Schema Registry, PostgreSQL, ELK, Prometheus/Grafana, and Jaeger. AWS/public-cloud infrastructure and Kubernetes manifests are out of scope for this MVP.

## Frontend and BFF Observability Workflow

```text
User opens apps/auth or apps/reference-data
  -> BFF creates or propagates correlation id
  -> protected BFF routes call identity-service and reference-data-service with the same id
  -> server-side logs include operation and safe subject/resource summary
  -> UI shows supportable correlation id in error, denied, status-unavailable, and publication-failure states
  -> app health route reports frontend/BFF readiness
```

Frontend apps do not implement a full observability dashboard. Operators use the approved stack, while application screens expose enough safe status and correlation information for support handoff.

## Walking Skeleton Support

For Bolt 1, U10 must prove one traceable path:

- A request creates or views a reference record through the frontend/BFF path.
- The same correlation id is visible in the BFF log, service log, audit/change history, outbox item, and event/status evidence.
- Health and smoke checks can run against the local/staging profile.
- At least one metrics/trace/log signal is visible in the approved on-prem observability stack or local equivalent.

## Non-Goals

- No Charge, Booking, or Container Movement runtime implementation.
- No public-cloud managed observability service.
- No custom operational dashboard application beyond safe status/correlation surfaces in existing apps.
- No final disaster-recovery or site-residency design beyond placeholders already identified as upstream open questions.

