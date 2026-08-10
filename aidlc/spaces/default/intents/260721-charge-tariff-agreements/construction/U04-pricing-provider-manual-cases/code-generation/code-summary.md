# Code Summary — U04 Pricing Provider and Manual Cases

## Outcome

U04 implements the Charge-owned pricing provider, immutable terminal receipt
replay, and read-only manual-pricing evidence flow. Pricing resolves an exact
approved Agreement first and otherwise requires one complete approved
BASE/OFR, SURCHARGE/BAF, and LOCAL/THC tariff. Missing or ambiguous authority
terminates as one durable OPEN manual case; successful and unsuccessful
terminal responses are serialized once and replayed byte-for-byte.

The approved plan has 45 of 48 items complete. The remaining three aggregate
cells are explicitly blocked by unavailable Docker/PostgreSQL execution,
Windows sandbox process creation, absent pinned security-toolchain and coverage
evidence, and pre-existing shared-worktree changes. No live-stack, browser,
bilateral Booking-to-Charge, or release-audit pass is inferred.

## Files Created or Modified

### Domain, application, and persistence

- Added exact pricing authority resolution, three-line calculation, canonical
  request hashing, terminal reason mapping, and a success-only pricing result.
- Added authorize-first pricing orchestration with database-time claim and
  takeover, random owner fencing, winner replay, and atomic terminal
  receipt/manual-case persistence.
- Added explicit Rate and Agreement authority ports and JDBC adapters. The
  snapshot adapter delegates through those ports rather than duplicating SQL.
- Extended manual-case persistence and reads with evidence-only context,
  bounded filters, stable pagination, and NULL-last ordering.
- Kept Flyway V1–V4 immutable; their SHA-256 values match the preservation
  fixture.

### API, security, contracts, and telemetry

- Added a fail-closed trusted-service identity/token boundary for
  `POST /pricing-requests`; browser assertions and legacy actor identity cannot
  substitute for service credentials.
- Added strict, authorized manual-case list/detail endpoints with
  authorization-before-existence behavior and allowlisted response fields.
- Extended OpenAPI, contract catalog, examples, and Booking Pact fixtures
  additively, including the nine-scenario U04 terminal matrix.
- Added bounded enum-only pricing/manual telemetry with tests rejecting
  identifiers, request material, owner tokens, money, authorization material,
  snapshots, and record IDs as log values or metric labels.

### BFF and Charge UI

- Corrected the U02 manual-case route policies and
  `charge-manual-cases:read` permission mapping.
- Added strict redacting schemas, fixed 25-row paging conversion, and read-only
  list/detail BFF routes.
- Added the Charge-local `/charge-agreements/manual-pricing` evidence page with
  loading, error, empty, filtered-empty, list, detail, legacy, and unavailable
  states; keyboard/focus restoration and responsive behavior are covered by
  source tests.
- Added no amount, approval, resolution, repricing, shared-shell, navigation,
  palette, or `packages/ui` behavior.

### Runtime, preservation, and U06 handoff

- Added approved local-only pricing service identity/configuration while
  preserving fail-closed non-local behavior, resource bounds, nginx `18088`,
  and manager `8088` isolation.
- Added deterministic U04 performance-input, preservation, and rollback-policy
  evaluators and their tests.
- Recorded the release-valid live evidence cells in
  `docs/u04-pricing-provider-u06-handoff.md` and the machine-readable blocker
  ledger in `artifacts/u04/u06-handoff.json`.

## Key Decisions

1. Agreement authority wins; tariff fallback is valid only when all three exact
   approved OFR/BAF/THC components exist and are unambiguous.
2. Every 200, 404, or 422 terminal outcome has one immutable serialized receipt.
   Retries replay the persisted bytes rather than recomputing authority.
3. First-writer and stale-owner races are fenced in persistence; only the
   winning owner can complete, and losing workers replay the winner.
