# Reliability Requirements - U02 Identity Authorization Service

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines explicit decision outcomes, fail-closed behavior for unavailable dependencies, transactional role assignment/audit, Keycloak adapter boundaries, and walking-skeleton support. `business-rules.md` requires stale-write rejection, deterministic decisions, correlation propagation, and error envelopes. `requirements.md` fixes NFR-005, NFR-009 through NFR-012, NFR-016, and on-prem runtime constraints.

## Availability and Failure Posture

U02 must be reliable enough that protected platform actions can depend on it. When required authorization dependencies are unavailable, U02 must fail closed rather than grant access.

## Reliability Requirements

| Area | Requirement |
|---|---|
| Token validation | Invalid token, unknown subject, and dependency unavailable outcomes must be distinguishable. |
| Policy evaluation | Same active assignment and policy version must produce deterministic decisions. |
| Role assignment writes | Concurrent changes must reject stale versions or conflicts. |
| Audit persistence | Assignment changes and audit records persist in one transaction where storage allows. |
| Error response | REST errors use platform envelope with code, message, correlationId, timestamp, and optional details. |
| Health/readiness | Readiness must reflect required database and Keycloak adapter dependency state. |

## Degradation Behavior

| Scenario | Required behavior |
|---|---|
| Keycloak token invalid | Return deny/invalid-token outcome safely. |
| Keycloak metadata unavailable | Fail closed for protected decisions and emit dependency-unavailable signal. |
| PostgreSQL unavailable | Fail closed for protected decisions requiring assignment/policy data. |
| Concurrent assignment update | Reject stale write and preserve prior assignment state. |
| Audit write fails during assignment change | Roll back assignment change where transactional storage allows. |
| Audit query unavailable | Do not affect decision path; report dependency/status error to authorized caller. |

## Recovery Requirements

- Health checks must make database and Keycloak adapter dependency failures visible.
- Logs and traces must include correlation id for failed decisions and assignment writes.
- Operators must be able to distinguish authorization denial from dependency outage.
- Audit records must remain append-only from the application perspective after recovery.
- Walking skeleton must prove one allow and one deny decision with traceable audit/log evidence.

## Backup and Durability Considerations

- U02 PostgreSQL data contains authorization and audit-sensitive records and must be compatible with encryption-at-rest and operational backup requirements.
- Final backup retention, restore time, and disaster-recovery targets remain open NFR/environment questions.
- U02 must not store raw tokens or passwords, reducing recovery exposure.

## Non-Goals

- No final production SLA/SLO in this stage.
- No custom high-availability implementation.
- No eventual-consistency shortcut for protected authorization decisions.

