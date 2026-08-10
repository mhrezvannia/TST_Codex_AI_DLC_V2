# W2-04 Alarm Definitions

## Status and Upstream Trace

These alarms translate `performance-design`, `security-design`,
`reliability-design`, `monitoring-design`, and `infrastructure-services` into
bounded local/on-prem operational signals.

**Status: DEFINED, NOT ROUTED.** No production environment, on-call rotation,
SNS topic, paging integration, or validated metric stream exists. The rules
below block acceptance or create review work; they do not claim active paging.

## Severity Model

| Severity | Local/acceptance action |
|---|---|
| P1 | Stop the acceptance run, preserve evidence, prohibit promotion |
| P2 | Mark run failed, notify release reviewer/platform owner, open remediation |
| P3 | Record a ticket or evidence gap before the next candidate |

No named person, response-time contract, or external notification channel is
invented.

## Blocking Alarm Matrix

| Alarm | Condition | Evaluation | Severity | Owner/action |
|---|---|---|---|---|
| Manager guard failed | Any pre/post `demo:guard` failure | Immediate | P1 | Stop; protect port 8088; platform owner |
| Wrong target | Compose project is not exactly `linercore-wave-a` for acceptance | Immediate | P1 | Stop without mutation |
| Unauthorized write | DENY/outage case changes any prohibited business row | Any occurrence | P1 | Stop; security/service owner |
| Evidence integrity | Manifest hash missing/mismatched or image is fallback/mutable | Immediate | P1 | Stop promotion |
| Permanent outbox failure | Permanent CMM publication failure count > 0 | 1 datapoint | P2 | Inspect schema/payload by correlation |
| Retry age exceeded | Oldest due retry remains unresolved for > 30 seconds in acceptance | 3 checks at 500 ms cadence after bound | P2 | Inspect relay/consumer fence |
| Consumer degraded | Booking health remains RETRYABLE/degraded beyond 30 seconds | At bound | P2 | Inspect receipt and dependency |
| Projection convergence | Published CMM event not APPLIED and UI-visible within 30 seconds | At bound | P2 | Preserve DB/UI observations |
| Dependency unavailable | Identity or Reference Data timeout/unavailable rate is non-zero in a normal-path fixture | Per fixture | P2 | Fail closed; preserve safe logs |
| Fresh Retry failed | API/UI does not converge within 30 seconds after observed dependency readiness | At bound | P2 | Preserve separate API/UI timings |
| Typed conflict regression | Duplicate/wrong-next loses HTTP 409 safe envelope or mutates accepted state | Any occurrence | P1 | Stop; service owner |
| Performance threshold | Accepted API p95 > 2 s or max > 5 s in approved population | End of population | P2 | Fail acceptance |
| Observability target down | Prometheus/Grafana/collector/trace store required for run is unavailable | 3 of 5 checks | P2 | Do not claim telemetry evidence |
| No-data | Required metric/query returns no series during an exercised fixture | End of fixture | P2 | Instrument before promotion |
| Descriptor drift | Compose/config/dashboard smoke fails | Per candidate | P3 unless runtime evidence is required, then P2 | Fix deterministic validation |

## Noise and Cardinality Controls

- Alert on user-visible or evidence-visible symptoms, not raw CPU alone.
- Group by environment, service, operation, outcome, dependency, and safe code.
- Never page or group by journey, container, booking, event, request,
  correlation, actor, partition, or offset.
- Deterministic product/security failures are not retried as environmental
  failures.
- A metric absence is distinct from a healthy zero.

## Routing and Escalation

Until a real team route is approved, alarm output is limited to the serialized
CI job summary, retained evidence bundle, and release-review decision. Future
non-local routing must name the primary/secondary owner, escalation timer,
incident channel, and runbook; production activation remains blocked.

