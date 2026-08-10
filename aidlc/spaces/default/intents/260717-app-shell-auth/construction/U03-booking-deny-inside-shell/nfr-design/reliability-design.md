# Reliability Design - U03 Booking Deny

## Source Context

This design consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. U03 reliability means authorization denial produces a predictable, accessible in-shell denied state with auditable evidence.

## Resilience Patterns

| Condition | Design | Requirement coverage |
| --- | --- | --- |
| Anonymous user | Redirect to existing auth; do not classify as U03 role denial. | REL-01 |
| Authenticated `local.reference.admin` without Booking permission | Render access denied inside the shell, not blank/404/empty list. | REL-01, SEC-03 |
| Missing actor | Fail closed before or at booking-service; do not retry as another subject. | SEC-04, REL-02 |
| identity-service timeout/unavailable | Fail closed with clear denied/error state and correlation id. | SEC-04, REL-02 |
| Deny UI recovery | Provide keyboard-reachable request-access and back/home actions. | REL-03 |
| Runtime startup blocker | Record W2-01 blocker with dependency and observed failure; do not claim PASS from tests. | REL-04 |

## Retry and Fallback Policy

- No automatic authorization retry loop after deny.
- No retry as `local-user` or any alternate subject.
- No fake empty Booking list, hidden success, or shell-only allow.
- Manual safe navigation to request access or back/home is the recovery path.

## Health and Evidence Design

U03 evidence distinguishes:

- Authenticated `local.reference.admin` session.
- Requested Booking resource/action.
- identity-service deny, timeout/error, or missing-actor branch.
- 403/access denied mapping.
- In-shell denied UI render with safe recovery actions.
- Correlation id and QA-safe decision reference.

## Accessibility Reliability

- Denied page/state has one visible `h1`.
- Request-access and back/home actions are keyboard reachable.
- Deny explanation states authenticated-but-unauthorized without leaking policy internals.
- Correlation/decision reference text wraps or truncates without overlap on mobile and desktop.

## Operational Notes

Keep W1's live-proof waiver explicit as BLOCKED at `compose-start`; U03 must not rewrite deny proof or W2-01 runtime evidence into a real W1 PASS. U03 reliability work must also preserve W0-01 platform/eventing, W0-02 reference-data, W1-01 Booking, and W2-02 design-system foundation boundaries rather than modifying prior merged work to make the deny path easier.

