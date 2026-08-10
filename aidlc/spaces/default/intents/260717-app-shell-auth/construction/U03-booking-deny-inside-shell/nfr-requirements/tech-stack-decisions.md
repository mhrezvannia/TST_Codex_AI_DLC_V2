# Tech Stack Decisions - U03 Booking Deny

## Source Context

These decisions consume U03 `business-logic-model.md`, U03 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U03 uses existing shell, Booking BFF, booking-service, and identity-service stack.

## Locked Choices

| Area | Decision | Rationale |
| --- | --- | --- |
| Denied UI | Next.js App Router, React, TypeScript in `apps/shell`. | Existing frontend stack and NFR-07. |
| Authorization | identity-service `/internal/identity/authorize` through booking-service adapter. | Required real-subject deny evidence. |
| Deny fixture | Existing/local seed mechanism preserving `local.reference.admin` without Booking permissions. | Deterministic deny proof. |
| Runtime | Local Docker Compose through Nginx/Keycloak. | W2-01 acceptance target. |
| Tests | Vitest/Testing Library, backend tests, live proof. | Existing tooling. |

## Prohibited Choices

- No Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js.
- No shell-only authorization as the source of truth.
- No new role-admin UI or policy-management product.
- No empty-list substitution for access denied.
- No W1 waiver PASS rewrite.

## Configuration Decisions

| Configuration | Requirement |
| --- | --- |
| `local.reference.admin` | Authenticated local subject, no Booking permissions. |
| Deny mapping | Resource `booking`, action `read` or requested action, scope where available. |
| Correlation id | Present in deny evidence and UI/error reference. |
