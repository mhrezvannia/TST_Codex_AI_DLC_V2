# Code Quality Assessment

## Static Quality Baseline

The scan found 213 test files: 28 Booking Java tests, 9 Booking app tests, 8 CMM tests, 9 Reference Data tests, 40 Charge Agreement tests, 12 shell tests, 4 shared-UI tests, plus Playwright suites under `tests/e2e` and `tests/w2-02` and script tests. This is an inventory only; none was executed during this pass.

TypeScript uses strict mode, ESLint 9.17.0, typescript-eslint 8.19.1, and `no-explicit-any`; the Booking UI also bans hard-coded hex colors. `.editorconfig` is present. No Prettier configuration was identified. Java uses Maven compiler and Surefire but no Checkstyle or Spotless configuration was identified.

## CI/CD and Verification

Checked-in CI targets self-hosted on-premise runners with Java 21 and Node 24. It includes Maven verification, frontend tests, type checking, linting and build, contract checks, high-severity Yarn audit, Compose static validation, readiness/evidence stages, `aidlc-audit`, and `erp-fidelity-audit`.

No repository-wide SAST, secret scan, image scan, SBOM/signing, dependency-update bot, or Sonar configuration was found. No JaCoCo, Istanbul, c8, or enforced Vitest coverage threshold was found. Turbo names coverage output, but the documented 80% mandate is not enforced by discovered configuration.

## Positive Design Indicators

- Hexagonal module direction separates domain/application logic from Spring, JDBC, and Kafka adapters.
- Booking uses idempotency, audit, versioned snapshots, consumed-event tracking, immutable pricing snapshots, and transactional outbox patterns.
- Pricing requests are canonicalized and SHA-256 fingerprinted; responses are checked for correlation, equality, and arithmetic.
- The `booking.confirmed` Avro copies are byte-identical across contract, producer, and consumer locations.
- BFF helpers enforce session actor, same-origin JSON, body-size, correlation, service-credential, timeout, and pricing authorization controls.
- CI includes contract and live-evidence-oriented commands, even though their outcomes were not observed here.

## Technical Debt and Defects

| Priority | Finding | Evidence/impact |
|---|---|---|
| Critical | CMM rejects nullable equipment ID | Avro permits `null`, but `BookingConfirmedEvent` and `journeyContainerId` require a physical ISO 6346 ID. |
| Critical | Physical-ID/quantity-one invariant | Booking aggregate, both forms, legacy upcast, and CMM prevent commercially complete equipment requests before allocation. |
| High | Commercial fields are absent/untyped | Customer ref, shipper/consignee/notify, cargo, packages, weight, volume are not first-class; commodity/requested date are attributes. |
| High | Voyage cutoff/deadline/OHS gap | Typed voyage lacks cutoff/deadline; Booking adapter omits ETD/ETA. |
| High | Unsafe pricing defaults | Missing trade lane becomes `NA-EU`; missing commodity becomes `commodity-general`. |
| High | Topic drift | Runtime/Compose uses `booking.events`; Enterprise/AsyncAPI uses `booking.confirmed`. |
| High | Duplicate Booking UI/routes | `/booking` and `/bookings` forms differ; only one sends requested departure. |
| High | Migration/upcast limitation | Legacy canonicalization requires authoritative route/voyage/equipment/physical ID and hardcodes quantity one. |
| Medium | Incomplete executable contracts | No full Booking OpenAPI; static Avro identity does not prove producer/consumer behavior. |
| Medium | Missing reference exposure | Booking lacks commodity and party-role reference sets. |
| Medium | Coverage mandate unenforced | Test inventory exists without configured coverage gates. |
| Medium | Commodity event placeholder schema | Domain/event evolution is not fully modeled. |
| Low | Stale README and Graphify index | Discovery can underrepresent current Booking implementation. |

## W3-04 Quality Strategy Implications

- Add aggregate/API/form/persistence tests for complete required fields, optional consignee/notify/volume, quantity greater than one, and absent physical ID.
- Add legacy snapshot fixtures proving safe upcast versus explicit `legacyIncomplete` without fabricated data.
- Add contract tests proving voyage schedule fields, exact pricing input, immutable snapshot version 2, topic naming, and CMM acceptance of a schema-valid nullable-ID event.
- Exercise both route families until one is removed or made a thin delegate; assert identical request payloads during transition.
- Require Compose-observed create -> validate -> price -> confirm -> CMM acceptance, browser/a11y evidence, `aidlc-audit`, and `erp-fidelity-audit` before declaring completion.
- Establish and enforce measurable coverage thresholds instead of relying on an output directory name.

## Evidence Boundary and Confidence

Checked-in source, contracts, configurations, migrations, and test filenames were inspected. Not run or proven: compilation, unit/integration/contract tests, coverage percentages, Compose health, Flyway migration against live data, Kafka/Schema Registry delivery, browser behavior, performance, accessibility, security scans, or either audit. Findings about these outcomes are gaps in evidence, not claims of failure.
