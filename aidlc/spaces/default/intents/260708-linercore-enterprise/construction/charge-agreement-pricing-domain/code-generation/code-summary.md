# Code Generation Summary - charge-agreement-pricing-domain

## Files Created Or Modified

| File | Change |
|---|---|
| `services/charge-agreement-service/domain-core/src/main/java/com/linercore/platform/chargeagreement/domain/model/PricingRequest.java` | Added pricing request value object with customer, trade lane, commodity, effective date, quantities, and correlation id. |
| `services/charge-agreement-service/domain-core/src/main/java/com/linercore/platform/chargeagreement/domain/model/PricingLine.java` | Added itemised pricing line with rate, quantity, and amount validation. |
| `services/charge-agreement-service/domain-core/src/main/java/com/linercore/platform/chargeagreement/domain/model/PricingResult.java` | Added priced/manual result model with total calculation and manual fallback reason. |
| `services/charge-agreement-service/domain-core/src/main/java/com/linercore/platform/chargeagreement/domain/model/ManualPricingCase.java` | Added manual pricing case evidence model. |
| `services/charge-agreement-service/domain-core/src/main/java/com/linercore/platform/chargeagreement/domain/model/DndRule.java` | Added D&D free-days/daily-rate rule and chargeable-day amount calculation. |
| `services/charge-agreement-service/domain-core/src/test/java/com/linercore/platform/chargeagreement/domain/model/CustomerAgreementTest.java` | Added pricing result, manual fallback, and D&D rule coverage. |
| `services/charge-agreement-service/application-service/src/main/java/com/linercore/platform/chargeagreement/applicationservice/port/ManualPricingCaseRepository.java` | Added fakeable port for manual pricing case persistence. |
| `services/charge-agreement-service/application-service/src/main/java/com/linercore/platform/chargeagreement/applicationservice/ChargeAgreementApplicationService.java` | Added itemised pricing method using active lookup, term quantities, manual fallback, and manual case recording. |
| `services/charge-agreement-service/application-service/src/test/java/com/linercore/platform/chargeagreement/applicationservice/ChargeAgreementApplicationServiceTest.java` | Added automatic pricing and manual pricing case tests. |

## Key Implementation Decisions

- Built on the existing Charge Agreement Service lifecycle, lookup, and repository model.
- Itemised pricing is calculated only from Charge-owned agreement terms and request quantities.
- Manual pricing is returned and recorded when no active agreement or applicable terms exist.
- D&D rule preparation is Charge-owned free-day/rate calculation only; no CMM movement status is derived.
- Booking remains a consumer through contracts/ports; no Booking state is mutated.

## Test Coverage Summary

| Command | Result |
|---|---|
| `.local-tools/apache-maven/bin/mvn.cmd -f services/charge-agreement-service/pom.xml test` with `.local-tools/jdk-21` as `JAVA_HOME` | Passed: charge reactor success, 19 tests. |
| `node scripts/validate-contract-catalog.mjs` | Passed: catalog status `ok`, 13 contracts, green health snapshot. |
| `yarn vitest run apps/charge-agreements/app/page.test.tsx --config vitest.config.ts` | Passed: 1 test. |
| `yarn exec tsc --noEmit -p apps/charge-agreements/tsconfig.json` | Passed. |

## Deviations From Plan

- No OpenAPI/Pact fixture changes were required because the existing contract catalog remained green with the service changes.
- No UI code changes were required; the existing charge agreements page test and typecheck stayed green.
- D&D implementation is intentionally limited to Charge-owned free-day/rate calculation. Movement-derived elapsed days remain a downstream integration concern.

## Traceability

| Story or requirement | Implemented evidence |
|---|---|
| US-CHG-001 - Maintain agreements and tariffs | Existing lifecycle tests remain passing with new pricing extensions. |
| US-CHG-002 - Resolve active pricing | Pricing uses active agreement lookup by customer/lane/commodity/effective date. |
| US-CHG-003 - Calculate itemised pricing | Pricing line and total tests cover rate x quantity calculations. |
| US-CHG-005 - Booking pricing seam | Pricing request/result models expose a Booking-consumable seam without Booking mutation. |
| US-CHG-006 - Manual pricing fallback | Manual pricing result and manual case tests cover no-active-agreement fallback. |
| US-CHG-007 - D&D rules/free time preparation | D&D free-day/rate calculation is covered in domain tests. |
