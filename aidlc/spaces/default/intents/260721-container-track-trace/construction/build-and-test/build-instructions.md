# Build Instructions

## Inputs and prerequisites

The build contract is the approved U01/U02/U03 `code-generation-plan.md` and
`code-summary.md` set. It covers the Container Movement service, the Booking
consumer/UI seam, and the `booking.confirmed` / `containermovement.status`
contracts. Use Java 21, Maven, Node.js, and the checked-in Yarn 4.5.3 release.
Do not regenerate dependencies or lockfiles during verification.

Turbo must use a writable workspace-local cache in this sandbox:
`--cache-dir .turbo-cache`. Live Compose is a separate guarded step and must
start with `npm run demo:guard`.

## Build and verification commands

1. Clean backend build and focused tests:
   `mvn -f services/container-movement-service/pom.xml clean test -DskipITs`
2. Cross-service compile/test:
   `mvn -f services/pom.xml test -DskipITs`
3. Booking lint:
   `npm run lint -- --filter=@erp/app-booking --cache-dir .turbo-cache`
4. Booking typecheck:
   `npm run typecheck -- --filter=@erp/app-booking --cache-dir .turbo-cache`
5. Booking production bundle:
   `npm run build -- --filter=@erp/app-booking --cache-dir .turbo-cache`
6. Sandbox-compatible Booking render smoke:
   `node aidlc/spaces/default/intents/260721-container-track-trace/construction/build-and-test/frontend-render-smoke.cjs`
7. Sandbox-compatible Booking interaction smoke:
   `node aidlc/spaces/default/intents/260721-container-track-trace/construction/build-and-test/frontend-interaction-smoke.cjs`
8. Contract catalog and provider shapes:
   `npm run contracts:validate` and `npm run contracts:verify`
9. Whitespace verification:
   `git diff --check`

Build success requires compiled Container Movement and Booking modules, green
contract shapes, and a green Booking typecheck. A sandbox `spawn EPERM` is an
environment blocker, not a product pass; record it exactly.

## Troubleshooting and safety

- Redirect Turbo only to `.turbo-cache`; do not write outside the workspace.
- Do not create an npm lockfile in this Yarn-managed repository.
- Do not start or clean Docker directly. Use `scripts/wave-a-compose.mjs` only
  after `demo:guard` passes.
- Protect the manager demo on port 8088 and preserve W1 BLOCKED/waiver history.
- Do not expand into EDI, public DCSA APIs, fleet, depot, or M&R.
