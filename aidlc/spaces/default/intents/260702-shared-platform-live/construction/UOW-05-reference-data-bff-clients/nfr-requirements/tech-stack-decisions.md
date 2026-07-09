# Tech Stack Decisions - UOW-05 Reference Data BFF Clients

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Decisions

| Area | Decision |
| --- | --- |
| Frontend/BFF | Next.js 15 route handlers in `apps/reference-data`. |
| Validation | Zod for BFF input validation. |
| API client | `@erp/api-core`/fetch or axios consistent with repo. |
| Tests | Vitest and Testing Library for route/UI behavior. |

## Rationale

Use the existing TypeScript stack and keep service integration server-side.

