# Code Generation Plan - charge-agreement-pricing-domain

## Plan Context

Unit: `charge-agreement-pricing-domain`

Scope: Brownfield extension of the existing Charge Agreement Service for agreements, tariffs, charge terms, active agreement lookup, tariff fallback, itemised pricing, manual pricing cases, D&D rule preparation, free time/rate rules, chargeable-day calculations, and commercial audit. The unit must not mutate Booking lifecycle, derive CMM status, or query Booking/CMM databases.

Test strategy: Comprehensive. This plan includes Java domain/application tests for pricing and agreement behavior, API/container tests where touched, contract fixture validation for pricing/D&D seams, and targeted root service verification.

Workspace target: changes stay in `services/charge-agreement-service/`, `contracts/`, `apps/charge-agreements/` where needed, and tests. Booking and CMM integration remain through ports/contracts only.

## Story-To-Step Traceability

| Story or requirement | Plan steps |
|---|---|
| US-CHG-001 - Maintain agreements and tariffs | Step 1, Step 2, Step 7 |
| US-CHG-002 - Resolve active pricing | Step 2, Step 3, Step 7 |
| US-CHG-003 - Calculate itemised pricing | Step 3, Step 4, Step 7 |
| US-CHG-005 - Booking pricing seam | Step 4, Step 5, Step 8 |
| US-CHG-006 - Manual pricing fallback | Step 4, Step 6, Step 7 |
| US-CHG-007 - D&D rules/free time preparation | Step 6, Step 7 |
| US-UI-003 - Charge agreement UI support | Step 5, Step 8 |

## Sequential Implementation Steps

- [x] Step 1: Inventory current Charge Agreement Service surfaces.
  - Confirm existing domain, application, dataaccess, container, frontend, OpenAPI/Pact, and tests.
  - Preserve current service/module boundaries and existing behavior.
  - Traceability: US-CHG-001.

- [x] Step 2: Harden agreement lifecycle and active lookup.
  - Ensure agreements can be created/updated with validity windows, status, charge terms, customer/reference ids, and audit.
  - Ensure active lookup selects the correct agreement by customer, service context, date, and status.
  - Add tests for active, inactive, expired, and overlapping agreement cases.
  - Traceability: US-CHG-001, US-CHG-002.

- [x] Step 3: Implement or harden itemised pricing.
  - Calculate itemised pricing from charge terms and request facts owned by Charge Agreement Service.
  - Include currency, basis, quantity, rate, amount, and applied agreement/tariff reference in pricing results.
  - Add tests for happy path, missing agreement, missing reference validation, and tariff fallback.
  - Traceability: US-CHG-002, US-CHG-003.

- [x] Step 4: Add booking pricing seam behavior.
  - Expose typed pricing request/result behavior through application/container contracts where already present.
  - Keep Booking as a consumer only; no booking state mutations occur here.
  - Add tests for idempotency/correlation and boundary failure responses.
  - Traceability: US-CHG-005.

- [x] Step 5: Align contract and UI support where touched.
  - Verify OpenAPI/Pact fixtures for booking-charge pricing match implemented result shape.
  - Update Charge Agreements UI service-client tests only if API shape changes.
  - Traceability: US-CHG-005, US-UI-003.

- [x] Step 6: Add manual pricing and D&D rule preparation.
  - Record manual pricing cases for missing/ambiguous tariff results.
  - Model D&D free-time/rate rules and chargeable-day calculation as Charge-owned behavior.
  - Do not consume or derive CMM movement status in this unit.
  - Traceability: US-CHG-006, US-CHG-007.

- [x] Step 7: Add comprehensive Java tests.
  - Cover agreement lifecycle, active lookup, itemised pricing, manual fallback, D&D rule calculation, audit, denied authorization, and no cross-domain mutation.
  - Traceability: all charge agreement/pricing stories.

- [x] Step 8: Run verification commands and fix failures.
  - Run targeted Maven tests for `services/charge-agreement-service`.
  - Run contract catalog/Pact validation for pricing/D&D seams.
  - Run TypeScript checks only for touched frontend/runtime files.
  - Traceability: all unit stories.

- [x] Step 9: Write the code summary and mark this plan complete.
  - Produce `code-summary.md` under this unit's `code-generation` record directory.
  - Summarize files changed, implementation decisions, test coverage, command results, and deviations from this plan.
  - Traceability: all unit stories.

## Implementation Guardrails

- Do not mutate Booking lifecycle state.
- Do not derive CMM movement status.
- Do not query Booking/CMM databases.
- Use ports/contracts for Booking and CMM seams.
- Preserve correlation, idempotency, pricing audit, and commercial audit evidence.
