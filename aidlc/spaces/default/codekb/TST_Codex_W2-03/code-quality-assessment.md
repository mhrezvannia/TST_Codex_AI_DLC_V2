# Code Quality Assessment — TST_Codex_W2-03

## Assessment Basis

This assessment is based on a read-only static scan at commit `c2f13dd`. It inventories tests, configuration, contracts, automation, and known code paths. It does not claim a build, test, Compose, browser, performance, or audit PASS.

## Strengths

- Backend service boundaries are explicit: domain, application, ports, adapters, data access, messaging, and runtime composition are separated.
- Charge already tests agreement lifecycle rules, application itemisation, manual-case recording, schema/repositories, controllers, and event serialization.
- Booking already tests pricing adapter success/manual/transient/denied mappings, stable request identity, manual Booking state, aggregate/JDBC behavior, controller mapping, auth/reference integration, and messaging.
- Shared auth implements signed sessions, actor derivation, expiry/safe redirects, redaction, and non-production-only local bypass.
- BFF command patterns include same-origin checks, JSON/body limits, idempotency, correlation, and server-derived actors.
- Contracts have deterministic catalog/provider verification and ownership/compatibility metadata.
- Compose provides isolated service data stores and optional observability, and Wave A has a fixed project/env wrapper.
- CI aggregates backend, frontend, contract, seed, acceptance-evidence, and fidelity checks on relevant branches.
- Domain/app tests and existing ports make the intended Charge/Booking evolution incremental rather than a greenfield rewrite.

## Test Inventory and Coverage

- 81 test files were found across Java, TypeScript/React, and Node scripts.
- Backend counts: Booking 14, Charge 7, Reference Data 9, Identity 5, Container Movement 5, Platform Messaging 1.
- Frontend counts: Auth 5, Booking 5, Charge 1, Reference Data 4, Shell 9, plus shared package tests.
- Frameworks: JUnit Jupiter/Spring Boot Test, Vitest, Testing Library, Node test runner, and installed Playwright.
- Script tests cover readiness, replay/restart, quality aggregation, seeds, contracts, prior-wave acceptance/performance, and observability smoke behavior.

No JaCoCo, Istanbul/NYC, Sonar, or committed coverage threshold was found. Turborepo declares `coverage/**` output but the scan found no producer/config. Test-file counts therefore do not imply quantitative coverage.

## Static Quality and CI

- TypeScript linting uses ESLint 9 with root `eslint.config.mjs`.
- Workspace type checking uses `tsc --noEmit` and Turborepo ordering.
- Java builds use compiler/Surefire configuration; no Checkstyle, SpotBugs, or PMD gate was found.
- `.github/workflows/quality-gates.yml` runs on `main` and `integ/main-reconciled` with a self-hosted on-prem Linux runner.
- `scripts/run-quality-gates.mjs --all` covers backend tests, contracts, seeds, prior evidence, shared auth/types, Auth, Reference Data, Booking, Shell, and Charge test/typecheck.
- Charge lint and build are missing from the aggregate quality command; the workflow does not add them directly.
- No ADR store was detected, although intent/design/process documentation is substantial.

## W2-03-Critical Quality Gaps

| Gap | Consequence | Required evidence direction |
|---|---|---|
| Charge UI is a disabled hard-coded skeleton | No usable tariff/agreement workflow | Charge component/unit tests and Playwright paths |
| No immutable approved-version persistence | Cannot reproduce historical pricing authority | Domain/repository/migration tests and API contract evidence |
| Coarse line applicability | Wrong equipment/port/local charges may be selected | Table-driven matching tests including origin-only locals |
| Pricing controller drops basis/quantity/rate | Booking receives incomplete itemisation | Provider/consumer contract and live response proof |
| Booking flat string map | Fragile decoding and absent rate | Typed codec/backward-compatibility tests |
| Manual vocabulary mismatch | Consumers cannot reliably distinguish no-rate outcome | End-to-end `MANUAL_PRICING_REQUIRED` mapping tests |
| Repricing is implicit | Revision behavior can be ambiguous | Explicit revision-aware API/application/UI test |
| No Charge edge route | Manager path cannot reach Charge app | nginx/shell route regression and live browser evidence |
| No W2-03 Playwright setup | Unit tests cannot prove integrated UI behavior | New Playwright config/spec/evidence package |
| No W2-03 live harness | Static checks cannot satisfy intent DoD | Wave A Compose script with live Charge→Booking assertions |

## Technical Debt and Reliability Risks

- `HttpChargePricingClient` uses `LocalDate.now()` rather than an injected or request-carried pricing date.
- Missing Booking values default trade lane to `NA-EU` and commodity to `commodity-general`, risking silent authority selection.
- Charge uses Spring SQL initialization while Booking uses Flyway, complicating safe upgrades and rollback.
- Legacy and canonical Charge OpenAPI artifacts advertise divergent pricing paths.
- D&D contract material exists while the local implementation throws not-implemented.
- Default outbox interface methods throw unsupported-operation exceptions; incomplete adapter wiring can fail only at runtime.
- Nginx/shell route patterns overlap, so a new Charge mount has a material regression surface.
- Historical artifacts share the repository with live source; unscoped graph/text search can produce stale conclusions.
- Local Compose defaults include credentials/tokens appropriate only to isolated development.

## Recommended Verification Strategy

### Unit and domain

- Rate-version lifecycle and approved immutability.
- Base/surcharge/local composition and deterministic rounding/quantity/basis behavior.
- Agreement-versus-tariff precedence and tie/ambiguity rules.
- Equipment, POL/POD, and origin-only local-charge matching.
- Manual-case creation and idempotent retry behavior.

### Contract and integration

- Canonical OpenAPI compatibility and Booking↔Charge provider verification.
- Full typed line transport including rate and authority/version.
- Backward decoding of existing Booking snapshots.
- Explicit `MANUAL_PRICING_REQUIRED` translation through Charge, Booking, BFF, and UI.
- Revision-aware repricing retains a new auditable snapshot.

### UI and live acceptance

- Charge list/detail/editor/approval/rate flows using the established design system.
- Keyboard, focus, validation, loading/error/empty states, and responsive behavior.
- Booking-visible line breakdown and manual pricing state.
- Stable `/charge-agreements` route without regressions to auth, `/booking`, `/bookings`, or `/reference-data`.
- `npm run demo:guard` before and after; isolated `linercore-wave-a` Compose only.
- Live pricing proof, Playwright evidence, `aidlc-audit`, and `erp-fidelity-audit`.

## Quality Verdict

The baseline is structurally capable of supporting the slice and has meaningful domain/integration tests, but it is not release-ready for W2-03. The critical defects are contract/persistence fidelity, applicability completeness, frontend/routing absence, and missing live/browser evidence. Runtime acceptance remains an explicit open condition; the W1 waiver remains a waiver and must never be rewritten as a real PASS.

