# Code Summary — U02 Charge Domain Routing and BFF

## Outcome

U02 implements the Charge application's authenticated, base-path-aware BFF
boundary and the matching Charge-service subject-assertion verifier. The
implementation generalizes the U01 Rate proxy behind fixed route policies,
adds bounded Agreement/manual-case/Reference forwarding seams for later units,
and preserves the existing U01 Rate route contract.

The approved plan has 64 of 79 items completed. The remaining 15 items are
explicitly blocked or unobserved evidence items; they are not represented as
passes. No U02 database migration or commercial persistence change was made.

## Files Created or Modified

### Charge BFF and browser boundary

- `apps/charge-agreements/lib/bff/`
  - closed route-policy, request-context, configuration, session/page-auth,
    validation, correlation, replay-key, telemetry, and error types;
  - fair bounded admission, streaming body limits, lifecycle ownership, and
    response normalization;
  - TypeScript subject-assertion issuer;
  - fixed Rate, Agreement, manual-case, and Reference policies plus the shared
    `proxy-charge` core.
- `apps/charge-agreements/lib/rate-proxy.ts`
  - retained as the U01-compatible adapter over the shared policy core.
- `apps/charge-agreements/app/api/`
  - existing Rate handlers preserved;
  - fixed Agreement, manual-case, and bounded Reference-option handlers added;
  - health now exposes configuration readiness without dependency calls.
- `apps/charge-agreements/app/`
  - Charge-owned denied, loading, error, and not-found states added or refined;
  - existing LinerCore shell and `--erp-*` token system retained.
- `apps/charge-agreements/test/fixtures/u02-preservation.json`
  - captures preserved routes, ports, ownership boundaries, and exact U01
    migration hashes.

### Charge service security boundary

- `services/charge-agreement-service/container/src/main/java/com/linercore/platform/chargeagreement/container/security/`
  - strict assertion result/failure model, verifier, bounded replay cache, and
    request filter.
- `ChargeAgreementServiceConfiguration.java` and `application-local.yaml`
  - verifier/filter beans and fail-closed secret, key, and replay-capacity
    configuration.
- `contracts/security/charge-subject-assertion-v1.json`
  - shared TypeScript/Java golden vectors, including Unicode and encoded paths.
- Container tests verify signing parity, request-context binding, rejection
  cases, replay behavior, and trusted-subject exposure.

### Runtime, gates, and documentation

- `infrastructure/nginx/default.conf`
  - exact `^~ /charge-agreements/` routing while preserving other mounts and
    nginx host port 18088.
- `compose.yaml`, `infrastructure/env/wave-a.env.example`, and
  `scripts/wave-a-compose.mjs`
  - Auth/Charge/Reference/assertion settings, 20/10 admission limits, body and
    deadline bounds, Node memory settings, 768 MiB container limit, base-path
    healthcheck, and ten-second shutdown behavior.
- `scripts/u02-route-preservation.mjs` and test
  - base-path, nginx, Wave A, manager-port, ownership, and U01 migration
    preservation checks.
- `scripts/u02-bff-performance.mjs` and test
  - fail-closed evaluator for the specified latency, admission, memory, socket,
    and quiescence evidence.
- `scripts/run-u02-security-gates.mjs` and
  `scripts/verify-security-waivers.mjs`
  - fail-closed security evidence and waiver validation seams.
- `scripts/run-quality-gates.mjs`, root/package workspace scripts, and
  `docs/u02-charge-routing-bff.md`
  - quality-gate registration plus runtime and rollback guidance.
- `tests/e2e/u02-charge-routing.spec.ts`
  - fixture-backed acceptance source; runtime execution remains unobserved.
- `.codebase-memory/`
  - refreshed graph artifact containing the new BFF symbols.

## Key Implementation Decisions

1. Browser input can select neither backend origin/path nor service, actor,
   capability, media type, or idempotency authority. Route handlers select
   immutable policies, and invalid configuration fails protected requests with
   typed 503 responses.
2. The shared proxy authenticates the signed session and exact capability
   before admission or protected lookup, then holds a fair permit through body
   consumption, one backend call, normalized delivery, cancellation, or expiry.
3. The browser session cookie is not forwarded to Charge. Instead, the BFF
   issues a short-lived, context-bound HMAC assertion from a dedicated secret;
   the Java filter verifies canonical bytes, signature, time, request context,
   and nonce replay before exposing the trusted subject.
