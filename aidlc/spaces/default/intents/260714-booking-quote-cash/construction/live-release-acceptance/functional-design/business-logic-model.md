# Business Logic Model - U07 Live Release Acceptance

## Scope and Inputs

U07 implements the release boundary in `unit-of-work.md` and US-W1-007 from `unit-of-work-story-map.md`. It proves FR-W1-013/FR-W1-014 and all blocking NFRs in `requirements.md` using C12 plus every delivered component in `components.md`. It executes the real interfaces defined in `component-methods.md` over the Compose, Kafka, Schema Registry, PostgreSQL, UI, retry/DLT, and observability topology in `services.md`.

## One-Run Orchestration

One checked-in command/runbook creates a unique run ID and evidence directory under `artifacts/w1-01-live/<run-id>/`. It fails on the first blocking precondition but still writes command/result metadata for diagnosis.

### 1. Preflight

Capture branch, commit, dirty-state summary, tool versions, OS, timestamp/time zone, Docker engine/storage/disk, image availability, configured environment, and selected ports. Assert:

- PostgreSQL host mapping is `${POSTGRES_HOST_PORT:-55432}:5432`, never occupied/default host 5432;
- nginx uses host 8088 and required service ports are available;
- Kafka, Schema Registry, PostgreSQL, services, UI, and nginx images can start;
- no local-noop publisher/registrar profile can satisfy the run;
- canonical contracts/examples/catalog parse and root/service resource hashes agree;
- required reference and agreement seed fixtures are present.

Transient Maven TLS `bad_record_mac` is retried online without changing dependencies or mirrors.

### 2. Governed local schema cutover

Before W1 producers start, inspect the disposable local registry:

1. Export legacy Booking/CMM subject versions, schemas, compatibility, and SHA-256 fingerprints under `schema-registry/before/`.
2. Assert the registry is the approved local disposable environment and no external/released consumers are configured. Any non-local endpoint or unknown fingerprint blocks the run.
3. Permanently retire only the two unreleased local W1 event subjects.
4. Register canonical nested schemas as version 1, set BACKWARD compatibility, and export versions/fingerprints under `schema-registry/after/`.
5. Fail producer readiness if either canonical fingerprint/version/compatibility differs.

### 3. Start and readiness

Start the real Compose stack with PostgreSQL host port 55432. Wait on bounded health/readiness probes for infrastructure, Reference Data, Charge, Booking, CMM, and nginx/UI. Capture Compose config, container/image IDs, health transitions, and redacted logs. Assert Kafka listeners, relays, publisher/registrar adapters, Flyway history, and no-noop guards are active.

### 4. Seed and continuous user journey

Apply idempotent canonical Reference Data and one approved active USD agreement. Through the running Booking UI at nginx:

1. Open `/bookings/new`, select live customer/locations/voyage/equipment type, enter one valid ISO 6346 equipment ID, quantity one, commodity, and W1 defaults.
2. Create the real draft and retain its stable `/bookings/{bookingId}` route.
3. Validate against live Reference Data and observe persisted `VALIDATED`.
4. Price through real `POST /pricing-requests`; observe itemized AGREEMENT/USD snapshot and Charge idempotency state.
5. Confirm through Booking; observe immediate `CONFIRMED` plus pending journey and no Booking-to-CMM HTTP request.
6. Observe canonical `booking.confirmed` on Kafka, one CMM journey/status outbox, canonical `containermovement.status`, one Booking receipt/projection, and the rendered planned movement status.

Capture browser network evidence, IDs/correlation, screenshots, decoded schema-valid topic records, Schema Registry IDs, database rows/counts, and relevant outbox transitions.

### 5. Negative and resilience observations

Drive active/inactive/unknown reference validation, Charge `NO_RATE`, simulated timeout/503/circuit behavior, duplicate pricing/confirm/events, stale revisions, out-of-order statuses, transaction rollback integration cases, DLT correction/replay, and sequential Booking/CMM restarts. Reassert U06 protected business counts and stable detail after every fault.

### 6. Fixed performance workloads

Pricing: 100 warm-up plus 1,000 measured valid-agreement requests at concurrency 10. Round trip: 10 warm-up plus 100 measured unique booking/container journeys at concurrency 5. Use monotonic client timing and nearest-rank percentile; preserve every sample and error.

- Pricing gate: p99 <=800 ms.
- Successful confirm response to visible returned status: p95 <=5 seconds.
- Any failed measured sample fails the gate and remains in raw CSV/JSON.

### 7. Browser and accessibility proof

Playwright exercises keyboard-only list/create/detail/validate/price/confirm/pending/success/manual/unavailable/retry paths. Automated checks cover accessible names, focus, live regions, WCAG 2.1 AA contrast, and overlap/bounding boxes. Capture indexed desktop and mobile screenshots with real data and no clipped/overlapping text.

### 8. Blocking quality and audits

Run the root quality aggregator, all Maven tests, Booking frontend test/typecheck/coverage, Booking/CMM domain-purity checks, contract/schema/serde/Pact/seed/readiness tests, and changed-code line coverage >=80 percent. Then run:

- `bash .claude/skills/aidlc-audit/detectors.sh`
- `bash .claude/skills/erp-fidelity-audit/detectors.sh`

Both detector outputs and exit codes are evidence. Findings are fixed and rerun; they are not waived by a green test suite.

### 9. Evidence index and verdict

Generate `index.md` and `manifest.json` mapping every FR/NFR/DoD gate to command, timestamp, artifact path, SHA-256, and verdict. The release verdict is green only when every required item exists, every command exited zero, thresholds pass, DLT/noop checks pass, and topic/database/browser evidence shares the same business/correlation identities.

## Failure Semantics

A failed/partial run remains indexed with `FAILED` status and reason. Rerun uses a new run ID; it never overwrites contradictory evidence. W1-01 is not complete and must not merge on unit tests alone, API-only proof, fixture-only Kafka records, noop messaging, destructive database reset, omitted errors, or manually edited detector output.

## Source Coverage

The workflow implements U07 in `unit-of-work.md`, maps US-W1-007 from `unit-of-work-story-map.md`, proves every blocking requirement in `requirements.md`, exercises all `components.md`, invokes real `component-methods.md` interfaces, and validates the complete runtime/quality topology in `services.md`.

## Review

**Verdict: NOT-READY (independent rereview unavailable).** Iteration 1 found eight issues, all corrected and documented in `construction/functional-design/reviewer-feedback.md`; all 28 Functional Design artifacts then passed required-sections and upstream-coverage sensors again. Iteration 2 was invoked but returned no verdict because the account-wide subagent usage limit was reached. This section records the conductor's review-state outcome, not an independent READY claim.
