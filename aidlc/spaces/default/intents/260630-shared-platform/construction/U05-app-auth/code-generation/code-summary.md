# Code Summary - U05 Auth Frontend App and BFF

## Source Trace

This implementation follows `code-generation-plan.md` and the U05 artifacts: `business-logic-model.md`, `business-rules.md`, `domain-entities.md`, `unit-of-work.md`, and `requirements.md`.

## Files Created or Modified

Shared auth package:

- `packages/auth/src/index.ts`
- `packages/auth/src/index.test.ts`

Auth app BFF and helpers:

- `apps/auth/lib/auth-server.ts`
- `apps/auth/lib/auth-server.test.ts`
- `apps/auth/app/api/auth/sign-in/route.ts`
- `apps/auth/app/api/auth/callback/route.ts`
- `apps/auth/app/api/auth/session/route.ts`
- `apps/auth/app/api/auth/sign-out/route.ts`
- `apps/auth/app/api/auth/request-access/route.ts`

Auth app pages:

- `apps/auth/app/page.tsx`
- `apps/auth/app/sign-in/page.tsx`
- `apps/auth/app/session/page.tsx`
- `apps/auth/app/signed-out/page.tsx`
- `apps/auth/app/access-denied/page.tsx`
- `apps/auth/app/request-access/page.tsx`
- `apps/auth/proxy.ts`

Tests:

- `apps/auth/app/page.test.tsx`
- `apps/auth/app/sign-in/page.test.tsx`
- `apps/auth/app/access-denied/page.test.tsx`
- `apps/auth/app/request-access/page.test.tsx`

AI-DLC records:

- `aidlc/spaces/default/intents/260630-shared-platform/construction/U05-app-auth/code-generation/code-generation-plan.md`
- `aidlc/spaces/default/intents/260630-shared-platform/construction/U05-app-auth/code-generation/code-summary.md`

## Key Implementation Decisions

- Added server-safe auth/session types and helpers in `@erp/auth`.
- Added OIDC sign-in/callback route placeholders that generate state/nonce/PKCE placeholders and use HttpOnly cookies.
- Added a current-session BFF route returning only safe `SessionSummary` data.
- Added sign-out behavior that clears the app session cookie and redirects to Keycloak logout when configured.
- Added access-denied and request-access pages with support-safe reason/correlation context.
- Updated `proxy.ts` to redirect protected routes to sign-in while keeping public/API/static paths accessible.
- Kept token exchange and identity-service calls as local placeholders because real Keycloak/client secret wiring belongs to environment provisioning and later hardening.

## Test Coverage Summary

- Auth helper tests cover safe return URL handling, token-like value redaction, browser-safe session summaries, cookie encoding/decoding, and session extraction.
- Page tests cover sign-in, access-denied, request-access, and home entrypoint behavior.

## Verification Results

- Direct TypeScript checks passed for all frontend/package workspaces.
- `D:\TST_Codex\node_modules\.bin\vitest.cmd run` passed: 9 files, 15 tests.
- `D:\TST_Codex\node_modules\.bin\eslint.cmd apps packages scripts eslint.config.mjs vitest.config.ts` passed.
- `D:\TST_Codex\node_modules\.bin\next.cmd build` in `apps/auth` passed.

## Deviations and Environment Limits

- OIDC code exchange and identity-service effective-permission lookup are placeholders. The implementation preserves the server-side BFF boundary and cookie/session shape without adding real client secrets to source.
- Next build reports a warning that the Next ESLint plugin is not configured in the custom flat ESLint config; standalone ESLint still passes on generated source.

## Scope Guard

U05 did not add password storage, customer identity, full permission-review administration, reference-data admin workflows, or Charge, Booking, or Container Movement routes.
