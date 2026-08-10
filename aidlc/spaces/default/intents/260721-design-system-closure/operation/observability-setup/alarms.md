# Alarms and Stop Conditions — W2-02 Design-System Closure

## Inputs

Alarm design follows `booking-design-system-closure/nfr-design/performance-design.md`, `security-design.md`, `reliability-design.md`, `booking-design-system-closure/infrastructure-design/monitoring-design.md`, and `infrastructure-services.md`.

## Executable local stop conditions

No paging platform is configured. The following direct gates act as severity-one release stop conditions for a W2-02 run:

| Condition | Threshold | Action |
|---|---|---|
| Manager target mismatch or guard failure | Any occurrence | Do not mutate Wave A |
| Pre-existing Wave A resource | Any resource | Reject ownership |
| Required service unhealthy/unready | Any required service | Fail deployment |
| Booking BFF request exceeds existing abort | 2,500 ms | Safe error and failed applicable case |
| Unexpected browser error/rejection/timeout | More than 0 | Fail case/run |
| Duplicate action call | More than 1 pending command/network call | Fail case/run |
| Serious/critical accessibility finding | More than 0 | Fail case/run |
| Page-level overflow/clipped primary action | Any required viewport | Fail case/run |
| Secret-bearing durable evidence | Any forbidden value | Delete staged raw trace and fail run |
| Cleanup or manager post-guard failure | Any occurrence | Prevent terminal completion |
| Audit process failure | Non-zero direct exit | Prevent terminal completion |

These conditions are synchronous release gates, not asynchronously routed alarms.

## Shared profile findings

The optional manager profile currently has conditions that would merit operational warning if alert routing existed:

- every configured Prometheus application target is down;
- Elasticsearch is OOM-killed with exit 137;
- Kibana cannot provide a timely status response.

No SNS, email, chat, PagerDuty, on-call, or escalation destination is configured, so no notification-delivery PASS is claimed.

## Severity and ownership

- W2-02 lifecycle/secret/manager-safety failures: closure-blocking.
- Optional shared metrics/logging failures: program observability backlog; non-blocking for the already-proven W2-02 acceptance contract.
- Production user-impact alarms: not defined because there is no production target.
