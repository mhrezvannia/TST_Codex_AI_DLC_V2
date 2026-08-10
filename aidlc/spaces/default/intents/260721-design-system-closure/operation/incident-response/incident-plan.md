# Incident Response Plan — W2-02 Design-System Closure

## Upstream bindings and scope

This plan consumes `observability-setup/dashboards.md`, `observability-setup/alarms.md`, `booking-design-system-closure/nfr-design/reliability-design.md`, `security-design.md`, and `booking-design-system-closure/infrastructure-design/deployment-architecture.md`.

It applies only to the ephemeral local `linercore-wave-a` acceptance runtime and its immutable W2-02 evidence. It does not establish production operations, AWS Incident Manager, SSM Automation, an SLA/SLO, an RTO/RPO, backup/restore capability, or authorization to modify the protected `linercore-shared-platform` manager.

## Severity model

| Severity | W2-02 trigger | Immediate disposition |
|---|---|---|
| P1 safety/security | Protected-manager mutation or target mismatch; credential/secret exposure; auth bypass; suspected destructive data action | Stop all mutation, preserve safe evidence, contain exposure, notify security and manager owners |
| P2 closure-blocking | Canonical journey, required service, accessibility, trace sanitization, cleanup, manager post-guard, or audit failure | Mark the run failed; retain evidence; diagnose before a new attempt |
| P3 degraded dependency | Optional shared telemetry failure with no W2-02 journey impact | Record program follow-up; do not reinterpret it as closure PASS |
| P4 informational | Non-impacting diagnostic warning or cosmetic observation outside required assertions | Record and triage through normal backlog |

No response-time commitment is attached because no approved on-call rotation or service objective exists.

## Roles

- **Initial responder:** active W2-02 operator; stops unsafe activity and captures facts.
- **Incident commander:** W2-02 delivery owner for P1/P2; coordinates rather than debugging every workstream.
- **Technical responder:** owner of the failing shell, Booking, identity, shared UI, platform, or evidence-harness boundary.
- **Security responder:** reviews suspected credential, authorization, trace, or data exposure.
- **Manager-runtime owner:** sole approver for any action against `linercore-shared-platform`.
- **Evidence custodian:** preserves attempt lineage, hashes, logs, screenshots, sanitized trace, cleanup result, and audit exits.
- **Communications owner:** publishes verified status through the organization’s approved channel when configured.

No named people, phone numbers, paging endpoint, or weekly rotation is present in the approved inputs. That missing contact data is an operational-readiness gap, not a reason to invent ownership.

## Response lifecycle

1. **Detect:** use the run-scoped dashboard, stop conditions, process exits, case records, browser collectors, wrapper health, and demo guards.
2. **Declare:** assign severity, incident commander, technical owner, and evidence location.
3. **Contain:** stop new Wave A mutations; for P1, stop the run immediately. Never substitute or modify the protected manager.
4. **Diagnose:** use read-only status/log evidence first. Separate product defects, harness defects, dependency failure, and optional manager-observability degradation.
5. **Mitigate:** apply only the matching runbook and preserve service/database ownership boundaries.
6. **Validate:** repeat the failed focused check, then run a new terminal acceptance attempt when necessary. Do not overwrite the failed attempt.
7. **Recover:** require cleanup through the Wave A wrapper, the post-demo guard, both audits, and a complete manifest before closure.
8. **Close:** record impact, cause status, actions, evidence links, residual risk, and follow-up owner.

## Communications

Each update records: timestamp, status (`investigating`, `identified`, `mitigating`, `monitoring`, or `resolved`), verified impact, containment, current owner, next action, and evidence path. Updates occur on meaningful state changes; no unsupported update interval or ETA is promised.

External/customer communication is not defined because this is not production. For P1 security or protected-manager impact, use the organization’s established security/manager escalation route. If that route or owner cannot be reached, remain stopped.

## Recovery and continuity

- Recovery creates a separately identified attempt; prior failures remain immutable.
- Service-owned data volumes are preserved during diagnosis. Destructive reset, cross-service database access, and unscoped Compose teardown are prohibited.
- There is no automatic failover, backup restore, zero-data-loss guarantee, or recovery clock.
- The known Elasticsearch OOM/Kibana timeout belongs to protected-manager program remediation; W2-02 records it but does not restart those services.

## Post-incident review

A blameless review is required for every P1/P2 before the incident is considered fully closed. It contains:

1. timeline from detection through closure;
2. verified impact and affected scope;
3. root cause or explicit “not yet established” status;
4. contributing system/process factors;
5. what worked and what failed;
6. corrective actions with role owner and verification evidence;
7. recurrence-prevention checks and unresolved risks.

The review never rewrites the historical W1 BLOCKED/waived status as PASS.
