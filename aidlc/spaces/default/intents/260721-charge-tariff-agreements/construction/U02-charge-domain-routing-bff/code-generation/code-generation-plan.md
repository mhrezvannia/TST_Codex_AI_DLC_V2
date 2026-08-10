# Code Generation Plan — U02 Charge Domain Routing and BFF

## Status

**Approved 2026-07-28.** U02 product-code generation may proceed against this
plan. Approval selection: `Approve plan (Recommended)`.

## Scope and implementation boundary

U02 turns the existing Charge Next.js application into the authenticated, base-path-aware browser boundary for the Charge domain. It owns the Charge-local BFF core, fixed route policies, safe page guards and route states, exact nginx mount, Compose health/configuration, the TypeScript issuer and Java verifier for the internal subject assertion, performance/backpressure controls, and focused quality gates. It does not own Rate, Agreement, pricing, or manual-case business rules; create a new service or data store; redesign the shell or `packages/ui`; add RTK; modify Booking pages; target the manager project/port 8088; or claim U06 live acceptance.

The implementation must preserve the U01 Rate routes and tests already present in `apps/charge-agreements/app/api/rates/**`, `apps/charge-agreements/lib/rate-proxy.ts`, and `apps/charge-agreements/lib/rates.ts`. The checked-in code graph predates those U01 files, so implementation discovery must continue graph-first and then cross-check current source before editing.

## Binding decisions and approval-sensitive tradeoffs

1. **Generalize without breaking U01.** Replace the internals of the narrow `rate-proxy.ts` with a shared fixed-policy BFF core, while retaining its exported `proxyRate(...)` compatibility adapter and the existing public Rate route shapes. This avoids two security implementations without forcing U01 route/UI churn.
2. **Implement the bilateral assertion seam now.** U02 owns the TypeScript issuer, exact shared golden-vector contract, Java verifier/replay cache/filter, and their tests. U03 will consume the verified subject in its Agreement application/controller behavior; U02 must not implement Agreement lifecycle rules. Existing legacy Agreement behavior remains explicitly separate from the W2 vendor-media policies.
3. **No database migration.** U01 owns Charge V1–V4. U02 adds no table, cache, replay ledger, or commercial persistence. A migration/schema-diff guard must prove that U02 did not change `services/charge-agreement-service/**/db/migration/**`.
4. **Fail closed rather than add a bypass.** Invalid non-local session, origin, URL, secret, assertion, or capacity configuration keeps protected routes at typed 503 and health at `DOWN`; there is no permissive fallback.
5. **Security-gate specification gap.** The consumed deployment design says U02 owns pinned Semgrep/Gitleaks tooling, normalized reports, and expiring waivers, but its reviewer history references a separate CI artifact that is not among this unit’s supplied inputs and the workspace currently contains none of those files. Step 13 proposes concrete repository locations and fail-closed behavior, but tool versions/image digests and the trusted CI-time source must be confirmed during plan approval or derived from the authoritative CI artifact before generation. No invented scan PASS or waiver-freshness claim is permitted.
6. **Reviewer history remains honest.** `deployment-architecture.md` retains an iteration-two `NOT-READY` verdict followed by lead corrections. Implementation can prove those corrections, but must not relabel the design review as READY.
7. **UI skill reconciliation.** Reject the skill’s hero, logo-carousel, new palette/fonts, spinner, chart/KPI, and marketing CTA recommendations. Use only the shared authenticated shell, `@erp/ui` primitives and `--erp-*` tokens, stable skeletons, Charge-owned route-state compositions, and the existing Charge page override. Do not edit `packages/ui`, the shell, global navigation, the LinerCore master, or the Charge page override.

## Sequenced implementation plan

### Step 1 — Freeze the brownfield compatibility and ownership baseline

- [x] Re-run graph queries for `@erp/auth` session/capability helpers, shell authentication, Charge/Reference clients, and Charge backend authorization; cross-check current U01 files and record the exact edit set before changing code.
- [x] Add a focused ownership/compatibility fixture or test manifest under `apps/charge-agreements/test/fixtures/u02-preservation.json` covering the existing Rate BFF routes, `/`, `/auth`, `/reference-data`, `/booking`, `/bookings`, `NGINX_HOST_PORT=18088`, and forbidden 8088 targets.
- [x] Add a static migration-ownership assertion to the U02 verification script so no Flyway file is added, removed, or edited by this unit.
- [x] Preserve all U01 and unrelated/user edits; do not alter `packages/ui`, shared shell/navigation, Booking pages, historical W1 waiver/evidence, or Charge V1–V4 migrations.

