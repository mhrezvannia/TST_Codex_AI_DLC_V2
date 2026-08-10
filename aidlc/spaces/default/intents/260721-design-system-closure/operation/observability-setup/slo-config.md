# SLO and SLI Configuration — W2-02 Design-System Closure

## Inputs

This configuration respects `booking-design-system-closure/nfr-design/performance-design.md`, `security-design.md`, `reliability-design.md`, `booking-design-system-closure/infrastructure-design/monitoring-design.md`, and `infrastructure-services.md`.

## Production SLO status

No production SLO, SLA, error budget, burn-rate window, RTO, or RPO is configured. `reliability-design.md` explicitly excludes those claims, and W2-02 has no production traffic or time-series history from which to derive them.

Inventing a percentage or time window would be unsupported. Production SLO definition remains pending a future intent with business expectations, telemetry reliability, and accountable operational ownership.

## Per-run acceptance indicators

The following are exact release indicators, not SLOs:

| Indicator | Required value | Formal run 36 |
|---|---|---|
| Browser cases | 100% of 98 required cases pass | 98/98 PASS |
| Unexpected browser failures | 0 | 0 |
| Skipped/flaky cases | 0 / 0 | 0 / 0 |
| Required lifecycle gates | 100% PASS | PASS |
| Manager guard before/after | PASS / PASS | PASS / PASS |
| Serious/critical axe findings | 0 | 0 |
| Page overflow/clipping violations | 0 | 0 |
| Required trace forbidden values | 0 | 0 after sanitization |
| Audit direct failures | 0 | 0 |

## Measurement limitations

One local run cannot establish availability, latency percentiles, error-budget consumption, seasonality, traffic mix, capacity, or reliability over time. Case durations are retained as observations only.

The optional Prometheus profile currently has no healthy application scrape population, so it cannot support a meaningful availability or latency SLI at this checkpoint.

## Future SLO prerequisites

A future production scope must first provide stable metrics endpoints, validated scrape health, environment/traffic definitions, telemetry retention, ownership, alert routing, business-impact thresholds, and at least one agreed time window. Only then may quantified SLOs and burn-rate alerts be created.
