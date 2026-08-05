# Code Summary - Agreement Pricing

## Files Created

- `services/charge-agreement-service/domain-core/src/main/java/com/linercore/platform/chargeagreement/domain/model/ChargeCategory.java`
- `services/charge-agreement-service/application-service/src/main/java/com/linercore/platform/chargeagreement/applicationservice/port/PricingRequestRepository.java`
- `services/charge-agreement-service/application-service/src/main/java/com/linercore/platform/chargeagreement/applicationservice/port/PricingRequestStatus.java`
- `services/charge-agreement-service/application-service/src/main/java/com/linercore/platform/chargeagreement/applicationservice/port/StoredPricingRequest.java`
- `services/charge-agreement-service/application-service/src/main/java/com/linercore/platform/chargeagreement/applicationservice/PricingConflictException.java`
- `services/charge-agreement-service/application-service/src/main/java/com/linercore/platform/chargeagreement/applicationservice/PricingRequestInProgressException.java`
- `services/charge-agreement-service/dataaccess/src/main/java/com/linercore/platform/chargeagreement/dataaccess/jdbc/JdbcPricingRequestRepository.java`
- `services/charge-agreement-service/container/src/main/java/com/linercore/platform/chargeagreement/container/api/PricingApiController.java`
- `apps/booking/app/api/bookings/[bookingId]/price/route.ts`

## Files Modified

- Charge domain and application service pricing models now use the contract request fields, charge categories, pricing basis/reference, manual outcomes, and durable idempotency claims.
- Charge schema now includes `pricing_requests`.
- Booking application and domain lifecycle now route automatic success to `PRICED` and manual/failure outcomes to `MANUAL_PRICING`, preserving exact safe upstream reasons where available.
- Booking Charge HTTP adapter now posts to `/pricing-requests` using `application/vnd.api.v1+json`, `Idempotency-Key`, `X-Correlation-Id`, and service identity headers.
- Booking UI/BFF now exposes a real Price action for `VALIDATED` bookings and renders pricing/manual-pricing details.
- `contracts/openapi/pricing.v1.yaml` now requires `quantities.amendmentSeq`.

## Key Decisions

- Kept Booking-to-Charge as synchronous HTTP for this unit; no Booking-to-CMM sync HTTP changes were made.
- Defaulted missing legacy `ChargeTerm.category` and `PricingLine.category` to `FREIGHT` so existing JSON snapshots remain readable.
- Preserved Charge safe reason codes in Booking manual-pricing attributes instead of replacing them with generic Booking codes.
- Used the existing Booking BFF proxy pattern for browser actions so the browser still never calls Charge directly or sends internal service credentials.

## Test Coverage

- `mvn -o -q -pl booking-service/container,charge-agreement-service/container -am test` passed.
- `mvn -o -q test` from `services/` passed.
- `yarn workspace @erp/app-booking test` passed: 4 files, 11 tests.
- `yarn workspace @erp/app-booking typecheck` passed.
- `yarn workspace @erp/app-booking build` passed and produced `/api/bookings/[bookingId]/price`.
- `yarn workspace @erp/app-booking lint` passed with no warnings or errors.
- `docker compose config --quiet` passed.
- `git diff --check` passed with line-ending warnings only.
- `.claude/skills/aidlc-audit/detectors.sh` passed via Git Bash with exit 0.
- `.claude/skills/erp-fidelity-audit/detectors.sh` passed via Git Bash with exit 0.

## Deviations

- The configured reviewer subagent is not available in this ChatGPT Codex environment because the named model is unsupported. The review below was performed inline against the U03 design artifacts, changed code, and verification results.

## Review

Verdict: READY

Findings:

- No blocking architecture issues found in the implemented U03 surface.
- Residual implementation gap: Charge idempotency uses the new repository port and tests replay/conflict/live-lease behavior, but the more advanced expired-lease takeover and fenced stale-owner completion described in design remain partial and should be hardened before higher-concurrency production use.
- Residual live-proof gap: this stage has host and static Compose evidence, but not a fresh browser-driven live Docker run of the full quote-to-cash flow.