4. Replay protection is bounded and process-local by design. It is not
   presented as durable cross-restart replay protection.
5. U01 Rate forwarding keeps its public handler shapes and remains
   service-authorized. U03 will consume the trusted subject for Agreement
   lifecycle behavior; U02 does not implement Agreement business rules.
6. U02 changes no Flyway file or commercial schema. The executable preservation
   gate checks the exact U01 V1–V4 migration set and hashes.
7. The UI follows the LinerCore operational-console contract using existing
   shell/primitives/tokens. U02 does not edit `packages/ui`, shared navigation,
   typography, palette, or the design-system master.

## Story and Requirement Trace

| Scope | Implementation |
|---|---|
| US-13 / BFF-005–BFF-017 | Signed-session authorization, fixed policies, bounded forwarding, assertion binding, safe errors, and correlation |
| US-14 / BFF-019–BFF-020 | Base-path health and accessible Charge-owned route states |
| FR-002–FR-004 | Trusted actor propagation, exact authorization, safe command/query forwarding |
| FR-601 / FR-606 | Charge mount, health/readiness, loading/error/denied/not-found behavior |
| FR-702 / FR-703 | Isolated Wave A/nginx configuration and preservation gates |
| NFR-004 | Fail-closed authentication, authorization, assertion, replay, and response boundaries |
| NFR-005 / NFR-009 / NFR-010 | Resource bounds, observability fields, compatibility, rollback, and isolation |

## Validation Evidence

| Check | Result | Evidence boundary |
|---|---|---|
| Charge TypeScript type-check | PASS | Zero errors after the final source batch |
| Charge lint | PASS | Zero lint warnings/errors; existing Next deprecation/plugin notices remain |
| Charge Maven reactor | PASS | `BUILD SUCCESS`; Docker-dependent tests were skipped |
| Assertion verifier/filter | PASS | 4/4 focused tests |
| Contract catalog | PASS | 13 contracts green |
| Rendered Wave A configuration | PASS | Exact configuration assertions passed |
| Route/base-path/U01 migration preservation | PASS | Executable and direct-process test passed |
| Performance evaluator logic | PASS | Direct-process evaluator test passed; no measured SLO claim |
| Script syntax | PASS | All new Node scripts parsed |
| Playwright discovery | PASS | Two U02 tests discovered; browser behavior not executed |
| Code graph refresh | PASS | 77,073 nodes / 89,283 edges; new BFF symbols found |
| `git diff --check` | PASS | Line-ending notices only |
| Vitest | BLOCKED | Managed Windows sandbox returned `spawn EPERM` before test execution |
| Next production build | BLOCKED | Managed Windows sandbox returned `spawn EPERM` |
| Isolated `node --test` | BLOCKED | Child-process creation returned `spawn EPERM`; same-process tests passed |
| Security scans and waiver freshness | BLOCKED | No authoritative pinned version/digest lock or trusted CI-time source |
| Measured BFF performance/resource SLOs | BLOCKED | Required warm-up/sample/runtime evidence is absent |
| Browser/accessibility/screenshots | UNOBSERVED | Built app, fake backends, and signed fixture runtime unavailable |
| Docker integration | BLOCKED | Docker unavailable; dependent tests skipped |

## Plan Deviations and Residual Work

- Test source exists for the major BFF components, but Vitest could not start,
  so coverage, behavioral breadth, and the 80% changed-line floor are unproven.
- The Java suite validates replay rejection and capacity behavior, but the
  explicitly concurrent 4096-claim proof remains unchecked.
- Security and performance gates intentionally exit non-zero when authoritative
  tool pins, trusted CI time, scan reports, or measured samples are absent.
- Full quality-registry execution, live Wave A, manager-demo guards,
  integrated DS-02/DS-03, `aidlc-audit`, and `erp-fidelity-audit` remain for the
  later guarded acceptance work and are not claimed by U02.
- The code graph indexes application code but excludes `scripts`, `tests/e2e`,
  and documentation; those artifacts were source-checked rather than
  graph-verified.
- The AI-DLC approval logger could not execute in this managed session because
  Bun received `EPERM` while reading `.codex/tools/aidlc-log.ts`. The exact plan
  approval selection is preserved in `code-generation-plan.md`.

