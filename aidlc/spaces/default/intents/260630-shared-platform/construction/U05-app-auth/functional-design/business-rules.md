# Business Rules - U05 Auth Frontend App and BFF

## Source Trace

These U05 business rules trace to `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

## Authentication Boundary Rules

BR-U05-001: `apps/auth` must delegate user authentication to Keycloak 24.

BR-U05-002: `apps/auth` must not store passwords or implement a custom authentication provider.

BR-U05-003: OIDC code exchange, token validation, refresh handling, and logout coordination must happen server-side in BFF route handlers or server utilities.

BR-U05-004: Browser JavaScript must never receive access tokens, refresh tokens, id tokens, PKCE verifier, nonce secrets, or raw sensitive claims.

BR-U05-005: Session cookies must be HttpOnly and configured with secure same-site behavior appropriate to the environment.

BR-U05-006: The app must validate OIDC state and nonce on callback before creating a session.

## Session and Authorization Rules

BR-U05-007: Current-session responses must expose only a session-safe summary.

BR-U05-008: Role and permission summaries must come from `identity-service` rather than duplicated frontend constants.

BR-U05-009: A user authenticated by Keycloak but denied by platform authorization must see access denied or request-access behavior, not a broken route.

BR-U05-010: Route protection through `proxy.ts` must redirect unauthenticated requests to sign-in with a validated return URL.

BR-U05-011: Route protection must not replace backend authorization checks.

BR-U05-012: Sign-out must clear the application session even when Keycloak logout redirect cannot be completed.

## Request Access Rules

BR-U05-013: Request-access submissions must include current safe subject context, requested resource/action where known, user message where supplied, and correlation id.

BR-U05-014: Request-access must not grant permissions automatically.

BR-U05-015: Full permission-review administration screens are out of U05 MVP scope unless a later workflow explicitly adds them.

## Error and UX Rules

BR-U05-016: Auth failures must return safe user-readable messages and correlation ids.

BR-U05-017: Error pages must not expose token contents, client secrets, raw provider errors, stack traces, or internal URLs.

BR-U05-018: Access-denied pages must identify the denied application/resource enough for support without disclosing sensitive policy internals.

BR-U05-019: The app must meet WCAG 2.1 AA expectations for sign-in, sign-out, access denied, session display, and request-access paths.

BR-U05-020: Auth routes must preserve safe return URL behavior without open redirects.

## Technical Environment Rules

BR-U05-021: `apps/auth` must use Next.js App Router, TypeScript strict mode, Yarn, Tailwind, TanStack Query where needed, Zustand only for bounded UI state, React Hook Form and Zod for request-access form validation, Axios through `@erp/api-core`, and `@erp/ui`.

BR-U05-022: The app must not introduce npm, pnpm, Redux Toolkit, SWR, CSS Modules, Styled Components, Emotion, jQuery, or Moment.js.

BR-U05-023: Backend calls from browser-visible code must go through BFF route handlers.

BR-U05-024: Correlation ids must be generated or propagated across BFF calls, logs, errors, and support-visible denied states.

## Scope Rules

BR-U05-025: U05 must not implement customer-facing shipper/BCO identity.

BR-U05-026: U05 must not implement reference-data admin workflows beyond redirects/links needed for auth and access denied behavior.

BR-U05-027: U05 must not implement Charge, Booking, or Container Movement routes, screens, or runtime clients.
