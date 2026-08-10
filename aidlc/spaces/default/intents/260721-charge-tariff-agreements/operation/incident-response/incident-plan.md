# W2-03 Incident Response Plan

## Status and upstream basis

Status: **PLAN DEFINED; NOT ACTIVATED; RESPONDERS UNASSIGNED**.

This plan consumes the approved `dashboards` and `alarms` plus every Unit's
`reliability-design`, `security-design`, and `deployment-architecture`.
Because Deployment Execution produced no candidate, the plan applies only to
guarded `linercore-wave-a` acceptance. It does not claim production incident
management, a paging service, AWS Incident Manager, SSM Automation, AWS
Backup, named staff, or customer communications.

## Scope and objectives

In scope:

- detect and stop unsafe isolated acceptance activity;
- protect the manager demo on port 8088 and sibling Wave A resources;
- preserve redacted, hash-verifiable evidence;
- contain authorization, integrity, migration, dependency, performance, and
  evidence-writer failures;
- recover through approved restart, forward repair, or isolated verified
  restore;
- prove the system is safe before resuming acceptance.

Out of scope:

- production availability commitments or customer-facing incident handling;
- unapproved cloud, multi-region, replication, failover, or backup services;
- destructive database reset, down migration, unscoped Compose teardown, or
  manager-stack mutation;
- manual pricing assignment/approval/closure workflow beyond persisted OPEN
  evidence.

## Severity model

| Severity | Declaration criteria | Immediate response | Coordination target |
|---|---|---|---|
| P1 | manager drift, auth bypass, secret/prohibited-data disclosure, durable integrity failure, or required semantic gate corruption | stop mutation, preserve evidence, appoint incident commander | acknowledge within 15 minutes; update every 15 minutes |
| P2 | required journey/readiness/latency/restore failure with containment intact | stop promotion, preserve evidence, appoint technical lead | acknowledge within 30 minutes; update every 30 minutes |
| P3 | early-warning latency/resource drift or non-blocking diagnostic gap | annotate evidence and assign investigation | review during the run or next business day |

The targets become enforceable only after real responders and a coordination
channel are assigned. Until then, an event is still classified and recorded,
but notification delivery is `UNPROVEN`.

## Roles

| Role | Responsibility | Assignment |
|---|---|---|
| Incident commander | owns severity, coordination, decisions, cadence, and closure | UNASSIGNED |
| Technical responder | diagnoses application, dependency, runtime, and telemetry evidence | UNASSIGNED |
| Release reviewer | stops/resumes acceptance and protects the evidence gate | UNASSIGNED |
| Data/recovery specialist | owns service-database integrity, backup, restore, and forward repair | UNASSIGNED |
| Security responder | owns bypass, secret exposure, redaction, rotation, and disclosure assessment | UNASSIGNED |
| Communications lead | publishes internal updates and records decisions | UNASSIGNED |
| Scribe | maintains timeline, commands, evidence hashes, and action items | UNASSIGNED |

One person may hold multiple roles in a local exercise, but the incident
commander should not be the sole technical executor for P1/P2.

## Response lifecycle

### 1. Detect and declare

1. Capture the triggering alarm/gate ID, run ID, time, affected journey, and
   safe correlation.
2. Classify P1/P2/P3 from `alarms`.
3. Create an incident record and assign incident commander, technical
   responder, release reviewer, and scribe.
4. Stop the acceptance driver for every P1 and for any P2 that could compound
   writes or evidence loss.

### 2. Contain

1. Run the common safety checks in `runbooks` RB-00.
2. Do not mutate manager port 8088, its Compose project, network, images,
   volumes, or databases.
3. Stop new Wave A mutations through the wrapper-owned control plane.
4. Preserve current logs, metrics, traces, process/container state, catalog,
   counts, hashes, and manager fingerprints.
5. If telemetry contains unsafe content, quarantine and discard unsafe copies;
   never repeat the secret/value in the incident record.

### 3. Diagnose

Use the approved dashboard and query map:

- release/journey dashboard for scope and terminal meaning;
- Charge/Agreement dashboard for authorization, reference, pool, lock,
  catalog, and relay symptoms;
- Pricing/Booking dashboards for receipt, manual-case, replay, retry/circuit,
  snapshot, and history evidence;
- BFF/security dashboard for route policy, fail-closed state, permits, and
  trace linkage;
- evidence/resource dashboard for U06 ledger, restart/restore, preservation,
  and redaction.

Follow the narrowest applicable runbook. Observation does not authorize
mutation.

### 4. Recover

Recovery choices require incident-commander and release-review approval:

- stateless/service failure: wrapper-scoped graceful restart;
- bad candidate configuration: stop candidate and correct version-controlled
  configuration before a fresh guarded attempt;
- post-migration incompatibility: forward repair; never edit/down an applied
  migration;
- durable-data concern: restore only to generated isolated Charge and Booking
  targets with source/target/OID/owner guards;
- secret exposure: rotate through the owning configuration boundary, then
  invalidate evidence containing the exposed material.

### 5. Validate and resume

Do not resume until:

1. manager and sibling before/after probes are equal;
2. required service readiness plus authenticated semantic probe succeeds;
3. catalog/Flyway/count/hash and receipt/snapshot/manual-case invariants pass;
4. the triggering condition is absent under a controlled reproduction;
5. redaction and evidence-ledger validation pass;
6. incident commander and release reviewer record the resume decision.

### 6. Close and learn

Record detected time, declaration, containment, recovery, validation, and
closure. P1/P2 requires a blameless review covering timeline, impact, root
cause, contributing controls, what worked, gaps, and assigned actions. Do not
close an incident merely because the process restarted.

## Communications

Internal update template:

```text
Incident: <safe id>
Severity: P1 | P2 | P3
Status: investigating | contained | recovering | monitoring | resolved
Impact: <affected W2-03 journey and evidence state>
Current evidence: <safe dashboard/gate references>
Action: <what is being done>
Decision needed: <owner and deadline, if any>
Next update: <UTC time>
```

P1 updates every 15 minutes; P2 every 30 minutes; P3 in the acceptance report.
No external status page or customer statement is authorized by this plan.

## Recovery objective boundary

- Service restart/readiness plus authenticated semantic probe: <=120 seconds.
- Aggregate guarded Wave A startup: <=10 minutes.
- Committed Charge and Booking data inside existing isolated volumes: local
  RPO 0, proved by canonical count/hash equality and exact replay.
- Host/volume destruction, production RTO/RPO, geographic recovery, and
  contractual availability: **UNAPPROVED**.

## Activation checklist

This plan cannot be marked operational until:

- primary/secondary responders and availability are assigned;
- an internal incident channel and notification path are tested;
- each P1/P2 alarm links to a rehearsed runbook;
- a deployable candidate exposes the required safe telemetry;
- restart, forward-repair, isolated restore, secret-rotation, and preservation
  exercises pass without touching manager resources;
- retention, access, and post-incident ownership are approved.

Current exercise result: **NOT RUN - NO DEPLOYED CANDIDATE**.

