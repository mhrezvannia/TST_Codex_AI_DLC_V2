# Build Instructions — W2-03 Charge Tariffs and Agreements

## Inputs and build boundary

These instructions consume each unit's `code-generation-plan` and
`code-summary` artifacts for
`U01-rate-authority`, `U02-charge-domain-routing-bff`,
`U03-agreement-authority`, `U04-pricing-provider-manual-cases`,
`U05-booking-consumption-repricing`, and
`U06-isolated-acceptance-preservation`, together with each unit's
`nfr-requirements/` artifacts. The indexed architecture identifies the Charge
and Booking Java reactors, Charge and Booking Next applications, Identity and
Reference Data dependencies, and the Booking-to-Charge pricing boundary.

The build is evidence-preserving: unavailable Docker, browser, esbuild, Maven
artifact, security-tool, or native-writer capabilities are recorded as
`BLOCKED`; malformed source or a command that executes and fails is `FAIL`.
No blocked check is replaced with a weaker pass.

## Reproducible commands

Run from the workspace root:

1. `npm run contracts:validate`
2. `npm run contracts:verify`
3. `npm --workspace @erp/app-charge-agreements run typecheck`
4. `npm --workspace @erp/app-charge-agreements run lint`
5. `npm --workspace @erp/app-booking run typecheck`
6. `npm --workspace @erp/app-booking run lint`
7. `mvn -f services/charge-agreement-service/pom.xml test`
8. Attempt the Booking Maven reactor only when the approved Resilience4j
   2.2.0 artifacts are locally resolvable; do not substitute compile-only
   stubs for a production build claim.
9. Parse every U06 entry point, module, and test with `node --check`.
10. Run `git diff --check` as a scoped hygiene check; line-ending conversion
    notices are informational unless they expose malformed content.

## Acceptance and failure handling

A build PASS requires the invoked compiler/build command to exit zero. A
Docker/Testcontainers skip is reported separately from the reactor result.
Frontend production builds and Vitest are attempted at most once when the
known esbuild process restriction has not already been reconfirmed in this
stage. The manager demo on port 8088 is never mutated; Wave A live commands use
only the project wrapper and are not run after a failed pre-guard.
