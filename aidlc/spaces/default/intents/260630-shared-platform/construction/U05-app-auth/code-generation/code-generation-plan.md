# Code Generation Plan - U05 Auth Frontend App and BFF

## Source Trace

This plan implements U05 from `business-logic-model.md`, `business-rules.md`, `domain-entities.md`, `unit-of-work.md`, `unit-of-work-story-map.md`, and `requirements.md`.

U05 expands `apps/auth` and shared auth packages. It owns the internal carrier auth entrypoint, BFF session surface, access-denied view, sign-out flow, and request-access capture. It must not authenticate users itself, store passwords, expose tokens to browser JavaScript, build customer-facing identity, or implement full permission-review administration.

## Implementation Steps

- [x] Step 1: Extend `@erp/auth` with auth/session domain types and server-safe helpers.
  - Traceability: US-001, US-002, US-003, US-004; BR-U05-003 through BR-U05-008.
  - Add `AuthSession`, `OidcTransaction`, `SessionSummary`, `AccessDeniedContext`, `RequestAccessSubmission`, and `AuthError` types.
  - Add helpers for correlation ids, safe return URL validation, transient OIDC state shape, and token redaction.

- [x] Step 2: Add app-level auth configuration.
  - Traceability: BR-U05-001 through BR-U05-006, BR-U05-021.
  - Add server-only config for Keycloak issuer/client/redirect URLs, identity-service URL, session cookie names, and local defaults.
  - Keep secrets in environment variables or future Vault references; do not add client secrets to browser code.

- [x] Step 3: Implement sign-in BFF route.
  - Traceability: US-001; BR-U05-001 through BR-U05-006, BR-U05-020.
  - Add route handler that validates return URL, creates state/nonce/PKCE placeholder values, sets secure HttpOnly transient cookie, and redirects to Keycloak authorization endpoint.

- [x] Step 4: Implement callback BFF route.
  - Traceability: US-001, US-004; BR-U05-003 through BR-U05-008.
  - Validate state/nonce placeholder, perform server-side code exchange placeholder, call identity-service effective permissions placeholder, create HttpOnly app session cookie, and redirect safely.

- [x] Step 5: Implement current-session BFF route.
  - Traceability: US-004; BR-U05-007, BR-U05-008, BR-U05-023.
  - Return only safe `SessionSummary`; never return raw tokens, refresh tokens, id tokens, nonce, PKCE verifier, or raw claims.

- [x] Step 6: Implement sign-out BFF route and signed-out page.
  - Traceability: US-002; BR-U05-012.
  - Clear application session cookie and build Keycloak logout redirect when configured.

- [x] Step 7: Implement access-denied and request-access routes.
  - Traceability: US-003; BR-U05-009, BR-U05-013 through BR-U05-019.
  - Render safe reason/correlation id and request-access action.
  - Add BFF route/form handling that records or echoes request context without granting permissions.

- [x] Step 8: Strengthen `proxy.ts` route protection.
  - Traceability: BR-U05-010, BR-U05-011.
  - Redirect unauthenticated protected routes to sign-in with validated return URL while leaving API/static routes safe.

- [x] Step 9: Add accessible UI components/pages.
  - Traceability: BR-U05-016 through BR-U05-019.
  - Add sign-in, session, signed-out, access-denied, and request-access views with semantic labels, visible actions, and `data-testid` on interactive elements.

- [x] Step 10: Add tests.
  - Traceability: Standard test strategy.
  - Add unit tests for safe return URL, token redaction, session summary safety, request-access validation, access-denied rendering, sign-in page rendering, and proxy/route helpers where feasible.

- [x] Step 11: Run verification.
  - Traceability: U05 NFRs and frontend standard strategy.
  - Run direct TypeScript checks, Vitest, ESLint, and `next build` for `apps/auth`.
  - Record any environment limitations.

## Test Strategy

The active strategy is Standard. U05 must include frontend/package unit tests and route-helper tests. Build and Test may add broader E2E coverage later, but U05 must not defer core test files.

## Approval

This plan is ready for review before `apps/auth` implementation.
