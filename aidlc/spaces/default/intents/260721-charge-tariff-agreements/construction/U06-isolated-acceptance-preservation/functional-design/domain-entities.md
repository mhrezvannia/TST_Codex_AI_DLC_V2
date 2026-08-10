# Domain Entities - U06 Acceptance Evidence

## Evidence boundary and fidelity

U06 defines evidence records, not commercial domain aggregates. Rate,
Agreement, PricingResult, BookingPricingSnapshot, and ManualPricingCase remain
owned by U01-U05. Evidence uses their canonical contract names without
renaming (`pricingRequestId`, `agreementVersionId`, `sourceRateVersionId`,
`requestedDepartureDate`, `correlationId`) and stores typed values rather than
a generic metadata map.

The evidence package is immutable after finalization. JSON objects use fixed
property ordering in the writer; timestamps are ISO-8601 UTC; durations are
integer monotonic nanoseconds plus derived decimal milliseconds; hashes are
lowercase SHA-256 hex; amounts are exact decimal JSON contract values and are
never binary-float-derived.

## `AcceptanceManifest`

`manifest.json` is the root record:

| Field | Type/invariant |
| --- | --- |
| `schemaVersion` | integer, initially 1 |
| `intent` | constant `W2-03-charge-tariffs-and-agreements` |
| `runId` | unique UTC-safe string |
| `startedAt`, `completedAt` | UTC timestamps; completion optional while running |
| `branch`, `commit`, `baseBranch`, `baselineCommit` | exact Git provenance; baseline is `c2f13dd`, base reconciliation is `c96b5b3` |
| `dirtySummary` | redacted path/status list, never silently omitted |
| `composeProject`, `edgeUrl` | constants `linercore-wave-a`, `http://127.0.0.1:18088` |
| `managerEdgeUrl` | constant `http://127.0.0.1:8088`, probe-only |
| `status` | `PLANNED/RUNNING/BLOCKED/FAILED/PASSED` derived from gates |
| `w1HistoricalStatus` | exact explicit blocked/waived wording and protected artifact reference |
| `w2DesignSystemStatus` | observed pending/blocked/pass plus DS-01/02/03 cells; never inferred |
| `guards` | exactly one pre and one post `GuardEvidence` |
| `gates` | ordered `GateResult` summaries |
| `preservationResults` | exactly one `PreservationRegressionEvidence` for every closed `PreservedIntentId` |
| `securityMatrix` | one complete `SecurityEvidenceMatrix`; every required cell terminal |
| `scenarios` | exactly one summary per required `ScenarioId` |
| `browserMatrices`, `performanceSets`, `observability`, `audits` | referenced typed summaries |
| `blockers` | IDs resolving to `blockers.jsonl`; empty only for PASSED |
| `artifacts` | relative path, SHA-256, byte count, media type, producing gate |

The validator rejects absolute paths, path traversal, duplicate IDs, missing
files, hash mismatch, secret patterns, a PASS with blockers, a missing closed-set
preservation/security/observability record, or a status not derivable from child
technical results. Human approval is intentionally not a manifest field or
status input; technical `PASSED` only permits the later AI-DLC human gate.

## Gate and safety records

### `GateResult`

Contains `gateId`, `phase`, `requirements[]`, redacted `command`, `startedAt`,
`completedAt`, `exitCode`, `status`, `summary`, `artifactPaths[]`, and optional
`blockerId`. A `PASS` requires `exitCode=0` and the gate-specific assertion
payload to validate. `SKIPPED` identifies the earlier blocker/failure.

### `GuardEvidence`

Contains `position=PRE|POST`, the literal package script, default manager
project/URL, exit code, output path, and `ManagerInventoryFingerprint`.
The fingerprint is an ordered list of project label, service, container ID,
image ID, start time, and published ports plus its own SHA-256. Post comparison
requires equality for mutation-sensitive fields and a passing guard.

### `ProtectedArtifactEvidence`

