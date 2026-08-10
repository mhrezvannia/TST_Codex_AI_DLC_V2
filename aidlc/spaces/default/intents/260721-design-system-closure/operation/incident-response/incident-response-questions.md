# Incident Response Questions — W2-02 Design-System Closure

## Upstream bindings

These decisions are constrained by `observability-setup/dashboards.md`, `observability-setup/alarms.md`, `booking-design-system-closure/nfr-design/reliability-design.md`, `security-design.md`, and `booking-design-system-closure/infrastructure-design/deployment-architecture.md`.

## Resolved incident-response choices

### Q1. What are the most likely failure modes?

The highest-impact W2-02 failures are a manager-target mismatch, accidental protected-manager mutation, unsafe authentication or secret exposure, an unhealthy Wave A dependency, an incorrect or duplicated Booking command, an unexpected browser/accessibility/layout failure, incomplete evidence, failed cleanup, or a failed audit. The optional shared observability profile has separate known failures: all application scrape targets are down, Elasticsearch exited OOM-killed with code 137, and Kibana times out.

### Q2. What are the escalation paths and on-call rotations?

Escalation is role-based: the active W2-02 operator becomes initial responder; the W2-02 delivery owner coordinates closure incidents; the relevant shell, Booking, identity, platform, or security owner diagnoses within their boundary; and the protected-manager owner authorizes any manager action. No named contact directory, notification route, or on-call rotation is configured in this intent, so automated paging and response-time claims remain unavailable.

### Q3. What automated remediation is permitted?

Only fail-closed checks and isolated Wave A lifecycle commands are permitted: `npm run demo:guard`, `node scripts/wave-a-compose.mjs config`, `ps`, `logs`, `up`, and `down`, plus the established evidence/audit commands. There is no SSM Automation, AWS Incident Manager, Lambda remediation, failover controller, or AWS Backup configuration. The protected `linercore-shared-platform` manager is never automatically restarted or changed.

### Q4. How are incidents communicated?

The responder records status, impact, containment, evidence paths, owner, next action, and resolution in a dedicated incident record and the team’s approved incident channel when one exists. Security or manager-safety incidents are escalated immediately and no unverified root-cause claim is communicated. A named external-status channel is not configured because W2-02 has no production target.

### Q5. What are the RTO and RPO targets?

No time-bounded RTO or data-loss RPO was approved. W2-02 fails closed and may start a new isolated acceptance attempt only after the cause is understood and containment is verified. Existing service-owned volumes are preserved for diagnosis; destructive reset or `down --volumes` is not recovery evidence. Production recovery, backup, restore, and failover targets remain program-level decisions.

## Deferred decisions

Named on-call contacts, paging channels, response-time commitments, production severity ownership, RTO/RPO, backup policy, restore drills, AWS automation, and manager-observability remediation require program ownership outside W2-02.
