# Business Rules - U07 Live Release Acceptance

## Release Gate Rules

| ID | Rule | Blocking evidence |
|---|---|---|
| BR-U07-001 | One continuous real Compose user journey proves U01-U06. | Shared booking/container/correlation IDs across UI, topics, and DBs. |
| BR-U07-002 | PostgreSQL host port is 55432 by default and container port remains 5432. | Rendered Compose config and port probe. |
| BR-U07-003 | Kafka and Schema Registry are real; local noop cannot satisfy acceptance. | Adapter profile/readiness, topic/SR records, no-noop assertion. |
| BR-U07-004 | Both canonical nested topic records validate with exact field names and approved fingerprints. | Decoded records, schema IDs, hash/resource checks. |
| BR-U07-005 | Pricing p99 <=800 ms and round-trip p95 <=5 seconds under fixed workloads. | Raw samples and nearest-rank summaries. |
| BR-U07-006 | Changed backend/frontend code coverage is >=80 percent and all blocking quality checks pass. | Coverage and quality command outputs. |
| BR-U07-007 | `aidlc-audit` and `erp-fidelity-audit` detectors are green. | Raw outputs and zero exit codes. |

## Environment and Schema Rules

- Preflight fails on occupied required ports, insufficient disk/images, unhealthy Docker, missing seed, or non-local legacy schema history.
- The schema retirement exception applies only to the proven disposable local registry and only to the two unreleased W1 subjects.
- Legacy schemas/fingerprints are exported before retirement; canonical schemas register as version 1 and return to BACKWARD compatibility.
- A non-local registry with a legacy fingerprint blocks release and requires a new major event type/subject decision.
- Compose databases/volumes are preserved for migration/restart proof; destructive reset is forbidden.

## Journey Evidence Rules

- Browser actions use real UI/BFF/API and live Reference/Charge/Kafka/CMM seams; no fallback/demo response counts.
- Pricing response is itemized AGREEMENT/USD with no guessed/partial amounts.
- Confirm commits one Booking revision/outbox event and performs no CMM HTTP call.
- Exact topic keys are Booking ID and `bookingRef:containerRef`.
- CMM has one journey/highest revision; Booking has one latest projection and durable receipts.
- Returned status rendered in UI must correspond to the captured topic/database event ID and correlation.
- Negative/manual/pending/unavailable/retry states are observed, not inferred from source existence.

## Performance Rules

- Warm-up samples are excluded only by declared index; measured errors are never excluded.
- Pricing uses 1,000 measured samples at concurrency 10 after 100 warm-up.
- Round trip uses 100 measured unique journeys at concurrency 5 after 10 warm-up.
- Percentiles use nearest-rank on monotonic elapsed durations and record environment/commit/error count.
- Any measured error fails the workload regardless of percentile among successes.

## Browser and Quality Rules

- Keyboard-only workflow, focus, live announcements, WCAG 2.1 AA contrast, responsive text, and no-overlap are blocking.
- Desktop/mobile screenshots contain real primary data and are indexed to their assertions.
- Maven/frontend/domain-purity/contracts/seeds/readiness/coverage are blocking and must run from checked-in commands.
- Audit detector findings require code/evidence correction and rerun; outputs are never edited to green.

## Evidence Rules

- Each run has immutable unique directory, manifest, command/exit/time metadata, and SHA-256 hashes.
- Evidence excludes secrets, credentials, raw customer PII, and unredacted environment values.
- Failed/partial evidence is retained and marked; later success uses another run ID.
- Completion requires an index mapping every FR/NFR/DoD to directly observable evidence.

## Source Coverage

Rules refine U07 from `unit-of-work.md`, US-W1-007 in `unit-of-work-story-map.md`, release/performance/security/accessibility requirements in `requirements.md`, C12/all-component ownership in `components.md`, actual interfaces from `component-methods.md`, and Compose/observability/audit behavior from `services.md`.
