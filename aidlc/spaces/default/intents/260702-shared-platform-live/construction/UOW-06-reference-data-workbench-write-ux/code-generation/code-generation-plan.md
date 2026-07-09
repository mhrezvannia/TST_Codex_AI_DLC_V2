# Code Generation Plan - UOW-06 Reference Data Workbench Write UX

## Scope

Replace the static/view-only Reference Data mock with a permission-aware client workbench that uses BFF APIs.

## Steps

- [x] Step 1: Add a client workbench component for live BFF loading. Traceability: US-006, US-007.
- [x] Step 2: Show permission state and enable create/edit controls only when `canWrite` is true. Traceability: US-008, FR-013.
- [x] Step 3: Add create/edit draft forms with client validation attributes and BFF submission. Traceability: US-009, FR-016, FR-017.
- [x] Step 4: Preserve fallback local data and contract catalog visibility when backend services are unavailable. Traceability: NFR-001.
- [x] Step 5: Add status/error feedback for failed service calls. Traceability: US-010.
- [x] Step 6: Add component tests for rendering, enabled mutations, and BFF create submission. Traceability: NFR-003.
- [x] Step 7: Run TypeScript, tests, and lint for the Reference Data app. Traceability: NFR-003.

## Review

READY: the Reference Data UI is no longer view-only when write permissions are available.
