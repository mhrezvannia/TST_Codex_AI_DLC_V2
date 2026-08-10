# Smoke Test Results — W2-03

## Inputs and status

This artifact consumes `cd-config`, `deployment-strategy`,
`environment-inventory`, and `build-test-results`.

Status: **NOT RUN — DEPLOYMENT PRECHECK BLOCKED**.

## Required smoke set

When deployment becomes eligible, smoke must prove through edge 18088:

- authenticated Charge Rate and Agreement reads;
- successful Agreement and Tariff pricing;
- no-rate `MANUAL_PRICING_REQUIRED`;
- Booking-visible itemised price and explicit Reprice;
- receipt replay/correlation and manual-case evidence;
- manager demo guard unchanged before and after.

Health-only endpoints, direct service ports, mocks, evaluator tests, or a
different Compose project cannot substitute for these authenticated smokes.

## Evidence boundary

No smoke PASS is claimed. The earlier deterministic `build-test-results`
remain valid source evidence but are not post-deployment evidence.

