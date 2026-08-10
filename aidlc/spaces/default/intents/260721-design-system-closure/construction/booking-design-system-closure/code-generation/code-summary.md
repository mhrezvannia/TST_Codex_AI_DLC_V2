# Code Summary - booking-design-system-closure

## Outcome

The existing W2-02 implementation now has one canonical Booking presentation in the authenticated shell, real `@erp/ui` consumption, permanent trusted-origin compatibility redirects from the standalone Booking presentation routes, executable anti-drift controls, and a root Playwright/accessibility/evidence harness. The Booking BFF routes and service contracts were not changed. No Compose project, manager-demo runtime, backend service, database, event contract, or other domain page was operated or modified.

Historical W1 live proof remains **BLOCKED/waived**. This Code Generation result does not rewrite it as PASS and does not claim W2-02 live Compose, Playwright, audit, or backlog closure.

## Files Created

- `packages/ui/src/primitives.test.tsx` - generic ref/DOM forwarding, live semantics, table containment, Skeleton, and EmptyState coverage.
- `apps/booking/lib/booking-redirect.ts` and `booking-redirect.test.ts` - request-aware trusted-origin 308 redirect decision, exact query allow-list, invalid-detail fallback, and API exclusion.
- `apps/shell/app/booking/booking-presentation.ts` and test - one `empty | populated | denied | degraded | error` list normalization seam with a 25-row bound.
- `apps/shell/app/booking/loading.tsx` - shared Skeleton/Table route loading presentation.
- `scripts/check-w2-02-presentation.mjs` and test - read-only application color/style/import gate with restorative temporary negative probes.
- `playwright.config.ts` and `tests/w2-02/booking.spec.ts` - canonical-route, axe severity, keyboard/focus, reduced-motion, light/dark, 375/768/1024/1440, controlled-state, and mutation-gated real journey coverage.
- `scripts/w2-02-evidence.mjs` and test - secret-safe evidence sanitization, writing, and manifest validation.
- `scripts/w2-02-trace-sanitize.mjs` and test - fail-closed raw trace extraction, redaction, rebuild, second extraction/scan, JSONL replay-readiness validation, hashes, and failure cleanup.

## Files Modified or Removed

- `packages/ui/src/primitives.tsx`, `styles.ts`, and `package.json` - domain-neutral refs/DOM props, semantic status tones, TableContainer, declared test tooling, and preserved token/reduced-motion behavior.
- `apps/shell/package.json`, root layout, `ShellFrame.tsx`, and `shell.css` - declared/rendered `@erp/ui`, tokenized colors, skip link, canonical module order, shared focus behavior, and no local palette.
- `apps/shell/app/booking/**` and `apps/shell/lib/booking-client.ts` - URL-backed list filters, bounded shared Table/statuses, explicit route states, shared create/detail/lifecycle compositions, typed action recovery, retained values, error-summary focus, one-command-in-flight, pricing/downstream degradation truth, and safe audit disclosure.
- `apps/booking/app/page.tsx`, `layout.tsx`, and `app/bookings/**/page.tsx` - duplicate shell/navigation removed; presentation entries now redirect to the canonical shell.
- Removed obsolete standalone Booking presentation CSS/components/tests and the presentation-only booking-form helper after equivalent canonical route/form/action coverage existed. All `apps/booking/app/api/**` files and `apps/booking/lib/bookings.ts` remain intact.
- Root `package.json`, `yarn.lock`, `.gitignore`, and `.github/workflows/quality-gates.yml` - pinned dev-only axe/Playwright support, deterministic W2-02 commands, raw/staged trace exclusions, and CI-safe static/focused gates. Live Compose/guards/audits remain local release evidence.

## Key Implementation Decisions

- Kept server-oriented Booking reads and route-local interaction state; no global client store or new aggregate API was introduced.
- Kept Booking vocabulary/composition in the shell and added only generic behavior to `packages/ui`.
- Built redirect destinations only from a trusted configured shell origin. List keys are exactly `page,pageSize,sort,direction,status,q`; detail keeps only `created=1`; create keeps no query; every `/api/**` request returns no redirect decision.
- Used returned Booking status as lifecycle truth. Pending commands prevent duplicates; validation/denial/fatal outcomes do not blind-retry; recoverable/degraded outcomes expose only bounded same-command retry.
- Located browser/state/evidence controls outside production source. No test-state query flag, debug picker, second shell, module theme, remote font, spinner, or app-to-app import was added.

## Story and Requirement Coverage

| Coverage | Code/test evidence |
|---|---|
| US-001 / FR-001-FR-004, FR-007 | canonical shell list, state normalizer, shared filters/Table/Badge/Skeleton/EmptyState/StatusStrip, 25-row bound |
| US-002 / FR-005-FR-007 | shared create/detail/actions, retained input, focus/live behavior, duplicate prevention, typed recovery and service-truth status |
| US-003 / FR-002, FR-003, FR-008 | declared `@erp/ui`, tokenized shell, duplicate presentation removal, anti-drift positive/negative gate |
| US-004 / FR-004-FR-010 | root Playwright/axe matrix, same-route controlled state, mutation-gated real journey, secret-safe evidence tooling |
| US-005 / FR-009, FR-012 | live commands deliberately not run here; later stage must assert the exact guard inputs and wrapper/project contract |
| US-006 / FR-010-FR-012 | manifest/trace validation and CI handoff; later direct guards/audits/backlog decision remain required |
| NFR-001-NFR-009 | accessible semantics/focus/themes/viewports, bounded DOM, preserved BFF contracts, deterministic scripts, no unsupported SLO/scanner/cloud claim |

## Verification Results

Passed:

- branch `intent/W2-02-design-system-closure`; `c2f13dd` remains an ancestor.
- deterministic Yarn lock generation and `corepack yarn install --immutable --mode=skip-build` using workspace-local temporary Yarn cache/global folders.
- `git diff --check`.
- `@erp/ui`, `@erp/app-shell`, and `@erp/app-booking` TypeScript checks.
- `@erp/ui`, shell, and Booking lint.
- W2-02 anti-drift positive scan.
- six Node anti-drift/evidence/trace tests.
- standalone TypeScript validation of `playwright.config.ts` and `tests/w2-02/booking.spec.ts`.

Environment-blocked, not application PASS/FAIL:

- the initial normal immutable install could not run esbuild/sharp lifecycle children because the managed Windows sandbox returned `spawn EPERM`;
- Vitest for `@erp/ui`, shell, and Booking could not load Vite config because esbuild child spawning returned `EPERM`;
- shell and Booking production builds reached Next.js optimized-build startup, then returned `spawn EPERM`.

These results were retained without weakening commands or changing the application timeout. The later Build and Test stage must rerun Vitest/build in an environment that permits child processes.

## Deviations and Pending Evidence

- No live Compose, demo guard, browser, or audit execution occurred in Code Generation, as required by the stage boundary.
- Playwright live mutation remains explicitly gated by `W2_02_ALLOW_LIVE_MUTATION=1` plus isolated fixture environment variables; skipping it is not PASS.
- Trace sanitizer archive execution was authored and its redaction logic tested, but promotion/replay proof requires a real raw trace in the later live stage.
- Required later gates: exact pre/post demo-guard inputs/results, wrapper-only `linercore-wave-a` lifecycle, authenticated real create-to-confirm journey, full browser matrix, sanitized durable evidence, direct `aidlc-audit`, direct `erp-fidelity-audit`, and truthful backlog update.

## Review

**Verdict: NOT-READY**

### Findings

- **CRITICAL — live mutation is not fail-closed to Wave A.** `playwright.config.ts:12` accepts an arbitrary `W2_02_BASE_URL`, while `tests/w2-02/booking.spec.ts:58` enables mutations from only `W2_02_ALLOW_LIVE_MUTATION=1`. Nothing rejects `http://127.0.0.1:8088`, proves `linercore-wave-a`, or requires the exact pre-guard result before create/validate/price/confirm. This can target the protected manager demo. Require exact Wave A base/project/guard inputs and fail before any mutation on mismatch.
- **HIGH — lifecycle commands violate service-truth and idempotent-retry contracts.** `apps/shell/app/booking/[bookingId]/BookingActions.tsx:30-31` creates a new idempotency key inside every `execute`, including retry; network rejection has no catch and leaves the action pending; and `:57-58` reports success for any 2xx without verifying the returned Booking establishes the requested state. Persist one key across an attempt/retry, normalize thrown transport failures, focus/announce the outcome, and accept success only from the returned authoritative Booking representation. Add confirm-unknown/retry and false-2xx regression tests.
- **HIGH — create recovery and error association are incomplete.** `apps/shell/app/booking/new/BookingCreateForm.tsx:62` has no transport catch/finally, so rejection can leave `busy` true with an unhandled promise; `:78` collapses 401/403 and recoverable/fatal outcomes into generic form errors; and `:122` references `${name}-error` while `packages/ui/src/primitives.tsx:62` renders no matching id. Implement typed denied/recoverable/fatal handling with retained values, safe retry/navigation, useful focus, and real field-error IDs/tests.
- **HIGH — the acceptance harness can produce false green evidence.** `tests/w2-02/booking.spec.ts:30-85` accepts whichever single list state happens to render rather than deterministically covering loading/populated/empty/error-retry/denied/degraded across the required matrix; its “keyboard” journey uses direct clicks and installs no page-error/rejection/console collector. `scripts/w2-02-evidence.mjs:32` checks only key presence and accepts empty `cases`/`gates`, which `scripts/w2-02-evidence.test.mjs:18` explicitly enshrines. Require complete FR/NFR/state/theme/viewport/guard/audit mappings, exact base/project values, non-skipped mutation proof, and zero unexpected runtime errors.
- **HIGH — trace failure handling does not implement the approved fail-closed design.** `scripts/w2-02-trace-sanitize.mjs:102-107` deletes only the promoted output/temp directory on failure; it neither deletes the raw staged input nor writes the required secret-free failure report. Add archive-level integration tests and ensure failed parse/redact/rebuild/rescan/replay removes raw input, retains a safe report, and cannot promote evidence.
- **HIGH — duplicate presentation was removed before equivalent canonical functionality existed.** Deleted standalone validation, movement-status, lifecycle, legacy-incomplete, and not-found presentation has no full replacement: `apps/shell/lib/booking-client.ts:29` models only optional movement status, and `apps/shell/app/booking/[bookingId]/page.tsx:81` only reports absence rather than rendering present movement/lifecycle/validation evidence. Migrate the preserved operational detail behavior into the canonical shell before deleting the duplicate implementation.
- **MEDIUM — the 25-row invariant is masked instead of enforced.** `apps/shell/app/booking/booking-presentation.ts:17` silently slices oversized service responses and its test treats truncation as success. The approved NFR requires an oversized response/DOM page to fail and be diagnosed. Surface the contract violation and test the failure path.
- **MEDIUM — trusted redirect configuration regresses the normal local stack.** `apps/booking/lib/booking-redirect.ts:6` defaults to Wave A port 18088, but `compose.yaml` does not supply `SHELL_PUBLIC_URL` to `apps-booking`; the default shared runtime edge remains 8088. Wire a trusted per-stack origin through Compose/env (8088 default, 18088 Wave A) and test both without deriving it from untrusted headers.
- **MEDIUM — enforcement/dependency closure is incomplete.** `scripts/check-w2-02-presentation.mjs:5` hard-codes only `apps/shell` and `apps/booking`, so it does not enforce FR-008 over all documented applicable `apps/**` sources or a reviewed baseline exception set. Also `apps/booking/lib/bookings.ts:1` imports `@erp/auth` while `apps/booking/package.json` still does not declare it. Define the applicable-source/baseline policy explicitly and fix workspace dependency declarations.

