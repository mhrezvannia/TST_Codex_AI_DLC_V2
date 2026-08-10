# Alarms - W2-01 App Shell and Auth

## Upstream Inputs

These alarms consume `performance-design`, `security-design`, `reliability-design`, `monitoring-design`, and `infrastructure-services`.

## Alarm Definitions

| Alarm | Severity | Trigger | Action |
| --- | --- | --- | --- |
| W2 final evidence blocked | P1 before merge | `manifest.finalDecision != PASS` during release proof | Stop promotion |
| `local-user` observed | P1 | Any mounted shell/Booking runtime actor evidence equals `local-user` | Stop promotion, security review |
| Auth redirect/sign-out fast burn | P2 | 14.4x burn of the 99.9% monthly SLO over 5 minutes | Investigate auth app/Keycloak |
| Shell route fast burn | P2 | 14.4x burn of the 99.9% monthly SLO over 5 minutes | Roll back or fix forward |
| Booking authorization timeout spike | P2 | More than 0.5% timeout/error outcomes over 5 minutes | Check identity-service/network |
| Audit detector unavailable | P1 before merge | `erp-fidelity-audit` or `aidlc-audit` does not exit `0` | Stop promotion |

## Routing And Escalation

Local proof blockers route to the release-review owner and stop promotion. Production page destinations and named on-call contacts are not supplied, so no SNS/contact point is fabricated; these must be bound before production deployment.

## Current Status

No alarm rule is active because application metrics are not yet ingested. The thresholds are defined below SLO exhaustion and remain required for the first production observability implementation.
