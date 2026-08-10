# U04 Pricing Provider → U06 Evidence Handoff

Status: source implementation is ready for isolated-stack evidence. This handoff does not claim Docker, PostgreSQL, browser, bilateral Booking→Charge, or release-audit PASS.

## Implemented seams

- Charge owns `POST /pricing-requests` behind the fail-closed `X-LinerCore-Service-Id` / `X-LinerCore-Service-Token` boundary and `charge-agreement:price` authorization.
- Exact terminal receipt replay, fenced takeover/completion, atomic manual-case creation, agreement-first authority, complete tariff fallback, canonical request hashing, and bounded enum-only telemetry are implemented.
- Charge exposes read-only `GET /api/manual-pricing-cases` and `GET /api/manual-pricing-cases/{caseId}`. The Charge BFF exposes the existing `/api/manual-cases` browser seam and the evidence-only page at `/charge-agreements/manual-pricing`.
- The provider/consumer fixture is `contracts/pact/booking-charge-pricing-fixtures.json`; the complete terminal matrix is `contracts/examples/pricing-u04-terminal-matrix.json`.
- `scripts/u04-pricing-preservation.mjs`, `scripts/u04-pricing-performance.mjs`, and `scripts/u04-rollback-policy.mjs` are the executable U04 source/performance/rollback evaluators.

## Verified before handoff

- `mvn -f services/charge-agreement-service/pom.xml clean verify`: BUILD SUCCESS; 165 tests discovered, 0 failures, 0 errors, 28 Docker/Testcontainers skips.
- U02–U04 deterministic evaluator suite: 13/13 PASS.
- U04 performance/preservation/rollback evaluator suite: 7/7 PASS.
- `npm run contracts:validate` and `npm run contracts:verify`: PASS; live provider verification remains skipped by design.
- Charge `lint` and `typecheck`: PASS.
- `git diff --check`: PASS.
- V1–V4 SHA-256 values match the preservation fixture:

  - `V1__charge_baseline.sql`: `63524a7922f55229bfb14a477b966e1ea8aa0241e572a56dbd699a14f3d97e3a`
  - `V2__versioned_rate_authority.sql`: `ae009a733508ee14c208b1cd7ab973a2ce6ca5f369ce78238a58206f1b95c156`
  - `V3__versioned_agreement_authority.sql`: `10f3f9b13243de1be3b8c1db4f3eb86c0caff12edf18bdd5a0903fbb2f2beba5`
  - `V4__pricing_terminal_evidence.sql`: `830ea4b77c99502f53d725f62c93fcd875c82a675166acd851302f04f4756b7e`

## U06 release-valid evidence cells

1. Run `npm run demo:guard` before and after the isolated work. The manager demo must remain on project `linercore-shared-platform` and port `8088`.
2. Validate/start only the isolated Wave A project using `npm run wave-a:config` and `npm run wave-a:up`. Its project/network are `linercore-wave-a` / `linercore-wave-a-network`, and nginx is `127.0.0.1:18088`.
3. Resolve the bilateral ownership blocker before calling pricing from Booking. The current `services/booking-service/.../HttpChargePricingClient.java` sends the prohibited legacy `X-LinerCore-Actor-Id: booking-service` and does not send the trusted service ID/token. U04 intentionally did not modify Booking. The approved consumer owner must switch that call to the provider headers and aligned secret without forwarding browser identity.
4. On live PostgreSQL, run all Docker-skipped migration, concurrency, receipt/case atomicity, and 10,000-case repository tests. Retain `EXPLAIN (ANALYZE, BUFFERS)` plans at `work_mem = '4MB'` proving no list/detail spill.
5. Exercise fresh agreement, tariff, no-rate, all four ambiguity paths, conflict, in-progress, denied, malformed, and unavailable outcomes. Prove exact correlation propagation, byte-identical 200/404/422 replay, zero resolver/case work on replay, stale-owner fencing, and restart persistence.
6. Capture raw measured performance input matching `scripts/u04-pricing-performance.mjs`: exactly 10 clients; 20 discarded warm-ups per path; at least 100 samples for each of seven fresh paths; exactly 25 replays for each 200/404/422; at least 100 list and detail samples over at least 10,000 OPEN cases; raw no-spill plans; three post-GC heap/RSS cycles; environment metadata. Validate it with:

   `node scripts/u04-pricing-performance.mjs --input <raw-input.json> --evidence artifacts/u04/performance.json`

7. Run Playwright at 375, 768, 1024, and 1440 px in both light and dark themes. Cover keyboard-only filtering, selection/close focus restoration, polite result/detail announcements, loading, empty, filtered-empty, denied, not-found, legacy/unavailable evidence, service error/retry, long identifiers, table/compact records, and absence of commercial/workflow controls.
8. Keep DS-03 blocked until the integrated W2-02 route-metadata seam proves the shared journey ribbon is absent on all Charge administration routes. Do not add local CSS suppression or edit `packages/ui`.
9. Run live provider/Pact verification, `aidlc-audit`, and `erp-fidelity-audit`; retain commands, timestamps, environment identity, raw outputs, screenshots, and failure evidence.

## Known non-live blockers

- Docker named pipe `npipe:////./pipe/docker_engine` was unavailable, so 28 Testcontainers tests were skipped.
- Charge Vitest could not load `vitest.config.ts` because the sandbox denied esbuild process creation with `spawn EPERM`; two equivalent attempts failed before test discovery. Do not report this as a test assertion failure.
- `scripts/run-u02-security-gates.mjs` is blocked because `infrastructure/security/u02-toolchain-lock.json` is absent.
- Changed-line coverage ≥80% was not measured: no Java JaCoCo gate is configured, and frontend coverage cannot start while the esbuild spawn blocker remains.
- The shared worktree already contains earlier U01–U03 and unrelated active-program edits, including Agreement Avro/nginx changes. U04 added no pricing event/topic and changed no `apps/booking`, `services/booking-service`, `packages/ui`, or `apps/shell` implementation file.

## Exact rollback predicate and policy

Run this against the live pricing database:

```sql
SELECT
  (SELECT count(*) FROM pricing_requests
   WHERE terminal_schema_version = 'pricing.v1'
      OR terminal_http_status IS NOT NULL
      OR terminal_pricing_request_id IS NOT NULL
      OR manual_case_id IS NOT NULL)
  +
  (SELECT count(*) FROM manual_pricing_cases
   WHERE booking_ref IS NOT NULL
      OR amendment_seq IS NOT NULL
      OR request_hash IS NOT NULL)
  AS incompatible_u04_rows;
```

A previous image is eligible only when the runtime is drained, the previous image and DB role are SELECT-only, catalog/Flyway/data hashes are unchanged, legacy fixtures are byte-preserved, both pricing/manual routes are blocked, and `incompatible_u04_rows = 0`. Otherwise use forward repair. Never down-migrate V1–V4 or reset durable data.
