# Security Requirements - U05 Route Compatibility and Preservation

## Source Context

These security requirements consume U05 `business-logic-model.md`, U05 `business-rules.md`, `requirements.md`, and `technology-stack.md`. Compatibility routes must preserve authentication and actor integrity.

## Route Security Requirements

| ID | Requirement | Verification |
| --- | --- | --- |
| SEC-01 | `/bookings*` compatibility routes require the same protected shell auth/session checks as canonical `/booking*`. | Route tests/live proof. |
| SEC-02 | Compatibility cannot bypass shell actor propagation or reach Booking as `local-user`. | BFF/backend evidence. |
| SEC-03 | Redirect/resolution must preserve safe return behavior and not allow open redirects. | Route tests/code review. |
| SEC-04 | Correlation id remains available for compatibility route evidence. | Evidence package. |

## Preservation Security Requirements

| ID | Requirement | Verification |
| --- | --- | --- |
| SEC-05 | W0-01, W0-02, W1-01, and W2-02 files are unchanged or touched only with W2-01-specific justification. | Diff review. |
| SEC-06 | No prior-work security guard is weakened to make shell routing easier. | Targeted review. |
| SEC-07 | W1 waiver remains BLOCKED at `compose-start`; no false PASS wording. | Evidence review. |

## Threat Controls

| Threat | Control |
| --- | --- |
| Auth bypass via legacy URL | Legacy aliases run through shell/Nginx protected route behavior. |
| Open redirect | Only fixed `/bookings*` to `/booking*` mappings are allowed. |
| Scope creep | Preservation diff review blocks unrelated prior-work rewrites. |
