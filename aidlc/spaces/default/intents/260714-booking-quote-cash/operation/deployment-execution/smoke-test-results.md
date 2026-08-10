# Smoke Test Results - W1-01

## Upstream Inputs

Smoke tests are evaluated against `cd-config`, `deployment-strategy`, `environment-inventory`, and `build-test-results`. The required user-path smoke is the nginx entry point for Booking, not a direct internal-service check.

## Smoke Commands

| Command | Result | Meaning |
|---|---|---|
| `node scripts/w1-live-acceptance.mjs --probe http://localhost:8088/bookings` | FAIL | Required nginx user path was not reachable |
| `Invoke-WebRequest http://127.0.0.1:3001/bookings` | PASS | Direct Booking app diagnostic returned HTTP 200 |
| `Invoke-WebRequest http://127.0.0.1:8085/actuator/health` | PASS | Direct Booking service diagnostic returned HTTP 200 |

## Interpretation

The direct Booking app and service diagnostics show that parts of a previous local app stack are running. They do not satisfy W1 release smoke because the required live proof uses nginx on `8088` and the full acceptance harness.

## Result

Smoke status: BLOCKED.

Reason: the fresh deployment attempt did not complete `compose-start`, and the required nginx Booking path was not reachable.

## Next Smoke Attempt

After Docker image/proxy access is fixed:

```powershell
node scripts/w1-live-acceptance.mjs --run-id <new-id>
```

The smoke gate passes only when the manifest records `PASS` and the `booking-ui-health` gate passes through nginx.
