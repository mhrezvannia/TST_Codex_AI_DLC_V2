# Technology Stack Decisions — booking-design-system-closure

## Decision Basis

The stack must implement `business-logic-model.md` and `business-rules.md`, satisfy `requirements.md`, and preserve the versions/topology inventoried in `technology-stack.md`. This is a brownfield closure; technology selection is predominantly retention and explicit non-selection.

## Retained Application Stack

| Area | Decision | Rationale/gate |
|---|---|---|
| Workspace/package manager | Yarn 4.5.3 and Turbo 2.3.3 | Existing pinned workspace; no npm/pnpm migration |
| Frontend language/framework | TypeScript 5.7.2, Next.js 15.1.3 App Router, React/React DOM 18.3.1 | Existing shared shell/apps; strict typed route/component work |
| Shared UI | Existing `@erp/ui` ESM package and `--erp-*` tokens | Sole token/primitive owner; no second library/theme |
| Unit/component tests | Vitest 2.1.8, Vite 5.4.11, jsdom 25.0.1, Testing Library | Existing focused test stack |
| Browser/live proof | Existing `@playwright/test` 1.61.1 | Canonical route, keyboard, state, theme, viewport, trace/screenshots |
| Static checks | ESLint 9.17.0 and typescript-eslint 8.19.1 | Extend existing anti-drift behavior rather than add a parallel linter |
| Backend/runtime | Existing Java 21, Spring Boot 3.3.7, PostgreSQL, Kafka/Schema Registry, Keycloak | No W2-02 backend/runtime redesign |
| Local orchestration | Docker Compose through `scripts/wave-a-compose.mjs`, project `linercore-wave-a`, nginx edge | Required isolated acceptance path |

## Accessibility Test Decision

The workspace declares Playwright but no direct axe integration was found. The severity gate requires zero critical/serious violations. During code generation:

1. First verify whether an existing executable project checker exposes rule severity.
2. If not, add a pinned **dev-only** Playwright-compatible axe integration (for example `@axe-core/playwright`) to the root test toolchain.
3. Keep it out of all production app bundles and runtime imports.
4. Record the exact installed version from the resulting manifest/lockfile rather than inventing one here.
5. Combine automated results with the named manual keyboard/focus/announcement/reduced-motion checks; neither substitutes for the other.

An unavailable checker is a failed/pending evidence gate, not permission to label semantic assertions as “zero serious/critical.”

## Rejected Additions

- No micro-frontend host, second Next.js app, global client-state library, alternate component library, CSS-in-JS/theme engine, remote font, charting/dashboard package, or marketing/gateway framework.
- No new service, database, cache, queue, API gateway, AWS resource, IaC stack, production environment, or deployment platform.
- No k6/Locust/load-testing program because no capacity target exists.
- No SAST/DAST/dependency/SBOM/compliance platform claim unless separately installed, configured, and evidenced.
- ui-ux-pro-max Enterprise Gateway, hero/CTA, alternate blue/amber palette, Fira fonts, and spinners are rejected; data density, filtering, visible focus, reduced motion, and responsive checks are retained.

## Dependency and Build Constraints

- Application code imports shared packages only; app-to-app imports are forbidden.
- Any generic primitive correction lives in `packages/ui`; Booking-specific compositions remain in `apps/shell/app/booking/**`.
- Standalone `apps/booking` presentation redirects while its API/BFF dependencies remain.
- Test-only helpers and accessibility tooling are never imported by production source.
- Manifest/lockfile changes receive focused tests, Yarn install resolution, lint, typecheck, tests, and production build validation.
- No dependency version is refreshed solely because `technology-stack.md` records an older baseline; changes require a demonstrated closure need.

## Decision Consequences

Retaining the stack minimizes blast radius, respects baseline `c2f13dd`, and makes acceptance reproducible with installed repository tooling. The tradeoff is that W2-02 cannot claim production-scale, scanner, cloud, or compliance capabilities the repository does not execute. Those omissions remain truthful explicit boundaries.

