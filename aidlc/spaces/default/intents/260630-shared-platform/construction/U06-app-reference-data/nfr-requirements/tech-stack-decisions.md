# Tech Stack Decisions - U06 Reference Data App

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines `apps/reference-data`, BFF route handlers, identity-service/reference-data-service calls, RHF/Zod validation, event status/history, and responsive read-only behavior. `business-rules.md` mandates BFF-only access, React Hook Form, Zod, shared `@erp/*` packages, accessible status, and no downstream screens. `requirements.md` fixes Next.js App Router, React, TypeScript strict mode, Turborepo, Yarn, Tailwind, TanStack Query, Zustand, Axios through `@erp/api-core`, and `@erp/ui`.

## Decision Summary

U06 uses the approved frontend stack and BFF pattern. It consumes backend contracts and shared packages rather than owning backend domain rules.

## Stack Decisions

| Concern | Selection | Rationale |
|---|---|---|
| Framework | Next.js App Router and React | Mandated app platform. |
| Language | TypeScript strict mode | Required frontend maintainability. |
| Package manager | Yarn with Turborepo | Mandated workspace toolchain. |
| Styling/UI | Tailwind and `@erp/ui` | Approved UI stack. |
| Forms | React Hook Form and Zod | Required for draft preservation and validation mapping. |
| Server data | TanStack Query | Approved query/caching layer for BFF data. |
| UI state | Zustand for bounded UI state only | Avoids duplicating backend authorization/domain state. |
| HTTP | Axios through `@erp/api-core` | Centralized error envelope/correlation behavior. |

## Rejected Alternatives

| Alternative | Rejection reason |
|---|---|
| Direct browser-to-service calls | Violates BFF/security model. |
| Generic metadata editor | Bypasses aggregate-specific validation and UX. |
| Full mobile create/edit parity | Out of MVP scope. |
| Downstream module screens | Out of workflow scope. |
| Prohibited frontend libraries/package managers | Violates project constraints. |

## Implementation Guidance for Later Units

- U07 supplies contract/developer views that U06 may display.
- U08 gates TypeScript, lint, tests, and accessibility-relevant checks.
- U10 consumes BFF/app logs, health, and correlation evidence.

