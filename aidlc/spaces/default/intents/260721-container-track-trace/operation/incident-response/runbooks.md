# W2-04 Incident Runbook Library

## Status and Upstream Trace

These runbooks use the planned `dashboards` and `alarms`, preserve the recovery
semantics in `reliability-design`, enforce the fail-closed/redaction controls in
`security-design`, and operate only within the portable Compose
`deployment-architecture`.

**Status: DESIGNED, NOT OPERATIONALLY ACTIVATED.** No production target,
staffed on-call rotation, live observability pipeline, or validated
backup/restore service exists. AWS SSM Automation, Incident Manager, and AWS
Backup are not applicable to this on-premises intent.

## Universal First Response

For every incident:

1. stop promotion and the serialized acceptance controller;
2. identify the exact Compose project, source SHA, image/config/contract/
   migration digests, and evidence-manifest hash;
3. protect the manager project and port 8088; never use an unscoped Compose
   command;
4. preserve redacted logs, metrics, traces, screenshots, audit rows, migration
   state, outbox/receipt state, consumer offsets, and correlation identifiers;
5. classify security/data-integrity risk before restarting or replaying;
6. appoint an Incident Commander and record the timeline;
7. choose a runbook below; if preconditions are not proven, remain stopped.

No runbook may delete volumes, purge topics, reset offsets, rewrite outbox or
projection state, run automatic down migrations, use cross-service SQL, or
bypass authorization.

## RB-01 — Manager Demo or Target Isolation Failure

Trigger: manager guard fails, port 8088 is changed, the acceptance project is
not exactly `linercore-wave-a`, or the controller could target shared resources.

1. Stop the acceptance job before any cleanup/deploy step.
2. Record `docker compose ls`, project labels, running containers, networks,
   volumes, and the failing guard output.
3. Confirm no command used the manager project or a shared/unscoped target.
4. If the manager was modified, escalate to platform owner as SEV1; do not
   attempt automated repair from the W2-04 worktree.
5. The manager owner restores it through the canonical integration workspace.
6. Require a passing manager guard and evidence review before any acceptance
   retry.

An independently recovered guard does not erase the incident timeline.

## RB-02 — CMM Outbox or Booking Consumer Stalled

Trigger: permanent publication failure, retry age beyond 30 seconds, consumer
degraded beyond the bound, stale fence completion, or projection convergence
failure.

1. Identify the run-scoped correlation/event ID without exposing the payload.
2. Snapshot CMM outbox status, attempt/next-at time, worker/token/version fence,
   Kafka partition/offset, Booking receipt/disposition, duplicate evidence,
   consumer health, and projection hash.
3. Determine whether failure is dependency, transport, schema, application, or
   stale-worker fencing.
4. Preserve Kafka/outbox/receipt state; do not purge, reset, or mutate evidence.
5. Correct configuration or application through a new immutable candidate.
6. Replay only the bounded authorized event after proving idempotency and
   owner approval.
7. Verify CMM PUBLISHED, Booking APPLIED, and UI-visible convergence within
   30 seconds from one controller clock.

Permanent schema incompatibility is not retryable.

## RB-03 — Authorization or Dependency Failure

Trigger: unexpected DENY/ALLOW, repository access before read ALLOW, Identity or
Reference Data outage, protected data disclosure, or fresh Retry failure.

1. Stop write-path testing and preserve the correlation and safe response.
2. Confirm verified subject context and the exact read/capture permission
   evaluated; never use a UI hint as authority.
3. Compare before/after write sets.
4. Real DENY must have one denial audit and zero business rows.
5. Identity/Reference Data outages must have zero prohibited CMM rows and only
   safe correlated telemetry.
6. If any unauthorized write or protected disclosure occurred, classify SEV1,
   isolate the candidate, and notify the security owner.
7. After dependency recovery, require user-triggered fresh evaluation and
   independent API/UI convergence; never replay a denied capture automatically.

## RB-04 — Typed Conflict or Lifecycle Integrity Regression

Trigger: duplicate/wrong-next request does not return typed HTTP 409, accepted
state changes, request identity is lost, or final projection disagrees with CMM
history.

1. Freeze the fixture and preserve request, journey version, movement/history,
   audit, rejection, outbox, receipt, and projection hashes.
2. Confirm strict typed DCSA/location/equipment/time validation.
3. Compare current state and required-next evidence with the canonical
   lifecycle.
4. Do not repair through direct SQL or delete the conflicting request.
5. Correct in source, rerun unit/transaction/contract tests, then the isolated
   deterministic fixture.
6. Promotion remains blocked until unchanged-state and projection correctness
   are proven.

## RB-05 — Migration or Data-Integrity Failure

Trigger: Flyway checksum/order failure, service startup against an unexpected
schema, data corruption suspicion, or previous-image incompatibility.

1. Stop application writes and preserve migration history and database health.
2. Keep service-owned database boundaries; no cross-module repair query.
3. If the prior image is proven compatible with the additive schema, redeploy
   the previous immutable manifest while preserving volumes.
4. If compatibility is unproven, use reviewed forward repair.
5. Restore from backup only if that exact backup/restore path has been
   validated separately.

No validated production backup, RPO, or RTO exists today, so destructive
recovery is prohibited.

## RB-06 — Secret or Sensitive-Evidence Exposure

Trigger: token, credential, cookie, secret claim, provider credential URL, raw
payload, or protected subject data appears in logs/evidence.

1. Stop distribution and restrict access to the affected artifact.
2. Record only artifact identity and affected control; do not repeat the value.
3. Revoke/rotate through the owner-controlled secret mechanism.
4. Remove the disclosure in a new candidate and rerun redaction detectors.
5. Treat committed or broadly distributed credentials as SEV1.

## RB-07 — Observability Blind Spot

Trigger: required `dashboards` show no data, an `alarms` source is missing,
Prometheus/collector/trace/log store is unavailable, or correlation breaks.

1. Do not infer healthy zero from no data.
2. Preserve component state, descriptor validation, scrape target results, and
   safe log-shape counts.
3. Confirm application metric endpoints, structured logs, OTLP export, and
   datasource wiring.
4. Correct instrumentation/configuration in source; do not start or reconfigure
   the protected manager from this runbook.
5. Repeat the current-image isolated fixture and attach telemetry evidence.

## RB-08 — Evidence or Release Identity Failure

Trigger: mutable/fallback image, dirty source, missing digest/checksum, hash
mismatch, wrong W2-02 base, or W1 waiver relabeled.

1. Stop promotion immediately.
2. Quarantine the candidate manifest and preserve the mismatch.
3. Rebuild from one committed SHA without fallback images.
4. Regenerate and validate evidence; never edit evidence to fit the candidate.
5. Keep W1 `BLOCKED_WAIVED` explicit.

## Automation Boundary

Safe automation may stop promotion, validate identities/hashes, collect
redacted metadata, and open an incident record. Service restarts, replays,
credential rotation, migration repair, and rollback require owner approval and
verified target scope. Automated purge/reset/fail-open behavior is forbidden.

