# Escalation Matrix — W2-02 Design-System Closure

## Upstream bindings

This matrix is derived from `observability-setup/dashboards.md`, `observability-setup/alarms.md`, `booking-design-system-closure/nfr-design/reliability-design.md`, `security-design.md`, and `booking-design-system-closure/infrastructure-design/deployment-architecture.md`.

## Role-based escalation

| Severity / trigger | Initial responder | Escalation owner | Required consultation | Contact route | Authority required to resume |
|---|---|---|---|---|---|
| P1 protected-manager safety | Active W2-02 operator | Manager-runtime owner | W2-02 delivery owner; platform owner | Active workflow/session plus organization’s approved manager incident channel | Manager-runtime owner confirms safety; fresh pre-guard passes |
| P1 secret/auth exposure | Active W2-02 operator | Security responder | Credential owner; affected service owner | Organization’s approved security incident channel | Security responder confirms containment; new sanitized evidence passes |
| P1 destructive-data risk | Active W2-02 operator | Owning service/data owner | W2-02 delivery owner | Approved service incident channel | Data owner approves a non-destructive recovery path |
| P2 canonical journey/service failure | Active W2-02 operator | W2-02 delivery owner | Relevant shell, Booking, identity, reference, charge, or platform owner | Active workflow/session and team delivery channel | Focused regression passes; new terminal attempt is authorized |
| P2 evidence/cleanup/audit failure | Evidence custodian | W2-02 delivery owner | Harness or audit owner; platform owner if cleanup-related | Active workflow/session and team delivery channel | Complete immutable evidence, clean Wave A, post-guard and audits pass |
| P3 optional observability degradation | Active W2-02 operator | Protected-manager/platform owner | Observability owner | Program operations backlog/channel | Program owner supplies authorized remediation evidence; W2-02 need not rerun if unaffected |
| P4 non-impacting observation | Reporter | Relevant component owner | None by default | Normal backlog | Component owner triage |

## Contact and rotation readiness

No named human, phone number, email address, paging endpoint, primary/secondary on-call rotation, or guaranteed response interval is present in the approved repository evidence. Until program owners provide that directory:

- the active W2-02 workflow/session is the durable coordination record;
- the team’s already-approved delivery, security, platform, or manager channel is used when available;
- if the required P1 owner cannot be contacted, all mutation remains stopped;
- no automatic notification-delivery or on-call readiness PASS is claimed.

## Escalation payload

Every escalation includes:

1. incident ID, time, severity, and current status;
2. exact affected project (`linercore-wave-a` or protected manager observation);
3. verified impact and the action that was stopped;
4. current guard, wrapper, case, log, trace-scan, cleanup, and audit evidence paths;
5. containment already applied;
6. decision required from the receiving owner;
7. next safe check and explicit forbidden actions.

Sensitive headers, tokens, cookies, credentials, raw payloads, and unsafe traces are excluded.

## Review cadence and closure

Status is updated when impact, cause status, containment, owner, or next action changes. P1/P2 closure requires a blameless post-incident review with timeline, impact, cause, contributing factors, corrective actions, accountable role owners, and verification. No invented ETA, RTO, or response-time objective is attached.
