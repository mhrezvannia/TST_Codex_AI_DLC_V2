# Runbooks

## Inputs

These runbooks consume `dashboards`, `alarms`, `reliability-design`, `security-design`, and `deployment-architecture`.

## Runtime Blocked

Trigger: `readiness:local` status `blocked`.

Steps:

1. Open `artifacts/readiness/local-readiness.json`.
2. Identify blocked prerequisites.
3. Install/start missing runtime:
   - Java 21
   - Maven 3.9+
   - Docker Desktop Linux engine
   - Compose services
4. Re-run `node scripts/local-readiness.mjs --evidence artifacts/readiness/local-readiness.json`.
5. Escalate if required services still fail to listen.

## BFF Upstream Unavailable

Trigger: Reference Data BFF returns sustained `503`.

Steps:

1. Check Identity service on `8082`.
2. Check Reference Data service on `8083`.
3. Inspect BFF correlation id.
4. Re-run `node scripts/verify-contract-providers.mjs --live --evidence-file artifacts/contracts-live-verification.json`.
5. If service is down, restart Compose apps profile after Docker is healthy.

## Auth Bypass Non-Local

Trigger: bypass enabled outside local/test profile.

Steps:

1. Stop deployment.
2. Remove `AUTH_BYPASS=true` and `REFERENCE_DATA_AUTH_BYPASS=true`.
3. Verify `APP_ENV` and `NODE_ENV`.
4. Run auth tests:

```powershell
node_modules\.bin\vitest.cmd run packages/auth/src/index.test.ts apps/auth/lib/auth-server.test.ts --config vitest.config.ts
```

## Seed Apply Failure

Trigger: `artifacts/seed-apply-attempt.json` status `failed` after services are healthy.

Steps:

1. Check failed record keys.
2. Verify identity role assignment API.
3. Verify reference-data create/update API.
4. Re-run seed apply after service health is green.

## Outbox Freshness Breach

Trigger: `reference_event_freshness_seconds` exceeds threshold.

Steps:

1. Check Kafka and Schema Registry.
2. Check reference-data outbox status endpoint.
3. Inspect failed/retryable event rows.
4. Re-run live contracts after recovery.
