# Code Generation Plan - UOW-05 Reference Data BFF Service Clients and Error Mapping

## Scope

Replace static Reference Data BFF route behavior with service clients and UI-shaped responses.

## Steps

- [x] Step 1: Create a BFF service-client module for identity-service and reference-data-service. Traceability: ADR-001, FR-013.
- [x] Step 2: Add correlation-id generation and propagation. Traceability: NFR-006.
- [x] Step 3: Replace `/api/reference-sets` static response with backend catalog and permission calls. Traceability: FR-015.
- [x] Step 4: Replace list/detail/history routes with reference-data-service calls. Traceability: FR-015, FR-020.
- [x] Step 5: Replace create/update fake acceptance with real service calls or explicit authorization/service errors. Traceability: FR-016, FR-017.
- [x] Step 6: Add service-client unit tests for bypass, normalization, and mutation command construction. Traceability: NFR-003.
- [x] Step 7: Run TypeScript validation for `apps-reference-data`. Traceability: NFR-003.

## Review

READY for B01: BFF routes now use real service boundaries and fail loudly when local services are unavailable.
