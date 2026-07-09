# Code Generation Plan - UOW-04 Reference Data Service Persistence and Mutation Core

## Scope

Route BFF list/detail/create/update/history traffic to reference-data-service now; defer Java persistence changes until the backend toolchain is available.

## Steps

- [x] Step 1: Add BFF client calls to `/reference-sets`, `/reference-sets/{set}/records`, `/reference-sets/{set}/records/{id}`, and history endpoints. Traceability: FR-015 through FR-021.
- [x] Step 2: Normalize backend value-object records into UI-safe BFF payloads. Traceability: US-006, US-007.
- [x] Step 3: Map upstream failures to explicit BFF errors with correlation ids. Traceability: NFR-001, NFR-006.
- [x] Step 4: Forward create/update mutation commands to reference-data-service. Traceability: FR-016, FR-017.
- [ ] Step 5: Add PostgreSQL-backed Java repositories for records and history. Traceability: FR-005 through FR-009.
- [ ] Step 6: Add Java unit/integration tests after Java/Maven are available. Traceability: NFR-003.

## Review

PARTIAL for B01: the BFF no longer uses static mutation behavior, but reference-data-service persistence remains next implementation work.
