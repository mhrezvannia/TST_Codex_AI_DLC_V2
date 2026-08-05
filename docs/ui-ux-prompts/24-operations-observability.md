$ui-ux-pro-max

Act as a principal operations UX designer with deep experience in distributed
systems observability, Kafka/outbox reliability, incident response, Grafana,
Jaeger, ELK, alerting, and accessible data-dense operational dashboards. This
is an AI-DLC Inception design task for LinerCore W4-02.
Do not edit production code in this turn, including infrastructure or telemetry
configuration.

Inspect `docs/intents/W4-02-operations-observability.md` and its complete Context
Pack, current Compose and telemetry descriptors, service metrics/logging/tracing,
event contracts, existing dashboards/alerts/runbooks, and the running local
stack. Use the output approved from `00-shared-design-system.md` only for shared
semantics; respect the native interaction patterns of Grafana, Jaeger, and ELK.

Design operator workflows in the mandated operational tools. Do not build a
duplicate observability application inside the LinerCore business shell and do
not introduce an in-product chart library. Use one correlation id as the pivot
across UI, Booking, Charge, Kafka, CMM, traces, metrics, and logs.

Create these surfaces:

1. Platform overview: service availability, active alerts, request latency/error
   summary, eventing health, and evidence freshness.
2. Service and HTTP dashboard: request rate, errors, p50/p95/p99 latency,
   saturation/resource context, and dependency failures.
3. Eventing dashboard: outbox pending and oldest age, publish failures, consumer
   lag, consume failures/retries, dedupe counts, and last successful flow.
4. Trace-to-log flow: correlation search, sync and async span chronology,
   failure attributes, and an exact matching-log pivot.
5. Alert detail and runbook flow: condition, threshold, value/unit, duration,
   affected service/topic, first/last firing, recovery owner, and runbook link.

Use line charts for time-series trends, compact stat panels only for current
state, and tables for alerts and top offenders. Every panel must define title,
unit, time range, threshold, source, legend, freshness, and no-data meaning.
No-data is not zero, and green is not trustworthy without a recent timestamp.
Reject decorative KPI cards, gauges without operational meaning, 3D charts,
forecasting, animated streaming, flashing/pulsing alerts, marketing composition,
and generated replacement palettes.

Design loading, no data, telemetry stale, partial service, query error,
permission denied, alert pending, firing, acknowledged where supported,
recovering, and resolved states. The failure-drill evidence plan must cover a
forced CMM-consumer failure and Kafka unavailability with before/during/after
observations, correlation traces/logs, alert behavior, runbook execution, and
verified recovery.

Meet WCAG 2.2 AA within each tool's theming capabilities. Text/icons must
accompany semantic color. Charts need descriptive titles, units, legends,
thresholds, distinguishable lines, and tabular/export alternatives. Define
logical keyboard access through filters, time range, panels, spans, log pivots,
alerts, and runbooks. Avoid rapid automatic refresh and respect reduced motion.

Produce:

1. Operator roles, incident tasks, and observability information hierarchy.
2. Platform, HTTP/service, and eventing dashboard wireframes and panel inventory.
3. Metric names/units/sources/threshold assumptions requiring engineering review.
4. Correlation trace-to-log navigation specification.
5. Alert-to-runbook triage and recovery flow.
6. No-data, stale, partial, error, alert, and recovery state matrix.
7. Accessibility and native-tool configuration requirements.
8. Live Compose failure-drill evidence and acceptance plan.
9. Open telemetry/ownership questions before Infrastructure Design.

Do not implement until the W4-02 requirements, stories, and design are approved.
Revalidate the approved design against live Grafana, Jaeger, and ELK data during
Operation Observability Setup.
