# Operations & Observability Surface Contract

## Boundary

W4-02 uses the mandated operational tools: Grafana for metrics/dashboards, Jaeger
for traces, ELK for logs, and version-controlled alert/runbook artifacts. These
are operational surfaces, not a fifth LinerCore business module. Do not recreate
them in the authenticated product shell.

## Operator journeys

1. Search a correlation id, inspect the complete UI→Booking→Charge→Kafka→CMM→
   Booking trace, and pivot to matching logs.
2. Detect outbox or consumer lag, identify the affected service/topic and oldest
   age, open the alert/runbook, recover, and observe the metric return to normal.
3. Observe Kafka failure as retryable outbox behavior without interpreting it as
   successful publication or lost data.

## Dashboard inventory

| Surface | Required content |
|---|---|
| Platform overview | Service availability, active alerts, request error/latency summary, outbox/consumer-lag summary, evidence freshness |
| Service & HTTP | Request rate, error rate, p50/p95/p99 latency, saturation/resource context, dependency failures |
| Eventing | Outbox pending/oldest age/publish failures, consumer lag, consume failures/retries, dedupe counts, last successful flow |
| Alert detail | Condition, threshold, current value/unit, duration, affected service/topic, first/last firing, runbook link |
| Trace/log flow | Correlation search, span chronology including async hops, error/attribute summary, exact log pivot |

Use line charts for trends, compact stat panels for current state, and tables for
alerts/top offenders. Every panel defines unit, time window, threshold, source,
legend, and no-data/stale meaning. Do not use animated streaming charts, flashing
pulses, decorative gauges, 3D charts, or unexplained red/green tiles.

## State and evidence contract

Design loading, no-data, telemetry-stale, partial-service, query-error,
permission-denied, alert-pending, firing, acknowledged if supported, recovering,
and resolved states. No-data is distinct from zero. A green state is not valid
without a recent timestamp/source. Failed CMM-consumer and Kafka drills retain
before/during/after screenshots or exported panel evidence plus runbook steps.

## Accessibility and usability

- Text/icons accompany semantic color; contrast meets WCAG AA where tool theming
  allows, and legends never depend on hue alone.
- Charts have descriptive titles, units, legends, thresholds, and tabular/export
  alternatives. Lines use distinguishable patterns when multiple series overlap.
- Keyboard navigation reaches filters, time range, panels, trace spans, log pivots,
  alert details, and runbook links in logical order.
- Avoid rapid auto-refresh or preserve an operator-controlled refresh interval;
  respect reduced-motion and never flash alert state.

## Skill decision record

Adopt accessible line charts for time trends, explicit status text/icons,
contrast, keyboard access, and announced errors. Reject the skill's alternative
colors, animated streaming presentation, new in-product chart libraries, and
forecasting because the intent uses existing operational tools and observed data.
