# Code Summary - replay-restart-safety

## Produced

| Area | Files / changes |
|---|---|
| Charge pricing lease safety | `PricingRequestRepository`, `JdbcPricingRequestRepository`, `ChargeAgreementApplicationService` |
| Charge tests | `ChargeAgreementApplicationServiceTest` now covers live in-progress claims, expired takeover, and stale-owner fencing |
| Booking projection transaction | `BookingApplicationService.consumeMovementStatus` now has the intended transactional boundary |
| Replay/restart harness | `scripts/replay-restart-proof.mjs`, `scripts/replay-restart-proof.test.mjs`, `package.json` scripts |
| Evidence | `artifacts/w1-01-live/replay-restart/evidence.json` dry-run proof plan |

## Key Decisions

- Pricing claims remain committed before calculation instead of wrapping the entire pricing request in one transaction. Recovery is now controlled by database CAS predicates: live lease returns `PRICING_IN_PROGRESS`, expired lease can be taken over by one new owner, and completion requires the current owner token.
- Stale completion does not throw away a terminal result. If the service loses the fenced completion race, it rereads the stored winner and replays it when available.
- Booking movement-status receipt/projection now runs under the same application transaction, matching the earlier design and preventing receipt/projection divergence.
- The replay/restart proof harness is checked in but honest about execution mode. Dry-run records planned evidence for code-generation; live mode is reserved for the later live-release acceptance unit where Compose is actually driven.

## Test Coverage

- Charge application tests cover terminal replay, key/body conflict, live in-progress replay, expired lease takeover, and stale-owner non-overwrite.
- Script tests cover replay/restart dry-run evidence shape, Docker-blocked classification, and required topic list assertions.
- Full services Maven suite passed.
- Booking app tests, typecheck, lint, and build passed.
- Compose static config and whitespace checks passed.
- `aidlc-audit` and `erp-fidelity-audit` detector scripts exited 0 with LEADS output.

## Deviations

- Reviewer subagent invocation is unavailable in this Codex surface, so the review was performed inline and recorded below.
- Live Docker restart/replay proof was not executed during this code-generation unit. The checked-in harness writes dry-run evidence now and provides the command path for `live-release-acceptance`.

## Review

Verdict: READY

Findings:
- No blocking issues found in the U06 code-generation changes.
- Residual risk: `scripts/replay-restart-proof.mjs` currently validates restart persistence through service health, topic presence, and selected Booking DB counts. The final acceptance unit should extend or drive it with actual source-topic replay coordinates after creating a live booking.
- Residual risk: Replay authorization is represented in the evidence assertions and package script path, but a full protected replay CLI/endpoint is still deferred to the live acceptance/runtime proof slice.

Evidence:
- `mvn -o -q test` from `services/` passed.
- `node --test scripts/replay-restart-proof.test.mjs scripts/local-readiness.test.mjs scripts/run-quality-gates.test.mjs scripts/seed-local.test.mjs` passed.
- `node scripts/replay-restart-proof.mjs --dry-run --evidence artifacts/w1-01-live/replay-restart/evidence.json` wrote planned evidence.
- Booking frontend tests/typecheck/lint/build passed.
- `docker compose config --quiet` and `git diff --check` passed.
- Both audit detector scripts exited 0.
