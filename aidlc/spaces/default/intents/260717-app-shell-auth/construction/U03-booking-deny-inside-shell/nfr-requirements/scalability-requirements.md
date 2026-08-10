# Scalability Requirements - U03 Booking Deny

## Source Context

These scalability requirements consume U03 `business-logic-model.md`, U03 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U03 should preserve stateless request-scoped authorization behavior.

## Scaling Requirements

| ID | Requirement | Rationale |
| --- | --- | --- |
| SCALE-01 | Deny decisions are request-scoped and not cached in shell client state as authority. | Prevents stale authorization. |
| SCALE-02 | Denied UI does not poll or retry authorization repeatedly. | Avoids avoidable load. |
| SCALE-03 | U03 does not add role-admin/policy-management UI or new authorization services. | Keeps W2-01 bounded. |
| SCALE-04 | Shell/BFF remains stateless and horizontally scalable. | Matches existing architecture direction. |

## Load Assumptions

U03 is a single-user local proof. Production-scale authorization throughput is outside this unit, but implementation must not introduce stateful bottlenecks or client-owned authorization authority.

## Escalation Triggers

- Deny path loops or retries continuously.
- Denied UI requires new global state libraries.
- Authorization state persists in shell in a way that can outlive session changes.
