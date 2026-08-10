# Code Generation Plan - live-release-acceptance

Unit: live-release-acceptance
Stage: code-generation
Test strategy: Comprehensive

## Traceability

| Plan step | Story / requirement trace |
|---|---|
| Step 1 | BR-U07-001/FR-W1-013: one checked-in command must orchestrate live acceptance evidence. |
| Step 2 | BR-U07-002: PostgreSQL host port must default to 55432 and full-profile ports must not collide. |
| Step 3 | BR-U07-003: live acceptance must fail closed if local-noop messaging is active. |
| Step 4 | BR-U07-004/006/007: contracts, quality gates, and audits must be wired into the acceptance manifest. |
| Step 5 | U07 failure semantics: blocked/failed live attempts must retain immutable indexed evidence. |

## Steps

- [x] Step 1: Add `scripts/w1-live-acceptance.mjs` as the checked-in acceptance orchestrator with run IDs, gate results, `manifest.json`, `index.md`, artifact hashes, redaction, dry-run mode, and blocked/failed/skipped semantics.
- [x] Step 2: Add `scripts/w1-live-acceptance.test.mjs` covering dry-run manifest/index creation, stop-after-block behavior, preflight requirements, and secret redaction.
- [x] Step 3: Add package scripts `w1:live-acceptance` and `w1:live-acceptance:dry-run`.
- [x] Step 4: Add a `MESSAGING_REQUIRE_REAL=true` guard path to shared `NoopMessagingGuard` and test that local-noop is rejected even under the local profile when real messaging is required.
- [x] Step 5: Wire `MESSAGING_REQUIRE_REAL: "true"` into Reference Data, Charge, Booking, and CMM Compose service environments.
- [x] Step 6: Fix the full-profile Compose host-port collision by moving Grafana to `${GRAFANA_HOST_PORT:-3003}:3000` while Booking UI remains on 3001 and nginx remains on 8088.
- [x] Step 7: Add live acceptance gates for preflight, Compose config/start, contracts, dry/live seed, Booking UI health, replay/restart, quality gates, and both audit detectors.
- [x] Step 8: Run dry-run acceptance evidence at `artifacts/w1-01-live/codegen-dry-run/`.
- [x] Step 9: Attempt live acceptance with Docker. The run blocked at `compose-start` while pulling Elastic observability images due Docker Desktop HTTPS proxy/network access, and wrote evidence under `artifacts/w1-01-live/codegen-live-blocked-image-pull/`.
- [x] Step 10: Run full host gates after the U07 changes.

## Evidence

- `node scripts/w1-live-acceptance.mjs --preflight` - pass
- `node scripts/w1-live-acceptance.mjs --dry-run --run-id codegen-dry-run` - pass, planned evidence written
- `node scripts/w1-live-acceptance.mjs --run-id codegen-live-blocked-image-pull` - blocked at `compose-start` on Elastic image pull/proxy; evidence indexed
- `mvn -o -q test` from `services/` - pass
- `node --test scripts/w1-live-acceptance.test.mjs scripts/replay-restart-proof.test.mjs scripts/local-readiness.test.mjs scripts/run-quality-gates.test.mjs scripts/seed-local.test.mjs` - pass, 27 tests
- `yarn workspace @erp/app-booking test` - pass, 5 files / 15 tests
- `yarn workspace @erp/app-booking typecheck` - pass
- `yarn workspace @erp/app-booking lint` - pass
- `yarn workspace @erp/app-booking build` - pass
- `docker compose config --quiet` - pass
- `git diff --check` - pass with line-ending warnings only
- `.claude/skills/aidlc-audit/detectors.sh` - exit 0, LEADS output requires manual review
- `.claude/skills/erp-fidelity-audit/detectors.sh` - exit 0, LEADS output requires manual review
