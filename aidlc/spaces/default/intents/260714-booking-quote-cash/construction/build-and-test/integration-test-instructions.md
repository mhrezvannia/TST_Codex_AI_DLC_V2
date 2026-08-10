# Integration Test Instructions - W1-01

## Upstream Inputs

Integration coverage consumes the cross-unit behaviors described in `construction/*/code-generation/code-summary.md`: Booking to Reference Data validation, Booking to Charge pricing, Booking confirmed event to CMM, CMM status event back to Booking projection, and acceptance/replay scripts.

## Commands

Run backend integration-capable tests through the Maven service suite:

```powershell
cd D:\TST_Codex_W1-01\services
mvn -o -q test
```

Run script integration checks:

```powershell
cd D:\TST_Codex_W1-01
node --test scripts/w1-live-acceptance.test.mjs scripts/replay-restart-proof.test.mjs scripts/local-readiness.test.mjs scripts/run-quality-gates.test.mjs scripts/seed-local.test.mjs
docker compose config --quiet
```

Run the live acceptance command only when Docker can pull or already has all required images:

```powershell
cd D:\TST_Codex_W1-01
node scripts/w1-live-acceptance.mjs --run-id <new-id>
```

## Cross-Service Boundaries

| Boundary | Expected verification |
|---|---|
| Booking to Reference Data | canonical reference identifiers and validation failures map safely to UI |
| Booking to Charge | pricing request media type, idempotency key, correlation, service identity, manual pricing mapping |
| Booking event to CMM | `booking.confirmed` Avro schema, Kafka key, listener mapping, idempotent journey creation |
| CMM event to Booking | `containermovement.status` Avro schema, Booking consumer, projection ordering and dedupe |
| Runtime acceptance | preflight, Compose startup, contract checks, seed dry/live, UI health, replay/restart, audits |

## Expected Outcomes

Integration tests are acceptable when local deterministic gates pass and the live acceptance harness either passes on a working Docker host or records an indexed `BLOCKED` manifest with the exact external prerequisite that prevented execution.

The current known blocker is Docker Desktop image/proxy access to Elastic observability images during full-profile startup. That is an environment/runtime blocker, not a reason to relabel live acceptance as passed.
