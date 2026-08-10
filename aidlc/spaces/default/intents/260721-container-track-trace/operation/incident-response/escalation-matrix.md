# W2-04 Incident Escalation Matrix

## Scope and Upstream Trace

Severity uses evidence from `dashboards` and `alarms`, the state-safety rules in
`reliability-design`, the trust boundaries in `security-design`, and the
ownership/isolation model in `deployment-architecture`.

This matrix assigns roles, not people. A staffed production on-call rotation
does not exist and remains a readiness gap.

## Severity Definitions

| Severity | W2-04 criteria | Immediate action |
|---|---|---|
| SEV1 Critical | Manager/shared target mutation; unauthorized business write; sensitive-data/credential exposure; data corruption; evidence tampering; destructive command | Stop all promotion/acceptance, contain, assign IC, security/platform escalation |
| SEV2 Major | End-to-end path unavailable; permanent outbox/schema failure; event/projection/recovery exceeds bound; migration incompatibility; critical observability blind spot during release evidence | Stop candidate, preserve state, service/platform escalation |
| SEV3 Minor | Recoverable dependency degradation; non-critical telemetry gap; manager interruption that self-recovers; descriptor drift that does not affect active evidence | Record, investigate before next candidate |
| SEV4 Low | Documentation, cosmetic dashboard, or non-blocking query defect with no evidence/user impact | Backlog with owner |

## Role Escalation

| Incident type | Primary role | Secondary role | Mandatory consultation |
|---|---|---|---|
| Manager/Compose/network/volume | Platform owner | Release reviewer | Incident Commander |
| CMM journey/capture/outbox | CMM owner | Platform owner | Booking owner when event published |
| Booking receipt/consumer/projection | Booking owner | Platform owner | CMM owner |
| Identity/Reference Data | Platform owner | CMM owner | Security owner for authorization impact |
| Authorization/disclosure/secret | Security owner | CMM or Booking owner | Incident Commander + release reviewer |
| Migration/data integrity | Owning service | Platform owner | Tech lead role |
| Evidence/release identity | Release reviewer | Platform owner | Security owner on tampering |
| Observability blind spot | Operations role | Owning service | Release reviewer |

## Coordination Targets

| Severity | Declaration | Internal update | Review requirement |
|---|---|---|---|
| SEV1 | Immediate after verified/suspected critical condition | Every 15 minutes | Blameless review before promotion |
| SEV2 | As soon as user/evidence impact is confirmed | Every 30 minutes | Review before retry/promotion |
| SEV3 | During the active acceptance session or next business review | At material state change | Ticket with owner/evidence |
| SEV4 | Backlog intake | None unless scope changes | Normal prioritization |

These are coordination objectives, not contractual response SLAs.

## On-Call Readiness Gap

Production activation requires:

- named primary and secondary rotations with weekly handoff;
- verified contact and incident channels;
- escalation timeout and management/product communication ownership;
- access to environments, telemetry, secrets, and recovery tools;
- runbook training and non-production exercises;
- coverage when the primary is unavailable.

Until then, CI/release-review incidents stop the candidate and require explicit
role assignment before diagnosis continues.

## Escalation Stop Conditions

Do not downgrade or close until:

- the affected state and blast radius are known;
- secrets/data/evidence are contained;
- the exact target and release identity are verified;
- recovery validation passes or the candidate remains quarantined;
- follow-up actions have owners and evidence requirements;
- W1 `BLOCKED_WAIVED` and other holds remain truthfully classified.

