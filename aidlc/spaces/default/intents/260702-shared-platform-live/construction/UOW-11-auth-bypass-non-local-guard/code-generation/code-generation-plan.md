# Code Generation Plan - UOW-11 Auth Bypass Non-Local Guard

## Scope

Make local auth bypass explicit, shared, and impossible to activate in production or non-local runtime profiles.

## Steps

- [x] Step 1: Move bypass profile logic into the shared `@erp/auth` package. Traceability: FR-014, ADR-007.
- [x] Step 2: Update `apps-auth` session logic to use the shared guard. Traceability: US-005.
- [x] Step 3: Update `apps-auth` proxy logic to use the shared guard. Traceability: FR-014.
- [x] Step 4: Update Reference Data BFF local write bypass to use the shared guard with app-specific flags. Traceability: FR-014.
- [x] Step 5: Add shared package tests for local, test, production, and staging runtime profiles. Traceability: NFR-001.
- [x] Step 6: Add app-level tests for auth bypass allowed/denied behavior. Traceability: NFR-003.
- [x] Step 7: Run TypeScript, tests, and lint for affected packages/apps. Traceability: NFR-003.

## Review

READY: bypass behavior is shared and guarded by local runtime profile checks.
