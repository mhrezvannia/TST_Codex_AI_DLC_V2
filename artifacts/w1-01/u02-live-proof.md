# W1-01 U02 Reference Validation Live Proof

## Runtime

- Date: 2026-07-16
- Worktree: `D:\TST_Codex_W1-01`
- Branch: `intent/W1-01-booking-quote-to-cash`
- Compose Postgres host port: `55432`
- Running services observed: Postgres, Kafka, Schema Registry, Reference Data service, Booking service, Booking app, Reference Data app.

## Final Smoke

The final smoke ran against the rebuilt `linercore/booking-service:local` container.

```json
{
  "correlationId": "u02-final-smoke-c3ca4d22-f417-4417-a6c8-b85a6f3122c5",
  "bookingId": "e3fd781f-47c1-4bc9-916a-50f6a09b920e",
  "createStatus": "DRAFT",
  "validatedStatus": "VALIDATED",
  "validationOutcome": "VALID",
  "fieldCount": 5,
  "nonActive": 0,
  "validationCorrelationId": "u02-final-smoke-c3ca4d22-f417-4417-a6c8-b85a6f3122c5-validate"
}
```

The smoke used:

- customer: `party-customer-local-carrier`
- route: `USNYC` to `NLRTM`
- voyage: `voyage-local-001`
- equipment type: `22G1`
- equipment id: `MSCU6639870`
- cargo mode: `FCL_DRY`

## Negative Regression Check

Direct Booking create without `X-LinerCore-Service-Id` returned HTTP 401 after the filter fix, not HTTP 500.

```json
{
  "statusCode": 401,
  "correlationId": "u02-missing-service-2560ab82-20eb-4a9a-a769-67ba6ee93b63"
}
```

## Earlier Session Evidence

- Seed apply: `artifacts/w1-01/u02-seed-apply.json`, 19 created, 0 failed.
- Active validation: Booking `2962506b-14a7-4fed-a154-7bd7057b29d3`, outcome `VALID`, 5 fields, 0 non-active.
- Replay: same Booking lifecycle count stayed unchanged.
- Unknown reference: Booking `8f84028e-f3be-4540-aa56-a34528fb32a7`, status `VALIDATION_BLOCKED`, field `customerId`, reason `REFERENCE_NOT_FOUND`.
- Inactive reference: Booking `485ff058-0040-4d91-9fb9-5bbc49cf394b`, blocked field `equipment[0].equipmentTypeCode`, reason `REFERENCE_INACTIVE`; fixture was reactivated afterward.
- Provider unavailable: Booking `539252e5-f182-484a-b39a-37b84c408f74`, validate returned HTTP 503 `REFERENCE_DATA_UNAVAILABLE`; persisted status stayed `DRAFT`.
- Restart persistence: active and blocked statuses/snapshots remained queryable after Booking service restart.
- Performance sample: 100 requests, concurrency 10, zero non-200 responses, p50 689 ms, p95 877 ms, p99 1074 ms, max 1086 ms.

## Verification Commands

- `mvn -o -q -pl reference-data-service/container,booking-service/container,container-movement-service/container -am test`: pass, 112 tests, 0 failures/errors/skips.
- `node --test scripts/seed-local.test.mjs`: pass, 7 tests.
- `yarn workspace @erp/app-reference-data typecheck`: pass.
- `yarn workspace @erp/app-reference-data build`: pass on host.
- `yarn workspace @erp/app-booking test`: pass, 10 tests.
- `yarn workspace @erp/app-booking typecheck`: pass.
- `yarn workspace @erp/app-booking lint`: pass.
- `yarn workspace @erp/app-booking build`: pass.
- `docker compose config --quiet`: pass.
- `git diff --check`: pass with line-ending warnings only.
- `C:\Program Files\Git\bin\bash.exe .claude/skills/aidlc-audit/detectors.sh`: exit 0.
- `C:\Program Files\Git\bin\bash.exe .claude/skills/erp-fidelity-audit/detectors.sh`: exit 0.

## Limits

- Docker rebuild for `apps-reference-data` failed inside Docker because `yarn install --immutable` hit repeated `ETIMEDOUT` package fetches. Host Reference app typecheck/build passed.
- In-app browser tooling was unavailable, so UI proof used automated app tests, production builds, and HTTP/SSR evidence.
