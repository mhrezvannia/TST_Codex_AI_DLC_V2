# Anomaly Detection Configuration — W2-02 Design-System Closure

## Inputs

This decision follows `booking-design-system-closure/nfr-design/performance-design.md`, `security-design.md`, `reliability-design.md`, `booking-design-system-closure/infrastructure-design/monitoring-design.md`, and `infrastructure-services.md`.

## Configuration status

No statistical anomaly detector, dynamic threshold, seasonality model, CloudWatch anomaly band, machine-learning job, or automated capacity forecast is configured. W2-02 supplies one deterministic local acceptance sample, which is insufficient training data.

## Deterministic substitutes

The closure uses exact invariants instead:

- BFF abort remains 2,500 ms;
- list/DOM bound remains 25 rows;
- pending command/network-call count remains one;
- unexpected browser errors/timeouts remain zero;
- required viewports must have zero page-level overflow;
- manager/Wave A project identity must match exactly;
- all required case/gate/audit outcomes must be PASS.

These are contract thresholds, not anomaly models.

## Observed operational anomalies

Current shared-profile observations requiring program follow-up:

- all configured Prometheus application targets are down;
- Elasticsearch exceeded its available memory boundary and was OOM-killed;
- Kibana is running without a responsive Elasticsearch dependency.

These are direct failures, not inferred anomalies. No model is needed to classify them.

## Future prerequisites

Anomaly detection requires healthy continuous telemetry, a defined environment, retention, representative load history, known deployment markers, accountable owners and false-positive handling. None is available within W2-02, so anomaly automation remains outside scope.
