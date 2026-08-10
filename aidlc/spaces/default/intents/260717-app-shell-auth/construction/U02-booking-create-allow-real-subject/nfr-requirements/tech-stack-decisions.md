# Tech Stack Decisions - U02 Booking Create Allow

## Source Context

These decisions consume U02 `business-logic-model.md`, U02 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U02 keeps the approved brownfield stack and adds no new platform.

## Locked Choices

| Area | Decision | Rationale |
| --- | --- | --- |
| Shell/create UI | Next.js App Router, React 18.3.1, TypeScript 5.7.2. | Existing frontend stack and NFR-07. |
| Booking create/detail | Existing Booking UI/BFF and Java/Spring booking-service. | Preserve W1 behavior. |
| Authorization | identity-service `/internal/identity/authorize`. | Required by ADR-005 and FR-06. |
| Seeds/catalog | Existing local seed/identity catalog mechanism, extended for Booking permissions and `local.booking.user`. | Deterministic live proof without new auth service. |
| Runtime | Docker Compose with Nginx and Keycloak. | Required W2-01 acceptance target. |
| Tests | Vitest/Testing Library, Maven tests, live Compose proof. | Existing repo tooling. |

## Prohibited Choices

- No Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js.
- No new authorization service, micro-frontend platform, or public-cloud dependency.
- No browser raw-token handling.
- No hardcoded `local-user` write path.
- No broad redesign of Booking domain, W0-01 platform/eventing, W0-02 reference-data, or W2-02 design-system foundation.

## Configuration Decisions

| Configuration | Requirement |
| --- | --- |
| Booking permissions | Add or verify `booking:read` and `booking:create`, plus preserved action permissions if used. |
| `local.booking.user` | Deterministic allow subject with `booking-desk` access. |
| `local.reference.admin` | Must remain deny subject without Booking permissions. |
| Service tokens | Continue environment-based service identity; never hardcode. |
