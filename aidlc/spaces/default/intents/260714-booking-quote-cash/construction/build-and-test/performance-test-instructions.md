# Performance Test Instructions - W1-01

## Upstream Inputs

Performance scope is informed by the W1-01 code-generation outputs and the NFR design for confirmation/event replay. The performance-sensitive paths are Booking create/list/detail, validation, pricing, confirmation outbox relay, CMM event consumption, Booking status projection, and replay/restart proof commands.

## Applicability

The active test strategy is `Standard`, so no load-test execution is required in this stage. These instructions define the release-candidate performance checks to run once the live Compose stack can start end to end.

## Recommended Commands

Use the live acceptance harness first because it proves runtime health and real messaging:

```powershell
cd D:\TST_Codex_W1-01
node scripts/w1-live-acceptance.mjs --run-id perf-baseline-<date>
```

After a passing live acceptance run, add focused load probes around:

| Path | Probe |
|---|---|
| Booking list/detail | repeat GETs against `/api/bookings` and `/api/bookings/{id}` while Compose is healthy |
| Booking create/validate/price/confirm | sequential quote-to-cash runs with unique idempotency keys |
| Kafka relays | outbox pending count drains to zero under repeated confirms/status captures |
| Replay/restart | `node scripts/replay-restart-proof.mjs --evidence artifacts/w1-01-live/replay-restart/evidence.json` |

## Targets

Initial local targets are intentionally modest because Compose runs on a developer workstation:

| Signal | Target |
|---|---|
| Functional success rate | 100 percent for the scripted quote-to-cash happy path |
| Relay drain | no permanently stuck outbox rows after bounded retries |
| Duplicate handling | duplicate command/event retries preserve one business effect |
| Resource behavior | no service crash or health-check flap during the scripted run |

## Evidence

Store any performance baseline evidence under `artifacts/w1-01-live/<run-id>/`. Do not overwrite the blocked evidence directories already produced by code generation.
