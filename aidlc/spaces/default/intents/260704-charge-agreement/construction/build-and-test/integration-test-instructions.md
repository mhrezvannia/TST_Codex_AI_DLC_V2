# Integration Test Instructions - B01 Charge Agreement Walking Skeleton

## Source Alignment

This file consumes `code-generation-plan.md` and `code-summary.md` for U01.

## Scope

B01 integration proof is limited to service/app build integration and route wiring. Full backend-to-UI live integration is better suited to U05-U08 once CRUD and readiness scripts exist.

## Manual Host-Runtime Check

After starting the backend on `8084`, UI on `3002`, and proxy on `8088`, check:

```powershell
Invoke-WebRequest http://127.0.0.1:8084/actuator/health
Invoke-WebRequest http://127.0.0.1:8084/api/charge-agreements/module-info
Invoke-WebRequest http://127.0.0.1:3002/
Invoke-WebRequest http://127.0.0.1:8088/charge-agreements/
```

## Expected Result

All endpoints should return HTTP 200 when the local processes are running. Docker/Compose parity is not claimed.
