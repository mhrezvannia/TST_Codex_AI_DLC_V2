# Anomaly Config - Charge Agreement Walking Skeleton

## Source Alignment

This artifact consumes `performance-design`, `security-design`, `reliability-design`, `monitoring-design`, and `infrastructure-services`.

## Anomaly Signals

| Signal | Baseline | Anomaly |
| --- | --- | --- |
| Backend smoke latency | Under 2 seconds | Any sustained result over 2 seconds |
| Frontend smoke latency | Under 2 seconds | Any sustained result over 2 seconds |
| Proxy smoke latency | Under 3 seconds | Any sustained result over 3 seconds |
| Module-info payload fields | Fixed non-sensitive metadata keys | New sensitive or customer/business fields |
| Local process ports | `8084`, `3002`, proxy port | Port collision or unexpected listener |

## Detection Method

For U01, anomaly detection is deterministic threshold comparison in local smoke evidence. Statistical anomaly detection is premature because there is no production traffic baseline.

## Escalation

An anomaly blocks walking-skeleton promotion and creates an implementation follow-up. Production anomaly detection should be added after the module has real traffic, persistence, and error-rate telemetry.

