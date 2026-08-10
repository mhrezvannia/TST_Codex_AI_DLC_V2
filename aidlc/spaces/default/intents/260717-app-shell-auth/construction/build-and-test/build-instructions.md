# Build Instructions - W2-01 App Shell and Auth

## Upstream Inputs

This file consumes the U01-U06 `code-generation-plan.md` and `code-summary.md` artifacts under `aidlc/spaces/default/intents/260717-app-shell-auth/construction/*/code-generation/`.

Relevant implementation surfaces:
- U01: `apps/shell`, shared auth helpers, shell-to-Booking BFF, Compose/Nginx shell routing.
- U02: shell Booking create/detail, shared Booking validation, identity-service authorization adapter.
- U03: in-shell Booking denied state for `local.reference.admin`.
- U04: sign-out route adapter, `/signed-out`, expired/stale session fail-closed behavior.
- U05: `/bookings*` compatibility routes and Nginx forwarding.
- U06: W2-01 evidence package writer/validator.

## Environment Setup

Prerequisites:
- Node/Yarn workspace dependencies are installed via Yarn 4.
- Java/Maven are available for `services/pom.xml`.
- Docker Compose is available for config validation and live runtime proof.
- Local entrypoint for live proof is `http://127.0.0.1:8088`.

Recommended environment:
```powershell
$env:AUTH_BYPASS = "true"
$env:APP_ENV = "local"
$env:AUTH_LOCAL_SUBJECT_ID = "local.booking.user"
```

Do not place raw tokens, service tokens, cookies, or `lc_session` values into evidence files.

## Build Commands

Frontend/package build and compile checks:
```powershell
yarn workspace @erp/auth typecheck
yarn workspace @erp/shared-types typecheck
yarn workspace @erp/app-auth typecheck
yarn workspace @erp/app-booking typecheck
yarn workspace @erp/app-shell typecheck
yarn workspace @erp/app-shell build
```

Backend compile and targeted tests:
```powershell
mvn -f services/pom.xml -pl identity-service/domain-core,identity-service/application-service,booking-service/container -am "-Dtest=AuthorizationPolicyEvaluatorTest,IdentityApplicationServiceTest,HttpIdentityAuthorizationAdapterTest,BookingApiControllerTest,BookingLocalIdentityFilterTest,BookingLocalAuthorizationTest" "-Dsurefire.failIfNoSpecifiedTests=false" test
```

Compose verification:
```powershell
docker compose config --quiet
docker compose --profile full up -d --build
```

## Build Verification

Build is considered code-build ready when:
- All workspace type-check commands exit 0.
- `@erp/app-shell` production build exits 0.
- Targeted Maven reactor exits 0.
- `docker compose config --quiet` exits 0.
- Compose startup either succeeds and live proof proceeds, or a concrete W2-01 blocker is recorded separately from the W1 `compose-start` waiver.

## Troubleshooting

- PowerShell requires quoted comma-separated Maven properties: `"-Dtest=A,B"`.
- Run Maven from the workspace root with `-f services/pom.xml` or from `services/` with `-pl booking-service/container -am`.
- Next.js may emit the known `next lint` deprecation and missing Next ESLint plugin warnings; those are warnings unless new lint errors appear.
- If Compose cannot start because of Docker daemon, image pull, disk, or network failures, record `BLOCKED` with command, observed failure, owner, and next action.