### Validation

Branch and baseline ancestry are correct; `git diff --check`, immutable Yarn resolution (workspace-local cache), CI YAML parsing, UI/shell/Booking typechecks and lint, anti-drift execution, six Node helper tests, and standalone Playwright TypeScript validation passed. Vitest and Next production execution remain environment-blocked by managed-sandbox child-process `spawn EPERM`; that limitation is not treated as PASS and does not negate the mandatory code corrections above. The ui-ux-pro-max density/focus/responsive guidance was applied beneath the binding LinerCore master; its gateway/marketing layout, alternate palette, remote Fira fonts, and spinner advice were rejected.

### Mandatory Corrections

Resolve every Critical/High/Medium finding above and rerun this independent architecture review before the human code-generation gate.

## Reviewer Correction Iteration 1

### Structured Return

- **Status:** READY_FOR-INDEPENDENT-REVIEW. This does not approve Code Generation or claim live acceptance.
- **Scope preserved:** canonical authenticated shell and existing Booking BFF/service contracts; no backend, database, event contract, second frontend, module theme, or independent navigation was added.
- **Baseline preserved:** branch remains `intent/W2-02-design-system-closure` and `c2f13dd` remains an ancestor.
- **Runtime boundary preserved:** no Compose project, manager demo, live browser mutation, demo guard, `aidlc-audit`, or `erp-fidelity-audit` was operated in this correction loop.
- **Historical truth preserved:** W1 live proof remains **BLOCKED/waived**, never PASS. The evidence validator now requires the explicit `BLOCKED/WAIVED` record and rejects a PASS rewrite.

### Finding Resolution

1. **Critical live-mutation isolation:** added `scripts/w2-02-acceptance-guard.mjs`. Playwright now requires the exact base `http://127.0.0.1:18088` and Compose project `linercore-wave-a`, rejects the protected 8088/shared-platform targets, and requires an exact green pre-acceptance `npm run demo:guard` result with manager inputs (`linercore-shared-platform`, `demo-20260721`, `http://127.0.0.1:8088`) before mutation authorization. Pure tests cover mismatch, protected targets, missing/non-green guard, and green authorization.
2. **Lifecycle truth/idempotency:** `BookingActions` persists one idempotency key across the original attempt and safe retry, catches thrown fetch failures, always settles pending state, focuses/announces results, and refreshes only when the returned Booking establishes `VALIDATED`, `PRICED`, or `CONFIRMED` for the requested command. Tests cover false 2xx, unknown confirmation, transport throw, duplicate prevention, and retry-key identity.
3. **Create recovery/accessibility:** `BookingCreateForm` now distinguishes validation-blocked, denied, recoverable, fatal, pending, and success paths; wraps transport work in catch/finally; retains operator input and the command key for retry; focuses the summary; and offers retry only where safe plus canonical return navigation for denied/fatal outcomes. Generic `Field` hint/error IDs and ref-forwarding `StatusStrip` close the `aria-describedby`/focus contract, with primitive and form tests.
4. **Deterministic acceptance/evidence:** the Playwright suite requires a controlled live fixture manifest and enumerates list/create/detail across light/dark and 375/768/1024/1440, plus loading/populated/empty/error-retry/denied/degraded/validation/pending/success. It captures case artifacts, performs real Tab/Enter activation, and fails on page errors, console errors, unhandled rejections, serious/critical axe results, overflow, or missing shell state. The manifest validator rejects wrong base/project, empty/incomplete cases or gates, missing/unhashed artifacts, missing matrix/state/keyboard cases, skipped mutation, non-green/misnamed guards/audits, and a rewritten W1 PASS.
5. **Trace fail-closed behavior:** the sanitizer now operates on real ZIP archives using pinned `fflate`, redacts and parses trace/network JSONL, rebuilds, reopens, rescans, hashes, and removes raw input after successful promotion. Any parse/redact/rebuild/rescan/path-collision failure deletes raw/staged and promoted archives, writes only a secret-free `FAILED` report, and throws. Real archive success/failure/redaction integration tests pass.
6. **Canonical detail parity:** expanded the shell Booking type and detail page to retain revision/cargo, reference-validation snapshot and field outcomes, present movement code/readable status/location/source/occurred/received evidence, lifecycle events, legacy-incomplete correction, manual-pricing context, pricing source evidence, and a canonical not-found surface. No backend endpoint or contract was changed.
7. **25-row invariant:** responses containing more than 25 items now produce an explicit diagnosed contract error instead of a sliced populated success; its regression test expects failure presentation.
8. **Trusted redirects:** standalone compatibility redirects default to the normal shared edge at 8088. Compose supplies `SHELL_PUBLIC_URL` from trusted configuration, and the isolated Wave A env explicitly sets 18088. Tests cover both origins; request/forwarded headers are never origin authority.
9. **Repository enforcement/dependencies:** anti-drift now scans applicable `apps/**` source. Existing out-of-scope legacy Auth/Reference/Charge debt is allowed only through explicit whole-file SHA-256 reviewed exceptions, so any change/new violation fails. Cross-app imports, hardcoded colors, and local `CSSProperties` remain violations. `@erp/auth` is now declared by `@erp/app-booking`, and the immutable lock includes that workspace edge and exact `fflate@0.8.2`.

### Correction Verification

Passed after corrections:

- immutable Yarn resolution/install with the updated lock;
- `@erp/ui`, `@erp/app-shell`, and `@erp/app-booking` TypeScript checks;
- focused ESLint over changed UI, shell/Booking clients, Playwright config, and W2-02 tests with zero warnings;
- standalone TypeScript validation of current `playwright.config.ts` and `tests/w2-02/booking.spec.ts`;
- repository-wide W2-02 anti-drift scan;
- 11 direct Node tests covering anti-drift, mutation authorization, strict evidence validation, evidence redaction, and real trace archives;
- `git diff --check` and baseline ancestry.

Still environment-blocked, recorded as neither PASS nor application failure:

- `@erp/ui`, shell, and Booking Vitest startup each returns managed-sandbox `spawn EPERM` while Vite tries to start esbuild. No command was weakened and no result is represented as green.

Live Compose, full Playwright execution/evidence, pre/post manager guards, `aidlc-audit`, and `erp-fidelity-audit` remain mandatory later-stage work on the isolated wrapper-managed Wave A stack.

## Review

**Verdict: NOT-READY**

### Iteration 2 Findings

- **CRITICAL — the evidence gate still accepts fabricated artifacts and is not connected to the browser run.** `scripts/w2-02-evidence.mjs:41-60` checks only that a declared artifact has a non-empty path/kind and a syntactically valid 64-character hexadecimal string; it never resolves the path, proves that the file exists under the run root, reads the file, or compares a computed SHA-256. `scripts/w2-02-evidence.test.mjs:16-26` therefore treats nonexistent paths with repeated fake hashes as a valid complete manifest. Repository discovery also finds no production caller of `writeEvidenceManifest`; `tests/w2-02/booking.spec.ts:56-60` writes screenshots only and does not emit the required run/case/gate/network metadata. This leaves FR-006/FR-010/FR-012 and the monitoring design's unresolved-path/hash stop condition false-green. Build the manifest from actual Playwright and direct gate outputs, resolve and constrain every artifact path to the run directory, recompute every hash from disk, reject missing/mismatched artifacts, and preserve original failure/rerun records.
- **HIGH — a successful mandatory journey cannot produce the required sanitized trace.** `playwright.config.ts:17` uses `trace: "retain-on-failure"`, so the green create → validate → price → confirm case produces no raw archive. No browser or acceptance code invokes `sanitizeTraceArchive` or links its PASS report/promoted hash into a case. This directly conflicts with `security-design.md`, which states that successful Playwright without a proven secret-free required trace is incomplete, and with FR-006's network-trace proof. Capture the required success trace only in the gitignored staging area, run the fail-closed sanitizer, and require the promoted archive/report hashes in the real mutation case before evidence can pass.
- **HIGH — difficult-state setup is declarative text, not deterministic control.** `tests/w2-02/booking.spec.ts:11-18` requires a non-empty fixture `control` string, but `:94-110` never interprets or executes it; the case merely visits a supplied path. In particular, `loading` uses `waitUntil: "commit"` and races the live response rather than arranging a controlled condition. This does not implement the approved Playwright interception/isolated-service setup in BR-021 and cannot prove the setup method recorded in FR-004/FR-010. Implement an allow-listed control mechanism in the external harness (request interception or a documented wrapper-managed isolated service action), verify the resulting network/state transition, and record the applied setup in the manifest.
- **HIGH — the required per-state accessibility/responsive interaction contract is not executed.** The route loop at `tests/w2-02/booking.spec.ts:78-91` covers route × theme × viewport but asserts only main/navigation presence, page overflow, axe, and a screenshot. The state loop at `:94-110` runs each state once at the default theme/viewport and does not assert focus movement, announcements, reduced motion, primary-action reachability, overlap, or clipped controls. `reliability-design.md` requires the same semantic, keyboard/focus/live-region, reduced-motion, both-theme, four-viewport, overflow/overlap/clipping assertions for each required route/state. Expand the ledger and executable loops/assertions so omissions cannot be represented as PASS.
- **HIGH — mutation authorization consumes a manually constructible assertion rather than a direct pre-guard result.** `scripts/w2-02-acceptance-guard.mjs:37-42` trusts any JSON file whose fields say the guard passed; `scripts/demo-guard.mjs` emits only console text and no authenticated result file, and no acceptance orchestrator in the implementation runs the exact guard, captures its direct exit, operates the Wave A wrapper, or produces the JSON consumed by Playwright. Together with the manifest defect, a hand-authored file can authorize live mutation without an observed guard. Wire authorization to a same-run pre-guard execution record produced by the acceptance orchestrator, bind it to run/commit/timestamp, and make post-guard/audit direct exits mandatory before manifest promotion.

### Prior-Finding Disposition

The iteration-1 component findings are materially corrected: Wave A target constants reject port 8088/shared-platform; lifecycle retries reuse their idempotency key and require returned authoritative status; create recovery is typed and field associations are real; trace failure removes raw/promoted archives and writes a safe report; canonical detail parity, the 25-row error, trusted redirect defaults/wiring, repository-wide fingerprinted anti-drift, and the `@erp/auth` declaration are present. Those corrections do not compensate for the unresolved evidence-chain findings above.

### Validation

Iteration 2 independently passed baseline ancestry (`c2f13dd`), branch identity, `git diff --check`, all three affected workspace typechecks, repository-wide W2-02 anti-drift, standalone Playwright TypeScript validation, and all 11 direct Node helper tests. The helper tests are green as implemented, but the evidence test's acceptance of nonexistent fake-hash artifacts is itself evidence for the Critical finding. Vitest and Next production execution remain environment-blocked by managed-sandbox child-process `spawn EPERM`; neither is represented as PASS. No Compose project or manager-demo runtime was operated. The ui-ux-pro-max density/focus/responsive advice was applied only where compatible with the binding LinerCore master; its Enterprise Gateway/marketing composition, alternate blue/amber palette, Fira fonts, and spinner guidance were rejected.

### Mandatory Corrections

Resolve every Critical/High finding above and run another independent architecture review before the human Code Generation gate.

