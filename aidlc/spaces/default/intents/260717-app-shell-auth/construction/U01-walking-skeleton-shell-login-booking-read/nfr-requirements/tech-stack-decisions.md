# Tech Stack Decisions - U01 Walking Skeleton

## Source Context

These decisions consume U01 `business-logic-model.md`, U01 `business-rules.md`, `requirements.md`, and `technology-stack.md`. The brownfield stack is already established and U01 must use it.

## Locked Choices

| Area | Decision | Rationale |
| --- | --- | --- |
| Shell app | Next.js App Router, React 18.3.1, TypeScript 5.7.2 in the Yarn workspace. | Matches `technology-stack.md` and W2-01 application design. |
| Auth/session | Existing `apps/auth`, Keycloak 24, `packages/auth`, HttpOnly `lc_session`. | Reuse existing auth and avoid parallel identity mechanisms. |
| Booking BFF | Existing `apps/booking` BFF/read helpers adapted for session-derived actor. | Centralizes `serviceHeaders` change and preserves W1 behavior. |
| Backend | Existing Java/Spring booking-service. | Preserve service ownership and domain boundaries. |
| Runtime | Local Docker Compose with Nginx edge. | Required by W2-01 acceptance and team practices. |
| Tests | Vitest/Testing Library for frontend, Maven tests for backend, live Compose proof for acceptance. | Matches repo tooling and comprehensive test strategy. |

## Prohibited Choices

- Do not introduce Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js.
- Do not introduce AWS/cloud infrastructure, CDK, IAM, or VPC work for U01.
- Do not introduce micro-frontend/module federation.
- Do not store tokens in browser local storage or session storage.
- Do not use hardcoded `local-user` for protected shell/Booking paths.

## Configuration Decisions

| Configuration | Requirement |
| --- | --- |
| `BOOKING_SERVICE_URL` | Continue using environment configuration; default may remain local Compose service URL. |
| `BOOKING_SERVICE_TOKEN` | Required for service identity; never hardcode in source. |
| Auth bypass flag | If retained, profile-gated and unavailable as implicit protected-path `local-user` proof. |
| Correlation id | Preserve incoming `X-Correlation-Id` or create one per request using existing project helper/pattern. |

## Decision Impact

U01 should be implementable without adding dependencies to root `package.json` or new runtime services. Any proposed dependency must be treated as a scope change unless it is already present in the workspace and needed to consume existing patterns.
