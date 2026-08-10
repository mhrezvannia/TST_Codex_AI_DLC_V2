# Performance Requirements - U03 Booking Deny

## Source Context

These performance requirements consume U03 `business-logic-model.md`, U03 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U03 proves the deny path for `local.reference.admin` through shell, Booking BFF, booking-service, and identity-service.

## Local Acceptance Targets

| ID | Requirement | Measurement |
| --- | --- | --- |
| PERF-01 | Authenticated `/booking` deny flow should render access denied within 3 seconds p95 in local proof, excluding first cold start. | Scenario timestamps. |
| PERF-02 | identity-service deny decision must use a bounded timeout so unauthorized users are not left in indefinite loading. | Code/config review and timeout test. |
| PERF-03 | Denied UI must not trigger repeated polling or unbounded retry loops. | Browser/network trace. |

## Resource Constraints

- Do not add policy-admin UI, cache, or new authorization infrastructure.
- Use existing shell/Booking BFF request flow and identity-service authorization.
- Keep denied UI lightweight and inside the shell frame.

## Evidence

U03 performance evidence records route timing, deny decision timing where available, subject, and correlation id. An empty list or hidden route is not an acceptable performance shortcut.
