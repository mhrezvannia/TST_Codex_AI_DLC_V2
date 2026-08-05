# W2-03 Escalation Matrix

## Status and upstream basis

Status: **ROLE MATRIX DEFINED; CONTACTS AND CHANNELS UNASSIGNED**.

The matrix consumes `dashboards`, `alarms`, `reliability-design`,
`security-design`, and `deployment-architecture`. It intentionally names
roles, not people. No on-call schedule, phone number, chat channel, SNS topic,
AWS Incident Manager contact plan, or delivery success is claimed.

## Severity escalation

| Severity | Initial owner | Acknowledge target | Escalate if unowned/uncontained | Required roles | Update cadence |
|---|---|---:|---:|---|---:|
| P1 | release reviewer | 15 min | immediately to incident commander; secondary at 10 min if primary unreachable | incident commander, technical, security or data specialist, communications, scribe | 15 min |
| P2 | technical responder | 30 min | incident commander at 30 min; release reviewer before recovery mutation | technical, release reviewer, specialist as needed, scribe | 30 min |
| P3 | technical responder | next business day or same acceptance run | release reviewer if trend becomes a gate breach | technical, scribe | acceptance report |

These clocks are design targets. With contacts unassigned, escalation delivery
is `BLOCKED`, not PASS.

## Failure-domain escalation

| Trigger | Primary specialist | Mandatory escalation | Authority boundary |
|---|---|---|---|
| manager port 8088/project/network/volume drift | release reviewer | incident commander plus manager owner | W2-03 may inspect and stop its own run; it may not repair manager resources |
| auth bypass, assertion failure, secret or prohibited-data exposure | security responder | incident commander plus credential/data owner | fail closed; rotation requires owner approval |
| receipt, snapshot, activity, version, manual-case, replay, or hash integrity | data/recovery specialist | incident commander plus Charge/Booking owner | preserve evidence; no reset/down migration |
| Flyway/catalog/schema mismatch | data/recovery specialist | release reviewer plus migration owner | forward repair or verified isolated restore only |
| readiness/startup failure | technical responder | release reviewer at 120 s; incident commander if mutation risk | wrapper-scoped inspection/restart only |
| latency, pool, lock, deadlock, leak, or resource drift | technical responder | data specialist for DB symptoms; release reviewer before rerun | no capacity change without evidence |
| Identity/Reference/Charge dependency outage | technical responder | owning service role if fault persists | retain typed failure meaning; no guessed/stale commercial result |
| evidence-writer, ledger, trace, or redaction failure | release reviewer | security responder for disclosure; incident commander for required-cell loss | unsafe evidence discarded; required cell BLOCKED |
| broker/registry relay degradation | technical responder | Charge owner if recovery exceeds approved bound | command authority remains separate from relay health |

## Decision authority

| Decision | Required approval |
|---|---|
| stop acceptance | any responder; release reviewer records it |
| declare or change P1/P2 severity | incident commander |
| restart a Wave A service | incident commander plus release reviewer |
| apply forward repair/migration | migration owner plus data/recovery specialist plus release reviewer |
| restore Charge/Booking data | incident commander plus data/recovery specialist plus release reviewer |
| rotate a secret/credential | security responder plus credential owner |
| clean isolated databases, volumes, or run roots | release reviewer after identity/retention guards |
| resume acceptance | incident commander plus release reviewer |
| external communication | authorized communications/business owner, not assigned here |

## Contact registry

Must be filled before activation:

| Role | Primary | Secondary | Availability/time zone | Contact path | Verified |
|---|---|---|---|---|---|
| Incident commander | TBD | TBD | TBD | TBD | NO |
| Technical responder | TBD | TBD | TBD | TBD | NO |
| Release reviewer | TBD | TBD | TBD | TBD | NO |
| Data/recovery specialist | TBD | TBD | TBD | TBD | NO |
| Security responder | TBD | TBD | TBD | TBD | NO |
| Communications lead | TBD | TBD | TBD | TBD | NO |
| Manager-demo owner | TBD | TBD | TBD | TBD | NO |

## Handoff checklist

Every handoff includes:

- incident ID, severity, current status, and next update time;
- safe trigger/gate IDs and affected journeys;
- exact mutations already attempted;
- manager/sibling preservation state;
- database/catalog/backup/restore identities and hashes;
- unsafe evidence disposition;
- open decisions, owners, and deadlines.

Current activation result: **BLOCKED - CONTACTS AND CHANNEL UNASSIGNED**.

