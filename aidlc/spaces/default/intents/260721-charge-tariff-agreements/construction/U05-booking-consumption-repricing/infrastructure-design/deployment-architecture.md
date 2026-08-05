# Deployment Architecture — U05 Booking Consumption and Repricing

## Inputs and decision

This design consumes `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`.

U05 changes only the existing `booking-service`, Booking PostgreSQL database,
and `apps-booking` pricing region. The existing Booking nginx route is consumed
unchanged; U05 edits no nginx or shared-shell file. Charge remains the remote
commercial authority. No service, queue, cache, replica, broker topic, host
port, AWS resource, or second Compose topology is added.

## Compute and network

`booking-service` retains 1 CPU, 512 MiB, and JVM max RAM 55%. Compose DNS uses
`http://charge-agreement-service:8084`; the browser reaches only the signed-
session Booking BFF. The two-second provider call runs between short public
capture and completion transactions and holds no database connection.

The pricing-specific Spring `RestTemplate` uses Apache HttpComponents 5 with a
pooling manager: max total 10, max per Charge route 10, connection-request
timeout 100 ms, connect timeout 500 ms, and response/overall deadline 2 seconds.
A fair semaphore of 10 with 100 ms acquisition rejects excess work before a
socket/request thread is retained. Calls run synchronously on the bounded
Tomcat request pool (32 threads, accept queue 32, max connections 64), with no
retry executor or task queue. Cancellation closes the response and releases
permit/socket before at most one identical retry; bodies are capped at 64 KiB.

## Storage and transactions

Booking's ordered additive migration widens `booking_idempotency` for
`P|<bookingRef>:<sequence>`, adds PRICE receipt state/owner/fence/lease/due
fields, and creates immutable typed snapshots with descending cursor index
`(booking_id, amendment_seq DESC, created_at DESC, pricing_request_id DESC)`.

Capture locks/claims briefly; the remote call is transaction-free; completion
locks Booking then receipt in stable order and CAS-matches owner/fence,
revision, pricing sequence, and fingerprint. Snapshot/evidence, current
pointer, aggregate, audit, and receipt commit atomically.

### Exact Booking V3 ownership

Booking data access owns
`services/booking-service/dataaccess/src/main/resources/db/migration/V3__booking_pricing_snapshots.sql`.
It preserves V1/V2 columns and widens the primary key from VARCHAR(128) to
VARCHAR(192). It adds nullable `provider_key VARCHAR(160)`,
`response_http_status INTEGER`, `response_code VARCHAR(64)`,
`response_snapshot TEXT`, `retry_after_seconds INTEGER`,
`correlation_id VARCHAR(128)`, `lease_owner VARCHAR(128)`,
`lease_expires_at TIMESTAMP`, and `next_attempt_at TIMESTAMP`, plus
`fence_token BIGINT NOT NULL DEFAULT 0` and
`attempt_count INTEGER NOT NULL DEFAULT 0`.

Named checks enforce HTTP 100–599; retry seconds 1–30; nonnegative fence/
attempt; and, for `operation='PRICE'`, a 64-lowercase-hex request hash,
state in IN_PROGRESS/COMPLETED/RETRYABLE, and provider key/correlation present.
IN_PROGRESS requires owner+lease and forbids response/due fields. COMPLETED
requires response HTTP/status/snapshot and forbids owner/lease/due. RETRYABLE
requires immutable response HTTP/status/snapshot plus `next_attempt_at`, clears
owner/lease, and may carry normalized retry seconds. This permits exact
timeout/503/circuit/denied/malformed/in-progress outcome replay until due.
Existing CREATE rows remain unchanged with new nullable columns NULL and
numeric defaults zero.

`booking_pricing_snapshots` uses the exact columns/types/checks/FK/primary key
declared in U05 `domain-entities.md`; no legacy snapshot is backfilled. V3
creates only the final cursor index
`idx_booking_pricing_snapshots_cursor(booking_id, amendment_seq DESC,
created_at DESC, pricing_request_id DESC)`—it supersedes the unimplemented
two-column prepared index—and partial
`idx_booking_price_due(state, next_attempt_at, idempotency_key) WHERE
operation='PRICE'`. Migration tests cover empty/V1/V2/V3, drift, repeat,
maximum 192-character key, legacy preservation, constraints, and query plans.

## Runtime and recovery

The only full-stack environment is guarded `linercore-wave-a`; manager port
8088 is probe-only. Restart may reset the process-local circuit but durable
receipt state remains authoritative. Within 120 seconds, readiness, one exact
replay, current history, and one permitted retry path must work with RPO 0.