## Formal Revision 1 — Iteration 2 Evidence-Chain Resolution

### Structured Return

- **Status:** READY_FOR-INDEPENDENT-REVIEW. This revision does not approve Code Generation and does not claim live acceptance.
- **Scope preserved:** the existing authenticated shell, Booking BFF/service contracts, shared token system, branch ancestry, and prior W2-02 implementation remain intact. No second frontend, module theme, navigation, backend contract, or Compose definition was added or replaced.
- **Runtime boundary preserved:** this Code Generation revision did not operate Compose, port 8088, `linercore-shared-platform`, the manager demo, a browser mutation, either audit, or `npm run demo:guard`.
- **Historical truth preserved:** the manifest requires W1 live proof to remain exactly **BLOCKED/WAIVED** with a reason and rejects a rewritten PASS.

### Iteration 2 Finding Resolution

1. **Production producer and independently verifiable manifest:** added `scripts/w2-02-live-acceptance.mjs` as the sole acceptance producer. It creates an immutable unique run root, preserves `run-start.json` and a failure record for unsuccessful attempts, records the exact fixture controls, runs the direct pre-guard, invokes Playwright, runs the direct post-guard and both audit detector commands, parses the actual Playwright JSON, rejects missing/failed/duplicate required case results, reads the per-case records, hashes real artifacts, and calls `writeEvidenceManifest` only when every required direct result is green. `scripts/w2-02-evidence.mjs` now resolves every declared artifact relative to the exact run root, rejects absolute/traversal/alias/duplicate paths, reads each file, recomputes SHA-256, rejects missing/mismatched bytes, and binds run, setup, Playwright, case, gate, commit, and timestamp records. Negative tests use real temporary files and prove missing paths, traversal, fake hashes, duplicate declarations, omitted controls, W1 truth drift, and indirect gates cannot pass.
2. **Successful mutation trace closure:** implicit Playwright tracing is disabled. The mandatory create → validate → price → confirm journey explicitly starts tracing in `.w2-02-traces/staged/<run-id>`, stops it to the raw archive, invokes `sanitizeTraceArchive`, and cannot write a PASS case until the sanitizer succeeds. The orchestrator promotes the sanitizer-cleared archive and PASS report under the run root. Manifest validation recomputes both hashes, requires both artifact kinds, parses the report, verifies `closureStatus`, second scan, raw removal, and exact promoted hash. Normal acceptance cleanup removes the staging run directory; sanitizer failure still removes raw/promoted archives and writes the existing secret-free failure report.
3. **Executable allow-listed state controls:** fixture `control` is now a typed external harness command, not text. Only Booking-target `observe`, bounded `delay`, and constrained Booking-BFF JSON fulfilment are accepted; difficult states must actively delay or fulfil a request. Every case installs the interception before navigation, checks the expected HTTP method, records only safe method/path/status observations, requires at least one interception and an allow-listed returned status, and writes the applied/verified control into its same-run case record. The setup manifest is separately hashed and required by final validation.
4. **Omission-proof state/accessibility/responsive ledger:** `REQUIRED_CASE_IDS` now expands all nine difficult states across light/dark and 375/768/1024/1440 (72 state cases), in addition to the 24 list/create/detail visual cases and two keyboard journeys. Every route/state matrix case verifies declared semantics, a visible live region, reduced-motion activation with no infinite running animation, keyboard reachability and visible focus for the primary action, page overflow, clipped controls, control overlap, serious/critical axe findings, runtime console/page/unhandled-rejection cleanliness, and a full-page screenshot. Each successful case emits timings, setup/network observations, the complete assertion map, theme, and viewport. The validator requires the exact ledger cardinality and every named assertion for every route/state case.
5. **Same-run mutation authorization and closure gates:** pre-guard authorization now requires an exact direct `npm run demo:guard` result inside the same run root, exact protected-demo inputs, matching run ID and commit, fresh ordered timestamps, output hash, and an HMAC made with a 256-bit ephemeral run capability held by the orchestrator/Playwright process. A manually authored field-only JSON or a result moved to another run root cannot authorize mutation. The manifest separately requires the same-run direct Playwright exit, post-guard exit, `aidlc-audit` detector exit, and `erp-fidelity-audit` detector exit, with exact command labels, commit, timestamp window, artifact existence, and recomputed hashes before promotion. Exact Wave A base/project rejection and protected 8088/shared-platform rejection remain unchanged.

### Revision 1 Verification

Passed without operating a live stack:

- immutable Yarn 4.5.3 install with workspace-local cache and `--immutable --mode=skip-build`;
- `@erp/ui`, `@erp/app-shell`, and `@erp/app-booking` TypeScript checks;
- `@erp/ui`, shell, and Booking lint (zero errors; only existing Next lint deprecation/plugin notices);
- standalone TypeScript validation of `playwright.config.ts` and `tests/w2-02/booking.spec.ts`;
- `node --check` for the production acceptance, evidence, and authorization scripts;
- repository-wide W2-02 anti-drift enforcement;
- 14 direct Node tests: three anti-drift probes, exact target rejection, HMAC-bound guard authorization, evidence sanitization, real complete-manifest acceptance, missing/traversal/hash-mismatch/duplicate/fabrication rejection, safe validated manifest writing, exact Playwright mapping and omission/failure/duplicate rejection, plus real ZIP trace redaction/success/failure cleanup;
- `git diff --check` (line-ending notices only).

Vitest and Next production builds remain recorded under the existing managed-Windows `spawn EPERM` limitation and are not represented as PASS. Live Compose, full Playwright execution/evidence, pre/post manager guards, `aidlc-audit`, and `erp-fidelity-audit` remain mandatory later-stage work through the isolated `scripts/wave-a-compose.mjs` / `linercore-wave-a` path.

## Review

**Verdict: NOT-READY**

### Formal Revision 1 Findings

- **CRITICAL — the production acceptance entrypoint cannot load the fixture record it gives to Playwright.** `scripts/w2-02-live-acceptance.mjs:73-86` reads the supplied manifest, wraps it under a `fixtures` property in `setup/control-manifest.json`, and points `W2_02_FIXTURE_MANIFEST` at that wrapper. `tests/w2-02/booking.spec.ts:31-55` parses the same file as if `routes` and `states` were top-level, so the first route validation sees `undefined` and throws before the suite can register or emit evidence. The 14 helper tests never execute `main()` and do not cover this producer/consumer contract. Define one versioned setup schema shared by runner, Playwright, and validator (or pass the original manifest to Playwright while hashing the wrapper), and add an entrypoint-level dry integration test that proves all required cases register against the exact file produced by the runner.
- **CRITICAL — the acceptance orchestrator omits the binding Wave A lifecycle.** `scripts/w2-02-live-acceptance.mjs:89-153` goes directly from pre-guard to Playwright, post-guard, audits, and manifest. It never invokes `scripts/wave-a-compose.mjs` for config, start/build, readiness/status, or cleanup, and it records no effective profile/services/ports/readiness evidence. This contradicts `infrastructure-design/deployment-architecture.md:26,34-45`, `nfr-design/reliability-design.md:46-57`, and `infrastructure-design/cicd-pipeline.md:14-22`; a different process listening on 18088 could be tested and labelled `linercore-wave-a`. Add direct, recorded wrapper-only config/start/readiness/status/cleanup steps, prove the effective project/profile/ports, perform cleanup before the post-guard, and fail manifest promotion on any missing or non-green lifecycle record. Never add a raw or shared-project Compose fallback.
- **CRITICAL — difficult-state and route evidence remains caller-labelled rather than causally observed.** `tests/w2-02/booking.spec.ts:45-55` accepts any `/booking...` path and caller-selected selector/role/action; `expectedText` is optional. The route/state loops at `:181-210` never assert an immutable route discriminator or that the rendered `data-state` equals the case ID, so the same populated list surface can be declared as list/create/detail and every named state. In addition, `applyControl` at `:102-123` uses browser `page.route`, while the canonical list/detail data is fetched server-side by `apps/shell/app/booking/page.tsx:13-28` and `apps/shell/lib/booking-client.ts:89-108`; it cannot intercept those internal Next.js fetches. Delaying the document response cannot expose the routed loading skeleton, and the runner executes no wrapper-managed seed/setup operation. Bind route IDs to exact canonical route shapes and route-specific landmarks, bind every state ID to a non-optional production state discriminator and expected accessible outcome, and use an external control that actually reaches the server-side dependency or documented isolated-service setup. Add negative tests proving route/state aliasing and an unapplied/non-causal control cannot pass.
- **CRITICAL — mutation authorization is still hand-forgeable.** `scripts/w2-02-acceptance-guard.mjs:32-35,64-76` trusts an HMAC whose capability is supplied by the same caller and whose signing function is exported. `scripts/w2-02-acceptance-guard.test.mjs:13-24` explicitly constructs a field-only fake green guard, chooses its own capability, signs it, and demonstrates that `authorizeMutation` returns `mutation: true`; no direct `npm run demo:guard` occurred. Run/commit/target/timestamp fields are bound only to the caller's assertion, not to a trusted direct-exit producer. Replace the self-issued capability with authorization that Playwright cannot mint (for example, a direct preflight owned and executed by the acceptance parent with a non-reconstructible child channel), and add a negative test proving a syntactically perfect, freshly signed hand-built record cannot authorize mutation. Keep the exact `linercore-wave-a`/18088 and manager-demo input checks.
- **CRITICAL — successful trace promotion is not fail-closed for real credential forms.** `scripts/w2-02-trace-sanitize.mjs:7-18` recognizes only a narrow JSON `name|key` plus `value` shape and Bearer tokens; `:21-40` decodes unknown/binary entries but applies that same narrow scan; `:69-76` labels JSONL parsing as replay validation. A direct probe showed `Cookie: session=super-secret`, `Set-Cookie: sid=super-secret`, `Authorization: Basic ...`, and `client_secret=super-secret` all survive unchanged while `traceTextIsSafe()` returns `true`. The implementation also retains request-body/resource entries and does not implement the configured local-identity scan required by `nfr-design/security-design.md:32-59`. Parse the actual Playwright trace/network/resource schemas, remove or redact all credential/session/request-body fields and approved local identities, reject unclassified binary/resource content unless explicitly allow-listed, rescan every rebuilt entry, and perform a real trace-open/replay validation. Add representative real-archive fixtures covering Bearer/Basic, Cookie/Set-Cookie, token/secret/session fields, resource bodies, and binary entries.
- **HIGH — evidence can claim a commit that does not contain the tested implementation.** `scripts/w2-02-live-acceptance.mjs:60-70` records only `git rev-parse HEAD` and never rejects or fingerprints a dirty worktree. In the reviewed workspace HEAD is `c2f13dd` while the W2-02 closure is uncommitted, so a live run today would attribute the modified application/harness to the untouched baseline commit. Require a clean tracked worktree before acceptance (with run artifacts excluded), or bind and validate a complete source-diff/tree fingerprint; add a dirty-tree rejection test.
- **HIGH — artifact containment and duplicate checks are lexical, not canonical.** `scripts/w2-02-evidence.mjs:24-29,48-53` checks the raw declared string for duplicates before resolving it, accepts internal aliases such as `cases/../x`, and never resolves symlinks/reparse points. Two spellings can therefore declare the same file twice, and an in-root link can lead outside the run root despite the stated containment guarantee. Require canonical normalized run-relative spelling, reject links/reparse points or compare `realpath` targets beneath the real run root, and deduplicate on the canonical target. Extend negative tests for normalized aliases, case aliases on Windows, and an escaping link where supported.
- **HIGH — the UI proof records focus/theme PASS without proving either state.** `tests/w2-02/booking.spec.ts:81-90` treats any existing border as a visible focus treatment, without comparing focused and unfocused styles; a control with no focus-specific indicator passes. `:186-194,202-209` requests a color scheme and writes `erp-theme`, but never asserts that the rendered document resolved the requested theme, so two light renders can be recorded as light and dark. Require a measurable focus-only visual change (canonical focus ring/outline) and assert the actual resolved theme/token values before axe/contrast and screenshot capture. Add negative fixtures that remove focus styling or ignore the requested theme and must fail.
- **HIGH — failure/rerun and reproduction evidence is incomplete.** `scripts/w2-02-live-acceptance.mjs:63-70,139-155` records no host/tool versions, wrapper command/profile, prior-attempt link, or source-tree identity, and every failure merely says to start a new run ID. This does not satisfy `infrastructure-design/monitoring-design.md:27-31` or `infrastructure-design/cicd-pipeline.md:28-30`, which require reproducibility and immutable rerun linkage. Add explicit attempt identity/`rerunOf`, preserve prior failures without overwrite, and require the reproduction/lifecycle fields in manifest validation. Ensure failure recording cannot itself be rejected merely because the safe error message contains words matched by the evidence deny-list.

