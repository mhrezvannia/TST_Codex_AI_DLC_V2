# SLO Config - W2-01 App Shell and Auth

## Upstream Inputs

This SLO config consumes `performance-design`, `security-design`, `reliability-design`, `monitoring-design`, and `infrastructure-services`.

## Local Proof SLOs

| SLO | Target | Window | Measurement |
| --- | --- | --- | --- |
| Live acceptance correctness | 100% of four W2-01 scenarios PASS | Per proof run | `scenarios.jsonl` |
| Final decision integrity | 100% `manifest.finalDecision=PASS` only when all scenarios and commands pass | Per proof run | `manifest.json` |
| No hardcoded auth | 0 `local-user` hits in mounted shell/Booking surfaces | Per proof run | detector 6d and actor evidence |
| Evidence secrecy | 0 raw token/secret/cookie/`lc_session` leaks | Per proof run | evidence leak scan |

## Future Production SLOs

| SLO | Target | Window |
| --- | --- | --- |
| Shell route availability | 99.9% successful `/` and `/booking*` requests | 30-day rolling |
| Interactive route latency | 95% of shell/Booking routes under 3 seconds | 30-day rolling |
| Sign-out correctness | 99.9% sign-out requests clear the session and require reauth | 30-day rolling |
| Authorization correctness | 100% missing/denied actor paths fail closed | 30-day rolling |

## Error Budget Policy

For a 99.9% 30-day availability SLO, the monthly error budget is 43 minutes 12 seconds. A 14.4x five-minute fast-burn alert and a 6x one-hour slow-burn alert must fire before budget exhaustion. Exhausted budget stops feature promotion for the affected path until reliability review.

## Measurement Status

Local proof SLIs are live and all four browser scenarios PASS. Production SLO measurement is BLOCKED because Prometheus has no healthy application targets; no production compliance percentage is claimed.