The point of no return is the first U05 aggregate write, PRICE receipt, or
typed snapshot. Before it, a prior image is allowed only if the
compatibility cell passes, catalog/Flyway/canonical-data hashes are unchanged,
legacy byte fixtures pass, and this read-only query returns zero:

```sql
SELECT
  (SELECT count(*) FROM booking_records
   WHERE snapshot_version >= 2
     AND snapshot::jsonb ?| ARRAY[
       'pricingAmendmentSeq',
       'pricingInputFingerprint',
       'pricingStatus',
       'currentPricingRequestId',
       'currentPriceAmendmentSeq',
       'currentPriceInputFingerprint',
       'pricingFailureEvidence'
     ])
  +
  (SELECT count(*) FROM booking_idempotency
   WHERE operation = 'PRICE' OR idempotency_key LIKE 'P|%')
  + (SELECT count(*) FROM booking_pricing_snapshots)
AS incompatible_u05_rows;
```

The Booking predicate detects any U05 mutable aggregate encoding, including a
pre-pricing amendment, while leaving version-2 W1 rows without U05 keys
eligible for byte fixtures. Invalid snapshot JSON fails the gate rather than
being coerced.

After V3 the prior image is always drained/SELECT-only; it cannot accept
Booking mutations. After the point of no return only candidate restart,
forward repair, or the U05-owned verified isolated restore below is permitted.
Applied migrations are never edited/down.

### U05-owned recovery artifact

Before promotion, `scripts/u05-booking-recovery.mjs` creates a checksummed
custom-format Booking `pg_dump`, restores it into an exact wrapper-owned
isolated database, runs candidate V3 migration/validation, starts the candidate
Booking image against that database, and verifies catalog/Flyway/count/canonical
hashes, legacy decode, exact receipt replay, typed history, fence/due state, and
manager preservation. It writes
`artifacts/recovery/u05-booking-recovery.json` with source/restore identities,
image and backup digests, command versions, before/after hashes, probes, and
cleanup ownership. This U05 promotion gate exists before U06 and therefore is
not circular; U06 later consumes the same artifact for intent-wide recovery.

## Acceptance

Fresh Agreement/Tariff/Reprice subtypes each meet direct end-to-end p99
<=1,500 ms; capture p95 <=500 ms; completion/history p95 <=750 ms. Fixtures are
10,000 Bookings, 50,000 typed snapshots, 100,000 receipts, 10 clients, and 20
two-context rounds per race. Resource failure is
`max(120% cycle one, cycle one + 32 MiB)`, two successive >5% rises, pool
timeout, deadlock, cursor gap, or retained provider body.

Booking keeps Hikari min 2/max 10/acquire 2 seconds. The 512 MiB container
budget is: heap ceiling 282 MiB (55%), nonheap/code/metaspace 80 MiB,
direct/native/client buffers 48 MiB, 32 request plus JVM helper thread stacks
48 MiB, and 54 MiB reserve. Acceptance additionally requires RSS <=480 MiB,
no OOM/restart, CPU throttled within the 1-core limit, HTTP permits <=10,
open Charge connections <=10, request threads <=32, and stable permits/
sockets/threads across timeout cycles.

## Review

**Verdict: NOT-READY — iteration 1**

### Blockers

1. **Rollback has a circular dependency and no post-write closure.** U06
   depends on completed U05, yet U05 delegates restore after the first PRICE
   receipt/typed snapshot to U06. The prior-image path covers only zero-U05-data
   deployments; “forward repair” is not an executable rollback. Define the
   point of no return, exact catalog/Flyway/data queries and hashes, and an
   U05-owned, promotion-tested recovery artifact/runbook, or make the required
   U06 restore capability available before U05 deployment.
2. **Booking migration and index ownership are not implementable without
   guessing.** Assign the Booking data owner and exact
   `dataaccess/.../db/migration/V3__*.sql`, including the 128-to-192 key change,
   every receipt/snapshot column with type/null/default/check/FK/backfill rules,
   and named indexes. Reconcile `components.md`'s
   `(booking_id, amendment_seq)` index with the required four-column DESC
   cursor index; state whether the former is replaced or additionally retained.
3. **HTTP and container resource bounds are qualitative.** Two-second
   cancellation does not bound concurrency. Specify the client implementation,
   max total/per-route connections, permit-acquire timeout, executor
   threads/queue, and Hikari limit. The 1 CPU/512 MiB/JVM-55% allocation also
   lacks an absolute RSS/CPU ceiling and native/metaspace/thread/pool headroom;
   the relative three-cycle rule can pass while the container is already near
   OOM. Provide arithmetic and acceptance limits for the stated ten clients.