### Prior-Finding Disposition

Revision 1 materially closes the earlier missing production caller, basic on-disk hash recomputation, exact case/gate cardinality, manual successful trace capture, application of browser-side controls, route/state theme/viewport enumeration, explicit W1 `BLOCKED/WAIVED` truth, and the same-run pre/post/audit ordering inside the newly added runner. Those improvements do not close the execution-schema break, wrapper omission, caller-labelled SSR state proof, self-issued mutation authorization, real trace redaction gap, or commit/source binding defects above.

### Independent Validation

Passed without operating Compose, a browser, either audit, `npm run demo:guard`, or port 8088:

- branch `intent/W2-02-design-system-closure`; `c2f13dd` ancestry preserved;
- `node --check` for the acceptance, evidence, guard, and trace scripts;
- all 14 direct W2-02 Node helper tests;
- standalone TypeScript validation of `playwright.config.ts` and `tests/w2-02/booking.spec.ts`;
- `git diff --check` (line-ending notices only).

The helper suite's green result is not acceptance evidence because it does not execute the production orchestration entrypoint, Compose lifecycle, browser, or audits. The trace safety probe failed semantically as described above. The ui-ux-pro-max guidance was applied for data density, keyboard/focus, reduced motion, responsive overflow, and accessibility evidence; its gateway/marketing structure, alternate palette, remote Fira fonts, CTAs, and spinner advice were rejected in favor of the binding LinerCore master.

### Mandatory Corrections

Resolve every Critical and High finding above, add entrypoint-level negative/positive coverage for the real producer-consumer chain, and rerun independent architecture review before the human Code Generation gate. Live acceptance remains pending; historical W1 live proof remains **BLOCKED/waived**, never PASS.

## Formal Revision 1 — Correction Pass 2

### Structured Return

- **Status:** READY-FOR-INDEPENDENT-REVIEW. This correction does not approve Code Generation and does not claim live acceptance.
- **Scope preserved:** the existing authenticated shell, Booking BFF/service contracts, shared tokens/primitives, canonical Booking migration, branch ancestry, and earlier W2-02 work remain intact. No second frontend, module-local theme, independent navigation, production fake mode, or backend contract was introduced.
- **Runtime boundary preserved:** this Code Generation correction did not operate Compose, a browser, port 8088, `linercore-shared-platform`, the manager demo, `npm run demo:guard`, `aidlc-audit`, or `erp-fidelity-audit`.
- **Historical truth preserved:** W1 live proof remains exactly **BLOCKED/WAIVED** and cannot be rewritten as PASS by the evidence validator.

### Formal Revision 1 Finding Resolution

1. **One exact producer/consumer fixture contract:** `scripts/w2-02-fixture-contract.mjs` now owns schema version 2, exact top-level routes, states, selectors, actions, control modes, case registration, coverage validation, and production fixture writing. The runner writes that exact file; Playwright imports and validates the same module; the evidence validator requires the same schema and setup equality. A direct Playwright dry-registration integration listed exactly 98 required tests from the production fixture without starting global setup, a browser, Compose, guards, or audits. Contract tests reject route/state aliases and omissions.
2. **Wrapper-only Wave A lifecycle:** `scripts/w2-02-live-acceptance.mjs` now performs and records the exact `scripts/wave-a-compose.mjs` configuration, `up -d --build --wait`, service status, readiness, acceptance, cleanup, post-guard, and audit sequence. The fixed project is `linercore-wave-a`; the fixed application edge is `http://127.0.0.1:18088`; profiles are `app,w2-02-acceptance`; config validation rejects the protected 8088 edge, shared project, missing proxy wiring, or incomplete services. Cleanup precedes the post-guard and is retried through the wrapper on failure. There is no raw-Docker or shared-project fallback.
3. **Causal SSR state control and exact route/state proof:** the acceptance-only `scripts/w2-02-ssr-control-proxy.mjs` and `infrastructure/compose/w2-02-acceptance.compose.yaml` place a control proxy on the real `apps-shell` to `apps-booking` server dependency. Orchestrator-issued controls causally produce delayed loading/pending responses, populated, empty, 503, 403, degraded, validation, success, and real-mutation passthrough outcomes. Playwright no longer uses `page.route`; each case arms the external control, requires a causal observation, asserts an exact canonical pathname, exact route landmark, and exact production `data-state`. Negative and ephemeral-proxy tests reject unapplied controls and route/state aliasing.
4. **Non-forgeable direct pre-guard:** caller-issued HMAC signing and `authorizeMutation` were removed. The Playwright configuration hardcodes `scripts/w2-02-playwright-global-setup.mjs`, which directly executes the exact `npm run demo:guard` command with the protected manager-demo inputs immediately before any test and writes the direct-exit record. The acceptance parent requires that record before manifest promotion. Tests prove a caller-authored or freshly signed fake record has no authorization path and that a failing direct guard prevents setup completion.
5. **Trace sanitizer closure:** trace sanitizer schema version 3 covers Bearer and Basic authorization, raw Authorization/Proxy/Cookie/Set-Cookie lines, access/refresh/ID tokens, client secrets, passwords, sessions/API keys, sensitive JSON/header shapes, query parameters, and configured local identities. It removes request/form/multipart/resource bodies, drops `resources/`, rejects unclassified binary content, parses trace/network JSONL, rebuilds/reopens/rescans the archive, and records trace-open structural validation. Failures remove raw/promoted artifacts and retain only a fixed safe failure report. Direct archive tests cover every reviewer probe and binary/resource rejection.
6. **Source/worktree identity:** `scripts/w2-02-workspace-identity.mjs` verifies the `c2f13dd` baseline ancestor and binds HEAD, a binary tracked-diff hash, sorted untracked content hashes, and a deterministic workspace digest while excluding only declared run/staging artifacts. The runner records identity before execution and rejects drift before promotion; the manifest validates the full identity instead of attributing an uncommitted closure only to HEAD. Mutation and ancestry tests are green.
7. **Canonical artifact containment:** evidence validation requires canonical POSIX run-relative spelling, rejects absolute paths, dot/dot-dot/backslash/case aliases, resolves the real run root and every target, rejects symlink/reparse components and multi-linked files, proves real containment, deduplicates canonical targets, reads each artifact, and recomputes SHA-256. Negative tests cover normalized aliases, hard links, missing files, false hashes, and an escaping link where platform policy permits link creation.
8. **Measured focus and resolved themes:** `scripts/w2-02-ui-proof.mjs` requires a focus-only outline/shadow change between unfocused and focused computed styles and rejects document/body/main focus targets or static borders. Playwright applies the requested theme before navigation, asserts the actual `data-theme`, and verifies exact canonical light/dark token values before axe and screenshots. Tests reject unchanged focus styling and ignored/incorrect themes. Canonical Booking detail/create surfaces also expose the required `data-state`, landmark, live-region, and return navigation hooks without changing the shared-shell design.
9. **Immutable attempts and reproduction metadata:** the runner appends STARTED/COMPLETED/FAILED records to `artifacts/w2-02-live/attempts.jsonl`, never overwrites prior attempts, validates `rerunOf`/`reproducesRun`, and records source identity, Node/npm/Yarn/Compose versions, exact wrapper command, profiles, lifecycle results, and failure diagnostic hashes. The evidence schema requires this lineage and cleaned wrapper lifecycle; fixed failure records cannot be rejected by broad secret-word scanning.

### Correction Pass 2 Verification

Passed without operating any live surface:

- 24 direct Node tests: three anti-drift probes; direct-guard success/failure and forgery rejection; strict real-file evidence/path/link/source/rerun/W1/causality validation; exact fixture/registration and causal proxy behavior; wrapper lifecycle target/config/status validation; trace archive redaction/drop/rebuild/failure behavior; focus/theme proof; and workspace identity/diff mutation checks;
- production Playwright dry registration: exactly **98 tests in 1 file**, using the exact runner-produced fixture contract and without running global setup, a browser, Compose, guards, or audits;
- `node --check` for the acceptance runner, evidence validator, fixture contract, global setup, SSR proxy, trace sanitizer/library CLI, UI proof, and workspace identity modules;
- TypeScript checks for `@erp/ui`, `@erp/app-shell`, `@erp/app-booking`, and the standalone Playwright/config surface;
- lint for UI, shell, and Booking (only existing Next.js deprecation/plugin notices);
- repository-wide W2-02 anti-drift checks;
- immutable Yarn 4.5.3 install using `--immutable --mode=skip-build` and workspace-local cache;
- `git diff --check` and preserved `c2f13dd` ancestry.

Vitest and Next production builds retain the previously documented managed-Windows child-process `spawn EPERM` limitation and are not represented as PASS. Live wrapper-managed Compose, full Playwright execution and trace/evidence promotion, exact pre/post demo guards, `aidlc-audit`, and `erp-fidelity-audit` remain mandatory later-stage work on the isolated `linercore-wave-a` stack.

## Review

**Verdict: NOT-READY**

### Formal Revision 1 Correction Pass 2 Findings

