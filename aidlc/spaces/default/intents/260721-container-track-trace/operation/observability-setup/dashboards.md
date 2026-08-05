# W2-04 Observability Dashboards

## Status and Upstream Trace

This dashboard design implements the golden signals and acceptance timings in
`performance-design`, the redaction and authorization boundaries in
`security-design`, the fenced recovery states in `reliability-design`, the
correlated evidence specified by `monitoring-design`, and the CMM/Booking
ownership in `infrastructure-services`.

**Status: DESIGNED, NOT ACTIVATED.** The checked-in Grafana descriptor parses,
but the manager Prometheus/Grafana/Jaeger/Elastic profile was not running during
validation. Port 3003 belonged to the Charge Agreements app, not Grafana.

## Existing Descriptor Assessment

`shared-platform-overview.json` defines seven panels for Reference Data latency,
Reference Data outbox/freshness, Booking latency/outbox, CMM relay pending, and
Charge Agreement failures. It does not provide the complete W2-04 journey,
rejection, consumer, authorization, degradation, UI convergence, or evidence
status views.

Only Charge Agreement exposed `/actuator/prometheus` in the observed manager
images. Identity, Reference Data, Booking, and Container Movement returned 404,
so the existing Prometheus scrape configuration cannot currently populate the
critical W2-04 panels.

## Dashboard 1 — Release and Acceptance Readiness

Layout, top to bottom:

1. immutable candidate identity: source SHA, image/config/contract/migration
   digests, evidence-manifest hash;
2. manager demo guard and isolated `linercore-wave-a` project identity;
3. static gate state, current-image build state, coverage, dependency advisory,
   W2-02 synchronization, Playwright/a11y, performance, and exit-audit state;
4. latest acceptance run duration and cleanup result;
5. W1 status shown separately as `BLOCKED_WAIVED`.

All release panels are evidence-manifest inputs, not inferred from container
uptime. Missing or stale values render `UNKNOWN/BLOCKED`, never green.

## Dashboard 2 — CMM Journey and Capture

Required panels:

| Panel | Signal |
|---|---|
| Journey intake | confirmed Booking events accepted/rejected by safe reason |
| Journey lookup | list/detail/booking-reference traffic, errors, p95/max |
| Capture outcomes | accepted, duplicate, wrong-next, validation, denied, dependency unavailable |
| Lifecycle correctness | current state and required-next distribution |
| CMM outbox | pending/retryable/permanent depth, oldest age, attempts |
| Publication | event rate, failure rate, Kafka partition/offset evidence |
| Dependency health | Identity and Reference Data latency/timeouts/outcomes |
| API/UI convergence | independent freshness checks and 30-second result |

Metric labels must remain low cardinality: service, operation, outcome, safe
error code, dependency, and environment. Journey, booking, container, request,
event, correlation, actor, partition, and offset identifiers belong in
logs/traces/evidence, not metric labels.

## Dashboard 3 — Booking Projection and Consumer

Required panels:

- receipt dispositions: PROCESSING, RETRYABLE, APPLIED, STALE, REJECTED;
- duplicate-delivery evidence count without mutation of the original receipt;
- consumer health and oldest retry age;
- conditional claim/completion fence failures;
- latest-per-container projection update rate and freshness;
- CMM-published to Booking-applied and UI-visible convergence;
- ten-delivery fixture totals: nine immutable receipts, separate duplicate
  evidence, APPLIED=2, STALE=5, REJECTED=2.

## Dashboard 4 — Authorization and Degradation

Required panels:

- read and capture authorization outcomes by safe decision;
- Identity and Reference Data latency, timeout, and unavailable outcomes;
- denial audit count versus protected/business write deltas;
- last-known response and `dataUpdatedAt` freshness;
- Retry convergence for API and focused UI;
- unauthorized-write regression count, which must remain zero.

No protected identifier or sensitive subject value is placed on a dashboard.

## Activation Conditions

Before these dashboards can be called live:

1. current Booking/CMM images must expose Prometheus metrics;
2. the metrics must implement the low-cardinality contracts above;
3. Prometheus and Grafana must be running in the intended isolated profile;
4. every query must return either valid data or an explicit no-data state;
5. the descriptor smoke matcher must accept the valid
   `["observability", "full"]` profile form;
6. a current-image acceptance run must attach dashboard screenshots/query
   evidence to the immutable release manifest.

