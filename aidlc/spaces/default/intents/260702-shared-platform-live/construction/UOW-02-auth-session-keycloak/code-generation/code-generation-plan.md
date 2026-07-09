# Code Generation Plan - UOW-02 Auth Session and Keycloak Local Flow

## Scope

Connect existing local auth bypass behavior to Reference Data BFF permission evaluation without expanding the auth app in this pass.

## Steps

- [x] Step 1: Reuse the existing `AUTH_BYPASS=true` local convention in Reference Data permissions. Traceability: FR-010, FR-014.
- [x] Step 2: Add a Reference Data specific `REFERENCE_DATA_AUTH_BYPASS=true` guard for local development. Traceability: FR-014, US-005.
- [x] Step 3: Disable the bypass automatically when `NODE_ENV=production`. Traceability: ADR-007.
- [x] Step 4: Add unit tests for local bypass permission behavior. Traceability: NFR-001.
- [ ] Step 5: Complete Keycloak browser sign-in proof after Keycloak is listening locally on `8080`. Traceability: FR-010, FR-011.

## Review

READY with runtime caveat: local bypass is test-covered, but Keycloak end-to-end sign-in remains blocked by missing local service runtime.
