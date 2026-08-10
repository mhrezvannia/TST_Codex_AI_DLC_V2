# Reliability Requirements - U01 Rate Authority

## Reliability scope and objectives

This artifact quantifies U01 Rate durability, concurrency safety, migration
adoption, and dependency failure behavior from `business-logic-model.md` and
`business-rules.md`, under the program `requirements.md` and existing
`technology-stack.md`.

No production availability SLA is approved. The local acceptance objectives are:

- REL-U01-001: RPO 0 for every committed Rate, RateVersion, and rate-activity
  transaction across process restart and migration replay;
- REL-U01-002: measured from restart-command acceptance, Charge becomes ready
  and completes an authenticated Rate detail read within 120 seconds after a
  normal isolated-stack restart with healthy dependencies and unchanged data;
- REL-U01-003: U06 proves a pre-upgrade backup restore into a new isolated
  database and documents later-migration forward repair; destructive reset and
  editing applied migrations are not recovery;
- REL-U01-004: no failed/denied/timeout/conflict command leaves partial commercial
  or activity state.

The 120-second value is a local test bound, not a production RTO or SLO.

## Atomicity, idempotency, and concurrency

Create/edit/approve/successor persists its Rate/version/activity set in one
service-owned database transaction. Audit failure, constraint failure, process
failure before commit, or dependency failure rolls the set back. After commit,
restart returns the same canonical values, identities, row versions, and
activity hashes.

Approval obtains the transaction-scoped advisory key lock, reloads the Draft,
checks optimistic state and inclusive overlap, then commits. Repeated same-key
races produce at most one Approved authority; 20 independent keys complete
without deadlock. Successor allocation locks the stable Rate, uses monotonic
version numbering, and leaves exactly one Draft under contention.

HTTP mutation retries are safe only with the existing expected-version and
state constraints. U01 does not claim a new generic receipt for Rate admin.
A lost response is recovered by reading the stable Rate/detail and issuing only
a command valid for the observed state; a blind duplicate must not create a
second Approved version or Draft.

## Dependency and failure behavior

| Failure | Required behavior | Recovery evidence |
| --- | --- | --- |
| missing/invalid signed human session | 401 at BFF; no Rate disclosure/write or `RateActivity` | establish a valid session |
| authenticated exact Identity `DENY` | 403; no disclosure/write or `RateActivity` | correct permission |
| Identity transport/timeout/malformed response | typed 503; no disclosure/write or `RateActivity` | healthy dependency then explicit retry |
| missing required non-local Identity credential/secret or bypass profile | readiness false/configuration failure; no endpoint fallback | correct deployment configuration and restart |
| Reference timeout/429/5xx/malformed | 503 `REFERENCE_DATA_UNAVAILABLE`; no Rate/activity write | same safe form values, later explicit retry |
| Reference inactive/mismatch | terminal 422; no write | correct reference/input |
| stale row/version or competing authority | typed 409; winner remains valid | reload detail/history before new command |
| PostgreSQL unavailable/pool exhausted | safe error/readiness false; transaction absent or wholly committed | bounded restart/reconnect; canonical row hash check |
| process stop before commit | zero new business/activity rows | restart and retry from read state |
| process stop after commit before response | committed row/activity remain exactly once | restart, detail query, invariant/count proof |
| partial/drifted legacy catalog | startup aborts; never baseline/migrate silently | repair catalog from verified source/backup, then rerun |
| applied migration defect | no in-place edit/down migration | later forward-repair migration or restore backup into new isolated DB |

There is no availability fallback that serves a stale Draft as Approved, skips
reference/authorization, invents a rate, or writes to another database.

## Migration and backup integrity

Charge V1 is the exact legacy catalog and V2-V4 are ordered additive files.
Empty, exact-legacy, history-present, partial, and drifted catalog fixtures are
all blocking tests. Flyway checksum/version and canonical immutable-row hashes
are captured before/after restart. RPO 0 means exact equality of committed
`charge_rates`, `charge_rate_versions`, `charge_rate_activity`, and Flyway
history counts plus canonical selected-column hashes before/after restart and
migration replay. V3 deterministic legacy agreement backfill
and V4 dedupe structure are verified because U01 owns the physical chain, while
their behavior remains U03/U04 owned.

The U06 backup includes catalog, Flyway history, Rate/version/activity and
legacy rows. Restore targets a newly provisioned isolated database, validates
catalog shape, migration checksums, counts and canonical hashes, starts the
service, and completes authenticated reads of both old and new records.
Backup credentials and commercial payloads are redacted from evidence.
Forward repair is a later ordered migration with a failing-then-passing test;
an applied migration file is never edited.

## Observability and readiness

Readiness is false when migration validation, database connectivity, required
non-local secret, or fail-closed adapter configuration is invalid. Liveness
does not require downstream calls and is not used as proof that commands work.

Metrics cover Rate command/query latency, outcomes, approval conflict,
reference unavailable, lock wait/deadlock, connection pool, and mutation count.
Dimensions are limited to `operation`, `outcome`, and optional
`category`/derived lifecycle; IDs, correlation, customer, amount, subject, and
error text are prohibited labels. Histograms bracket 500 and 750 ms. Logs use
the exact safe field contract from SEC-U01-011. U06 proves one correlation ID
joins API response, authorization and reference decisions, mutation outcome,
the committed activity row, and latency evidence, with redaction green. It compares metric
deltas and correlated logs to API/DB results; a green health endpoint alone
cannot satisfy reliability.

## Testable quality scenarios

REL-U01-001-004 are validated with transaction-fault integration tests,
barrier-synchronized concurrency tests, Flyway live tests, two bounded service
restarts, old-fixture reads, and U06 restore evidence. Each failure produces an
asserted state/count/hash, not merely an exception expectation.

These requirements trace to FR-701-FR-704, NFR-002-NFR-005/NFR-009, QC-01-QC-02,
and U01 RATE-003-RATE-006/RATE-013-RATE-020.