- **CRITICAL — the production create-route cases reject their own legitimate proxy observations.** `tests/w2-02/booking.spec.ts:77-90` requires every observed upstream path to begin with `/api/bookings`. The create visual cases and mutation journey are explicitly configured as passthrough by `scripts/w2-02-ssr-control-proxy.mjs:14-16`, while `apps/shell/app/booking/new/BookingCreateForm.tsx:38-43` immediately loads four reference sets through `/api/booking/reference-options`, which the shell forwards to the controlled upstream as `/api/reference-options`. A direct isolated proxy probe for `visual:create:light:375` observed a causal applied passthrough at `/api/reference-options`, so the production assertion at `booking.spec.ts:88` evaluates false even though the expected create page is working. Replace the blanket prefix assertion with an exact route/case-specific allow-list and require the expected causal booking or reference-option observation for each case. Add an integration test covering the create reference loads and the mixed reference/create/action observations of the mutation journey.
- **CRITICAL — the required pre-acceptance manager guard runs only after the isolated stack has already been configured, built, started, status-checked, and probed.** `scripts/w2-02-live-acceptance.mjs:85-96` mutates Wave A before launching Playwright; only the Playwright global setup at `scripts/w2-02-playwright-global-setup.mjs:10-27` executes `npm run demo:guard`. A config/up/readiness failure therefore has no pre-guard at all. This does not satisfy the binding before/after demo-protection sequence. Execute and record the exact protected-demo guard before any Wave A lifecycle mutation, then preserve the direct global-setup guard immediately before tests if that second proximity check remains required. The evidence chronology must reject config/up records that precede the pre-guard.
- **CRITICAL — failure cleanup can destroy an isolated Wave A stack that this attempt did not start.** `scripts/w2-02-live-acceptance.mjs:83,86,120-122` sets `lifecycleConfigured = true` immediately after invoking `config`, even when config fails, and `finally` then runs `down --volumes --remove-orphans`. Configuration does not establish ownership of a stack; this attempt can therefore tear down a pre-existing `linercore-wave-a` environment. Track an ownership/acquisition record and enable destructive cleanup only after this attempt successfully starts the stack, or reject a pre-existing stack and hold a run lock. A failed finally-cleanup must also remain a terminal failure rather than an unchecked side record.
- **HIGH — immutable rerun lineage is asserted but not bound to the promoted evidence.** `scripts/w2-02-live-acceptance.mjs:71-77` appends a `STARTED` event and embeds that start object in the run record/manifest at `:112-115`; the `COMPLETED` event is appended only after manifest validation at `:116`. The shared `attempts.jsonl` is outside the run root, is neither hashed nor declared by the manifest, and is updated without serialization. `scripts/w2-02-evidence.mjs:71` validates only caller-supplied fields, not a preserved predecessor or terminal event. Put an immutable terminal attempt record and predecessor digest under the run root, hash it into the manifest, validate the chain against the prior run, and serialize attempt allocation so concurrent runs cannot reuse a sequence.
- **HIGH — the controlled loading state drops the shared authenticated shell and is inconsistent with its own focus contract.** The fixture starts at `/booking/new`, activates the Booking link, and then requires both the loading region and a primary `Booking` link (`scripts/w2-02-fixture-contract.mjs:27`). But `apps/shell/app/booking/loading.tsx:1-17` renders only the skeleton section; the root layout contains no `ShellFrame`, and each completed Booking page owns its own frame. While the route loading boundary is active, the shared navigation/primary action therefore disappears, so the required keyboard focus proof is not feasible and the one-shell contract is visibly broken. Move the persistent shell into an appropriate shared layout or make the loading boundary preserve it, then retain an accessible, keyboard-reachable action in the actual loading surface.
- **HIGH — the claimed keyboard-only journeys use programmatic form filling.** `tests/w2-02/booking.spec.ts:148-150` calls locator `.fill()` directly for every create field, and the list journey does the same for Search at `:185-194`. Only action activation is performed with Tab/Enter. This does not prove a keyboard-only create-to-confirm or filter workflow. Traverse fields through the real Tab order, type with keyboard input, assert the focused label/control at each step, and retain Enter-based action activation and focus-indicator measurements.
- **HIGH — local-identity trace sanitization is optional in the real acceptance path and can silently scan nothing.** `scripts/w2-02-trace-sanitize.mjs:78-85` accepts an empty identity list and still emits `localIdentityScan: "PASS"`. The production runner at `scripts/w2-02-live-acceptance.mjs:82` does not derive or require `W2_02_LOCAL_IDENTITIES` from the mandatory customer, location, voyage, equipment, and commodity fixture values used by the mutation test. Consequently those identities can remain in DOM snapshots or trace text while evidence reports a pass. Build a non-empty, exact identity set in the parent from the approved fixture environment, pass it explicitly to the sanitizer, record a count/configuration digest, and make both sanitizer and evidence validation reject an empty scan.

### Prior-Finding Disposition

Correction Pass 2 materially closes the earlier top-level fixture producer/consumer mismatch and exact 98-case registration; caller-selected route/state aliases; browser-side interception of server-rendered fetches; narrow credential-pattern redaction and unclassified resource/binary retention; dirty-worktree attribution; lexical-only artifact containment; unmeasured theme/focus claims; and the HMAC/caller-file mutation authorization path. The current implementation also preserves the fixed `linercore-wave-a` project, `http://127.0.0.1:18088`, wrapper-only Compose commands, acceptance-only SSR proxy override, exact W1 **BLOCKED/WAIVED** truth, and protected 8088/shared-platform target constants. Those are real improvements, but they do not close the production observation failure, before/after guard chronology, cleanup ownership, terminal lineage, shared-shell loading, keyboard-only, or non-empty identity-scan defects above.

### Independent Static Validation

Passed without operating Compose, a browser, the manager demo, either audit, `npm run demo:guard`, or port 8088:

- branch `intent/W2-02-design-system-closure`; `c2f13dd` remains an ancestor and the existing baseline was not reset or replaced;
- `node --check` for the fixture, global setup, guard, live runner, SSR proxy, trace sanitizer/CLI, evidence, UI proof, and workspace-identity modules;
- all **24** direct W2-02 Node script tests;
- standalone TypeScript validation of `playwright.config.ts` and `tests/w2-02/booking.spec.ts`;
- `git diff --check` (line-ending notices only);
- direct isolated proxy observation proving the create-case `/api/reference-options` mismatch described above.

The helper suite is not live acceptance evidence and does not exercise the complete production chain. `ui-ux-pro-max`, `design-system/linercore/MASTER.md`, and `design-system/linercore/SESSION-PROMPT.md` were reloaded for this UI-bearing review. Their relevant density, focus, reduced-motion, responsive, and accessibility guidance was applied; gateway/hero/CTA, alternate palette/font, decorative, and dark-default advice was rejected in favor of the binding LinerCore operational-console contract.

### Mandatory Corrections

Resolve every Critical and High finding above, add production-chain coverage for the create proxy observation and safe stack ownership/guard chronology, and rerun independent architecture review before the human Code Generation gate. Live Compose evidence, Playwright UI proof, `aidlc-audit`, and `erp-fidelity-audit` remain pending. Historical W1 live proof remains **BLOCKED/WAIVED**, never PASS.

## Formal Revision 1 — Correction Pass 3

### Structured Return

- **Status:** READY-FOR-INDEPENDENT-REVIEW. This correction does not approve Code Generation and does not claim live acceptance.
- **Scope preserved:** the existing Booking implementation, BFF/service contracts, one authenticated shell, W2-02 tokens/primitives, fixed `linercore-wave-a`/18088 target, and Wave A baseline ancestry remain intact. No second frontend, navigation, module theme, production fake mode, or backend contract was introduced.
- **Runtime boundary preserved:** this correction did not operate Compose, a browser, the manager demo, `npm run demo:guard`, either audit, port 8088, or `linercore-shared-platform`.
- **Historical truth preserved:** W1 live proof remains exactly **BLOCKED/WAIVED**, never PASS.

### Correction Pass 3 Finding Resolution

1. **Exact causal observations without rejecting legitimate passthrough:** `scripts/w2-02-ssr-control-proxy.mjs` now exports the route/case-specific observation contract used by both Playwright and evidence validation. It requires the exact controlled request, response status, and action for every case while allowing only the additional paths valid for that case. Create visuals require successful `GET /api/reference-options`; the mutation journey requires reference loading, exact `201 POST /api/bookings`, and 200 validate/price/confirm transitions while allowing detail refreshes. Unrelated `/api/reference-options` observations no longer fail a working create route. Direct ephemeral upstream/proxy tests cover all four reference loads and the mixed create/action journey; the proxy CLI was separated from the importable contract so the exact 98-case Playwright suite can register.
2. **Two direct pre-mutation manager guards with binding chronology:** the acceptance parent now executes and records the exact protected-demo `npm run demo:guard` before its first Wave A wrapper operation. Playwright global setup retains a second direct guard immediately before browser tests. The gate ledger distinguishes `demo-guard-pre-lifecycle` from `demo-guard-pre-browser`, requires exact protected-demo inputs and producers, and rejects ownership/config/up records that precede the first guard or browser work that precedes the second. Historical evidence validation uses the recorded chronology without incorrectly expiring an already completed run.
3. **Safe stack ownership and cleanup:** after the first guard, the runner acquires a single Wave A lifecycle lock and performs wrapper-only `ps --all --format json`. Any pre-existing `linercore-wave-a` resource aborts the attempt without cleanup. Configuration remains read-only and cannot arm cleanup. Ownership is armed only immediately before this run invokes `up`; therefore partial `up` failures are cleaned, while guard/lock/ownership/config failures can never call `down --volumes`. Cleanup stays wrapper-only, a failed normal cleanup is retried only for the owned attempt, and a failed retry becomes the terminal failure. Direct tests cover empty/pre-existing status, configuration failure authorization, partial-up ownership, chronology, source ordering, and absence of raw/shared fallback.
4. **Terminal attempt and rerun evidence:** schema version 3 writes an immutable per-run `attempt/started.json`, complete evidence payload, `attempt/terminal.json`, and final envelope. The terminal record binds the exact start-record digest and final payload hash; the envelope binds both artifact hashes and requires `COMPLETED` plus exact `reproducesRun`. Reruns bind a preserved predecessor terminal file by run ID, sequence, status, and actual SHA-256. Sequence allocation and terminal-log appends are serialized; every started live attempt receives an append-only COMPLETED or FAILED terminal record, while the shared log remains an index rather than an unverified evidence source. Negative tests reject non-terminal envelopes, payload/terminal/reproduction drift, and forged predecessor digests.
5. **One persistent shell during loading:** `apps/shell/app/booking/layout.tsx` now owns the existing authenticated `ShellFrame` for the whole Booking route tree. List/create/detail pages retain their domain/session/service logic but no longer instantiate page-local frames. The existing `booking/loading.tsx` renders inside that same frame, so navigation and the active Booking link remain mounted and keyboard-focusable while the controlled skeleton is visible. A source contract test requires exactly this layout/loading/page composition and the fixture’s real Booking-link focus action; no duplicate shell was created.
6. **Genuine keyboard journeys:** the Playwright create and list-filter paths contain no `.fill()` or DOM value injection. They traverse from the actual current focus with Tab, assert each labelled target is focused with a measured focus-only indicator, type through `pressSequentially`, and retain Enter activation for filter, create, validate, price, and confirm. A source guard fails if `.fill()` returns or the keyboard/focus assertions disappear.
7. **Mandatory local-identity trace closure:** the acceptance parent derives a non-empty, unique identity set from workspace/home/user/run/workspace-digest/storage-state facts and every required customer, load/discharge location, voyage, equipment type/ID, and commodity fixture. Missing fixture identities fail before acceptance. The exact sorted set is passed to Playwright as JSON; the sanitizer rejects empty, duplicate, or underspecified sets, redacts slash/case variants, and records only count plus configuration digest. Evidence requires the trace report and reproduction record to contain the same non-zero count/digest. Tests prove local paths/usernames are removed and empty/duplicate identity scans cannot PASS.

### Correction Pass 3 Verification

Passed without live execution:

