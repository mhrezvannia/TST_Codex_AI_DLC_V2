# Code Generation Plan - U03 Authorized Degraded Journey Access

This plan implements the approved U03 authorization, degraded freshness, and
observable isolation contracts using existing service boundaries.

- [x] Step 1: Inventory AuthorizationPort, Identity/Reference Data adapters, CMM read/capture routes, DTO unions, repositories, and tests.
- [x] Step 2: Implement authorization-first application ordering for list/detail/booking-reference/capture and exact 403/503/404 safe response envelopes.
- [x] Step 3: Implement truthful `fresh`/`last-known` DTO mapping, persisted `dataUpdatedAt`, checked time, disabled capture reasons, timeout/redaction behavior, and zero-row write sets.
- [x] Step 4: Add exact ten-request authorization isolation tests with repository-before-ALLOW probes and DENY/outage audit/business-row assertions.
- [x] Step 5: Implement CMM-owned list/detail/timeline/capture degraded UI states, capability hint as non-authority, fresh Retry, preserved data-testid/accessibility semantics, and shared primitives only.
- [x] Step 6: Add frontend/API interaction tests for authorized, denied, Identity unavailable, Reference Data last-known/unavailable, and capture denial outcomes.
- [x] Step 7: Update configuration/docs/test fixtures without caches, migrations, new providers, or shared-shell/packages/ui changes; run linter/type-check/unit checks.
- [x] Step 8: Write `code-summary.md` with changed files, evidence, and bounded validation limitations.

## Story Traceability

| Steps | Stories |
|---|---|
| 2-4 | U03 authorization and isolation stories |
| 3, 5-6 | U03 degraded freshness and recovery UI stories |
| 7-8 | U03 evidence/operability constraints |