**Traceability:** US-13, US-14; BFF-003, BFF-004, BFF-017, BFF-018, BFF-020; FR-601, FR-702, FR-703; NFR-005, NFR-010.

### Step 2 — Define the closed BFF types, configuration, and startup-readiness model

- [x] Add Charge-local server modules under `apps/charge-agreements/lib/bff/`: `types.ts`, `route-policy.ts`, `config.ts`, `request-context.ts`, and `errors.ts`.
- [x] Model immutable `ChargeRoutePolicy`, `AuthenticatedSubject`, `ChargeRequestContext`, `Capability`, `AccessClass`, `BodyMode`, `IdempotencyMode`, media constants, safe identifiers, correlation, return URL, client request UUID, replay key, and normalized error types.
- [x] Validate `basePath`, fixed Charge/Reference origins, `CHARGE_PUBLIC_ORIGINS`, dedicated assertion secret/KID, session/service secrets, permit/deadline/body limits, and forbidden bypass values once per process.
- [x] Expose a configuration-readiness result used by health and protected requests: invalid configuration remains process-alive for health but all protected forwarding fails with 503 `CHARGE_CONFIGURATION_INVALID`.
- [x] Keep browser-selected host, backend path, media, method, capability, actor, or service identity impossible by construction.

**Traceability:** US-13; BFF-005, BFF-008, BFF-011, BFF-017; FR-002, FR-003; NFR-004, NFR-010.

### Step 3 — Implement signed-session page/BFF authentication and exact capability decisions

- [x] Add `apps/charge-agreements/lib/bff/session.ts` and `page-auth.ts` using only `@erp/auth` `sessionFromRequest`/cookie verification, `parsePermission`, `safeReturnUrl`, and correlation helpers.
- [x] Derive user subject/display and exact resource/action/scope capabilities only from the signed `lc_session`; never use browser role/capability fields.
- [x] Implement safe Charge return URLs: maximum 2048 characters, no controls/backslashes/network path, equal to or below `/charge-agreements`, fallback `/charge-agreements/`.
- [x] Distinguish HTML behavior (safe Auth redirect) from BFF behavior (401 JSON), and authorize before any protected record/manual-case lookup.
- [x] Implement exact Rate, Agreement, and manual-evidence policy grants; `charge-manual-cases:read` must never be implied by generic Charge read.

**Traceability:** US-01, US-12, US-13; BFF-006–BFF-010; FR-002, FR-003, FR-004; NFR-004.

### Step 4 — Implement bounded admission, request validation, and cancellation-safe resource handling

- [x] Add `apps/charge-agreements/lib/bff/fair-semaphore.ts`, `bounded-stream.ts`, `request-validation.ts`, and `lifecycle.ts`.
- [x] Enforce one fair 20-permit protected-forwarding pool and separate 10-permit Reference selector pool; acquire after auth/capability and before body consumption, wait at most 100 ms inside the total deadline.
- [x] Hold the protected permit through body parsing, one backend call, normalization, delivery close/cancel/error, or five-second egress expiry; prevent double release and reject new work during SIGTERM drain.
- [x] Bound browser JSON mutations to declared and actual 32 KiB, backend JSON to 512 KiB, Reference responses to 128 KiB, and decode UTF-8 fatally without `request.json()`, `response.json()`, unbounded `.text()`, or body cloning on protected paths.
- [x] Enforce canonical query allowlists, single scalar keys, decoded-once safe IDs, fixed origin allowlist, exact JSON media, UUID client request IDs, authority-field rejection, and redirect mode `manual`.

**Traceability:** US-13; BFF-009, BFF-011, BFF-012, BFF-014; NFR-004, NFR-009; performance admission and 24 MiB/admission design.

### Step 5 — Implement safe correlation, derived replay keys, and bounded error normalization

