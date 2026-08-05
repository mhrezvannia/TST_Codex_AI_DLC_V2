# Security Requirements - U02 Booking Create Allow

## Source Context

These security requirements consume U02 `business-logic-model.md`, U02 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U02 is security-critical because it turns a real subject into a Booking write.

## Authorization Requirements

| ID | Requirement | Verification |
| --- | --- | --- |
| SEC-01 | `local.booking.user` must exist and have `booking-desk` access with Booking create/read permissions before U02 proof. | Seed/catalog review and live identity evidence. |
| SEC-02 | booking-service authorizes create through identity-service `/internal/identity/authorize` before mutation. | Integration test and service logs. |
| SEC-03 | Deny, unknown subject, missing subject, timeout, or identity-service error prevent create. | Negative tests. |
| SEC-04 | `local.reference.admin` remains without Booking permissions. | Seed/catalog diff and later deny proof guard. |

## Actor, Token, and Audit Requirements

| ID | Requirement | Verification |
| --- | --- | --- |
| SEC-05 | Create/detail requests carry session-derived actor subject and never fall back to `local-user`. | BFF/backend tests and evidence. |
| SEC-06 | Raw tokens remain server-side and are not serialized into Booking create/detail UI. | Code review and browser storage check. |
| SEC-07 | Create uses existing idempotency controls and does not accept missing/invalid idempotency where the current API requires it. | BFF validation tests. |
| SEC-08 | Audit/log/evidence includes actor, action `booking:create`, authorization decision, created booking id, and correlation id. | U02 evidence package. |

## Threat Controls

| Threat | Control |
| --- | --- |
| Privilege escalation through seed change | Keep `local.reference.admin` deny fixture unchanged and review catalog diff. |
| Tampered actor header | BFF derives actor server-side; browser does not provide service actor authority. |
| Write without authorization | booking-service adapter must fail closed before command execution. |
| Replay/double submit | Existing idempotency key behavior remains enforced. |
