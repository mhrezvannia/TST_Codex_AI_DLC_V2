# W2-04 Incident Response Decisions

## Upstream Context

These answers connect `dashboards` and `alarms` to the recovery behavior in
`reliability-design`, the controls in `security-design`, and the portable
ownership/isolation model in `deployment-architecture`.

## Decisions

### 1. What are the most likely failure modes?

**Answer:** Manager/acceptance target collision, outbox or Booking consumer
stall, schema incompatibility, stale fence, projection mismatch, typed conflict
regression, Identity/Reference Data outage, authorization fail-open or
unauthorized write, migration/data-integrity failure, secret disclosure,
mutable/mismatched evidence, and observability no-data.

### 2. What are the escalation paths and on-call rotation?

**Answer:** Role-based escalation is defined for Incident Commander, release
reviewer, CMM, Booking, platform, security, and communications ownership. No
named or staffed on-call rotation exists; production activation is blocked
until primary/secondary coverage and channels are approved.

### 3. What automated remediation is allowed?

**Answer:** Automation may stop promotion, verify target/release identities,
collect redacted metadata, and open an incident record. Restarts, replays,
credential rotation, migration repair, rollback, or service changes require
owner approval. Purges, volume resets, offset rewrites, down migrations,
cross-service SQL, and authorization bypass are prohibited.

### 4. What are the communication procedures?

**Answer:** Use a dedicated record/channel with status, severity, impact,
verified evidence, current action, and next-update time. Proposed internal
cadence is 15 minutes for SEV1 and 30 minutes for SEV2. No external
communication process is inferred for this internal slice.

### 5. What are the RTO and RPO targets?

**Answer — not defined:** The 30-second propagation/retry objective is not RTO.
No production environment, backup/restore proof, RTO, or RPO is approved.

### 6. Are AWS Incident Manager, SSM runbooks, and AWS Backup configured?

**Answer — not applicable:** W2-04 is on-premises Compose and has no AWS target.
The runbooks are portable procedures; no AWS control is invented.

### 7. Has disaster recovery or chaos been exercised?

**Answer — no:** No deployed candidate, active telemetry, or approved recovery
target exists. Destructive exercises are prohibited. The observed manager edge
outage/recovery is recorded as an availability example, not a DR drill.

### 8. What does approval mean?

**Answer:** Approval accepts the incident plan, runbooks, escalation gaps, and
unproven recovery classification. It does not claim production incident
readiness, backup, on-call staffing, RTO/RPO, or deployment authorization.

## Readiness Verdict

**PROCEDURES DESIGNED; OPERATIONAL ACTIVATION BLOCKED.** Activation requires
staffed ownership, live telemetry, a deployed target, tested recovery and
backup/restore, and approved communication channels.