4. **Cross-unit edge ownership conflicts.** This artifact says U05 changes
   nginx, while the ownership registry assigns shell/UI to W2-02, Wave A to U06,
   and no owner for nginx; application design associates the additive nginx
   mount with the broader C15 edge work. Remove nginx from U05 if unchanged, or
   name the owning unit, exact change, dependency, and merge/evidence gate.

### Non-blockers

- Capture/remote/completion transaction boundaries, Booking-then-receipt lock
  order, fencing, retry/circuit predicates, half-open timing, and synchronous
  response-body/permit release are coherent across the eight inputs.
- Direct per-subtype p99 measurement is a valid healthy-success gate because
  component percentiles are explicitly diagnostic and timeout/retry scenarios
  are separately tested.
- Signed-session/service-identity separation, fixed Charge destination,
  fail-closed nonlocal secrets/bypass, database isolation, and redaction rules
  provide a sound security boundary. Secret rotation and signing-key custody
  should be made explicit in the later pipeline/runbook.

### Validation

- All five required outputs exist, each had five H2 sections before this review,
  and each names all eight declared consumed artifacts.
- No TypeScript, TSX, or JavaScript snippets—or any fenced snippets—are present,
  so lint/type-check code-shape checks are inapplicable.
- Cross-references to U04/U05/U06/W2-02 resolve, but the U05-to-U06 rollback
  dependency is circular as described above. Repository inspection confirms
  Booking currently has V1/V2 migrations only, making the unnamed V3 ownership
  decision material.
- The four shipped sensor executables were invoked, but Bun was denied access
  to `.codex/tools/aidlc-sensor-*.ts` with Windows `EPERM`; equivalent read-only
  section, upstream-coverage, and snippet checks produced the results above.

### Iteration 2

**Verdict: NOT-READY**

#### Remaining blockers

1. **The rollback eligibility query misses incompatible aggregate writes.**
   U05 can persist `snapshot_version=2` pricing input/status/currentness through
   the amendment workflow before any PRICE receipt or typed snapshot exists.
   The stated point of no return is therefore late, and
   `incompatible_u05_rows` can return zero although a prior image cannot decode
   the Booking row. Redefine the point of no return as the first U05 aggregate
   write and include an exact `booking_records` predicate in the gate. Also
   replace monitoring's stale “restore mechanics remain U06-owned” statement
   with the U05-owned pre-promotion restore/U06-consumer split.
2. **The V3 PRICE constraint contradicts exact RETRYABLE replay.** V3 permits
   `response_http_status`, `response_code`, and `response_snapshot` only for
   COMPLETED, while `business-logic-model.md` requires RETRYABLE to replay its
   recorded timeout/503/circuit/denied/malformed outcome until
   `next_attempt_at`. Define the RETRYABLE response/evidence columns and adjust
   the named check so those rows can store and replay the required immutable
   outcome; test the constraint and due-time replay together.

#### Validation

- **PASS:** the U05-owned dump/isolated-restore artifact removes the original
  U06 execution dependency; V3 path/owner, 192-character key, columns/backfill,
  final four-column cursor index, and partial PRICE-due index are explicit.
- **PASS:** HC5/RestTemplate, semaphore, Tomcat, Hikari, body, and timeout limits
  are numeric. The memory allocation sums to 512 MiB and adds an absolute
  480-MiB RSS gate plus connection/thread/permit ceilings.
- **PASS:** nginx is unchanged and platform/W2-02-owned. Runtime secret custody
  and rotation proof are explicit and redact secret values.
- **PASS:** all five outputs retain at least two H2 sections and name all eight
  consumed artifacts. The required-sections sensor passed for every output;
  equivalent upstream checks passed. The only new fenced snippet is appropriate
  SQL, with no TypeScript/TSX/JavaScript snippet to lint or type-check.

## Post-review lead corrections

The iteration-2 NOT-READY verdict remains the final formal reviewer verdict.
Within the two-iteration cap, the lead corrected both remaining blockers:

- the point of no return is now the first U05 aggregate write, receipt, or
  typed snapshot, and the exact zero-count predicate detects U05 JSON fields in
  `booking_records` as well as PRICE receipts and typed rows;
- the V3 shape now permits RETRYABLE rows to store immutable response HTTP/
  code/snapshot plus mandatory due time, enabling exact pre-due replay while
  keeping IN_PROGRESS and COMPLETED shapes disjoint.

Monitoring now records U05 as owner of the pre-promotion restore artifact and
U06 as its later integration consumer. No third review is claimed; the
historical verdict and these corrections remain visible to the stage-wide gate.