4. Missing or ambiguous authority creates exactly one OPEN manual case carrying
   evidence, never an inferred commercial amount or resolution workflow.
5. Booking consumer ownership is not crossed. Its current legacy actor header
   and missing trusted service credentials keep bilateral live pricing
   intentionally blocked until the consumer owner aligns the call.
6. Previous-image rollback is allowed only for a drained, read-only,
   compatibility-proven state with zero `incompatible_u04_rows`; otherwise
   recovery is forward repair.

## Traceability

| Scope | Implementation |
|---|---|
| US-02 / US-03 | Agreement-first pricing, complete tariff fallback, and durable terminal evidence |
| US-06 / US-07 | Missing/ambiguous authority manual cases and read-only operational evidence |
| US-13 / US-14 | Trusted BFF routing and Charge-local responsive/manual-case UI |
| FR-301–FR-307 | Resolution, calculation, receipt replay, concurrency fencing, and manual cases |
| FR-001–FR-004 | Fail-closed service identity, authorization ordering, correlation, and redaction |
| NFR-001–NFR-010 | Integrity, compatibility, bounded telemetry, evaluator contracts, and rollback safety |

## Validation Evidence

| Check | Result |
|---|---|
| Charge Maven reactor `clean verify` | PASS — 165 discovered, 0 failures/errors; 28 Docker/Testcontainers skips |
| Deterministic U02–U04 evaluators | PASS — 13/13 |
| U04 performance/preservation/rollback tests | PASS — 7/7 |
| Contract catalog validation/provider verification | PASS |
| Charge TypeScript type-check | PASS |
| Charge lint | PASS |
| `git diff --check` | PASS |
| V1–V4 preservation hashes | PASS — exact fixture match |
| PostgreSQL migration/concurrency/atomicity/live repository evidence | BLOCKED — Docker unavailable; 28 tests skipped |
| Charge Vitest aggregate | BLOCKED before discovery — esbuild `spawn EPERM` in the Windows sandbox |
| U02 security aggregate | BLOCKED — pinned toolchain lock absent |
| Changed-line coverage ≥80% | UNMEASURED — no Java gate and frontend coverage could not start |
| Isolated Compose, Playwright, bilateral pricing, live performance/restart/audits | DEFERRED to U06 handoff |

## Deviations and Residual Work

- The current Booking pricing client sends the prohibited legacy actor header
  and no trusted service ID/token. U04 therefore does not claim a live bilateral
  path and did not modify Booking-owned code.
- Docker-backed migration, concurrency, receipt/case atomicity, 10,000-case
  repository, query-plan, and restart tests compile but remain unobserved live.
- Frontend Vitest assertions were not executed in the final aggregate pass
  because esbuild process creation failed twice before test discovery. Lint and
  type-check are green; this is recorded as blocked rather than PASS or FAIL.
- The shared worktree contains pre-existing U01–U03 and other active-program
  changes, so the aggregate hygiene cell remains open. U04 introduced no
  Booking implementation, `packages/ui`, shared-shell, or new pricing-event
  change.
- U06 owns isolated Compose/demo-guard, browser/accessibility/DS-03, live
  correlation/replay/restart/performance, provider/Pact, `aidlc-audit`, and
  `erp-fidelity-audit` evidence.

## Completion Assessment

U04 is source-complete for its owned provider and manual-case boundary with
green compile, unit, deterministic evaluator, contract, lint, type-check,
preservation, and hygiene-format evidence. Its unobserved live and aggregate
cells are isolated in an explicit U06 handoff and remain fail-closed.

## Review

### Iteration 1

**Verdict: NOT-READY**

#### Blocking findings

