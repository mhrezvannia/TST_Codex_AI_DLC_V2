# Unit Test Instructions - W2-01 App Shell and Auth

## Upstream Inputs

This file consumes U01-U06 code-generation plans and summaries, especially:
- U01 shell session/actor tests and Booking BFF no-fetch tests.
- U02 shared Booking validation, shell create form, identity authorization adapter tests.
- U03 denied-state component and auth subject-selection tests.
- U04 sign-out, expiry, stale-call fail-closed tests.
- U05 route compatibility helper tests.
- U06 evidence package writer/validator tests.

## Commands

Run the complete fast unit/component suite:
```powershell
yarn workspace @erp/auth test
yarn workspace @erp/shared-types test
yarn workspace @erp/app-auth test
yarn workspace @erp/app-booking test
yarn workspace @erp/app-shell test
node --test scripts/w2-01-live-acceptance.test.mjs
```

Run focused backend unit/controller tests:
```powershell
mvn -f services/pom.xml -pl identity-service/domain-core,identity-service/application-service,booking-service/container -am "-Dtest=AuthorizationPolicyEvaluatorTest,IdentityApplicationServiceTest,HttpIdentityAuthorizationAdapterTest,BookingApiControllerTest,BookingLocalIdentityFilterTest,BookingLocalAuthorizationTest" "-Dsurefire.failIfNoSpecifiedTests=false" test
```

## Coverage Expectations

Comprehensive strategy expectations:
- Session helpers reject expired, malformed, and blank-subject cookies.
- Shell protected route guard redirects unauthenticated/expired users to auth.
- Booking BFF never fetches backend without a session-derived actor.
- `local.booking.user` allows Booking read/create; `local.reference.admin` denies Booking.
- Sign-out adapter delegates and does not clear cookies itself.
- `/bookings*` compatibility helper preserves only allowlisted query state and rejects unsafe ids.
- U06 package writer validates JSON/JSONL shape and blocker linkage.

## Test Data

Use deterministic local subjects:
- Allow: `local.booking.user`.
- Deny: `local.reference.admin`.
- Legacy local fixture retained only where existing W1/local tests require `local-user`.

Avoid real secrets, tokens, or raw cookies in test output.
