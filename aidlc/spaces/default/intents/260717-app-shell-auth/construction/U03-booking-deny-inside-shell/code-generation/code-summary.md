# Code Summary - U03 Booking Deny Inside Shell

## Files Created

| Path | Purpose |
| --- | --- |
| `apps/shell/app/AccessDeniedPanel.tsx` | In-shell authenticated access-denied state with subject, resource/action, correlation id, request-access action, and back action. |
| `apps/shell/app/AccessDeniedPanel.test.tsx` | Denied panel rendering and request-access link coverage. |

## Files Modified

| Path | Change |
| --- | --- |
| `apps/auth/lib/auth-server.ts` | Added allowlisted local subject selection for `local.reference.admin` while preserving default `local.booking.user`. |
| `apps/auth/app/api/auth/sign-in/route.ts` | Local auth bypass can request an allowlisted `subjectId` for deterministic live proof. |
| `apps/auth/lib/auth-server.test.ts` | Added local subject allowlist coverage. |
| `apps/auth/package.json` | Aligned auth app test script with workspace Vitest runner. |
| `apps/booking/lib/bookings.ts` | Preserves 403 deny status and replaces backend `local-correlation` fallback with BFF correlation id. |
| `apps/booking/lib/bookings.test.ts` | Added 403 deny/correlation mapping test for `local.reference.admin`. |
| `apps/shell/app/booking/page.tsx` | Maps Booking list 403 responses to in-shell denied UI instead of generic unavailable/empty state. |
| `apps/shell/app/booking/[bookingId]/page.tsx` | Maps Booking detail 403 responses to in-shell denied UI. |
| `apps/shell/app/shell.css` | Added denied-state styling and responsive fact grid. |
| `yarn.lock` | Updated auth app dependency/test metadata. |

## Key Decisions

- U03 uses real backend denial: shell renders `AccessDeniedPanel` only from 403 responses returned through the Booking BFF/backend path.
- Local subject selection is allowlisted and only used by the existing local bypass sign-in path; the default remains `local.booking.user`.
- `local.reference.admin` remains without Booking permissions through U02 identity catalog/seed tests; U03 does not grant it Booking access.

## Test Coverage Summary

| Check | Result |
| --- | --- |
| `yarn workspace @erp/app-auth test` | PASS - 11 tests. |
| `yarn workspace @erp/app-auth typecheck` | PASS. |
| `yarn workspace @erp/app-booking test` | PASS - 20 tests. |
| `yarn workspace @erp/app-booking typecheck` | PASS. |
| `yarn workspace @erp/app-booking lint` | PASS; Next.js deprecation/plugin warnings only. |
| `yarn workspace @erp/app-shell test` | PASS - 11 tests. |
| `yarn workspace @erp/app-shell typecheck` | PASS. |
| `yarn workspace @erp/app-shell build` | PASS; Next.js emitted existing ESLint-plugin warning only. |
| `yarn workspace @erp/app-shell lint` | PASS; Next.js deprecation/plugin warnings only. |
| `mvn -f services/pom.xml -pl identity-service/domain-core,identity-service/application-service,booking-service/container -am "-Dtest=AuthorizationPolicyEvaluatorTest,IdentityApplicationServiceTest,HttpIdentityAuthorizationAdapterTest,BookingApiControllerTest" "-Dsurefire.failIfNoSpecifiedTests=false" test` | PASS - targeted identity and booking deny/authorization tests; reactor build success. |
| `docker compose config --quiet` | PASS. |

## Deviations From Plan

- U03 implementation ran inline because the subagent thread limit remained reached. This is recorded in the shared code-generation memory.
- Denied create POST currently returns a form-level error from the shell create form rather than replacing the form with the full denied panel; `/booking` and `/booking/[id]` render the explicit denied shell state. Build/Test live proof should use `/booking` for the U03 denial acceptance path.

## Remaining Risks

- Live Compose/Nginx proof for `local.reference.admin` has not been run in this code-generation stage.
- Backend deny payload still uses the existing safe message `booking command denied`; identity reason/decision id is not exposed through booking-service yet. U06 evidence can use identity-service logs/audit for decision detail.
- W1's live-proof waiver remains BLOCKED at `compose-start`; U03 did not rewrite prior W1 status.

## Review

Verdict: READY

Findings:

1. U03 implements an authenticated denied path inside shell chrome and avoids the invalid substitutes called out by design: hidden route, empty list, fake success, or `local-user` fallback.
2. The deny fixture is preserved. Existing identity tests prove `local.reference.admin` is denied for Booking while `local.booking.user` remains the allow subject.
3. The UI is scoped and accessible enough for code generation: visible denied heading, subject/resource/action/correlation facts, request-access link, back action, and stable responsive layout.
4. Prior-work boundaries remain intact; no W0/W1/W2-02 redesign, no new runtime service, no prohibited frontend library, and W1 waiver remains BLOCKED.
5. Verification is adequate for code generation; live Nginx/Keycloak evidence remains for Build and Test.

Required changes: none before the next code-generation unit.