## Completion Assessment

U02 generation is source-complete for its approved routing/BFF/security/runtime
scope, with blocked evidence kept visible in the plan. Release or Build-and-Test
acceptance must execute the unchecked tests and gates in an environment that
provides esbuild child processes, Docker, browsers, authoritative security-tool
pins, trusted CI time, and measured runtime samples.

## Iteration 1 Remediation

All three Iteration 1 source blockers were remediated without changing product
scope:

1. `FairSemaphore` now has an explicit waiter bound, defaulting to the active
   permit capacity, and throws the typed `FairSemaphoreCapacityError` before
   allocating another promise, timer, or abort listener. Protected and
   Reference forwarding map that condition to their existing bounded capacity
   503 responses. Focused tests cover saturation, FIFO handoff, recovery,
   double release, timeout, cancellation, and invalid bounds.
2. The browser request signal is linked to the tracked upstream controller and
   the total route deadline remains active across admission, request-body
   consumption, upstream fetch, and provider normalization. Pending request and
   provider reads receive `reader.cancel()` on abort; upstream fetch receives
   the same abort; all non-transferred and response EOF/cancel/no-body paths
   unlink listeners and release permits exactly once. Tests cover pending-read
   cancellation, browser-to-upstream abort, deadline abort, and permit recovery.
3. Dynamic Agreement and manual-case handlers now pass raw route parameters to
   `proxyCharge`; the shared proxy validates them before admission inside its
   typed `RequestValidationError` boundary. Handler-level tests assert an exact
   bounded 400 JSON envelope and no downstream call for malformed identifiers.

The shared negative-case catalog is now parameterized in both TypeScript and
Java. Java also proves 4096 unique concurrent claims, fail-closed admission at
4097, expiry cleanup, and post-expiry recovery.

Fresh remediation evidence:

- **PASS:** Charge TypeScript typecheck and lint with zero warnings/errors.
- **PASS:** focused same-process queue saturation/recovery and pending-reader
  cancellation.
- **PASS:** focused Maven verifier suite, 6 tests with zero failures/errors,
  including every shared negative fixture case and concurrent replay capacity.
- **BLOCKED:** Vitest remains subject to the managed sandbox's esbuild
  child-process restriction; no Vitest pass is inferred from typecheck or the
  same-process focused proof.
- Existing Docker, browser, security-pin/scan, measured-performance, coverage,
  and live-runtime evidence remains blocked or unobserved and is not reclassified.

## Review

### Iteration 1

Verdict: NOT-READY

Blocking findings:

1. `FairSemaphore` limits active permits but leaves its waiter array unbounded.
   A burst can create an arbitrary number of promises, timers, and abort
   listeners during the 100 ms wait window, so the claimed bounded admission
   and memory containment do not hold under adversarial load. Add an explicit
   queue bound with a fail-fast capacity response and cover saturation plus
   recovery.
2. Cancellation ownership is incomplete. `proxyCharge` does not connect
   `request.signal` to its tracked controller, and `readBoundedBytes` checks the
   supplied signal only before `reader.read()`; an abort that occurs while a
   request-body read is pending neither cancels that reader nor settles the
   read. A stalled upload or disconnected browser can therefore retain a permit
   and outlive the 2.5 second deadline. Wire client abort/deadline to request
   and provider readers and test pending-read cancellation, permit release, and
   upstream abort.
3. Agreement/manual-case route handlers call `safeIdentifier` before entering
   `proxyCharge`. Its `RequestValidationError` therefore bypasses the proxy's
   typed error handling, turning malformed dynamic identifiers into framework
   errors instead of the documented bounded 400 response. Move identifier
   parsing inside a shared route error boundary and add handler-level tests.

Non-blocking findings and evidence limits:

- Fixed policy selection prevents browser-controlled origin/path/service/media
  authority; signed-session capability checks precede protected admission, and
  provider errors are normalized without forwarding cookies or provider
  headers.
- TypeScript and Java positive golden vectors align, and the Java replay cache
  is synchronized and fail-closed at capacity. The fixture's negative-case
  catalog is not executed as a shared TS/Java parameterized contract, and the
  documented concurrent 4096-claim proof remains absent; add both to prevent
  parity and concurrency regressions.
