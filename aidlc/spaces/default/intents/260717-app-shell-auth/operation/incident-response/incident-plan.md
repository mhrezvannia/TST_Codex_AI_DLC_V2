# Incident Response Plan - W2-01 App Shell and Auth

## Scope And Inputs

This plan consumes `dashboards`, `alarms`, per-unit `reliability-design`, per-unit `security-design`, and per-unit `deployment-architecture` artifacts. It governs the local/on-prem W2 proof stack and release evidence. It does not establish production staffing, customer communications, AWS Incident Manager, SSM Automation, AWS Backup, or production recovery guarantees.

## Severity And Response

| Level | Criteria | Acknowledge | Command | Communication |
| --- | --- | --- | --- | --- |
| P1 Critical | Auth/authorization bypass, token/secret exposure, data loss, all protected routes unavailable, evidence falsification, or W1 waiver rewritten | 15 minutes during an active proof run | Release owner becomes incident commander; stop promotion immediately | Dedicated incident log; update every 30 minutes |
| P2 Major | Login, Booking lifecycle, Identity, Nginx compatibility, or required audit unavailable with no safe workaround | 30 minutes during an active proof run | Release owner coordinates service/platform/quality roles | Dedicated incident log; update every 30 minutes |
| P3 Minor | Partial degradation with safe workaround, one telemetry source unavailable, or nonblocking evidence defect | Same proof session or next business day | Owning role leads | Issue record; updates at material changes |
| P4 Follow-up | Cosmetic issue, documentation drift, or deferred instrumentation with no current proof impact | Planned backlog | Owning role | Normal work tracking |

The local objective is service restoration within 30 minutes. Missing application telemetry is currently a known P3/P4 follow-up unless it masks active user impact or invalidates release evidence, in which case severity increases.

## Response Lifecycle

1. **Detect:** Use browser reports, endpoint checks, Compose state/logs, acceptance validation, detector/audit outputs, and eventually the intended `dashboards` and `alarms` signals.
2. **Declare:** Open the incident record, assign severity and incident commander, record impact and next update time, and stop promotion for P1/P2.
3. **Preserve:** Capture sanitized state before mutation. Preserve Docker volumes, evidence files, correlation ids, image identifiers, and configuration diffs.
4. **Contain:** Fail closed for auth/session/authorization faults. Disable an unsafe route rather than bypassing controls. Quarantine inconsistent evidence.
5. **Diagnose:** Select the matching `runbooks.md` procedure. Keep investigation, mitigation, and communication as separate workstreams when more than one responder is available.
6. **Mitigate:** Automation collects evidence only. The incident commander approves a bounded restart, configuration restore, or image rollback after impact and data risk are understood.
7. **Verify:** Run focused health checks plus the affected live scenario. P1/P2 release incidents require the full W2 acceptance and `--require-pass` validation before promotion resumes.
8. **Resolve:** Record restored behavior, residual risk, final evidence references, and the decision to resume or keep promotion stopped.
9. **Review:** Hold a blameless review within two business days for P1/P2 and for repeated P3 incidents.

## Communication Procedure

Use a dedicated `incident-YYYYMMDD-HHMM-short-name` log or channel. Each P1/P2 update contains:

```text
Status: investigating | identified | mitigating | monitoring | resolved
Impact: affected actors, routes, operations, and data exposure/loss status
Evidence: sanitized correlation ids, checks, and artifact references
Action: current workstream and approved mitigation
Next update: UTC timestamp no more than 30 minutes away
```

Do not publish root-cause speculation, credentials, cookies, tokens, service secrets, or customer-sensitive payloads. This test-project scope has no public status-page commitment. A future production plan must bind approved customer, legal, privacy, and security notification procedures.

## Security And Evidence Rules

- Authentication and authorization failures remain fail closed as required by `security-design` and `reliability-design`.
- Browser-supplied actor identity is never authority; no incident workaround may introduce `local-user`.
- Expected authorization denial is not an outage. Unexpected allow, subject mismatch, or missing audit evidence is a security incident.
- A W2 PASS requires runtime PASS, all four scenarios PASS, detector 6d PASS, both audits PASS, and package validation PASS.
- W1-01 remains waived/BLOCKED at compose-start until its own real evidence passes. W2 recovery cannot rewrite that history.

## Recovery, Backup, And Continuity

The `deployment-architecture` uses local Compose services and existing volumes. W2-01 proves restart-safe application behavior but does not define backup schedules or restore points. Therefore:

- Local RTO objective: 30 minutes during an active proof run.
- Production RTO: not established.
- Production/local RPO: not established.
- Zero-data-loss claim: prohibited.
- Volume deletion or recreation: prohibited during incident response.
- Database restore: requires a separately reviewed and tested backup/restore procedure.

## Post-Incident Review

The review records timeline, impact, root cause, contributing conditions, detection gaps, response quality, what worked, what did not, and assigned actions with owners and dates. Repeated manual diagnostics become automation candidates only after review; automation still requires bounded behavior, redaction, tests, and explicit recovery authority.