- [x] Add `apps/charge-agreements/lib/bff/correlation.ts`, `replay-key.ts`, `response-normalizer.ts`, and `telemetry.ts`.
- [x] Accept only correlation values matching `^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$`; otherwise mint a UUID, then echo the same value in downstream headers, response headers, and error envelopes.
- [x] Derive `charge-ui:v1:<sha256>` from unambiguous length-prefixed subject/route/target/expected-version/client UUID input; never forward a browser idempotency key or plaintext subject.
- [x] Forward derived idempotency only for opted-in policies and document that it is not persistent replay protection unless the downstream endpoint stores/recognizes it.
- [x] Preserve the allowed non-2xx status set and safe provider fields; replace malformed, HTML, oversized, wrong-media, unsafe, or transport/deadline responses with exact typed failures. Never copy raw exceptions, SQL, stacks, tokens, cookies, actors, amounts, customer/Booking data, or raw bodies into responses/logs.
- [x] Emit only bounded route/operation/outcome/status-class metrics and safe timing/byte/permit-wait log fields.

**Traceability:** US-13; BFF-013–BFF-016; FR-004; NFR-004, NFR-009.

### Step 6 — Implement the TypeScript subject-assertion issuer and shared contract fixture

- [x] Add `apps/charge-agreements/lib/bff/subject-assertion.ts`.
- [x] Add the single owned fixture `contracts/security/charge-subject-assertion-v1.json` with schema `linercore.charge-subject-assertion-vectors/v1`; include valid Unicode/encoded-path/time cases and malformed envelope, context, signature, key, duplicate-nonce, expiry, and capacity cases.
- [x] Implement exact `X-LinerCore-Subject-Assertion` compact `v1.<kid>.<payload>.<signature>` issuance with fixed nine-field byte-length-framed UTF-8 record, uppercase method/percent hex, 30-second life, 128-bit random nonce, base64url without padding, and HMAC-SHA-256 over the exact compact signing input.
- [x] Use only dedicated `CHARGE_BFF_ASSERTION_SECRET`; reject reuse/equality with `AUTH_SESSION_SECRET`. Do not forward the session cookie to Charge.

**Traceability:** US-13; BFF-008, BFF-009; FR-002, FR-004; NFR-004.

### Step 7 — Implement the Java assertion verifier and bounded replay defense

- [x] Add framework-edge classes under `services/charge-agreement-service/container/src/main/java/com/linercore/platform/chargeagreement/container/security/`: `ChargeSubjectAssertionVerifier.java`, `ChargeSubjectAssertionReplayCache.java`, `ChargeSubjectAssertionFilter.java`, and typed failure/result classes.
- [x] Strictly decode one non-duplicate header; validate version/KID, canonical bytes, issuer, method, normalized path, correlation, signature in constant time, `iat`/`exp` with five-second skew, and request context before authorization.
- [x] Atomically claim `<kid>:<nonce>` in a 4096-entry process-local map until `exp+5`; duplicate is 401, capacity exhaustion is safe 503, expiry cleanup is bounded, and restart’s residual replay window remains documented as local-only.
- [x] Make the verified actor available only as trusted request context for U03’s future Agreement controller/service authorization; do not modify Agreement domain rules or weaken U01 Rate/service authorization.
- [x] Configure the filter only for the protected W2 Agreement administration surface, leaving health, Rate, pricing-service, and explicit legacy behavior unchanged.

**Traceability:** US-13; BFF-008, BFF-009; FR-002–FR-004; NFR-004, NFR-010.

### Step 8 — Build the fixed Charge policy registry and refactor U01 Rate forwarding compatibly

- [x] Add `apps/charge-agreements/lib/bff/policies.ts` and `proxy-charge.ts` with literal policies for existing Rate operations and the defined Agreement/manual-evidence operations.
- [x] Fix method, path builder, capability, access class, body mode, idempotency mode, media, size, timeout, and assertion behavior in each policy. Every U03 W2 Agreement policy uses `application/vnd.linercore.charge-agreement-v2+json`; browser headers cannot override it.
- [x] Retain an explicit, isolated legacy Agreement compatibility transform that reconstructs `actorSubjectId`/query actor from the signed subject without spreading untrusted input; W2 pages/policies must not use it.
- [x] Refactor `apps/charge-agreements/lib/rate-proxy.ts` into a thin compatibility adapter over the shared core and update Rate route handlers only as needed to select literal policies.
- [x] Keep service-side authorization mandatory; a BFF allow never substitutes for Identity/service enforcement.

