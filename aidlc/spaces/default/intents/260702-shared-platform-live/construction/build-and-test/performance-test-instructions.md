# Performance Test Instructions

## Inputs

Performance coverage is derived from NFR design artifacts and the generated `code-summary.md` files for Reference Data BFF, seed apply, contracts, and readiness.

## Local Baseline

Run after services are available:

```powershell
node scripts/local-readiness.mjs --evidence artifacts/readiness/local-readiness.json
```

Target local baseline:

- BFF permission and record list requests complete under 500 ms in local Compose.
- Seed dry-run completes under 5 seconds.
- Offline contract verification completes under 5 seconds.

## Deferred Load Testing

Load testing is deferred until the Java services and Compose profile are running. Use the readiness evidence as the prerequisite gate before running repeated mutation/list scenarios.
