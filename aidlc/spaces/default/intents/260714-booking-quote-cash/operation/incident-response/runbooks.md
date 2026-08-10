# Runbooks - W1-01

## Runbook Library

These runbooks are local Compose and evidence runbooks for W1. They intentionally do not claim AWS SSM Automation because `deployment-architecture.md` defines a local acceptance environment, not a production AWS deployment.

| Runbook | Trigger | Owner | Exit condition |
|---|---|---|---|
| RB-01 Docker image pull blocked | Compose start fails pulling `docker.elastic.co` or other required image | Release runner | Required images pull or are cached; new live acceptance run reaches next gate. |
| RB-02 nginx Booking path unavailable | `http://localhost:8088/bookings` probe fails | Booking app owner and release runner | nginx path returns HTTP 200 and live harness `booking-ui-health` passes. |
| RB-03 Booking outbox stuck | `booking_outbox_pending_total > 0` or stale `IN_PROGRESS` | Booking service owner | Pending/stale rows clear without manual domain mutation; Kafka publish evidence is valid. |
| RB-04 CMM returned-status relay stuck | `containermovement_outbox_pending_total > 0` or Booking projection stale | CMM and Booking owners | CMM event reaches Kafka and Booking projection with matching correlation ID. |
| RB-05 Charge pricing failures | Charge pricing 5xx or p99 threshold breach | Charge service owner | Pricing requests pass within threshold and no failed evidence remains unresolved. |
| RB-06 Evidence integrity failure | Manifest, attestation, or detector gate fails | Release runner | New run ID produces PASS manifest with valid detached signature. |

## RB-01 Docker Image Pull Blocked

1. Open `artifacts/w1-01-live/<run-id>/compose/compose-start.txt` and confirm the image, host, and failure message.
2. Verify Docker Desktop disk and network/proxy configuration.
3. Pre-pull the failing image, for example `docker pull docker.elastic.co/kibana/kibana:8.16.1`.
4. Do not mark the previous run as passed.
5. Rerun with a new run ID: `node scripts/w1-live-acceptance.mjs --run-id <new-id>`.
6. Confirm the manifest records PASS before any release claim.

## RB-02 nginx Booking Path Unavailable

1. Run the required user-path probe: `node scripts/w1-live-acceptance.mjs --probe http://localhost:8088/bookings`.
2. Check nginx, `apps-booking`, and `booking-service` logs.
3. Use direct app/service probes only as diagnostics, not as release smoke.
4. Fix route, app health, or service health, then rerun the full live acceptance with a new run ID.

## RB-03 Booking Outbox Stuck

1. Check Booking service health and scheduler logs.
2. Inspect outbox rows with read-only SQL for stale `PENDING`, `IN_PROGRESS`, retry count, and lease expiry.
3. Check Kafka, Schema Registry, producer, and schema compatibility errors.
4. Preserve domain data and avoid manual status mutation.
5. Rerun live proof after the relay clears naturally or through supported retry/replay controls.

## RB-04 CMM Returned-Status Relay Stuck

1. Check CMM listener assignment for `booking.confirmed`.
2. Inspect CMM outbox and returned-status publish logs.
3. Verify Booking projection consumer reads the status event and uses the same correlation/business identity.
4. Confirm no happy-path DLT record exists.
5. Rerun the journey and verify visible Booking status through nginx.

## RB-05 Charge Pricing Failures

1. Check Charge health and pricing API logs.
2. Confirm Reference Data dependency health and seed availability.
3. Validate request payload contract and idempotency behavior.
4. Re-run performance collector and live acceptance after fix.

## RB-06 Evidence Integrity Failure

1. Verify `W1_EVIDENCE_SIGNING_KEY_PATH` exists outside the workspace.
2. Verify detached attestation under `artifacts/w1-01-live-attestations/<run-id>.json`.
3. Do not edit manifest or detector output.
4. Rerun the acceptance harness with a new run ID and require a valid signature, commit, and tag before release.

## Source Coverage

Runbooks map alerts from `alarms.md` to actions, use navigation from `dashboards.md`, preserve fail-fast behavior from `reliability-design.md`, enforce redaction/signature controls from `security-design.md`, and follow the local stack defined in `deployment-architecture.md`.