**Traceability:** US-01, US-12, US-13; BFF-008–BFF-017; FR-002–FR-004; NFR-004, NFR-010.

### Step 9 — Add domain BFF route handlers and bounded Reference selector routing

- [x] Keep/update `apps/charge-agreements/app/api/rates/**/route.ts` to use fixed Rate policies without changing public paths or response semantics.
- [x] Add Charge-local route modules for Agreement list/detail/create/update/approve/successor/suspend/expire and manual-case reads under `apps/charge-agreements/app/api/**`, selecting policies only by imported constants.
- [x] Add `apps/charge-agreements/app/api/reference-options/route.ts` and `lib/bff/reference-options.ts` with page/domain capability precheck, fixed W0-02 paths/service identity/token, query <=128, at most 50 labels, label <=256, 2000 ms deadline, 128 KiB response, and no command authority.
- [x] Reject unknown/duplicate query fields, unsafe IDs, unsupported methods, actor/service/capability headers, and arbitrary backend paths before forwarding.
- [x] Remove `module-info` skeleton fallback from authoritative domain paths; provider failures remain non-2xx.

**Traceability:** US-01, US-12, US-13; BFF-008–BFF-017; FR-001–FR-004, FR-601; NFR-004, NFR-009, NFR-010.

### Step 10 — Complete base-path-aware health and accessible route states

- [x] Update `apps/charge-agreements/app/api/health/route.ts` to return exactly `service`, `status`, and UTC ISO timestamp, with exact JSON content type and 200/UP or configuration-invalid 503/DOWN; never call dependencies.
- [x] Add/complete root and Charge segment `loading.tsx`, `error.tsx`, `not-found.tsx`, and Charge-local denied composition, sharing narrow domain-local helpers rather than a second UI library.
- [x] Ensure error focus on a labelled alert, reset-based Retry, safe correlation/request reference, base-path-safe return links, and no protected metadata in denied/not-found states.
- [x] Use `@erp/ui` primitives/tokens and existing Charge styles only; add `data-testid` to interactive actions. Use one `h1`, ordered headings, visible focus, text/icon status, 44 px actions, live regions, reduced motion, and 320/375+ reflow.
- [x] Do not hide the shell ribbon locally; DS-03 remains blocked until W2-02’s shared route-metadata seam is integrated and observed. Do not claim DS-02 from a wrapper.

**Traceability:** US-13, US-14; BFF-005, BFF-006, BFF-019, BFF-020; FR-601, FR-606; NFR-006, NFR-007.

### Step 11 — Make nginx and Compose changes exact, isolated, and rollback-safe

- [x] Change `infrastructure/nginx/default.conf` Charge prefix to exact `location ^~ /charge-agreements/` while keeping the existing 308 and path-preserving `proxy_pass` without URI suffix; preserve all other locations byte-behaviorally.
- [x] Update `compose.yaml` for `apps-charge-agreements`: required Auth/Charge/Reference configuration, service identities/tokens, public origin, dedicated assertion secret/KID, 20/10 permit and size/deadline values, `NODE_OPTIONS=--max-old-space-size=512 --max-semi-space-size=8`, 768 MiB limit, full base-path healthcheck, and ten-second shutdown allowance.
- [x] Inject the same assertion secret/KID and replay capacity into the Charge backend verifier; add Reference service dependency only as required by health ordering, without a new service/network/volume/port.
- [x] Update `infrastructure/env/wave-a.env.example` with explicit local-only examples and keep nginx at 18088. Validate `scripts/wave-a-compose.mjs config` rejects wildcard bindings, topology drift, manager 8088 targets, and secret equality/missing values.
- [x] Preserve developer defaults as non-acceptance conveniences only; non-local readiness stays fail-closed.

**Traceability:** US-13; BFF-001–BFF-005, BFF-020; FR-601, FR-702, FR-703; NFR-004, NFR-005, NFR-010.

### Step 12 — Add Standard-strategy unit, integration, contract, and UI tests alongside code

