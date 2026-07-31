# Performance Requirements — booking-design-system-closure

## Basis and Boundary

These requirements quantify the closure paths in `business-logic-model.md` and `business-rules.md`, preserve NFR-009 and the UI gates in `requirements.md`, and use the brownfield versions/controls in `technology-stack.md`. W2-02 changes presentation and evidence, not backend capacity, so it introduces no unsupported percentile, throughput, concurrency, cost, or production-traffic target.

## Measurable Requirements

| ID | Metric and condition | Target | Measurement/evidence |
|---|---|---|---|
| PERF-001 | Booking BFF request deadline for existing list/detail/create/validate/price/confirm calls | Preserve the existing 2,500 ms abort deadline; no increase | Focused BFF test and source/runtime evidence |
| PERF-002 | Route outcome visibility | Every route read resolves to `empty`, `populated`, `denied`, `degraded`, or `error` before the browser test’s documented route timeout; no blank or endlessly loading state | Playwright timestamps, state assertion, trace |
| PERF-002A | Command outcome visibility | Every lifecycle command resolves to `success`, `validationBlocked`, `recoverableError`, `denied`, `degraded`, or `fatalError` before the documented command timeout; no false success or endlessly pending state | Component/Playwright timestamps, state assertion, trace |
| PERF-003 | Route loading behavior | Stable-size shared Skeleton appears for routed/deferred work and is replaced by a named terminal state without visible geometry collapse | Component test plus live screenshot/trace |
| PERF-004 | Browser runtime health | Zero unhandled page errors, unhandled promise rejections, or acceptance timeouts during every required canonical non-fatal matrix case | Playwright page-error/console capture and result |
| PERF-004A | Fatal-boundary health | The dedicated fatal-error-boundary case captures exactly the deliberately injected expected failure, renders the named boundary, and records zero additional page errors, rejections, or timeouts | Focused boundary test plus Playwright trace/result when exercised live |
| PERF-005 | Duplicate command prevention | At most one lifecycle command in flight per UI instance; repeated activation cannot create a second network command | Component/network assertion |
| PERF-006 | List render bound | Canonical list renders no more than the existing accepted page size of 25 records per response and contains table overflow within its region | DOM row count and responsive Playwright |
| PERF-007 | Runtime bundle/dependency impact | No new production UI/runtime dependency unless a proven generic gap requires explicit approval; any test-only accessibility package stays outside the application bundle | Manifest/lockfile diff and production build |
| PERF-008 | Observed baseline | Record route/command start, terminal-state time, viewport/theme, and result for the live journey; label values “observed,” not SLO | Evidence manifest |

## Latency Budget

The only hard request budget introduced by existing executable code is the BFF’s 2,500 ms deadline. Network, shell rendering, browser, and test orchestration add environment-dependent time and therefore receive observed durations rather than invented p95/p99 promises. A BFF abort must become a safe recoverable/degraded presentation; it cannot be hidden by extending Playwright timeouts until the test passes.

## UI Responsiveness

- At 375, 768, 1024, and 1440 CSS pixels, primary commands remain visible and operable.
- Page-level horizontal overflow, overlapping interactive targets, and clipped primary-control text must each be zero for required routes/states.
- Table overflow may exist only inside the intentional shared Table scroller.
- Loading/status animation respects reduced motion and does not shift layout.
- Both shared themes must meet the same behavioral targets.

## Benchmark Method

The acceptance harness records browser timestamps around navigation and each command, BFF/network response status, the terminal UI discriminator, and any page/console error. The zero-unhandled-error rule applies to loading, empty, populated, denied, degraded, error/retry, validation-blocked, pending/success, theme, viewport, and happy-path cases. The fatal-boundary test uses one exact deliberate failure and must distinguish that expected signal from any additional unhandled error. Results are compared only within the recorded `linercore-wave-a` environment and commit. No result is extrapolated to production load or user population.

A regression is any increased BFF deadline, missing/late terminal state that reaches the documented test timeout, new browser error, duplicate command, row-bound violation, or overflow/overlap/clipping failure. Any regression keeps the Unit open.

## Explicit Non-Requirements

- No new requests-per-second, concurrent-user, percentile-latency, CPU/memory, Core Web Vitals, or bundle-size numeric SLO.
- No load, stress, soak, autoscaling, CDN, caching, or database optimization program.
- No masking of a slow/failing dependency through longer timeouts, mocked happy-path completion, or detached UI.

## Review

**Verdict: READY**

The mandatory second review confirmed that route and command terminal-state targets
match the Functional Design model, the full canonical non-fatal matrix has a
zero-unhandled-error/timeout gate, and the deliberate fatal-boundary case permits
only its exact expected injected failure. All other NFR targets and non-claims are
coherent and implementable on the observed stack.

**Mandatory corrections:** None.
