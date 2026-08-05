# Performance Test Instructions - W2-01 App Shell and Auth

## Upstream Inputs

This file consumes U01-U06 code summaries and NFR performance requirements for shell route latency, BFF forwarding, identity authorization, and evidence generation.

## Local Performance Checks

Run after Compose is live:
```powershell
Measure-Command { Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8088/health }
Measure-Command { Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8088/bookings -MaximumRedirection 0 }
```

Run script overhead check:
```powershell
Measure-Command { node scripts/w2-01-live-acceptance.mjs --dry-run --output-root artifacts/w2-01-live/app-shell-auth }
```

## Targets

Code-generation performance expectations are smoke-level:
- Shell production build succeeds without abnormal route explosion.
- Compatibility redirects occur before Booking BFF/backend calls.
- U06 dry-run package generation completes locally within a few seconds.
- Live route latency is recorded as evidence but does not replace functional acceptance.

## Reporting

Record command durations, route tested, status code, and blocker id if the live runtime is unavailable. Do not record cookies or raw auth tokens.