- [x] Add TypeScript unit suites (target 5–8 requirement-driven cases per component): `config.test.ts`, `session.test.ts`, `route-policy.test.ts`, `request-validation.test.ts`, `fair-semaphore.test.ts`, `bounded-stream.test.ts`, `response-normalizer.test.ts`, `replay-key.test.ts`, `subject-assertion.test.ts`, and `reference-options.test.ts`.
- [ ] Cover missing/expired session, exact allow/deny, manual non-disclosure, spoofed authority, origin/media/body/query/path/token failures, timeout/transport/malformed/oversized responses, correlation replacement/echo, replay-key determinism/separation, queue cancellation, FIFO handoff, streaming cancellation, double-release prevention, and five-second egress expiry.
- [ ] Add route integration suites beside `app/api/**` using two independent Node/test servers and fake bounded streams; prove fixed host/path/media, no redirect following, Rate compatibility, safe Agreement vendor policy, and no generic open proxy.
- [ ] Add shared-fixture Java tests under `container/src/test/.../security/`: exact TypeScript/Java golden-vector parity, wrong context/signature/time, duplicate header/nonce, concurrent 4096 claims, 4097 safe 503, expiry cleanup, and post-expiry admission.
- [ ] Add `app/api/health/route.test.ts`, route-state component tests, and denied/manual-disclosure tests with keyboard focus/live-region assertions. Extend the existing root/rate tests rather than duplicate them.
- [x] Keep root `vitest.config.ts`/`vitest.setup.ts` as the standard test configuration; change them only if a concrete missing environment setup requires it. Add any new test patterns to the Charge workspace script without creating a second Vitest config.
- [ ] Enforce at least 80% line coverage for changed Charge frontend/BFF and Java verifier code; test failures and threshold failures block completion.

**Traceability:** US-01, US-12–US-14; BFF-001–BFF-020; FR-001–FR-004, FR-601, FR-606; NFR-004–NFR-010.

### Step 13 — Add executable routing, security, performance, and preservation gates

- [x] Add `scripts/u02-route-preservation.mjs` and `.test.mjs` to parse/render nginx/Compose, assert exact redirect/prefix/health behavior, preserve `/`, `/auth`, `/reference-data`, `/booking`, `/bookings`, verify assets/deep links stay under the base path, and fail if any U02 command/config targets 8088 or the manager project.
- [ ] Add `scripts/u02-bff-performance.mjs` and `.test.mjs`: 20 warm-ups, exact 100-call per-route samples, 10-client normal load plus 20-admission adversarial load, nearest-rank p95/p99, parent/child correlation validation, raw signed overhead (no clamping), event-loop/socket/permit/heap/external/RSS telemetry, and 60-second quiescence.
- [ ] Gate p95 <=100 ms and p99 <=200 ms BFF overhead; 24 MiB/admission; `heapUsed <=432 MiB`; `external <=48 MiB` counted once; diagnostic `arrayBuffers` subset; `RSS - heapUsed - external <=64 MiB`; RSS <=544 MiB; old-space headroom >=80 MiB; zero retained admissions and sockets <=idle+2.
- [ ] Add the approved security tooling at the confirmed repository locations (proposed: `.semgrep.yml`, `.gitleaks.toml`, `infrastructure/security/u02-toolchain-lock.json`, `infrastructure/security/security-waiver.schema.json`, `scripts/run-u02-security-gates.mjs`, `scripts/verify-security-waivers.mjs`, and tests). Pin exact versions/digests, normalize reports, fail on missing/malformed output and changed-code Critical/High findings, and evaluate waiver expiry against confirmed trusted current CI UTC with freshness proof—not source-commit time.
- [ ] Update `scripts/run-quality-gates.mjs`, its tests, `package.json`, and `.github/workflows/quality-gates.yml` with Charge lint/build, U02 tests, route/config, assertion-contract, security, and performance-smoke gate IDs. Keep least-privilege workflow permissions and immutable Yarn install.
- [ ] Add dependency/diff checks proving no new runtime library without approval, no app-to-app import, no direct UI component fetch, no `packages/ui` edit, no database/migration change, no raw hex/local palette, and no protected content in logs/evidence.