Contains prior intent ID, artifact path, prior status, bytes, and pre/post
hashes. The W1 waiver entry additionally stores the exact historical wording
and a separate optional later-proof path. The two records can never share a
path or status field.

### `PreservationRegressionEvidence`

`PreservedIntentId` is the closed set `W0-01`, `W0-02`, `W1-01`, `W2-01`,
and `W2-02`. Exactly one result per ID contains the executable regression
command, contract/assertion IDs, protected historical evidence path/hash/status,
observed result, output artifacts, and optional blocker. Unsupported or
unavailable execution is `BLOCKED`; it cannot be absent or compatibility-skipped.
For W1-01, the preservation result references but never replaces the separate
original blocked/waived `ProtectedArtifactEvidence`, and may separately link a
later verified proof.

### `Blocker`

Contains stable `blockerId`, detection time, dependency, command/scenario/matrix
cell, observed failure, impact, next action, owner, and whether it concerns a
historical waiver. Resolved blockers remain in the prior run; a new attempt
creates a new manifest instead of rewriting history.

## Migration evidence records

`MigrationProof` contains fixture ID, service/database owner, starting catalog
shape, starting Flyway version, migration list/checksums, backup artifact,
before/after catalog hashes, before/after row hashes, restart hashes, expected
backfill identities, actual identities, legacy read result, drift-test outcome,
restore rehearsal outcome, forward-repair guidance path, and status.

`ImmutableRowDigest` identifies owner, table, stable identity, version identity,
canonical selected-column payload hash, observation phase, and correlation if
applicable. It excludes DB-generated observation timestamps. The selected
columns are declared per table so omission cannot disguise mutation.

`RecoveryProof` identifies backup checksum, source isolated database, new target
isolated database, restore invocation evidence, schema/data validation, and
forward-repair migration/test references. It cannot point at manager resources
or treat volume deletion as repair.

## Scenario and cross-service proof records

`ScenarioId` is the closed set:

- `agreement-price`
- `tariff-fallback`
- `successor-reprice-history`
- `no-rate-manual-case`
- `ambiguity-manual-cases`
- `booking-outage-no-fallback`
- `restart-terminal-replay`
- `legacy-snapshot-read`

`ScenarioEvidence` contains scenario ID, seed namespace, actor/service subject,
requested departure, equipment quantity, expected outcome, observed outcome,
HTTP evidence IDs, owner-local DB evidence IDs, correlation proof ID, browser
evidence IDs, start/end, status, and blocker. Priced scenarios also contain an
`ExpectedPriceProof`; manual scenarios contain a `NoAmountAssertion`.

`ExpectedPriceProof` has exactly three ordered entries with `rateCategory`,
`chargeCode`, exact `unitRate`, positive integer `quantity`, expected `amount`,
observed `amount`, and `sourceRateVersionId`, followed by expected/observed USD
total, pricing basis/reference, optional agreement version, and comparison
status. Its expected values originate from the deterministic acceptance seed,
not the response being tested.

`HttpEvidence` stores method, edge URL path, request body hash, idempotency key
hash (not secret value), request/response media type, status, stable code,
response body hash, pricing request ID, correlation ID, safe response excerpt,
and timing. `DatabaseEvidence` stores database owner, redacted parameterized
query ID, selected canonical fields, row count, row hashes, and correlation. A
single record cannot name tables from both service databases.

`CorrelationProof` stores one correlation ID plus ordered hops: edge, Booking
BFF, Booking service, Charge service when invoked, Charge receipt/case, Booking
snapshot/evidence, and UI response. Each hop contains timestamp, safe operation,
outcome, and artifact reference. Amount/customer payloads are not log fields.

## Browser evidence records

`BrowserMatrix` identifies page family, route, actor/capability, state, theme,
viewport width/height, scenario ID, assertions, screenshot, trace, axe report,
console/network summary, and status. The validator materializes required cells
from the fixed page/state specification and rejects missing or duplicate cells.

