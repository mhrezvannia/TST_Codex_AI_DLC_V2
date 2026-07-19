# Escalation Matrix - W2-01 App Shell and Auth

## Upstream Inputs And Staffing Boundary

This matrix consumes `dashboards`, `alarms`, per-unit `reliability-design`, per-unit `security-design`, and per-unit `deployment-architecture` artifacts. W2-01 has a role-based proof-run model, not a named 24x7 production rotation. Names, phone numbers, paging systems, and corporate contacts must be bound before production use.

## Roles

| Role | Primary responsibility | Activation |
| --- | --- | --- |
| Proof-run release owner | Incident commander, severity, promotion stop/resume, recovery approval, 30-minute updates | Every P1/P2 during a proof run |
| Application owner | Shell, auth app, Booking UI/BFF, booking-service diagnosis and tested fix | User journey or application failure |
| Identity/security owner | OIDC validation, session behavior, actor propagation, role/policy analysis, token-exposure response | Auth, authorization, subject, secret, or deny/allow anomaly |
| Platform/runtime owner | Docker Desktop/Compose, Nginx, Keycloak, PostgreSQL, Elastic, network, host-port, and image-cache diagnosis | Runtime or dependency failure |
| Quality/evidence owner | Live scenarios, detector 6d, audit commands, package validation, redaction, waiver integrity | Evidence or release-control failure |
| Data owner | Assess persistence impact and approve any future restore plan | Suspected corruption or data loss |

One person may hold multiple roles in the test project, but the incident log must state which role they are acting in. The incident commander coordinates and approves recovery; they should avoid being the only person diagnosing a P1 security or data incident.

## Severity Escalation

| Time from declaration | P1 | P2 | P3/P4 |
| --- | --- | --- | --- |
| 0 minutes | Release owner, relevant technical owner, quality/evidence owner; stop promotion | Release owner and relevant technical owner; stop affected promotion | Owning role opens issue |
| 15 minutes | Add identity/security owner for auth/data risk and platform owner for runtime risk | Confirm owner and next update | Continue normal triage |
| 30 minutes | Send status update; if not contained, add data owner and project decision authority | Send status update; escalate to project decision authority if no recovery path | Reclassify if impact expanded |
| 60 minutes | Keep promotion stopped; require explicit fix-forward vs rollback decision and revised restoration estimate | Reclassify P1 if broad impact, security risk, or evidence integrity is uncertain | Schedule follow-up |

Unreachable roles are escalated immediately to the project decision authority; no unavailable contact is silently assumed to have approved a recovery action.

## Trigger Routing

| Trigger | Severity floor | Lead roles |
| --- | --- | --- |
| Protected route accessible without valid session | P1 | Identity/security, application, release owner |
| Unexpected authorization allow, `local-user`, or actor mismatch | P1 | Identity/security, quality/evidence, release owner |
| Raw token, cookie, password, or secret in logs/evidence | P1 | Identity/security, quality/evidence |
| Booking lifecycle unavailable with no workaround | P2 | Application, platform/runtime |
| Keycloak, Nginx, PostgreSQL, or Identity unavailable | P2 | Platform/runtime plus affected owner |
| Legacy route compatibility regression | P2 | Application, quality/evidence |
| W2 evidence inconsistent or required audit unavailable | P2; P1 if falsification/leakage | Quality/evidence, release owner |
| Application telemetry unavailable | P3; P2 if impact cannot be assessed | Platform/runtime, application |
| W1 waiver rewritten or represented as real PASS | P1 release-integrity event | Quality/evidence, release owner |

## Decision Authority

| Decision | Required approval |
| --- | --- |
| Capture diagnostics and run read-only health checks | Responding owner |
| Restart one container or restore reviewed configuration | Incident commander after technical-owner recommendation |
| Roll back an image or route configuration | Incident commander and application/platform owner |
| Change identity role or authorization policy | Incident commander and identity/security owner |
| Restore data | Data owner plus project decision authority; only from a tested backup contract |
| Resume W2 promotion | Incident commander and quality/evidence owner after `--require-pass` validation |
| Change W1 waiver status | Not authorized by W2 incident process; requires W1's own real acceptance evidence |

## Handoff And Closure

At handoff, record current severity, impact, timeline, hypotheses, completed diagnostics, approved mutations, correlation ids, next update time, and unresolved risks. Closure requires a resolution note and evidence references. P1/P2 incidents receive a blameless review within two business days; action items enter the program backlog with an owner and due date.