**Traceability:** US-13, US-14; BFF-001–BFF-020; FR-004, FR-601, FR-606, FR-702, FR-703; NFR-004–NFR-010.

### Step 14 — Add fixture-backed browser proof for U02-owned behavior

- [ ] Add `tests/e2e/u02-charge-routing.spec.ts` (or the repository’s established Playwright location) with a built Charge app, fake fixed Charge/Reference backends, and signed session fixtures.
- [ ] Prove exact root 308, deep-link/reload/asset/BFF base paths, safe missing-session redirect, BFF 401, authenticated read, mutation 403, manual non-disclosure, typed not-found, service error/retry, loading geometry, back/forward query restoration, and correlation display.
- [ ] Verify keyboard focus order, error alert focus, Retry, status text beyond color, no serious/critical automated accessibility violation, light/dark token behavior, and screenshots at 375, 768, 1024, and 1440 px.
- [ ] Mark DS-03/no-ribbon and full integrated DS-02 behavior blocked unless the exact W2-02 shell seam is present in the running integration. Do not substitute source inspection or fixture proof for U06 Compose/live acceptance.

**Traceability:** US-13, US-14; BFF-001, BFF-002, BFF-006–BFF-010, BFF-019, BFF-020; FR-601, FR-606, FR-705; NFR-006, NFR-007.

### Step 15 — Document operations, rollback, and evidence boundaries

- [x] Add inline documentation for canonical assertion bytes, permit lifecycle, bounded-stream ownership, safe error replacement, and legacy compatibility only where the reason is non-obvious.
- [x] Update Charge/runtime documentation with exact environment variables, direct/nginx health paths, fixed BFF policy rules, local-only assertion replay limitation, observed-versus-unobserved evidence, and no production SLO/topology claim.
- [x] Document rollback as redeploying the prior Charge app/nginx/Compose revision together; restore the prior `rate-proxy.ts` compatibility behavior; remove only U02 route/config/assertion wiring; retain all U01 code/data/migrations. No database down migration or destructive reset is needed or allowed.
- [x] Require post-rollback probes for existing Rate API/UI and preserved nginx routes. If a forward deployment has emitted assertions, rotate/remove the dedicated U02 assertion secret from both issuer and verifier together; never roll one side independently.
- [x] Keep Docker, full Wave A, demo guards, integrated DS-02/DS-03, manager preservation, `aidlc-audit`, and `erp-fidelity-audit` as pending U06 evidence unless actually observed in this environment.

**Traceability:** US-13, US-14; BFF-003, BFF-015, BFF-020; FR-702, FR-703, FR-706; NFR-005, NFR-010.

### Step 16 — Execute and retain verification evidence

- [ ] Run all commands below, retain stdout/exit status and generated reports, mark blocked commands honestly, and update this plan’s checkboxes only after observed completion.
- [x] Run `git diff --check` and a scoped diff/ownership review before code summary.
- [x] Re-index or update the code knowledge graph after implementation and record any stale/semantic limitation separately from source and runtime proof.

**Traceability:** all U02 stories/rules; FR-702, FR-703, FR-705, FR-706; NFR-008–NFR-010.

## Verification commands and required evidence

Commands may be refined only to match confirmed repository scripts/tool locks; the asserted behavior and pass/fail criteria are binding.

```powershell
# Charge unit/integration/UI and static gates
corepack yarn workspace @erp/app-charge-agreements test
corepack yarn workspace @erp/app-charge-agreements typecheck
corepack yarn workspace @erp/app-charge-agreements lint
corepack yarn workspace @erp/app-charge-agreements build

# Java assertion verifier/filter plus existing Charge tests
mvn -f services/pom.xml -pl charge-agreement-service/container -am test

# U02 route/config, security, and performance gates
node --test scripts/u02-route-preservation.test.mjs scripts/u02-bff-performance.test.mjs
node scripts/u02-route-preservation.mjs
node scripts/run-u02-security-gates.mjs --evidence artifacts/u02-charge-routing/security
node scripts/u02-bff-performance.mjs --evidence artifacts/u02-charge-routing/performance

# Shared contract and quality registry
node scripts/validate-contract-catalog.mjs
node scripts/run-quality-gates.mjs --all --evidence artifacts/quality-gates/evidence.json

# Static isolated Compose rendering only; does not equal live acceptance
node scripts/wave-a-compose.mjs config

# Fixture-backed browser suite
corepack yarn playwright test tests/e2e/u02-charge-routing.spec.ts

# Diff/ownership/escaping checks
git diff --check
git diff --name-only
```

