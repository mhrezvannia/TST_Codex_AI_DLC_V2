# Code Generation Plan - UOW-08 Seed Apply Through Live APIs

## Scope

Extend the local seed loader from validation-only behavior to live API apply mode while preserving dry-run safety.

## Steps

- [x] Step 1: Add `applySeedPack` to call identity-service and reference-data-service APIs. Traceability: FR-022, FR-023.
- [x] Step 2: Add role-assignment command generation for local users. Traceability: FR-022.
- [x] Step 3: Add reference-data mutation command generation for all seed reference records. Traceability: FR-023.
- [x] Step 4: Implement create/update behavior by checking record detail first, then POST or PUT. Traceability: FR-024.
- [x] Step 5: Extend `--wait` health checks to identity-service and reference-data-service. Traceability: FR-004.
- [x] Step 6: Add Node tests for command generation and fake live API apply mode. Traceability: NFR-003.
- [x] Step 7: Run dry-run and blocked live apply evidence. Traceability: NFR-003.

## Review

READY with runtime caveat: apply mode is implemented and test-covered; live apply is blocked until local services are running.
