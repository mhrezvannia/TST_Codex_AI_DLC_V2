# Code Generation Plan - replay-restart-safety

Unit: replay-restart-safety
Stage: code-generation
Test strategy: Comprehensive

## Traceability

| Plan step | Story / requirement trace |
|---|---|
| Step 1 | US-W1-006, FR-W1-012, NFR-W1-003: duplicate/retry must preserve one logical business effect. |
| Step 2 | Pricing crash-after-claim scenario: expired leases must be claimable by exactly one new owner. |
| Step 3 | Pricing owner fencing: stale original owner cannot overwrite terminal pricing result. |
| Step 4 | Booking status consumption must commit receipt and projection in one transaction. |
| Step 5 | Replay/restart proof must produce machine-readable evidence under `artifacts/w1-01-live/replay-restart/`. |
| Step 6 | Exit gates must remain green with detector output captured as manual-review leads. |

## Steps

- [x] Step 1: Expand the Charge `PricingRequestRepository` port with expired-claim takeover and owner-fenced completion operations.
- [x] Step 2: Implement JDBC CAS updates for `takeOverExpiredClaim` and `completeOwned` using `idempotency_key`, `owner_token`, status, and lease predicates.
- [x] Step 3: Update `ChargeAgreementApplicationService.requestPricing` to replay terminal results, return bounded in-progress conflicts, take over expired claims, and reread a winner when fenced completion loses.
- [x] Step 4: Add Charge application tests for live in-progress replay, expired lease takeover, and stale-owner overwrite prevention.
- [x] Step 5: Add `@Transactional` to Booking movement-status consumption so event receipt and projection update share one transaction.
- [x] Step 6: Add `scripts/replay-restart-proof.mjs` with dry-run and live modes, Docker/service blocked classification, topic assertions, restart steps, DB count capture, and redacted evidence output.
- [x] Step 7: Add `scripts/replay-restart-proof.test.mjs` covering dry-run evidence, blocked Docker classification, and required topic output.
- [x] Step 8: Add package scripts `w1:replay-restart` and `w1:replay-restart:dry-run`.
- [x] Step 9: Generate dry-run replay/restart evidence at `artifacts/w1-01-live/replay-restart/evidence.json`.
- [x] Step 10: Run focused and full Java, script, frontend, Compose, diff, and detector gates.

## Evidence

- `mvn -o -q -pl charge-agreement-service/application-service,charge-agreement-service/dataaccess,booking-service/application-service -am test` - pass
- `mvn -o -q test` from `services/` - pass
- `node --test scripts/replay-restart-proof.test.mjs scripts/local-readiness.test.mjs scripts/run-quality-gates.test.mjs scripts/seed-local.test.mjs` - pass, 23 tests
- `node scripts/replay-restart-proof.mjs --dry-run --evidence artifacts/w1-01-live/replay-restart/evidence.json` - pass, planned evidence written
- `yarn workspace @erp/app-booking test` - pass, 5 files / 15 tests
- `yarn workspace @erp/app-booking typecheck` - pass
- `yarn workspace @erp/app-booking lint` - pass
- `yarn workspace @erp/app-booking build` - pass
- `docker compose config --quiet` - pass
- `git diff --check` - pass with line-ending warnings only
- `.claude/skills/aidlc-audit/detectors.sh` - exit 0, LEADS output requires manual review
- `.claude/skills/erp-fidelity-audit/detectors.sh` - exit 0, LEADS output requires manual review