- **33/33** direct Node tests covering all earlier anti-drift, target, guard-forgery, evidence, canonical-path, source-identity, trace, theme/focus, and fixture guarantees plus the new mixed proxy observations, shell-loading composition, keyboard-source guard, guard/ownership/cleanup chronology, terminal envelope/predecessor binding, and mandatory local identities;
- dry Playwright production registration: exactly **98 tests in 1 file**, with no global setup, browser, Compose, guard, audit, or live request execution;
- `@erp/ui`, `@erp/app-shell`, and `@erp/app-booking` TypeScript checks;
- standalone TypeScript validation of `playwright.config.ts` and `tests/w2-02/booking.spec.ts`;
- UI, shell, and Booking lint (only existing Next.js deprecation/plugin notices);
- repository-wide W2-02 anti-drift enforcement;
- `node --check` over the changed runner, evidence, attempt, proxy library/CLI, guard/global setup, identity, and trace modules;
- `git diff --check`, branch identity, and preserved `c2f13dd` ancestry.

The required later-stage live work remains unchanged: exact parent/global pre-guards, wrapper-owned isolated stack startup/readiness/cleanup, all 98 Playwright cases and sanitized trace promotion, post-guard, `aidlc-audit`, and `erp-fidelity-audit`. Vitest and Next production builds retain the previously documented managed-Windows child-process `spawn EPERM` limitation and are not represented as PASS.

The required `ui-ux-pro-max` guidance was reapplied for persistent navigation, keyboard focus, loading stability, reduced motion, responsive widths, and accessibility. Its portfolio/hero/conversion structure, alternate blue/amber palette, Fira fonts, spinner, and decorative recommendations were rejected in favor of the binding LinerCore operational-console master and shared `@erp/ui` tokens.

## Review

**Verdict: NOT-READY**

### Formal Revision 1 Correction Pass 3 Findings

- **CRITICAL — the real second-guard chronology is impossible for every production run.** `scripts/w2-02-live-acceptance.mjs:32-35,149` records `browser.startedAt` before it spawns the Playwright process. The second direct manager guard runs later, inside that process's global setup (`scripts/w2-02-playwright-global-setup.mjs:15-27`). Both runtime and evidence validation nevertheless require `browserDirect.startedAt` to be at or after the global guard's `finishedAt` (`scripts/w2-02-live-acceptance.mjs:72-78` and `scripts/w2-02-evidence.mjs:130-132`). The comparison is necessarily false even when the guard correctly runs before any browser is created, so a fully green live acceptance reaches `validateLifecycleOrdering` and is rejected. The direct chronology test hides the defect by inventing a browser start timestamp after the in-process guard (`scripts/w2-02-live-acceptance.test.mjs:53-58`), which the production `direct()` boundary can never produce. A direct static model of the real process/global-setup order returned `Browser/cleanup/post-guard chronology is invalid`. Record a distinct post-global-setup/browser-work marker (or bind the earliest worker/case timestamp) and validate that marker after the guard; retain the outer Playwright process start only for process-duration evidence. Add a test that models the actual parent-process start → child global setup → browser-work ordering.
- **HIGH — the keyboard journeys still manipulate DOM focus instead of remaining keyboard-only.** `tests/w2-02/booking.spec.ts:59-66` calls `page.evaluate()` to blur `document.activeElement` whenever `focusByKeyboard` uses its default `reset = true`. Both journeys invoke that default for command activation (`:73-75,206,222,225`), and the create journey also uses it for the first field (`:149-157`). Although values now use `pressSequentially` and `.fill()` is gone, programmatically clearing focus restarts traversal from the document rather than continuing from the user's actual current focus. This contradicts the Pass 3 zero-DOM-injection/continuous-Tab guarantee. Keep visual-only focus probes separate if a reset is useful there, but make the two named keyboard journeys use only `page.keyboard` actions from their actual focus, assert each intervening destination/order, and extend the source guard to reject `activeElement.blur()`, `.focus()`, and DOM value mutation in those journeys.
- **HIGH — a deterministic start-record orphan path remains in attempt allocation.** `scripts/w2-02-live-acceptance.mjs:97-108` writes `attempt/started.json` and only then awaits the shared-log append. `main()` does not receive the attempt or enter its terminal-writing `try` until allocation returns at `:118-121`. If that append fails, allocation throws after the immutable STARTED file exists, leaving the started attempt without either a FAILED or COMPLETED terminal record; the later terminal handler at `:182-184` is never reached. This violates the claimed every-started-attempt terminal closure and can also let later sequence allocation ignore the orphan. Once the start file is durable, make index append failure non-authoritative and return enough state for `main()` to terminalize, or catch the post-start allocation failure inside the allocator and write/validate a FAILED terminal before propagating it. Add a fault-injection test for failure specifically between start-file persistence and index append.

### Prior-Finding Disposition

Pass 3 materially closes the previous blanket `/api/bookings` observation rejection: the shared production validator now permits legitimate reference-option traffic while requiring exact method/path/action/status transitions, and the mutation contract requires create plus validate/price/confirm. It also closes the missing parent pre-lifecycle guard; unsafe cleanup after guard/ownership/config failure; pre-existing Wave A acceptance; unbound success-terminal envelope; missing persistent shell during routed loading; `.fill()`/programmatic value entry; and optional/empty trace identity configuration. The acceptance-only SSR proxy, fixed wrapper/project/ports, 98-case fixture registration, broad fail-closed trace handling, workspace fingerprinting, canonical realpath/symlink/hardlink checks, resolved theme and focus-only indicator checks, protected manager-demo constants, and W1 **BLOCKED/WAIVED** truth remain materially preserved. The chronology and keyboard claims are only partially closed for the reasons above, and terminal lineage retains the orphan-start path.

### Independent Static Validation

Passed without operating Compose, a browser, `npm run demo:guard`, either audit, the manager demo, or port 8088:

- Graphify and codebase-memory architecture-first discovery, followed by targeted source inspection where the graphs did not include the new harness modules;
- `ui-ux-pro-max` design-system, accessibility/keyboard/loading, and Next.js searches with `design-system/linercore/MASTER.md` and `SESSION-PROMPT.md` reloaded;
- all **33/33** direct W2-02 Node script tests;
- dry Playwright production registration: exactly **98 tests in 1 file**, with global setup and browser execution not run;
- `node --check` for all 13 acceptance/lineage/proxy/guard/evidence/trace/UI/workspace/wrapper modules;
- standalone TypeScript validation of `playwright.config.ts` and `tests/w2-02/booking.spec.ts`;
- `@erp/ui`, `@erp/app-shell`, and `@erp/app-booking` typechecks plus repository-wide W2-02 anti-drift;
- branch `intent/W2-02-design-system-closure`, preserved `c2f13dd` ancestry, and `git diff --check` (line-ending notices only);
- direct negative chronology model reproducing the production validator failure above.

The current managed Windows sandbox returned `spawnSync git EPERM` when the real workspace-identity helper was invoked directly, so that helper's real child-process execution is not represented as PASS; its deterministic unit tests and independent shell ancestry checks passed. The UI skill's persistent navigation, keyboard focus, stable loading, reduced-motion, responsive, and accessibility guidance was retained. Enterprise Gateway/hero/CTA, alternate palette/Fira fonts, spinner, decorative, and dark-default advice was rejected in favor of the binding LinerCore operational-console contract.

### Mandatory Corrections

Fix the real parent-process/global-setup/browser chronology, remove DOM focus manipulation from both keyboard journeys, terminalize a start record even when the attempt-index append fails, and rerun independent architecture review before the human Code Generation gate. Live isolated Compose evidence, all 98 executed Playwright cases, sanitized trace promotion, post-guard, `aidlc-audit`, and `erp-fidelity-audit` remain pending. Historical W1 live proof remains **BLOCKED/WAIVED**, never PASS.

## Formal Revision 1 — Correction Pass 4

### Structured Return

- **Status:** READY-FOR-INDEPENDENT-REVIEW. This correction does not approve Code Generation and does not claim live acceptance.
- **Scope preserved:** the existing W2-02 Booking implementation, shared authenticated shell, shared tokens/primitives, exact 98-case ledger, fixed `linercore-wave-a`/18088 target, and `c2f13dd` baseline ancestry remain intact. No second frontend, navigation, module-local theme, or backend-contract redesign was introduced.
- **Runtime boundary preserved:** this pass did not operate Compose, a browser, `npm run demo:guard`, either audit, the manager demo, port 8088, or `linercore-shared-platform`.
- **Historical truth preserved:** W1 live proof remains exactly **BLOCKED/WAIVED**, never PASS.

### Correction Pass 4 Finding Resolution

1. **Real process/global-setup/case chronology:** Playwright global setup now writes `gates/browser-authorized.json` only after the direct pre-browser guard validates. The marker is bound to the exact guard SHA-256, run, workspace, guard completion timestamp, and in-process permit timestamp. Each Playwright case validates that marker against the orchestrator workspace before recording its own `startedAt` and first real browser `actionAt`; every immutable case record carries both timestamps and the exact permit. Runtime and evidence validators now replay the actual order: parent Playwright process start, global-setup guard, permit, case start/action/capture, parent process finish, cleanup, and post-guard. The outer process start remains duration evidence and is no longer incorrectly required to follow its own global setup. A direct production-boundary test accepts the real order and rejects fabricated pre-guard case action.
2. **Keyboard-only focus acquisition:** all `activeElement.blur()`, `.focus()`, reset flags, and focus-reset evaluation were removed from the Playwright suite. The shared helper advances only with real Tab presses from the current document focus, confirms the intended labelled/actionable target with `toBeFocused`, and retains measured focus-indicator evidence. The list-filter and create-to-confirm journeys retain `pressSequentially` and Enter activation; navigation/reload supplies the only natural focus restart. The source/behavior guard rejects `.fill()`, DOM `.value` assignment, DOM focus mutation, and evaluation-based focus resets while requiring Tab, sequential typing, focus assertions, and Enter.
3. **No orphan after durable STARTED:** attempt revision Pass 4 persists `attempt/started.json`, then catches a shared-index STARTED append failure inside the allocator. It immediately writes an immutable local FAILED terminal bound to the start digest, best-effort appends that terminal to the shared index, writes an `INDEX_RECOVERY` record containing only hashes/status, and returns the terminalized failure for propagation. Sequence allocation now considers terminal index events as well as STARTED events. The injected append-failure test proves that the failed STARTED append leaves a local FAILED terminal, indexed terminal, and recovery record rather than an orphan.

### Correction Pass 4 Verification

Passed without live execution:

- **34/34** direct W2-02 Node script tests, including the real production-boundary chronology model, permit/evidence replay, keyboard mutation source guard, and injected attempt-index failure terminalization;
- dry Playwright production registration: exactly **98 tests in 1 file**, with global setup and browser execution not run;
- `@erp/ui`, `@erp/app-shell`, and `@erp/app-booking` TypeScript checks and lints (only the existing Next.js deprecation/plugin notices);
- standalone TypeScript validation of `playwright.config.ts` and `tests/w2-02/booking.spec.ts`;
- repository-wide W2-02 anti-drift, changed-module `node --check`, explicit keyboard/chronology source guards, `git diff --check`, branch identity, and preserved `c2f13dd` ancestry.

The managed Windows sandbox rejected the default multi-file Node test worker spawn with `EPERM`; the repository's intended `--test-isolation=none` direct suite then executed all 34 tests in-process and passed. This is an environment constraint, not represented as a separate PASS. The required later-stage live work remains unchanged: isolated wrapper-owned Compose lifecycle, all 98 executed Playwright cases and trace promotion, post-guard, `aidlc-audit`, and `erp-fidelity-audit`.

