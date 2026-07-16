# Dashboards - W1-01

## Dashboard Inventory

The source dashboard is `infrastructure/observability/grafana/dashboards/shared-platform-overview.json`. It remains the shared platform overview and now includes W1 panels for Booking API latency, Booking outbox depth, CMM status relay backlog, and Charge pricing failures.

Prometheus scrape configuration is in `infrastructure/observability/prometheus.yml`. It now scrapes:

| Job | Metrics path | Target |
|---|---|---|
| identity-service | `/actuator/prometheus` | `identity-service:8082` |
| reference-data-service | `/actuator/prometheus` | `reference-data-service:8083` |
| charge-agreement-service | `/actuator/prometheus` | `charge-agreement-service:8084` |
| booking-service | `/actuator/prometheus` | `booking-service:8085` |
| container-movement-service | `/actuator/prometheus` | `container-movement-service:8086` |

## W1 Quote-To-Cash Panels

The dashboard must show the user journey before infrastructure internals:

| Panel | Query or source | Purpose |
|---|---|---|
| Booking API latency p95 | `histogram_quantile(0.95, sum(rate(http_server_requests_seconds_bucket{job="booking-service"}[5m])) by (le))` | Confirms draft/detail and confirm APIs stay within user-path expectations from `performance-design.md`. |
| Booking outbox pending | `booking_outbox_pending_total` | Detects confirm events stuck before Kafka publication. |
| CMM status relay pending | `containermovement_outbox_pending_total` | Detects returned-status events stuck before Booking projection. |
| Charge pricing request failures | `increase(http_server_requests_seconds_count{job="charge-agreement-service", outcome="SERVER_ERROR"}[5m])` | Flags quote/pricing path regressions. |
| Event freshness p95 | `reference_event_freshness_seconds_bucket` and W1 relay freshness metrics when emitted | Tracks projection freshness, including CMM return status. |
| Deployment manifest status | `artifacts/w1-01-live/<run-id>/manifest.json` | Release proof remains blocked until this manifest records PASS. |

## Runtime Status

Dashboard source configuration is updated, but the full dashboard runtime is not proven on this workstation. The fresh deployment run in `deployment-execution` blocked at `compose-start` because Docker could not pull `docker.elastic.co/kibana/kibana:8.16.1`; therefore Grafana/Prometheus/OTel/Kibana runtime verification remains pending.

## Source Coverage

This dashboard plan traces to `monitoring-design.md` for collected metrics, `performance-design.md` for latency thresholds, `security-design.md` for redacted evidence, `reliability-design.md` for manifest state, and `infrastructure-services.md` for the local live-proof components.
