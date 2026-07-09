# Code Generation Plan - UOW-03 Identity Authorization Integration and Persistence

## Scope

Wire BFF authorization calls to identity-service now; defer durable Java persistence until Java/Maven/Docker are available.

## Steps

- [x] Step 1: Add BFF client call to `/internal/identity/authorize`. Traceability: FR-012, FR-013.
- [x] Step 2: Propagate `X-Correlation-Id` to identity-service. Traceability: NFR-006.
- [x] Step 3: Map identity allow/deny decisions to `canWrite` permission state. Traceability: FR-013.
- [x] Step 4: Map identity-service unavailability to safe BFF `503` errors. Traceability: NFR-001.
- [ ] Step 5: Add durable identity role assignment and audit persistence. Traceability: FR-012, FR-013.
- [ ] Step 6: Add Java service tests after Java/Maven are available. Traceability: NFR-003.

## Review

PARTIAL for B01: BFF integration exists; identity-service persistence remains next implementation work.
