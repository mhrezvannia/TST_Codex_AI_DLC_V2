# SLO Compliance Report - W2-01 App Shell and Auth

## Inputs And Reporting Boundary

This report consumes `dashboards`, `alarms`, `slo-config`, `deployment-log`, `load-test-results`, and `incident-plan`. It reports the local proof window only. The `dashboards` and `alarms` application signals are not live, so no production availability percentage, latency percentile, incident rate, or error-budget burn is inferred.

## Local Proof Compliance

| SLI / SLO | Target | Observed | Status |
| --- | --- | --- | --- |
| Live acceptance correctness | Four of four required scenarios PASS | Allow lifecycle, deny, sign-out/stale call, and compatibility all PASS | PASS |
| Final decision integrity | PASS only when every scenario and command passes | Runtime PASS; detector 6d and both audits PASS; strict validator PASS | PASS |
| Hardcoded auth | Zero `local-user` hits | Detector 6d PASS and real OIDC actors recorded | PASS |
| Evidence secrecy | Zero raw token, secret, cookie, or `lc_session` leaks | Redaction and evidence checks PASS | PASS |
| Existing local latency gates | Every defined p95 within its per-unit limit | Ten of ten measured journeys PASS; worst gated p95 669.90 ms against 3000 ms | PASS |
| W1 waiver integrity | W1 remains BLOCKED unless its own live evidence passes | Waiver remains BLOCKED at compose-start and is not reused as W2 proof | PASS |

No P1/P2 W2 incident was declared during the proof window. The `incident-plan` is readiness evidence, not an incident-frequency data source.

## Production SLO Status

| Future SLO from `slo-config` | Target | Measurement status | Compliance |
| --- | --- | --- | --- |
| Shell route availability | 99.9% over 30 days | Application metrics unavailable | NOT MEASURABLE |
| Interactive route latency | 95% under 3 seconds over 30 days | Local ten-run timings only | NOT MEASURABLE |
| Sign-out correctness | 99.9% over 30 days | No production request series | NOT MEASURABLE |
| Authorization correctness | 100% fail closed over 30 days | No production decision series | NOT MEASURABLE |

The configured 99.9% monthly error budget is 43 minutes 12 seconds. Actual remaining budget and burn rate are unknown. The fast-burn and slow-burn rules in `alarms` cannot evaluate until application metrics are ingested.

## Evidence Assessment

The `deployment-log` proves a healthy local application and observability base stack. The `load-test-results` prove only warm sequential local timing and semantic correctness. Neither provides the time-series denominator required for production SLO compliance.

## Recommendation

Keep local proof gates as release evidence. Before production adoption, instrument application metrics/traces/logs, activate the W2 `dashboards` and `alarms`, validate signal quality, then start the 30-day SLO window. Do not backfill a production PASS from local evidence.
