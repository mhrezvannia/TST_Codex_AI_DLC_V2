# Reliability Requirements - U03 Booking Deny

## Source Context

These reliability requirements consume U03 `business-logic-model.md`, U03 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U03 must produce predictable denied states and evidence.

## Reliability Requirements

| ID | Requirement | Verification |
| --- | --- | --- |
| REL-01 | Deny state renders inside the shell rather than a blank page, route-not-found page, or fake empty list. | UI test/live proof. |
| REL-02 | identity-service timeout/unavailable fails closed with a clear error/denied state and correlation id. | Negative integration test. |
| REL-03 | Deny state provides safe recovery actions such as request access or back/home. | UI test. |
| REL-04 | Runtime blockers are recorded honestly as W2-01 blockers. | Evidence review. |

## Accessibility Reliability

- One visible `h1`.
- Request-access/back actions are keyboard reachable.
- Deny explanation identifies authenticated-but-unauthorized state.
- Decision/correlation text wraps or truncates without overlap.

## Recovery Behavior

Authorized users proceed in U02 allow path; unauthorized users can request access or return home. U03 does not silently retry with a different actor.
