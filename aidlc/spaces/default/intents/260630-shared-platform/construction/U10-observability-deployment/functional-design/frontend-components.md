# Frontend Components - U10 Observability Deployment

## Source Trace

This frontend/BFF design derives from US-011, US-019, US-020, US-023, NFR-005, NFR-012, U01 platform conventions, U04 event status behavior, U05 auth frontend behavior, and U06 reference-data frontend behavior.

U10 does not create a standalone observability product UI. It defines BFF/app hooks and safe user-visible support states while ELK, Prometheus/Grafana, and Jaeger remain the operational dashboard surfaces.

## Component and Route Inventory

| Surface | Purpose | Owning app/package |
|---|---|---|
| `apps/auth/app/api/health` | BFF/app readiness response for auth app. | `apps/auth` |
| `apps/reference-data/app/api/health` | BFF/app readiness response for reference-data app. | `apps/reference-data` |
| `apps/auth` BFF middleware/helper | Create or propagate correlation id for protected auth/session routes. | `apps/auth` |
| `apps/reference-data` BFF middleware/helper | Create or propagate correlation id for reference-data routes and event status routes. | `apps/reference-data` |
| `SupportCorrelationText` | Displays safe support correlation id in error/denied/status states. | `@erp/ui` or app-local component |
| `OperationalStatusBadge` | Shows healthy, degraded, unhealthy, unknown, pending, retrying, published, or failed status. | `@erp/ui` or app-local component |
| `PublicationFreshnessIndicator` | Displays event freshness/status signal from U04/U10 view model. | `apps/reference-data` |
| `SmokeStatusSummary` | Internal non-customer display for latest smoke status where authorized. | `apps/reference-data` or operator-only route if later approved |
| `DashboardLinkList` | Safe links/references to Grafana, Kibana/ELK, and Jaeger dashboards where authorized. | app-local or documentation surface |

## BFF Correlation Pattern

```text
Browser request enters BFF route
  -> read approved correlation header or create id server-side
  -> attach id to server request context
  -> call identity-service or reference-data-service with id
  -> log server-side operation with id
  -> return id in safe response metadata for error/status states
```

Rules:

- Browser code must not receive raw tokens, secret claims, or operational credentials.
- UI may display correlation id when it helps support diagnose access denial, publication failure, dependency outage, or smoke/status failure.
- Mutation and status BFF routes must preserve the same id when calling backend services.

## Health Route View Model

Purpose: Provide app/BFF readiness status to Nginx, smoke checks, and deployment readiness evaluation.

Fields:

| Field | Purpose |
|---|---|
| `appName` | `apps/auth` or `apps/reference-data`. |
| `status` | Healthy, degraded, unhealthy, or unknown. |
| `version` | Build/version identifier where configured. |
| `dependencies` | Safe dependency status summary for required backend calls. |
| `checkedAt` | Server-side check time. |
| `correlationId` | Correlation id for the health check request. |

## Status and Error States

| State | UI behavior |
|---|---|
| Access denied | Show safe denied reason and support correlation id; do not show secret policy details. |
| Read-only due to permission | Keep data usable and hide/disable write actions with supportable reason. |
| Publication pending/retrying | Show non-blocking status badge and attempt/freshness signal where available. |
| Publication failed/recovery required | Show failed status, safe reason, and correlation id for support/operator handoff. |
| Publication status unavailable | Show non-blocking unavailable state; do not block record detail display. |
| Dependency unavailable | Show retry/support state with correlation id. |
| Smoke failed | Show internal deployment/status evidence only where the user is authorized. |

## Reference Data Event Status Integration

```text
Record detail page renders
  -> BFF calls event status API with correlation id
  -> BFF maps U04 status and U10 freshness signal to safe view model
  -> UI renders status badge, timeline/freshness indicator, or non-blocking unavailable state
```

This supports US-011 and US-019 without moving event publication ownership into the frontend.

## Dashboard Link Pattern

Dashboard references may appear only in internal/operator-authorized contexts.

| Destination | Purpose |
|---|---|
| Grafana dashboard | Metrics for request latency, event freshness, outbox lag, errors, health, and smoke. |
| Kibana/ELK search | Structured logs filtered by correlation id, event id, service, and safe operation. |
| Jaeger trace search | Trace lookup by trace id or correlation-linked metadata. |

The UI stores or displays references only; credentials and dashboard authorization remain outside browser code.

## Accessibility and Interaction Rules

- Status badges must expose text labels in addition to color.
- Error and status messages must be reachable by keyboard and screen-reader users.
- Correlation ids must be selectable/copyable where shown.
- Health/status content must not auto-refresh in a way that steals focus.
- Mobile views may show compact status/correlation text, but must not hide failure state completely.

## Non-Goals

- No custom Grafana/Kibana/Jaeger replacement.
- No browser-side direct calls to backend services or observability systems.
- No display of raw event payloads, stack traces, credentials, tokens, or secret claims.
- No downstream module operational UI.