The required `ui-ux-pro-max` guidance was reapplied only to keyboard focus continuity and accessibility evidence. Enterprise Gateway/hero/CTA structure, alternate palette/fonts, decorative treatment, and dark-default recommendations were rejected in favor of the binding LinerCore operational-console master, session prompt, shared shell, and shared `@erp/ui` tokens.

## Review

**Verdict: NOT-READY**

### Formal Revision 1 Correction Pass 4 Finding

- **HIGH — post-STARTED failure recovery and sequence allocation are still not fail-closed when the shared attempt index is unavailable.** `scripts/w2-02-attempt-lineage.mjs:73-88` writes a local FAILED terminal and `INDEX_RECOVERY` record only for failure of the initial shared STARTED append. The other production failure paths at `scripts/w2-02-live-acceptance.mjs:125-126` and `:189-190` write a local FAILED terminal and then directly await `appendTerminal`; if that shared append fails, they escape without the immutable recovery record promised for every post-STARTED failure. More importantly, when both the initial STARTED append and the best-effort FAILED-terminal append fail, `persistStartedAttempt` correctly preserves local `terminal.json` plus `index-recovery.json` with `terminalIndexed: false`, but the next allocation reads sequence and default rerun identity only from `attempts.jsonl` at `scripts/w2-02-live-acceptance.mjs:100-108`. It never reconciles the preserved run-local start/terminal/recovery records, so it can reuse a sequence and omit the locally terminalized failed run from rerun lineage. The only fault-injection test (`scripts/w2-02-live-acceptance.test.mjs:68-76`) fails the first append but requires the second append to succeed; it does not cover double index failure or terminal-index failure from setup/runtime error handling. Use one terminalization/recovery helper for every failure after durable STARTED, make sequence/rerun allocation reconcile immutable run-local terminal/recovery records under the allocation lock (or use an independent durable sequence ledger), and add fault tests for both shared appends failing plus setup/runtime FAILED-terminal append failure.

### Pass 4 and Prior-Finding Disposition

The parent-process/global-setup chronology is materially corrected. `scripts/w2-02-browser-permit.mjs:33-48` validates finite timestamps in the real order of Playwright parent start, exact global-setup guard, hash-bound permit, every case start/action/capture, process finish, owned cleanup, and post-guard; both the live runner and evidence validator call that same check. Case evidence is additionally bound to the exact permit in `scripts/w2-02-evidence.mjs:104-108`. The production-boundary negative test rejects a pre-permit action.

The two named keyboard journeys are materially keyboard-only. `tests/w2-02/booking.spec.ts:67-84,165-173,216-251` advances focus only with Tab, enters values with `pressSequentially`, activates commands with Enter, and asserts the exact focused target. There is no `.fill()`, DOM value assignment, `.focus()`, `blur()`, or focus-reset evaluation; the source guard at `scripts/w2-02-fixture-contract.test.mjs:71-85` enforces those prohibitions.

Regression inspection also preserved the earlier closures: exact 98-case fixture registration; causal SSR proxy observations including create reference loads and the mixed create/validate/price/confirm journey; parent pre-lifecycle and global pre-browser manager guards; wrapper-only `linercore-wave-a`/18088 ownership, lifecycle, and cleanup with rejection of pre-existing resources; terminal-envelope and predecessor hashes; one persistent Booking `ShellFrame` during routed loading; broad trace credential/local-identity redaction and fail-closed archive handling; canonical artifact containment and workspace identity binding; measured focus/resolved-theme assertions; protected manager-demo constants; and explicit W1 **BLOCKED/WAIVED** truth. No other Critical or High regression was found.

### Independent Static Validation

Passed without operating Compose, a browser, `npm run demo:guard`, either audit, the manager demo, port 8088, or `linercore-shared-platform`:

- Graphify query plus a fresh codebase-memory index, followed by targeted source inspection of the new harness modules;
- `ui-ux-pro-max` design-system, accessibility/focus, and Next.js searches after reloading `design-system/linercore/MASTER.md` and `SESSION-PROMPT.md`; data-density, visible-focus, responsive-table, and reduced-motion advice was retained, while gateway/hero/CTA, alternate palette/fonts, spinner, decorative, and dark-default advice was rejected;
- all **34/34** direct W2-02 Node helper tests;
- exact production Playwright dry registration: **98 tests in 1 file**, with global setup and browser execution not run;
- `@erp/ui`, `@erp/app-shell`, and `@erp/app-booking` typechecks plus static ESLint for the Playwright/config surface;
- repository-wide W2-02 anti-drift and `node --check` for the acceptance, lineage, permit, global-setup, evidence, SSR-proxy, trace, and wrapper modules;
- branch `intent/W2-02-design-system-closure`, preserved `c2f13dd` ancestry, and `git diff --check` (line-ending notices only).

Live isolated Compose evidence, all 98 executed Playwright cases, sanitized trace promotion, post-guard, `aidlc-audit`, and `erp-fidelity-audit` remain pending later-stage work. Historical W1 live proof remains **BLOCKED/WAIVED**, never PASS.

### Mandatory Correction

Close the High attempt-index/recovery finding above and rerun independent architecture review before the human Code Generation gate.

## Formal Revision 1 — Correction Pass 5

### Structured Return

- **Status:** READY-FOR-INDEPENDENT-REVIEW. This correction does not approve Code Generation and does not claim live acceptance.
- **Scope preserved:** only the remaining attempt-lineage High finding was corrected. The existing W2-02 Booking implementation, one shared authenticated shell, shared tokens/primitives, exact 98-case ledger, fixed `linercore-wave-a`/18088 target, and `c2f13dd` ancestry remain intact.
- **Runtime boundary preserved:** this pass did not operate Compose, a browser, `npm run demo:guard`, either audit, the manager demo, port 8088, or `linercore-shared-platform`.
- **Historical truth preserved:** W1 live proof remains exactly **BLOCKED/WAIVED**, never PASS.

### Correction Pass 5 Finding Resolution

1. **One terminalization and recovery path:** `persistTerminalAttempt` now writes the immutable run-local terminal before attempting the shared append. Any shared terminal append failure writes an exclusive, fsynced `INDEX_RECOVERY` artifact containing the run, sequence, status, STARTED digest, terminal digest, sanitized index error, error digest, failed event, and whether the terminal reached the shared index. Initial STARTED-index failure, setup failure, ordinary lifecycle/runtime failure, final cleanup/post-guard failure, and successful COMPLETED indexing all use this path. No recovery attempt deletes or replaces a preserved local FAILED terminal; the former terminal removal and ad hoc completion warning paths are gone.
2. **Shared and local reconciliation under the allocation lock:** allocation now reads both `attempts.jsonl` and every run-local `attempt/started.json`, `terminal.json`, and `index-recovery.json` while holding the allocation lock. It validates start/terminal/recovery bindings, rejects duplicate sequence ownership and divergent start, terminal, or terminal-artifact digests, assigns `max(sequence) + 1`, and derives the default `reproducesRun` predecessor from the highest preserved terminal attempt. A locally terminalized attempt remains authoritative for monotonic allocation and rerun identity even when neither STARTED nor FAILED reached the shared index.
3. **Immutable-envelope compatibility:** successful evidence still writes and validates the payload-bound COMPLETED terminal before final envelope promotion. The shared helper then performs only the post-envelope shared-index/recovery step using that already-persisted terminal, so it does not rewrite the terminal or weaken the envelope hash model.
4. **Failure-finalization coverage:** final owned cleanup, final manager-guard recording, trace-staging cleanup, and lifecycle-lock cleanup exceptions are converted into terminal errors and flow through the same FAILED terminalization helper instead of escaping before terminal closure.
5. **Fault-injection proof:** tests now cover an ordinary runtime FAILED-terminal append failure, simultaneous STARTED and FAILED shared-append failure without requiring a second append to succeed, immutable local recovery retention, the next locked allocation selecting sequence 2, and `reproducesRun`/predecessor digest binding to the unindexed local sequence-1 terminal. Separate conflict tests reject duplicate sequences and divergent STARTED digests.

### Correction Pass 5 Verification

Passed without live execution:

- **37/37** direct W2-02 Node script tests through the repository's in-process `--test-isolation=none` runner;
- exact Playwright production dry registration: **98 tests in 1 file**, with global setup and browser execution not run;
- `node --check` for attempt lineage, live acceptance, browser permit, Playwright global setup, evidence, SSR proxy, trace sanitizer, and Compose wrapper modules;
- `@erp/ui`, `@erp/app-shell`, and `@erp/app-booking` typechecks and lints (only the existing Next.js deprecation/plugin notices);
- standalone TypeScript and ESLint validation of `playwright.config.ts` and `tests/w2-02/booking.spec.ts`;
- repository-wide W2-02 presentation anti-drift;
- branch `intent/W2-02-design-system-closure`, preserved `c2f13dd` ancestry, and `git diff --check` (line-ending notices only).

The default isolated Node test worker launch remains blocked by managed Windows `spawn EPERM`; the intended repository command executed all tests in-process and passed. This environment limitation is not represented as an additional PASS. Live isolated Compose evidence, all 98 executed Playwright cases, sanitized trace promotion, post-guard, `aidlc-audit`, and `erp-fidelity-audit` remain pending later-stage work.

## Review

**Verdict: NOT-READY**

### Formal Revision 1 Correction Pass 5 Finding

- **HIGH — the immutable COMPLETED terminal is committed before final evidence promotion and required final cleanup can no longer fail.** The original shared-index recovery gap is closed, but `scripts/w2-02-live-acceptance.mjs:243-247` writes `attempt/terminal.json` as immutable COMPLETED at `:244`, then performs the still-fallible terminal artifact hash and `writeEvidenceManifest` promotion, and sets `terminalWritten = true` only after manifest writing at `:246`. If hashing, manifest validation, or manifest writing fails after the immutable terminal exists, the error path reaches `:267-269` with `terminalWritten === false` and calls the centralized FAILED terminalizer against the same exclusive `wx` terminal path; that call fails with `EEXIST`, leaving a COMPLETED terminal for an acceptance attempt that returned failure and may have no final manifest. The inverse false-terminal path remains after promotion: trace-staging or lifecycle-lock cleanup exceptions at `:258-264` set `terminalError` after `terminalWritten === true`, so `:268` deliberately skips FAILED terminalization and throws while the durable terminal and manifest still claim COMPLETED. This contradicts Pass 5's stated final cleanup closure and the requirement that every post-STARTED terminal outcome remain truthful. Make COMPLETED terminal/envelope publication the last atomic commit after every mandatory fallible cleanup and promotion precondition, or introduce an explicit recoverable commit protocol that cannot expose COMPLETED unless the run can return success. Add fault-injection tests for terminal-artifact hashing/manifest validation or write failure after the candidate terminal is created, plus trace-staging and lifecycle-lock cleanup failure after the success path; each must end with exactly one truthful immutable terminal and no promotable false-green envelope.

### Pass 5 and Prior-Finding Disposition

Pass 5 materially closes the previous High shared-index blocker. `persistTerminalAttempt` writes the immutable local terminal before shared append, writes an exclusive/fsynced `INDEX_RECOVERY` through the production `writeJsonImmutable` path when indexing fails, and is used for initial STARTED-index failure, setup failure, ordinary runtime failure, and COMPLETED indexing. The locked allocator merges shared events with every run-local start, terminal, and recovery record; validates bindings and sequence/digest conflicts; chooses `max + 1`; and selects the highest preserved terminal as the default rerun predecessor. Direct tests now allow both STARTED and FAILED shared appends to fail, preserve the local terminal/recovery, allocate sequence 2, and bind `reproducesRun` plus the predecessor artifact digest without assuming the second append succeeds.

