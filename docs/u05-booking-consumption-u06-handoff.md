# U05 Booking Consumption and Repricing → U06 Evidence Handoff

Status: U05 source is ready for isolated-stack evidence. This handoff does not
claim Docker/PostgreSQL, browser, measured performance, Maven dependency
resolution, live bilateral, or release-audit PASS.

## Implemented seams

- Booking calls Charge only through its existing pricing port and the trusted
  `X-LinerCore-Service-Id` / `X-LinerCore-Service-Token` provider boundary.
  Browser identity is not forwarded and the service token is never exposed to
  the Booking BFF or browser.
- Pricing uses a short capture transaction, a bounded provider call with no
  Booking database connection held, and a fenced completion transaction.
- Booking V3 adds append-only typed pricing snapshots plus local operation
  receipts. Database time, input/revision fences, owner tokens, winner replay,
  stable history ordering, and legacy flattened snapshot decoding are
  implemented.
- First Price and explicit Reprice preserve `bookingRef:amendmentSeq`,
  distinguish pricing-affecting amendments, append immutable history, and keep
  confirmation blocked for stale/manual/provider-failure evidence.
- Timeout, 503, circuit-open, denied, malformed, validation, conflict,
  in-progress, no-rate, and ambiguity remain distinct. No provider amount or
  source version is reconstructed in Booking.
- The existing Booking detail pricing region now shows ordered itemization,
  total, basis/reference, source versions, current/prior snapshots, Reprice,
  legacy evidence, and manual/error states without changing the shared shell or
  `packages/ui`.
- Bounded telemetry, redaction tests, preservation/performance/rollback
  evaluators, and trusted local configuration are present.

## Verified before handoff

- Booking domain tests: PASS — 21/21 across lifecycle, snapshot, and existing
  Booking regression coverage.
- Booking migration/catalog/schema static tests: PASS — 10/10.
- U05 preservation/performance/rollback evaluator tests: PASS — 7/7 using
  `node --test --test-isolation=none`.
- Booking TypeScript type-check: PASS.
- Booking lint: PASS — zero warnings/errors.
- Contract catalog validation: PASS — 15 contracts.
- Contract provider verification: PASS — 199 checks; live verification skipped.
- U05 application/data-access sources and focused tests were compiled with the
  workspace static runner where the Maven dependency graph was unavailable.
- Scoped `git diff --check`: required at final reconciliation; line-ending
  warnings are non-failing.

## Honest blockers

1. Maven cannot resolve the newly approved Resilience4j 2.2.0 artifacts because
   both the configured Aliyun mirror and direct Maven Central time out; those
   artifacts are not cached. Full Booking reactor verification, dependency
   convergence, license, vulnerability, and controller test execution remain
   blocked.
2. Docker/Testcontainers/PostgreSQL execution is unavailable. Migration,
   claim/fence/takeover, restart, cursor-plan, and five-family concurrency tests
   compile but are not live evidence.
3. Booking Vitest cannot start because the Windows sandbox rejects esbuild child
   creation with `spawn EPERM`. This is before test discovery, not a failed test
   assertion.
4. Changed-line coverage ≥80%, production build, live provider/Pact, isolated
   Compose, Playwright, measured performance, and both release audits remain
   unobserved.

## U06 release-valid evidence cells

1. Run `npm run demo:guard` before and after. Do not target or mutate the manager
   project/port `linercore-shared-platform` / `8088`.
2. Start only the isolated `linercore-wave-a` stack through
   `scripts/wave-a-compose.mjs`; retain nginx `127.0.0.1:18088`.
3. Resolve/download Resilience4j 2.2.0 from an approved repository and run
   `mvn -f services/booking-service/pom.xml clean verify`, dependency
   convergence, license, and vulnerability checks.
4. Run V1→V3 Flyway upgrade/restart, operation-receipt claim/fence/takeover,
   snapshot append, legacy decode, five race families, and stable history cursor
   tests on live PostgreSQL. Retain `EXPLAIN (ANALYZE, BUFFERS)` with
   `work_mem = '4MB'` and prove no spill.
5. Prove Booking→Charge correlation and identical body/key reuse for first Price,
   Reprice, timeout/503 retry, replay, conflict, and in-progress outcomes. Prove
   no browser subject reaches Charge and no service credential reaches the
   browser.
6. Exercise agreement price, tariff fallback, successor-window Reprice,
   no-rate, every ambiguity, denied, malformed, conflict, in-progress, timeout,
   unavailable, and circuit-open. Match API, Booking DB, UI, logs, and
   correlation evidence; show no fabricated/partial total.
7. Capture measured raw performance with exactly 10 clients, 20 warm-ups, at
   least 100 Price and 100 Reprice samples, retained resource/circuit bounds,
   a no-spill history plan, and three post-GC heap/RSS cycles. Validate with
   `scripts/u05-booking-performance.mjs`.
8. Run Playwright at 375, 768, 1024, and 1440 px in light/dark themes. Cover
   keyboard-only current/prior selection and Reprice, focus restoration, live
   announcements, long identifiers, loading, empty, legacy, populated,
   validation, pending, manual, denied, conflict, and unavailable states.
9. Run live provider/Pact verification, changed-line coverage ≥80%,
   `aidlc-audit`, and `erp-fidelity-audit`; retain raw outputs, timestamps,
   environment identity, screenshots, traces, and failures.

## Exact rollback policy

The exact `incompatible_u05_rows` predicate is exported by
`scripts/u05-booking-preservation.mjs`. A previous image is eligible only when
the runtime is drained, schema access is validate-only/read-only, catalog,
Flyway, and data hashes are unchanged, legacy fixtures are byte-preserved, the
database role is SELECT-only, and the predicate returns zero. After any U05
aggregate, PRICE receipt, or typed snapshot row, use forward repair. Never
down-migrate V1–V3 or reset durable Booking data.