Evidence must show:

- all changed Charge TypeScript and Java verifier lines meet the 80% coverage floor;
- every fixed route policy’s method/path/media/capability is exercised;
- the TypeScript issuer and Java verifier consume the same checked-in golden vectors;
- no browser actor/service/capability authority crosses the BFF;
- manual evidence is authorized before existence/count lookup;
- U01 Rate routes and existing nginx routes remain compatible;
- no Flyway or commercial schema/store is changed;
- p95/p99, memory partitions, permits, sockets, timeouts, and raw samples meet the local U02 design without double-counting `arrayBuffers`;
- security tools are pinned, reports are valid, no changed-code Critical/High finding is silently waived, and expiry uses trusted current CI time;
- the manager project/port 8088 is never targeted or mutated;
- UI route states satisfy keyboard/focus/live-region/responsive checks without editing shared owners;
- Docker/live/audit cells remain `BLOCKED` or `UNOBSERVED` unless the exact guarded U06 workflow is actually run.

## Observed generation evidence — 2026-07-28

The following results are source/build evidence only and do not claim U06 release acceptance:

- **PASS:** Charge TypeScript typecheck; Charge lint with zero warnings/errors; full Charge Maven reactor
  `BUILD SUCCESS` including four assertion-verifier tests; contract catalog validation with 13 contracts
  and green health; rendered Wave A Compose configuration; U02 route/base-path/Wave A/Flyway
  preservation executable; direct-process preservation and performance-evaluator tests; Node syntax
  checks; Playwright discovery of two U02 tests; final scoped ownership review; and `git diff --check`.
- **PASS, graph scope limitation recorded:** codebase-memory fast re-index completed with 77,073 nodes
  and 89,283 edges, and a post-index query found `issueSubjectAssertion`,
  `proxyReferenceOptions`, `chargeConfigurationReadiness`, and `proxyCharge`. The index excludes
  `scripts`, `tests/e2e`, and `docs`, so those artifacts remain source-verified rather than
  graph-verified.
- **BLOCKED — sandbox child process:** Vitest startup, Next production build, and Node test-runner
  isolation fail before assertions with Windows `spawn EPERM`. The equivalent same-process Node
  preservation/evaluator tests pass; no frontend test or build checkbox is inferred from that.
- **BLOCKED — approved external inputs:** the security gate exits 2 because no approved pinned
  version/digest toolchain lock exists. The performance gate exits 2 because measured 20-warm-up,
  100-call-per-route evidence is absent. No synthetic evidence or invented pin is accepted.
- **BLOCKED/UNOBSERVED — runtime:** the browser suite has no built app, isolated fake
  Charge/Reference backends, or signed fixture runtime. Docker is unavailable; Maven's
  Docker-dependent tests were skipped. Coverage, concurrent 4096-claim proof, full quality-registry
  execution, security scan/waiver evaluation, measured SLO/resource gates, browser accessibility and
  screenshots, live Wave A, DS-02/DS-03, demo guards, and audit/fidelity gates remain unchecked.
- **Ownership review:** U02 changed Charge-local BFF/routes/states/tests, the Charge verifier wiring,
  shared assertion fixture, exact nginx/Compose/Wave A configuration, U02 scripts, quality-gate
  registrations, and U02 documentation. No U02 edit was made to `packages/ui`, shared shell,
  Booking, or Charge V1–V4 migration contents; the preservation gate verifies the exact migration
  set and SHA-256 values. Other dirty-worktree paths are pre-existing/user or other-unit work and
  were preserved.

## Completion condition for generation

Generation is complete only when Steps 1–16 are implemented or an item is explicitly documented as blocked by an external dependency; tests and evidence are truthful; the U01 compatibility surface is green; the mandatory architecture reviewer has reviewed the resulting `code-summary.md`; and no U02 artifact claims U06 release acceptance, DS-02/DS-03 integration, production readiness/SLO, or a rewritten READY verdict.
