# Build and Test Summary

## Inputs

This summary consumes all Construction `code-generation-plan.md` and `code-summary.md` artifacts across UOW-01 through UOW-11.

## Status

Overall status: BLOCKED for full local runtime, PASSING for available TypeScript, lint, unit, seed dry-run, offline contracts, and readiness aggregation.

## Test Inventory

- Unit tests: Node script tests and Vitest auth/reference-data tests.
- Integration tests: readiness aggregation, live contracts, seed apply, smoke-local.
- Performance tests: local readiness baseline and BFF/seed/contract timing targets.
- Security tests: auth bypass guard, BFF permission/error mapping, lint.

## Readiness Assessment

- Build-ready frontend: yes.
- Backend test-ready: blocked until Maven/Java are available.
- Local runtime-ready: blocked until Docker Desktop and service ports are available.
- Deployment-ready: not yet; next stages must finish CI/runtime proof.

## Known Limitations

- `mvn` is missing.
- Docker daemon is unavailable.
- Identity, Reference Data, Keycloak, and nginx ports are not listening.
- Yarn workspace `test` scripts cannot resolve `vitest` in this shell, but direct local binary execution works.
