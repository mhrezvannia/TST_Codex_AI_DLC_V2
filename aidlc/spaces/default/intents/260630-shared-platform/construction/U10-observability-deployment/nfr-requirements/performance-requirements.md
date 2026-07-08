# Performance Requirements - U10 Observability Deployment

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines correlation propagation, structured logging, metrics/traces, event publication health, health/smoke, deployment readiness, and BFF observability workflows. `business-rules.md` fixes p95 read/freshness measurement, safe metric labels, publication health metrics, and smoke diagnostics. `requirements.md` fixes NFR-001, NFR-002, NFR-005, NFR-011, NFR-012, and NFR-017.

## Target Requirements

| Requirement | U10 obligation |
|---|---|
| Reference read monitoring | Metrics support validating p95 <= 300 ms for common reference reads. |
| Event freshness monitoring | Metrics measure p95 <= 60 seconds from successful commit to consumer-observable Kafka event. |
| Observability overhead | Logging/tracing/metrics must not require unbounded payload serialization or high-cardinality metric labels. |
| Smoke timing | Health and smoke checks emit duration and failure boundary. |
| Dashboard performance | Grafana/ELK/Jaeger views use bounded safe labels and indexed fields. |

## Measurement Requirements

- Emit latency, error, authorization decision, outbox lag, event freshness, publication attempts, health, and smoke metrics.
- Keep correlation ids in logs/traces/status, not unbounded metric labels.
- Track telemetry export failures separately from application failures.
- Final load profile remains open; metrics must support later performance validation rather than hard-code assumptions.

## Non-Goals

- U10 does not tune business API implementation.
- U10 does not replace U04 publisher metrics.
- U10 does not build a custom dashboard app.

