# W2-04 Incident Response Plan

## Purpose and Upstream Trace

This plan turns `dashboards` and `alarms` into a coordinated response process,
preserves atomic recovery from `reliability-design`, enforces
`security-design`, and respects the isolated portable topology in
`deployment-architecture`.

It covers local/CI acceptance incidents and preparation for a future
non-local environment. It does not claim a production incident-management
service is active.

## Activation Criteria

Open an incident when:

- manager-demo isolation or the exact acceptance target is at risk;
- unauthorized write, protected disclosure, or credential exposure is
  suspected;
- lifecycle, typed conflict, outbox, consumer, or projection integrity fails;
- a dependency outage produces fail-open or prohibited writes;
- migration/data integrity or rollback compatibility is uncertain;
- the immutable release/evidence identity is missing or mismatched;
- a required telemetry source is unavailable during acceptance;
- an accepted performance/recovery bound is exceeded.

## Roles

| Role | Responsibility |
|---|---|
| Incident Commander | Coordinates, classifies, delegates, sets update cadence, declares resolution |
| Release reviewer | Freezes promotion, preserves manifest/evidence, controls retry decision |
| CMM owner | Journey, movement, rejection, audit, outbox diagnosis |
| Booking owner | Receipt, duplicate evidence, consumer health, projection diagnosis |
| Platform owner | Compose target, manager demo, Kafka, Schema Registry, PostgreSQL, Identity, Reference Data |
| Security owner | Authorization, disclosure, secret rotation, containment approval |
| Communications owner | Internal status and, only if applicable, stakeholder updates |

No named individual or staffed rotation is approved. Before production, every
role requires a primary, secondary, contact channel, and handoff schedule.

## Response Lifecycle

### 1. Detect and declare

Record timestamp, reporter, affected target, candidate identity, safe symptoms,
and the triggering alarm/test. Create a dedicated incident record and assign an
Incident Commander.

### 2. Classify and contain

Select severity from `escalation-matrix.md`. Stop promotion. Protect manager
port 8088 and preserve volumes, topics, offsets, outbox/receipts, databases,
credentials, and evidence. Security/data-integrity uncertainty defaults to the
higher severity.

### 3. Diagnose

Use correlation across CMM, dependencies, Kafka, Booking, and UI when available.
Because current observability is not activated, absence of telemetry is itself
a finding. Do not substitute container uptime for business correctness.

### 4. Mitigate and recover

Choose one reviewed runbook. Prefer configuration correction or an immutable
application rollback only when schema compatibility is proven. Do not perform
automatic down migrations, volume resets, offset purges, or direct projection
rewrites.

### 5. Validate

Rerun the exact safe checks that failed plus manager guard, immutable manifest,
contracts, lifecycle, typed conflicts, authorization/write sets, event path,
UI, performance, telemetry, audits, and cleanup as applicable.

### 6. Close and learn

Record impact, timeline, cause, contributing controls, recovery evidence, and
assigned actions. SEV1/SEV2 events require a blameless review before promotion.
An independently self-recovered component still receives a cause/evidence
review.

## Communication Format

Internal update:

```text
Status: investigating | identified | mitigating | monitoring | resolved
Severity: SEV1 | SEV2 | SEV3 | SEV4
Impact: affected target and user/business path; no speculation
Evidence: safe candidate/correlation identifiers and verified observations
Action: current containment or runbook step
Next update: timestamp
```

Proposed cadence is every 15 minutes for SEV1 and every 30 minutes for SEV2
during an active response. This is a process target, not an SLA, until staffing
and channels are approved. External communication is not defined for this
internal acceptance slice.

## Evidence Checklist

- committed source SHA, image/config/contract/migration digests;
- exact Compose project, container/network/volume identity;
- pre/post manager guard;
- safe logs/metrics/traces and correlation continuity;
- Flyway history and database health;
- CMM journey/movement/rejection/audit/outbox hashes;
- Kafka topic/partition/offset metadata;
- Booking receipt/duplicate/health/projection hashes;
- UI/Playwright trace and screenshot identity;
- exit-audit and evidence-manifest detector output;
- decision, approver role, timestamps, and recovery result.

Secret values and raw payloads are never attached.

## RTO, RPO, Backup, and Disaster Recovery

No production RTO or RPO is approved. The 30-second event/retry bound is an
acceptance objective, not a disaster-recovery commitment. Local Compose
volumes provide committed-state persistence only while the host/volumes remain;
they do not prove backup or disaster recovery.

No AWS Backup or equivalent validated restore configuration exists. A later
production scope must define data classification, backup schedule, retention,
off-host protection, restore test, RTO/RPO, ownership, and evidence before
claiming recoverability.

## Exercise Status

No destructive chaos or failover exercise was run because no deployed
candidate, active telemetry plane, or approved recovery target exists. The
observed manager edge interruption and later independent recovery provide a
real detection/recording example, but not a completed recovery drill.

