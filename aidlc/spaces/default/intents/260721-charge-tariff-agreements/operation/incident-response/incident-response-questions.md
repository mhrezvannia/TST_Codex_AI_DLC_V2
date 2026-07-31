# Incident Response Questions - W2-03

## Context

The approved `dashboards` and `alarms` are design-only and unprovisioned
because there is no deployed candidate. The unit `reliability-design`,
`security-design`, and `deployment-architecture` artifacts define local
failure containment, manager preservation, forward repair, isolated restore,
120-second readiness, and local-volume RPO-0 evidence. They do not establish a
production environment, named responders, paging service, or production
RTO/RPO.

## Questions

### Q1. What operational scope should the incident plan cover now?

A. Isolated acceptance scope (recommended) - define response for guarded local
Wave A runs and explicitly defer production incident operations.

B. Production scope - define a live production response organization despite
the absence of a production topology or owner.

C. Documentation only - provide generic guidance without W2-03-specific
failure modes or recovery controls.

X. Other (please specify)

[Answer]: A. Isolated acceptance scope (recommended)

### Q2. How should responder ownership and escalation be represented?

A. Role-based and unassigned (recommended) - use release reviewer, technical
responder, incident commander, security/data specialists, and communications
lead; require real names and availability before activation.

B. Invent a weekly on-call rotation - create placeholder named people and
schedules.

C. No escalation structure - leave response ownership entirely undefined.

X. Other (please specify)

[Answer]: A. Role-based and unassigned (recommended)

### Q3. What remediation automation is permitted?

A. Diagnose and stop only (recommended) - automate evidence capture and safe
read-only checks; require explicit human approval for wrapper restart, restore,
forward repair, credential rotation, or cleanup.

B. Guarded automatic restart - allow the system to restart failed Wave A
services automatically.

C. Full self-healing - allow restart, restore, cleanup, and credential changes
without human approval.

X. Other (please specify)

[Answer]: A. Diagnose and stop only (recommended)

### Q4. What communication procedure should apply?

A. Internal evidence-led updates (recommended) - create an incident record,
use role-owned updates every 15 minutes for P1 and 30 minutes for P2, and leave
the actual channel/status-page integration unassigned.

B. External status-page procedure - publish customer-facing updates despite no
production service or approved communications owner.

C. Evidence record only - retain diagnostics without a coordination cadence.

X. Other (please specify)

[Answer]: A. Internal evidence-led updates (recommended)

### Q5. Which recovery objectives should the plan state?

A. Local objectives only (recommended) - retain <=120-second service
restart/readiness, <=10-minute aggregate startup, and RPO 0 for committed data
within the existing isolated volumes; production RTO/RPO remain unapproved.

B. Production objectives - adopt RTO <=30 minutes and RPO <=5 minutes without
production architecture or replication evidence.

C. No recovery objectives - omit even the approved local acceptance bounds.

X. Other (please specify)

[Answer]: A. Local objectives only (recommended)

## Confirmation

The consolidated answer set was confirmed before artifact generation.
