# Smoke Test Results - Charge Agreement Walking Skeleton

## Source Alignment

This artifact consumes `cd-config`, `deployment-strategy`, `environment-inventory`, and `build-test-results`.

## Smoke Summary

| Smoke Check | Status | Reason |
| --- | --- | --- |
| Backend module-info HTTP check | Not run | Backend local server intentionally stopped |
| Frontend health route HTTP check | Not run | Frontend local server intentionally stopped |
| Reverse proxy route check | Not run | Reverse proxy intentionally stopped |
| Build/test smoke proxy | Passed | `build-test-results` has passing package-level checks |

## Expected Live Smoke Commands

When the user asks to run the project locally again, execute:

```powershell
Invoke-RestMethod http://127.0.0.1:8084/api/charge-agreements/module-info
Invoke-RestMethod http://127.0.0.1:3002/api/health
Invoke-WebRequest http://127.0.0.1:3001/charge-agreements/
```

## Acceptance Position

This stage does not claim live smoke success. It preserves an honest distinction between build/test readiness and running local deployment verification.