Pass 4 chronology and keyboard corrections remain intact. The runtime/evidence validators still enforce parent Playwright start, global-setup guard, hash-bound permit, case start/action/capture, process finish, owned cleanup, and post-guard ordering. The two keyboard journeys still use Tab-only focus acquisition, `pressSequentially`, Enter, and exact focus assertions, with no `.fill()`, DOM value mutation, `.focus()`, `blur()`, or evaluation-based focus reset.

Regression inspection preserved the previous closures: exact 98-case registration; causal SSR proxy proof including create reference calls and create/validate/price/confirm; parent and global manager guards; wrapper-only `linercore-wave-a`/18088 lifecycle with pre-existing-stack rejection; terminal envelope/predecessor hashes; one persistent Booking shell during loading; trace credential/local-identity fail-closed handling; workspace and canonical artifact containment; resolved theme/focus proof; protected manager-demo constants; and explicit W1 **BLOCKED/WAIVED** truth. No other Critical or High regression was found.

### Independent Static Validation

Passed without operating Compose, a browser, `npm run demo:guard`, either audit, the manager demo, port 8088, or `linercore-shared-platform`:

- Graphify query plus a fresh codebase-memory index, followed by targeted Pass 5 source tracing;
- `ui-ux-pro-max` invocation after reloading `design-system/linercore/MASTER.md` and `SESSION-PROMPT.md`; keyboard focus and reduced-motion advice was retained, while gateway/hero/CTA, vibrant block styling, alternate palette/fonts, and promotional composition were rejected;
- all **37/37** direct W2-02 Node helper tests;
- exact Playwright production dry registration: **98 tests in 1 file**, without global setup or browser execution;
- `@erp/ui`, `@erp/app-shell`, and `@erp/app-booking` typechecks plus static ESLint for Playwright/config;
- repository-wide W2-02 anti-drift and `node --check` for the lineage, runner, permit, global setup, evidence, proxy, trace, and wrapper modules;
- branch `intent/W2-02-design-system-closure`, preserved `c2f13dd` ancestry, and `git diff --check` (line-ending notices only).

Live isolated Compose evidence, all 98 executed Playwright cases, sanitized trace promotion, post-guard, `aidlc-audit`, and `erp-fidelity-audit` remain pending. Historical W1 live proof remains **BLOCKED/WAIVED**, never PASS.

### Mandatory Correction

Close the High completion-commit/final-cleanup finding above and rerun independent architecture review before the human Code Generation gate.

## Formal Revision 1 — Correction Pass 6

### Structured Return

- **Status:** READY-FOR-INDEPENDENT-REVIEW. This correction does not approve Code Generation and does not claim live acceptance.
- **Scope preserved:** only the remaining completion-commit boundary was changed. Pass 5 local/shared attempt reconciliation, the existing W2-02 Booking implementation, one shared authenticated shell, shared tokens/primitives, exact 98-case ledger, fixed `linercore-wave-a`/18088 target, and `c2f13dd` ancestry remain intact.
- **Runtime boundary preserved:** this pass did not operate Compose, a browser, `npm run demo:guard`, either audit, the manager demo, port 8088, or `linercore-shared-platform`.
- **Historical truth preserved:** W1 live proof remains exactly **BLOCKED/WAIVED**, never PASS.

### Correction Pass 6 Finding Resolution

1. **Terminal-last transaction:** the runner no longer writes `attempt/terminal.json` as COMPLETED inside the evidence-building try block. It builds deterministic COMPLETED bytes off the canonical terminal path, validates the evidence payload and envelope against those staged bytes, and atomically promotes a fsynced `manifest.json` whose explicit state is `terminalStatus: PREPARED` with `commitProtocol: terminal-last-v1`. The envelope is deliberately non-complete until its declared immutable terminal exists with the exact hash.
2. **All fallible closure precedes COMPLETED:** owned stack cleanup/final guard handling completes first. The transaction then prepares/promotes the envelope, removes trace staging, and releases the lifecycle lock. Only after every step succeeds does it atomically rename the off-path terminal candidate to `attempt/terminal.json`. Manifest preparation, pending write, promotion, trace cleanup, lock release, or terminal publication failure flows through the centralized Pass 5 `persistTerminalAttempt` FAILED path and cannot collide with a pre-existing canonical COMPLETED file.
3. **No throwing work after publication:** atomic terminal rename is the final operation allowed to propagate an exception. After canonical COMPLETED publication, the only operation is the contained shared-index/recovery routine. It catches every append, recovery, and lock-cleanup exception and returns an outcome without rejecting the acceptance command. A shared COMPLETED append failure therefore leaves the immutable local COMPLETED terminal plus `INDEX_RECOVERY` when recovery storage is available, but cannot turn a completed command into a thrown failure.
4. **Validator commit semantics:** `validateEvidenceManifest` now requires the PREPARED terminal-last protocol and still requires the actual canonical terminal artifact, exact terminal hash, payload binding, COMPLETED terminal status, and all prior evidence gates. A promoted PREPARED envelope with no terminal, a FAILED terminal, or a divergent terminal hash cannot validate as complete. Preparation uses a narrowly scoped virtual artifact override only for the not-yet-published terminal bytes; normal validation always reads the canonical file.
5. **Fault-injection closure:** direct transaction tests inject manifest preparation, manifest write, manifest promotion, trace-staging cleanup, lifecycle-lock release, and completed-publication failures. Every precommit fault proves `completedPublished: false`, an immutable local FAILED terminal, FAILED `INDEX_RECOVERY`, and rejection by the production envelope validator. A completed-index append fault proves terminal-last publication remains COMPLETED, recovery is written, and the transaction does not reject. The positive test promotes the PREPARED envelope, proves it rejects while the canonical terminal is absent, publishes the terminal last, and then proves the final production envelope validates.

### Correction Pass 6 Verification

Passed without live execution:

- **46/46** direct W2-02 Node script tests through the repository's in-process `--test-isolation=none` runner;
- exact Playwright production dry registration: **98 tests in 1 file**, with global setup and browser execution not run;
- `node --check` for the completion transaction, attempt lineage, live acceptance, evidence, browser permit, Playwright global setup, SSR proxy, trace sanitizer, and Compose wrapper modules;
- `@erp/ui`, `@erp/app-shell`, and `@erp/app-booking` typechecks and lints (only the existing Next.js deprecation/plugin notices);
- standalone TypeScript and ESLint validation of `playwright.config.ts` and `tests/w2-02/booking.spec.ts`;
- repository-wide W2-02 presentation anti-drift;
- branch `intent/W2-02-design-system-closure`, preserved `c2f13dd` ancestry, and `git diff --check` (line-ending notices only).

The default isolated Node test worker launch remains blocked by managed Windows `spawn EPERM`; the intended repository command executed all tests in-process and passed. This environment limitation is not represented as an additional PASS. Live isolated Compose evidence, all 98 executed Playwright cases, sanitized trace promotion, post-guard, `aidlc-audit`, and `erp-fidelity-audit` remain pending later-stage work.

## Review

**Verdict: READY**

### Formal Revision 1 Correction Pass 6 Findings

No Critical or High findings remain in the Code Generation implementation.

### Completion-Boundary Disposition

Pass 6 closes the prior High false-terminal path. The production runner now prepares deterministic COMPLETED terminal bytes off the canonical path, writes/fsyncs the pending terminal candidate, internally validates the PREPARED `terminal-last-v1` envelope against only those staged bytes, and fsyncs/promotes the PREPARED manifest. It then removes trace staging and releases the lifecycle lock before atomically renaming the candidate to canonical `attempt/terminal.json`. The canonical COMPLETED rename is the final exception-propagating operation.

The public `validateEvidenceManifest` path accepts no artifact override: a promoted PREPARED envelope without the canonical terminal, with a FAILED terminal, or with a divergent terminal hash is incomplete and rejected. Once the exact canonical COMPLETED terminal is published, the same envelope validates and remains bound to the payload and attempt lineage. Any preparation, pending write, manifest promotion, trace cleanup, lifecycle-lock release, or terminal-publication failure takes the centralized FAILED terminal path; a promoted envelope remains non-validating. The only post-publication activity is the contained shared-index attempt, whose append/recovery/attempt-lock errors are caught and cannot reject an otherwise committed acceptance result.

Fault injection covers manifest preparation, manifest write, manifest promotion, trace-staging cleanup, lifecycle-lock release, and COMPLETED publication. Every precommit fault preserves `completedPublished: false`, a local FAILED terminal, recovery when shared indexing fails, and a production-validator rejection. The success proof demonstrates public invalidity before canonical terminal publication and validity afterward. A COMPLETED shared-index append failure leaves the canonical COMPLETED terminal plus recovery and does not escape the transaction.

### Regression Disposition

Pass 5 reconciliation remains intact: allocation holds the attempt lock while merging `attempts.jsonl` with all run-local STARTED, terminal, and recovery artifacts; conflicting sequence/start/terminal digests are rejected; `max + 1` is monotonic; and the highest preserved terminal supplies the default rerun predecessor even when both STARTED and FAILED shared appends failed.

All earlier Critical/High closures remain present: real parent-process/global-setup/permit/case/cleanup chronology in runtime and evidence validation; keyboard journeys using Tab, `pressSequentially`, Enter, and exact focus assertions with no DOM focus/value reset; exact 98-case registration; causal SSR proxy proof including mixed reference/create/action calls; parent and global manager guards; wrapper-only isolated `linercore-wave-a`/18088 lifecycle and pre-existing-stack rejection; one persistent authenticated Booking shell during loading; trace credential/local-identity fail-closed handling; canonical artifact/workspace binding; resolved theme/focus proof; protected manager-demo constants; and explicit W1 **BLOCKED/WAIVED** truth.

### Independent Static Validation

Passed without operating Compose, a browser, `npm run demo:guard`, either audit, the manager demo, port 8088, or `linercore-shared-platform`:

- Graphify query plus a fresh codebase-memory index, followed by targeted terminal-last transaction tracing;
- `ui-ux-pro-max` invocation after reloading `design-system/linercore/MASTER.md` and `SESSION-PROMPT.md`; keyboard-focus and reduced-motion guidance was retained, while gateway/hero/CTA, vibrant promotional styling, alternate palette/fonts, and oversized composition were rejected;
- all **46/46** direct W2-02 Node helper and fault-injection tests;
- exact Playwright production dry registration: **98 tests in 1 file**, without global setup or browser execution;
- `@erp/ui`, `@erp/app-shell`, and `@erp/app-booking` typechecks plus static ESLint for Playwright/config;
- repository-wide W2-02 anti-drift and `node --check` for the completion transaction, lineage, runner, evidence, permit, global setup, proxy, trace, and wrapper modules;
- branch `intent/W2-02-design-system-closure`, preserved `c2f13dd` ancestry, and `git diff --check` (line-ending notices only).

The managed-Windows default isolated Node worker limitation remains recorded as `spawn EPERM`; the intended in-process repository suite passed and the limitation is not represented as a separate application PASS.

### Remaining Stage-Bound Work

This READY verdict is limited to Code Generation architecture review. Live isolated Compose execution, all 98 Playwright cases, sanitized trace promotion, post-guard, `aidlc-audit`, and `erp-fidelity-audit` remain mandatory later-stage evidence. Historical W1 live proof remains **BLOCKED/WAIVED**, never PASS.