1. **The published OpenAPI does not describe the implemented authentication
   boundary or its error bodies.** `POST /pricing-requests` requires
   `PricingServiceIdentityFilter`, which returns `401` for absent/invalid
   service credentials and a filter-specific `400` for spoofed actor/assertion
   headers, but `contracts/openapi/pricing.v1.yaml` declares no `401` response
   and its `Error.code` enum excludes the filter codes. Both manual-case routes
   require `X-LinerCore-Subject-Assertion`, yet that required header and the
   assertion filter's `401`/capacity-failure responses are absent from the
   operations. The assertion filter body also has `fields` and no
   `correlationId`, while the declared `Error` forbids additional properties
   and requires `correlationId`. A client or security integrator cannot
   implement the real boundary from the contract. Align the operations,
   response statuses/codes, and error shape with the filters, then add an
   executable contract test that runs requests through the real filters.

2. **Tariff success serialization violates the published schema and terminal
   fixture.** Tariff calculation intentionally produces
   `agreementVersionId == null`. `JacksonPricingTerminalRenderer` serializes a
   record containing that null property with the default Spring `ObjectMapper`,
   while `PricingResult.agreementVersionId` is declared as `type: string` and
   the `tariff-success` matrix omits the property. The current controller
   contract test injects hand-authored tariff bytes and therefore bypasses the
   renderer; the catalog/provider scripts check the matrix's presence and
   statuses but not runtime payload/schema parity. Either omit the null property
   at serialization or make the schema and fixture explicitly nullable, and
   schema-validate real renderer output for both Agreement and Tariff success.

These are source/contract defects, not consequences of unavailable Docker,
PostgreSQL, browser execution, coverage tooling, or Windows process creation.
The summary's contract-validation PASS is factually true for the current
validators but is not sufficient evidence for the stronger claim that the
published contracts match the provider.

#### Verified architecture

- The provider authenticates at the servlet boundary and authorizes before
  reading or claiming idempotency state. Canonical request hashing, immutable
  terminal replay, database-time leases, random owner fencing, and stale-owner
  winner replay resolve to implemented ports and adapters.
- Agreement authority is resolved first inside a repeatable-read snapshot.
  Tariff fallback requires one approved BASE/OFR, SURCHARGE/BAF, and LOCAL/THC
  source; ambiguity and missing authority terminate explicitly rather than
  producing partial pricing.
- Manual-case canonicalization, receipt construction, and the fenced terminal
  update share one transaction. A stale-owner exception rolls the case insert
  back, containing the race blast radius; successful 200/404/422 receipts are
  subsequently replayed from stored bytes.
- Manual-case application authorization occurs before the existence lookup.
  List/detail reads are OPEN-only, bounded, parameterized, and deterministically
  ordered. The Charge BFF uses the corrected
  `charge-manual-cases:read` capability and path-bound subject assertions.
- Domain, application, container, and JDBC ownership flows inward through
  ports; no circular U04 dependency or unresolved implementation reference was
  found. Booking implementation ownership was not crossed. Its current
  `HttpChargePricingClient` still sends `X-LinerCore-Actor-Id` and no trusted
  pricing service token, so the summary correctly does not claim a live
  bilateral path.
- PostgreSQL remains the integrity and availability blast-radius boundary.
  Provider completion cannot commit a terminal without the database, and an
  interrupted owner is recoverable only after lease expiry; manual evidence
  reads fail closed as unavailable. Live proof of those database guarantees is
  still required but the source transaction/fencing design is implementable.

#### Fresh validation

| Check | Iteration 1 result |
|---|---|
| Charge Maven reactor `test` | PASS — 165 tests, 0 failures/errors; 28 Testcontainers tests skipped because Docker is unavailable |
| Charge TypeScript type-check | PASS |
| Charge lint | PASS — 0 warnings/errors |
| Contract catalog validation | PASS — 13 contracts; does not exercise runtime auth/error or renderer/schema parity |
| Contract provider verification | PASS — 199 checks, 0 failures; live provider verification skipped and the checks do not catch the two blockers above |
| U04 preservation/performance/rollback evaluators | PASS — 7/7 |
| Charge Vitest aggregate | ENVIRONMENT BLOCKED before discovery — reproduced `esbuild` `spawn EPERM` |
| PostgreSQL migration/concurrency/atomicity/restart evidence | ENVIRONMENT BLOCKED — Docker unavailable; represented by the 28 Maven skips |

