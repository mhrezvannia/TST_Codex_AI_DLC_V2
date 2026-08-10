# Code Summary - U02 Reference Validation

## Files Created Or Modified

- Booking domain/application/data/API: added typed reference-validation outcomes, field results, snapshots, `VALIDATION_BLOCKED`, stale-booking detection, idempotent apply, row-lock capture/apply flow, snapshot codec support, repository locking, local service identity, and validate/error response mapping.
- Booking Reference Data adapter: replaced boolean validation with typed all-field evaluation over Reference Data, bounded into three task groups, with code-or-ID lookup, voyage-route coherence, response-size limits, timeout/overload/provider failure categories, service identity headers, and managed shutdown.
- Reference Data and CMM compatibility: added strict local identity for Reference Data, read-only Booking/CMM service identities, Reference Data deactivate/reactivate API coverage, seed-loader identity targeting, and CMM Reference Data token headers.
- Booking app/BFF: added validation command route, bounded reference option BFF, create-form provider options, validation panel states, field-addressable blocked results, retryable unavailable state, and Price gating until validated.
- Tests/config/runtime: added Java domain/application/container/dataaccess tests, frontend component/helper tests, local env/Compose wiring, and live Compose evidence on PostgreSQL host port `55432`.

## Key Implementation Decisions

- No U02 migration was added for validation snapshots. The existing Booking snapshot codec upcasts legacy U01 shapes and writes the canonical snapshot with the new `referenceValidation` section.
- Booking captures reference-validation intent under a lock, releases the transaction for HTTP provider calls, then reapplies under a separate transactional service to avoid holding database locks across network I/O.
- The Reference Data adapter uses three bounded task groups: customer, route/voyage, and equipment. This preserves concurrency while keeping executor pressure predictable.
- Local service identity is strict for service-to-service calls. Direct calls without service headers return 401; the Compose BFF path sends `booking-bff` with `BOOKING_SERVICE_TOKEN`.
- Reference app and seed-loader helpers now attach Reference Data local tokens only for `/reference-sets` requests, not for Identity calls.

## Test Coverage Summary

- `mvn -o -q -pl reference-data-service/container,booking-service/container,container-movement-service/container -am test`: 112 tests across 26 suites, 0 failures, 0 errors, 0 skipped.
- `node --test scripts/seed-local.test.mjs`: 7 tests passed.
- `yarn workspace @erp/app-reference-data typecheck`: passed.
- `yarn workspace @erp/app-reference-data build`: passed on host. Docker image rebuild for this app is blocked by registry timeouts inside Docker (`yarn install --immutable` ETIMEDOUT); the running app image remains the prior local image.
- `yarn workspace @erp/app-booking test`: 10 tests passed.
- `yarn workspace @erp/app-booking typecheck`: passed.
- `yarn workspace @erp/app-booking lint`: passed with existing Next.js lint deprecation/plugin warnings only.
- `yarn workspace @erp/app-booking build`: passed, including `/api/bookings/[bookingId]/validate` and `/api/reference-options`.
- `docker compose config --quiet`: passed.
- `git diff --check`: passed with line-ending warnings only.
- `.claude/skills/aidlc-audit/detectors.sh`: exit 0 under Git Bash.
- `.claude/skills/erp-fidelity-audit/detectors.sh`: exit 0 under Git Bash.

## Live Evidence

- Compose stack is running with Postgres on host port `55432`, Kafka `9092`, Schema Registry `8081`, Reference Data `8083`, Booking service `8085`, Booking app `3001`, and Reference app `3002`.
- Seed apply evidence: `artifacts/w1-01/u02-seed-apply.json`.
- Final valid Booking smoke after rebuilding `linercore/booking-service:local`:
  - correlationId: `u02-final-smoke-c3ca4d22-f417-4417-a6c8-b85a6f3122c5`
  - bookingId: `e3fd781f-47c1-4bc9-916a-50f6a09b920e`
  - createStatus: `DRAFT`
  - validatedStatus: `VALIDATED`
  - validationOutcome: `VALID`
  - fieldCount: `5`
  - nonActive: `0`
  - validationCorrelationId: `u02-final-smoke-c3ca4d22-f417-4417-a6c8-b85a6f3122c5-validate`
- Regression check for missing local service identity returned HTTP 401 instead of the earlier HTTP 500.
- Earlier live U02 evidence in this session also covered unknown, inactive, provider-unavailable, replay/idempotency, restart persistence, SSR detail rendering, and representative concurrency performance. See `artifacts/w1-01/u02-live-proof.md`.

## Deviations From Plan

- Reference app Docker rebuild could not complete because Docker-internal Yarn package fetches timed out. Host `typecheck` and `build` passed, while the live backend proof used the rebuilt Booking service container.
- In-app browser tooling was unavailable in this environment, so UI verification used HTTP/SSR checks and the app test/build pipeline.

## Review

Verdict: READY

Reviewer note: The named `aidlc-architecture-reviewer-agent` could not run in this Codex/ChatGPT account because its configured `openai.gpt-5.4` model is unsupported. The review was completed inline against the U02 artifacts, live evidence, and changed code paths.

Findings:

- Transaction boundary is architecturally acceptable: Booking captures validation state under lock, performs Reference Data HTTP outside the Booking transaction, and reapplies under a separate transactional service. This addresses the main deadlock/long-lock risk in U02.
- Provider semantics are coherent: typed unavailable categories, all-field deterministic results, route/voyage coherence, bounded task grouping, response-size caps, and 503/Retry-After mapping are implemented and covered by tests/live proof.
- Service identity posture is acceptable after the final fix: missing Booking service identity now returns 401 rather than HTTP 500, and Reference Data local tokens are targeted only to `/reference-sets` calls instead of shared Identity helper calls.
- Contract drift risk is contained for U02: field names exposed through Booking validation results match the intended UI correction paths and live proof validates five expected reference fields.
- Non-blocking caveat: Docker image rebuild for `apps-reference-data` is still dependent on external Yarn registry access from inside Docker. Host app build/typecheck passed, but Build/Test should decide whether to add a Docker package cache/mirror before claiming fully repeatable app-image builds.
- Non-blocking caveat: UI live proof used HTTP/SSR and automated app checks because the in-app browser connector was unavailable.
