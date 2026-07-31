# Dashboards — W2-02 Design-System Closure

## Inputs

This dashboard assessment consumes `booking-design-system-closure/nfr-design/performance-design.md`, `security-design.md`, `reliability-design.md`, `booking-design-system-closure/infrastructure-design/monitoring-design.md`, and `infrastructure-services.md`.

## W2-02 run dashboard

The canonical W2-02 dashboard is its immutable evidence package:

- 98 expected/98 passed cases;
- route, state, theme and viewport discriminators;
- request/status/duration observations;
- browser error and timeout collectors;
- screenshots and sanitized mutation trace;
- manager guards, Wave A lifecycle gates and audits;
- terminal attempt lineage and manifest hashes.

This is appropriate for an ephemeral closure deployment because it preserves the exact workspace/run relationship instead of implying continuous production telemetry.

## Existing Shared Platform dashboard

`infrastructure/observability/grafana/dashboards/shared-platform-overview.json` provides seven local panels:

1. Reference API latency p95;
2. Outbox pending depth;
3. Event freshness p95;
4. Booking API latency p95;
5. Booking outbox pending;
6. CMM status relay pending;
7. Charge pricing request failures.

Grafana is currently reachable on the protected manager’s effective port 3005 with HTTP 200. The checked-in default remains port 3003; the manager is a separate integration checkout and is not changed here.

## Live data-source status

The optional shared dashboard is **PARTIAL**:

- Prometheus readiness: HTTP 200;
- Grafana health: HTTP 200;
- all seven observed Prometheus application targets: `down`;
- Next application scrapes report invalid exposition parsing;
- Spring service scrapes return HTTP 404;
- Elasticsearch: exited 137, OOM-killed;
- Kibana: running but status request times out because Elasticsearch is unavailable.

Therefore dashboard provisioning is present, but live application panels cannot be claimed healthy. This does not invalidate W2-02’s run-scoped evidence because `monitoring-design.md` explicitly keeps optional shared observability outside the closure gate.

## Required follow-up

Program-level observability work should define valid application metrics endpoints/exposition, right-size Elasticsearch within the Docker memory budget, restart and validate Elasticsearch/Kibana under authorized manager ownership, and then verify non-empty Grafana panels. W2-02 does not mutate the protected manager to perform that remediation.