The two blocking contract mismatches must be corrected and covered by
runtime-to-schema tests before the code-generation review can be READY. Docker,
Vitest, live Compose, browser, bilateral, performance, restart, and release
audit evidence remain separately unverified and must not be inferred from the
green source checks.

## Iteration 1 Remediation

- Aligned `pricing.v1.yaml` with the implemented fail-closed servlet boundary:
  pricing now publishes the trusted service headers plus its filter-specific
  `400`/`401` bodies, and both manual-case operations publish the required
  subject assertion plus its exact `401` and capacity-exhausted `503` bodies.
- Added executable contract coverage that traverses the real
  `PricingServiceIdentityFilter` and `ChargeSubjectAssertionFilter`, including
  rejected, capacity-exhausted, and valid pass-through paths.
- Made the Jackson success renderer omit the inapplicable null
  `agreementVersionId` for tariff pricing. Real Agreement and Tariff renderer
  output is now checked against the OpenAPI properties and the corresponding
  U04 terminal-matrix fixture.

Fresh validation: focused Charge Maven reactor tests PASS (4 tests, 0
failures/errors/skips); contract catalog validation PASS (13 contracts);
provider verification PASS (199 checks, 0 failures, live verification still
explicitly skipped); scoped `git diff --check` PASS. The historical Iteration 1
review verdict above is retained unchanged.

## Review

### Iteration 2

**Verdict: READY**

The two Iteration 1 architecture blockers are resolved.

1. **Pricing/manual authentication is now contract-coherent and executable through the real filters.**
   - `PricingServiceIdentityFilter` responses and `pricing.v1.yaml` agree on headers, statuses, codes, and response shapes for missing or invalid service identity, spoofed identity headers, and invalid correlation IDs.
   - `ChargeSubjectAssertionFilter` responses and both manual-case operations agree on the required subject-assertion header, `401 INVALID_SUBJECT_ASSERTION`, `503 SUBJECT_ASSERTION_CAPACITY_EXHAUSTED`, and the `code`/`message`/empty-`fields` body shape.
   - `PricingOpenApiSecurityFilterContractTest` invokes both production filters and covers rejection and pass-through paths, so these boundary claims are no longer based only on text assertions against the OpenAPI document.

2. **Terminal rendering now matches both OpenAPI and the terminal matrix.**
   - Agreement success output retains its required `agreementVersionId`.
   - Tariff success output omits `agreementVersionId`; it cannot emit the previously forbidden `agreementVersionId: null`.
   - `JacksonPricingTerminalRendererContractTest` exercises the production renderer for both bases, checks emitted properties against the OpenAPI schema, compares the complete JSON output with the terminal-matrix fixtures, and explicitly verifies basis-dependent presence of `agreementVersionId`.

The remediation introduces no new circular dependency, unresolved cross-reference, or ownership inversion. The security filters remain boundary concerns ahead of application authorization, and the renderer remains the terminal-response adapter for the existing immutable receipt flow. The transaction, fencing, and module-ownership conclusions from Iteration 1 are unchanged.

Fresh focused validation:

- The two remediation contract suites passed: **4 tests, 0 failures, 0 errors, 0 skipped**.
- The adjacent five-class Maven regression selection completed successfully with **0 failures**.
- Contract catalog validation passed for **13 contracts**.
- Provider verification passed **199/199 checks**; live-provider execution remained skipped because its external runtime was unavailable.

There are no remaining source-level architecture blockers for U04 Code Generation. Docker/PostgreSQL, browser/Compose, live-provider, bilateral, and final audit evidence remain environment-dependent validation work for the later integration/validation stage; they are not defects in this reviewed source change.

**Final determination:** a developer can implement and integrate U04 from the code and contracts without unresolved architectural guidance. This is code-generation architecture readiness, not production-release certification.