- U01 route/migration preservation passed and no U02 migration was introduced.
  Compose/nginx source retains the Charge base path, port 18088, fixed service
  origins, health path, resource settings, and ten-second stop grace period.
- Docker, browser/accessibility execution, security scans/pins, measured
  performance, live Compose, Vitest, and Next production build remain
  environment-blocked or unobserved. Those missing observations are not treated
  as source failures here, but they remain required acceptance evidence.

Validation:

- PASS: `yarn workspace @erp/app-charge-agreements typecheck`.
- PASS: `yarn workspace @erp/app-charge-agreements lint` with zero warnings or
  errors; Next deprecation/plugin notices remain.
- PASS: `node scripts/u02-route-preservation.test.mjs`.
- PASS: `node scripts/u02-bff-performance.test.mjs` for evaluator logic only;
  no measured SLO claim.
- PASS: `git diff --check` apart from line-ending conversion warnings.
- BLOCKED: fresh focused Maven verifier execution stopped before the container
  module because the managed sandbox denied Maven writes under the user
  repository; the prior successful Java evidence was not reclassified.

### Iteration 2

Verdict: NOT-READY

Blocking finding:

1. The new queue bound is correct in production, but
   `fair-semaphore.test.ts` was not made consistent with it. The FIFO test
   constructs `new FairSemaphore(1)`, whose default `maximumQueued` is now one,
   then creates both a second and third pending acquisition. The third
   acquisition deterministically rejects with `QUEUE_CAPACITY_EXHAUSTED`, so
   the test cannot reach its expected `[2, 3]` handoff assertion. Set an
   explicit queue bound of at least two for that FIFO test (while retaining the
   separate saturation test), then execute the focused Vitest suite in a
   child-process-capable environment.

Remediation verification:

- The three Iteration 1 production blockers are remediated: admission now has
  an allocation-before-queue bound and typed capacity mapping; request abort
  and the total deadline cancel pending readers/upstream work and release
  permits; dynamic identifiers are parsed within `proxyCharge`'s typed error
  boundary with handler-level no-fetch assertions.
- Both TypeScript and Java now enumerate every shared negative fixture case.
  Java source also exercises 4096 concurrent unique claims, fail-closed claim
  4097, expiry cleanup, and recovery. No additional assertion or replay source
  defect was found.
- Docker, browser/accessibility, security-pin/scan, measured-performance,
  coverage, live-Compose, and production-build gaps remain acceptance-evidence
  limitations rather than newly discovered source defects.

Validation:

- PASS: fresh Charge type-check and lint; zero warnings/errors, excluding the
  existing Next deprecation/plugin notices.
- PASS: fresh route/U01-migration preservation and performance-evaluator logic
  tests.
- PASS: fresh `git diff --check` apart from line-ending conversion warnings.
- CONFIRMED: a same-process transpilation/execution of the actual semaphore
  source reproduced the FIFO-test contradiction: capacity one accepted the
  second waiter and rejected the third with `QUEUE_CAPACITY_EXHAUSTED`.
- BLOCKED: focused Vitest startup still failed at esbuild `spawn EPERM`, before
  test execution.
- BLOCKED: fresh offline focused Maven execution could not resolve the sibling
  reactor artifacts; the reported prior six-test Maven pass was not
  reclassified.

## Post-Review Remediation

The reviewer iteration limit was exhausted with Iteration 2 still
`NOT-READY`, so no third reviewer pass was invoked. The single remaining
finding was corrected afterward without rewriting either reviewer verdict:

- `fair-semaphore.test.ts` now constructs the FIFO fixture with
  `new FairSemaphore(1, 2)`, allowing two queued waiters as the `[2, 3]`
  assertion requires. The separate saturation/recovery test continues to use
  a queue bound of one and therefore retains coverage of fail-fast capacity
  behavior.
- Fresh Charge TypeScript type-check: **PASS**.
- Fresh Charge lint: **PASS**, zero warnings/errors; the existing Next lint
  deprecation and missing-plugin notices remain.
- Focused Vitest execution remains **BLOCKED** because this managed Windows
  environment cannot start esbuild (`spawn EPERM`). The corrected test source
  therefore requires execution in Build and Test; no test pass is inferred
  from type-check or lint.

The final architecture-review verdict remains visible as `NOT-READY` because
the workflow permits at most two reviewer iterations. The unresolved item is
now an execution-evidence gap rather than a known source contradiction.
