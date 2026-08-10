# Incident Response Questions - W2-01 App Shell and Auth

## Upstream Inputs

These questions consume `dashboards`, `alarms`, per-unit `reliability-design`, per-unit `security-design`, and per-unit `deployment-architecture` artifacts.

## Questions

### Q1. Which W2-01 failure modes require page-ready runbooks?

A. All W2 modes: OIDC/session, authorization, Booking/data/pricing, edge compatibility, telemetry, and evidence integrity
B. User-impacting runtime modes only: OIDC/session, authorization, Booking/data/pricing, and edge compatibility
C. Release-control modes only: telemetry blind spots and evidence integrity
X. Other (please specify)

[Answer]: A - All W2 modes. **Timestamp:** 2026-07-19T18:55:56Z. **Mode:** guided.

### Q2. What on-call ownership model applies to this test-project/local proof scope?

A. Role-based release owner during proof runs; named 24x7 rotation deferred until production
B. Dedicated named 24x7 application rotation now
C. Existing corporate on-call rotation and paging policy
X. Other (please specify)

[Answer]: A - Role-based release owner during proof runs; named 24x7 rotation deferred until production. **Timestamp:** 2026-07-19T18:55:56Z. **Mode:** guided.

### Q3. What automated-remediation authority should the runbooks assume?

A. Diagnostics and evidence capture only; restart or rollback requires human approval
B. One bounded container restart, then halt and escalate
C. Automatic rollback to the prior image after any P1 trigger
X. Other (please specify)

[Answer]: A - Diagnostics and evidence capture only; restart or rollback requires human approval. **Timestamp:** 2026-07-19T18:55:56Z. **Mode:** guided.

### Q4. What incident communication procedure should be recorded?

A. Dedicated incident channel/log, 30-minute updates for P1/P2, resolution note, and blameless review
B. Existing corporate incident communications standard
C. Issue tracker updates only
X. Other (please specify)

[Answer]: A - Dedicated incident channel/log, 30-minute updates for P1/P2, resolution note, and blameless review. **Timestamp:** 2026-07-19T18:57:23Z. **Mode:** guided.

### Q5. Which recovery objectives can W2-01 truthfully claim?

A. Local proof objective: restore service within 30 minutes; no production RTO/RPO or zero-data-loss claim
B. Production RTO 15 minutes and RPO zero
C. Inherit an existing production SLA and backup policy
X. Other (please specify)

[Answer]: A - Local proof objective: restore service within 30 minutes; no production RTO/RPO or zero-data-loss claim. **Timestamp:** 2026-07-19T18:57:23Z. **Mode:** guided.

## Decision Check

After all answers are recorded, check them against the local/on-prem `deployment-architecture`, fail-closed `security-design`, bounded-recovery `reliability-design`, and the known telemetry limits in `dashboards` and `alarms`. Do not invent AWS Incident Manager, SSM Automation, AWS Backup, named contacts, or production guarantees that W2-01 does not provision.
