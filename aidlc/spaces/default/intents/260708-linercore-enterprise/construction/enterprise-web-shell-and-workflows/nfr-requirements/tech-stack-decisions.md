# Tech Stack Decisions - enterprise-web-shell-and-workflows

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

The UI stack is integrated, typed, API-backed, and visual-baseline-aware without copying prototype business logic.

## Selected Stack

| Area | Decision | Rationale |
|---|---|---|
| App shell | New integrated Next.js `enterprise-web` | Required for unified enterprise workflows. |
| UI runtime | React 18 and TypeScript 5 | Matches existing frontend stack. |
| Data access | OpenAPI/typed clients, Axios, React Query where useful | Keeps UI service-backed and cache-aware. |
| Shared packages | Reuse `@erp/ui`, `@erp/auth`, `@erp/api-core`, config/types/transformers/utils where valid | Preserves existing foundations. |
| Visual baseline | Claude UI export as visual/UX baseline only | Meets FR-UI while rejecting prototype business logic. |
| Testing | Vitest, React Testing Library, UI/E2E tests | Matches stack and test strategy. |

## Deferred Choices

| Deferred item | Reason |
|---|---|
| Frontend-owned business rules | Violates ownership. |
| Mock screens as readiness | Violates no-fake-completion. |
| Keeping only separate module apps | Does not satisfy integrated enterprise workflow requirement. |

## Traceability

| Source | Tech-stack coverage |
|---|---|
| `business-logic-model.md` | Defines shell, routing, API/BFF, evidence, and exception workflows. |
| `business-rules.md` | Defines UI ownership and prototype boundaries. |
| `requirements.md` | Supplies FR-UI and E2E workflow requirements. |
| `technology-stack.md` | Supplies Next.js, React, TypeScript, Vite/Vitest, React Testing Library, Axios, React Query, Zustand, and shared packages. |
| `nfr-requirements-questions.md` | Q5 selects the integrated frontend stack posture. |
