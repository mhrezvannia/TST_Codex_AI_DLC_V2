# Code Generation Plan - W2-03 Charge Tariffs and Agreements

## Scope and Traceability

| Story ID | User outcome |
| --- | --- |
| W2-03-S1 | Pricing analyst creates and views a versioned base tariff for one trade lane and equipment type. |
| W2-03-S2 | Pricing analyst adds one surcharge and one POL local charge with Shared Platform charge codes. |
| W2-03-S3 | Pricing analyst binds exact rate versions to a new agreement version and approves it. |
| W2-03-S4 | Booking receives and stores a computed itemised `pricing.result`; no match produces `MANUAL_PRICING_REQUIRED`. |
| W2-03-S5 | Release reviewer observes create, approve, price, rate-change/reprice, no-rate, restart, and both audits on live Compose. |

## Approved Implementation Sequence

- [ ] **Step 1 - Baseline and contract lock (W2-03-S1-S5):** inventory current Charge/Booking code, preserve unrelated dirty changes, run focused backend/frontend/contract baselines, and reconcile `contracts/openapi/pricing.v1.yaml`, examples, and Pact fixtures with the frozen bilateral field names before implementation.
- [ ] **Step 2 - Add versioned rate authority domain (W2-03-S1, W2-03-S2):** add framework-free domain types for distinct tariff, surcharge, and local-charge categories; immutable version identity/status; trade-lane, equipment-type, location applicability, charge code, USD money, validity, and optimistic version rules.
- [ ] **Step 3 - Add rate-domain tests (W2-03-S1, W2-03-S2):** cover valid creation, invalid amount/currency/window, category-specific applicability, immutable approved versions, new-version creation, and overlapping/mismatched keys.
- [ ] **Step 4 - Add additive persistence and repositories (W2-03-S1-S3):** evolve the pricing schema with normalized rate definitions/versions, agreement-version bindings, indexes, constraints, quote authority snapshot fields, and repository ports/adapters; preserve existing agreement/pricing rows and add upgrade/restart schema tests.
- [ ] **Step 5 - Implement rate and agreement-version application services (W2-03-S1-S3):** create/list/detail/version/approve rate commands and queries, bind exact rate versions to agreement versions, validate Shared Platform IDs, enforce roles/optimistic locking, and write audit/outbox evidence atomically.
- [ ] **Step 6 - Implement admin APIs and OpenAPI (W2-03-S1-S3):** expose bounded tariff, surcharge, local-charge, agreement-version binding, approval, and quote-preview endpoints with standard errors, correlation IDs, pagination, and testable response shapes; update provider OpenAPI without renaming frozen fields.
- [ ] **Step 7 - Replace agreement-term pricing with rate-authority calculation (W2-03-S4):** resolve the approved agreement version by party/date/lane/equipment type, load bound immutable rate versions, calculate separate `FREIGHT`, `SURCHARGE`, and `LOCAL` lines with `BigDecimal`, persist the exact authority snapshot, and preserve fenced idempotency semantics.
- [ ] **Step 8 - Add pricing and contract tests (W2-03-S3, W2-03-S4):** cover matching three-line quote/total, rate-version reconstruction, changed-rate reprice, outside-lane/equipment manual outcome, ambiguous/no authority, exact replay, conflicting idempotency key, transient failure classification, Booking snapshot consumption, and provider/consumer Pact fixtures.
- [ ] **Step 9 - Build the Charge operational UI/BFF (W2-03-S1-S4):** replace skeleton-only data with list/detail/editor flows for the three rate categories, agreement-version bindings/approval, and quote preview; use existing `@erp/ui`/auth patterns, show loading/empty/error/denied/stale states, and add `data-testid` to interactive controls.
- [ ] **Step 10 - Add UI tests and configuration (W2-03-S1-S4):** test rate creation, category navigation, agreement binding/approval, itemised preview, validation/denied/stale/error states; keep Vitest/TypeScript configuration within existing workspace conventions.
- [ ] **Step 11 - Correct local infrastructure and observability (W2-03-S5):** add durable Postgres volume, Charge service/UI healthchecks and resource/log controls, health-based Booking dependency, Charge auth/session settings, Prometheus actuator exposure/registry, W2-03 metrics, and resolve the Charge UI/Grafana host-port collision. Validate changes in isolated `linercore-wave-a`; never stop, rebuild, or mutate the protected `linercore-shared-platform` manager demo.
- [ ] **Step 12 - Add CI and live acceptance (W2-03-S5):** add Charge UI test/typecheck/lint/build gates, contract/security/config gates, and `scripts/w2-03-live-acceptance.mjs` plus tests/evidence paths for the full live DoD and both audits. Require `npm run demo:guard` before and after the isolated lifecycle, and preserve W1's live-proof result as `BLOCKED` with an explicit test waiver rather than rewriting it as `PASS`.
- [ ] **Step 13 - Execute focused verification (W2-03-S1-S5):** run Charge Maven tests, Booking pricing consumer tests, Charge UI tests/typecheck/lint/build, contract validation/provider checks, script tests, and `docker compose config --quiet`; record exact pass/fail/blocker evidence.
- [ ] **Step 14 - Review and summarize (W2-03-S1-S5):** run architecture review, resolve blocking findings within two iterations, mark completed checkboxes truthfully, and create `code-summary.md` with files, decisions, test results, deviations, and remaining live blockers.

## File Ownership

Primary implementation areas are `services/charge-agreement-service/`, `apps/charge-agreements/`, the Booking pricing adapter/snapshot tests under `services/booking-service/`, `contracts/openapi/pricing.v1.yaml`, `contracts/examples/pricing-quote.response.json`, `contracts/pact/booking-charge-pricing-fixtures.json`, `compose.yaml`, `infrastructure/observability/`, `.github/workflows/quality-gates.yml`, and W2-03 acceptance scripts/evidence configuration.

Unrelated existing changes, especially W2-01 work in `packages/ui/package.json`, `vitest.config.ts`, other intent records, history, and artifacts, must not be reverted or reformatted.

## Test Strategy

The preserved record declares Standard testing. Each changed component receives focused unit tests plus integration/contract coverage at key boundaries. The live Compose journey and both audits remain release evidence, not substitutes for tests.