`InteractionAssertion` is typed as `SEMANTIC`, `KEYBOARD`, `FOCUS`, `LIVE_REGION`,
`RESPONSIVE`, `NETWORK_BOUNDARY`, or `VALUE_FIDELITY`; it stores expected,
observed, selector/accessibility target, and status. DS-01/02/03 evidence adds
`dependencyId` and observed integration status. A blocked dependency remains a
blocked cell.

No screenshot alone proves behavior. Each screenshot is paired with executable
assertions and a trace for its scenario. The browser ledger records that all
business requests went through the 18088 edge and that actor fields were not
accepted from browser input.

### `SecurityEvidenceMatrix`

The closed `SecurityScenarioId` set is `HUMAN_ALLOWED`,
`HUMAN_DENIED_NO_DISCLOSURE`, `BROWSER_ACTOR_SPOOF_REJECTED`,
`SERVICE_IDENTITY_MISSING`, `SERVICE_PERMISSION_MISSING`, `SECRET_MISSING`, and
`NON_LOCAL_BYPASS_REJECTED`. Each cell stores actor/service configuration,
safe request hash, expected/observed status and code, mutation/record-disclosure
counts, audit reference, and status. Every cell must pass; absence blocks the
manifest.

## Performance and audit records

`PerformanceSampleSet` contains scenario (`KNOWN_RATE` or `NO_RATE`), host
specification, commit, compose project, URL, warm-up count, measured count,
concurrency, algorithm=`NEAREST_RANK`, error count, raw sample paths, and
min/median/p95/p99/max milliseconds. `PerformanceSample` contains zero-based
sequence, hashed unique request identity, pricing request ID, distinct receipt
evidence ID, optional no-rate case evidence ID, `replayed=false`, monotonic
start/end nanoseconds, elapsed milliseconds, HTTP status, outcome code,
correlation ID, and success flag. Warm-up and measurement namespaces differ.
At least 100 measured samples, key/request/receipt uniqueness, expected case
cardinality, no replay, and zero unexpected outcomes are required; raw rows are
never discarded. Idempotent replay latency is proved in a separate non-SLO set.

`ObservabilityEvidence` contains scenario/correlation references, safe log hop
records, and metric snapshots/deltas for pricing latency count/histogram,
terminal outcome, agreement/tariff basis, manual fallback, and
idempotency replay/conflict. It also contains bounded-label assertions and a
redaction scan for secrets, customer payloads, and commercial amounts. Missing
metrics, a non-incrementing expected counter, broken correlation, or a redaction
hit blocks technical acceptance.

`AuditEvidence` contains audit ID, detector command/result/output, manual check
IDs, reviewed leads, severity-ranked findings, file/line references, live seam
references, disposition, reviewer, completion time, and status. A detector
result without all manual checks is `INCOMPLETE`, not `PASS`.

## Relationships and lifecycle

One manifest owns exactly five preservation results and one complete security
matrix, plus many gates, scenarios, browser cells, sample sets, observability
records, audits, and artifacts. Each required scenario resolves to one primary correlation proof
and may reference many HTTP/DB/browser records. Artifacts are written while the
run is RUNNING; finalization freezes and hashes them. Corrections create a new
run linked by `supersedesRunId`; finalized evidence is never edited in place.

## Contract-fidelity trace

| Evidence concept | Canonical source |
| --- | --- |
| pricing/result names and decimal values | `contracts/openapi/pricing.v1.yaml`, FR-401-FR-407 |
| Booking snapshot/history names | U05 functional design, FR-501-FR-507 |
| rate/agreement version identities | U01/U03 functional design, FR-101-FR-205 |
| manager/Wave A provenance | FR-702-FR-703, `scripts/wave-a-compose.mjs`, `scripts/demo-guard.mjs` |
| preservation/security/observability | FR-702, NFR-004/NFR-005/NFR-009, QC-01-QC-03 |
| browser/accessibility matrix | FR-705, refined mockups/interaction/accessibility artifacts |
| performance/audit evidence | FR-706, NFR-001/NFR-008/NFR-009, QC-03 |
