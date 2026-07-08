# Domain Entities - U10 Observability Deployment

## Source Trace

These operational entities derive from U10 unit boundaries, US-011, US-012, US-014, US-019, US-020, US-023, NFR-002, NFR-005, NFR-009 through NFR-012, NFR-016, and the approved on-prem deployment constraints.

U10 entities are cross-cutting value objects, status projections, and deployment/readiness records. They do not replace the core business entities owned by `identity-service`, `reference-data-service`, or the U04 outbox model.

## CorrelationContext

Purpose: Request-scoped trace identity propagated across platform boundaries.

Attributes:

| Attribute | Description |
|---|---|
| `correlationId` | Safe support trace id generated or accepted at the trusted boundary. |
| `traceId` | OpenTelemetry trace id where available. |
| `parentSpanId` | Parent span id for nested calls where available. |
| `source` | Browser, BFF, service, smoke runner, scheduler, or publisher. |
| `createdAt` | Time the context was created or accepted. |
| `trustedBoundary` | Boundary that accepted or generated the id. |

Relationships:

- Appears in logs, traces, metrics exemplars where supported, audit/change-history records, outbox records, Kafka event envelopes, and UI support messages.

## StructuredLogEvent

Purpose: JSON log record suitable for ELK ingestion and operational search.

Attributes:

| Attribute | Description |
|---|---|
| `timestamp` | Event time. |
| `level` | Debug, info, warn, error, or fatal. |
| `serviceName` | Service or app emitting the log. |
| `environment` | Local, CI, staging, production, or equivalent stage. |
| `operation` | Safe operation name such as authorize, create-reference, publish-event, smoke-check. |
| `correlationId` | Propagated support trace id. |
| `actorSummary` | Safe actor identifier or role summary where allowed. |
| `resourceSummary` | Safe resource identifier such as reference set, record id, or event id. |
| `result` | Success, denied, failed, retrying, unavailable, or skipped. |
| `errorCode` | Safe platform error code where applicable. |
| `message` | Human-readable operational message without secrets. |

## TelemetryMetric

Purpose: Metric sample or series emitted for Prometheus/Grafana consumption.

Attributes:

| Attribute | Description |
|---|---|
| `metricName` | Stable metric name following platform convention. |
| `metricType` | Counter, gauge, histogram, or summary. |
| `unit` | Milliseconds, seconds, count, bytes, or ratio. |
| `labels` | Bounded safe dimensions such as service, operation, result, status. |
| `value` | Numeric metric value. |
| `observedAt` | Sample time. |

Rules:

- Correlation ids must not be unbounded metric labels.
- Sensitive values must not appear in metric labels.

## TraceSpanSummary

Purpose: Operational representation of an OpenTelemetry span visible in Jaeger.

Attributes:

| Attribute | Description |
|---|---|
| `traceId` | Distributed trace identifier. |
| `spanId` | Current span identifier. |
| `parentSpanId` | Parent span identifier where applicable. |
| `serviceName` | Emitting service or app. |
| `operationName` | Route, handler, adapter, publisher, or smoke step. |
| `startTime` | Span start time. |
| `durationMs` | Span duration in milliseconds. |
| `status` | Ok, error, cancelled, timeout, or unavailable. |
| `correlationId` | Support trace id linked to logs/audit/events. |

## HealthCheckResult

Purpose: Current liveness or readiness result for a deployable component.

Attributes:

| Attribute | Description |
|---|---|
| `componentName` | Service, BFF app, database, broker, schema registry, Nginx, or observability component. |
| `checkType` | Liveness, readiness, dependency, or startup. |
| `status` | Healthy, degraded, unhealthy, unknown. |
| `dependencies` | Required dependency results used by readiness. |
| `checkedAt` | Time of check. |
| `details` | Safe diagnostics. |
| `correlationId` | Check correlation id where emitted by an active check. |

## SmokeCheckRun

Purpose: Promotion-oriented functional smoke evidence for an environment stage.

Attributes:

| Attribute | Description |
|---|---|
| `runId` | Stable smoke run id. |
| `environment` | Local, CI, staging, or production candidate. |
| `version` | Build or image version under test. |
| `startedAt` | Run start time. |
| `completedAt` | Run completion time. |
| `status` | Passed, failed, blocked, skipped. |
| `steps` | Ordered smoke steps and results. |
| `correlationId` | Root correlation id for cross-system lookup. |
| `evidenceLinks` | Safe links or references to logs, traces, events, and CI output. |

## PublicationHealthSnapshot

Purpose: Operator-facing projection of reference-change event publication health.

Attributes:

| Attribute | Description |
|---|---|
| `referenceSet` | Reference set or all-sets aggregate. |
| `pendingCount` | Count of pending publication items. |
| `retryingCount` | Count of retryable publication items. |
| `failedCount` | Count of permanent or recovery-required failures. |
| `oldestPendingAgeSeconds` | Age of oldest pending/retrying item. |
| `eventFreshnessP95Seconds` | p95 commit-to-publish duration. |
| `lastPublishedAt` | Last successful publication timestamp. |
| `lastFailureReasonCode` | Safe reason code for most recent failure. |
| `measuredAt` | Snapshot time. |

## DeploymentReadinessRecord

Purpose: Evidence that an environment stage is ready for promotion consideration.

Attributes:

| Attribute | Description |
|---|---|
| `environment` | Target stage. |
| `buildVersion` | Application build or image set. |
| `composeProfile` | Docker Compose profile or equivalent on-prem descriptor. |
| `nginxRouteVersion` | Nginx routing/config version reference. |
| `vaultPathSet` | Vault secret path set reference, not secret values. |
| `registryReferences` | Image registry names and tags. |
| `healthStatus` | Aggregate health status. |
| `smokeStatus` | Aggregate smoke status. |
| `observabilityStatus` | Logs/metrics/traces/dashboard evidence status. |
| `promotionDecision` | Ready, blocked, deferred, or not evaluated. |

## AlertSignal

Purpose: Operator-visible alert or dashboard signal derived from telemetry.

Attributes:

| Attribute | Description |
|---|---|
| `signalId` | Stable alert/signal id. |
| `severity` | Info, warning, critical. |
| `sourceMetric` | Metric or log pattern that produced the signal. |
| `condition` | Trigger condition, such as freshness p95 above target. |
| `affectedComponent` | Service, app, outbox, broker, or environment stage. |
| `safeContext` | Event id, record id, reference set, or correlation id where safe. |
| `raisedAt` | Signal creation time. |
| `resolvedAt` | Signal resolution time where applicable. |

## Entity Interaction Pattern

```text
CorrelationContext
  -> StructuredLogEvent
  -> TraceSpanSummary
  -> TelemetryMetric
  -> PublicationHealthSnapshot
  -> HealthCheckResult
  -> SmokeCheckRun
  -> DeploymentReadinessRecord
  -> AlertSignal
```

U10 entities connect operational evidence across existing Shared Platform units without taking ownership of their core domain state.

