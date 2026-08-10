# Infrastructure Design Memory

## Interpretations

- 2026-07-26T10:44:14Z - Treated the current Wave A Compose stack as the only executable infrastructure topology; approved application and NFR artifacts explicitly prohibit inventing AWS, staging, production, or new deployables.
- 2026-07-26T10:44:14Z - Treated `shared-infrastructure.md` as an ownership and boundary contract for existing cross-unit resources, not permission for U01 to modify resources owned by later units or W2-02.
- 2026-07-26T10:44:14Z - Pinned Wave A Rate authorization to an explicit `identity-http` bean and recorded the current internal Identity endpoint's lack of production caller authentication instead of allowing the Spring local profile to select an acceptance shortcut.
- 2026-07-26T11:04:21Z - Resolved U02's 544 MiB admission/runtime ceiling with independent 432 MiB heapUsed, 48 MiB Node external (already inclusive of arrayBuffers), 64 MiB `rss-heapUsed-external`, and 544 MiB RSS gates; a 768 MiB container with 512 MiB old/8 MiB semi-space prevents cgroup termination from hiding evidence while the manager remains untouched.
- 2026-07-26T11:04:21Z - After U03 review, replaced prefix-only relay ownership with a total classifier covering every reserved-prefix or five-type/W2 row; the old relay owns the exact complement and malformed U03-owned rows are quarantined PERMANENT.
- 2026-07-26T11:18:00Z - Closed the U03 reviewer-limit correction by applying the same total classifier to pre-start, compatibility, and rollback eligibility across active, terminal, and quarantined rows; the historical NOT-READY verdict remains recorded for the stage gate.
- 2026-07-26T11:18:00Z - Made TEXT snapshot classification deterministic on PostgreSQL 15 through a V3 `charge_try_jsonb(text)` helper that converts SQLSTATE 22P02 to NULL, while the independent prefix arm always routes malformed reserved rows to U03 quarantine.
- 2026-07-26T11:31:00Z - Treated U04 as behavior inside the one existing Charge image and database: exact replay, fencing, candidate snapshot, and manual evidence require no new deployable, store, cache, queue, or network.
- 2026-07-26T11:46:00Z - Reconciled U04 fencing to the physical U01 V4 contract: each takeover replaces the random owner token, completion matches the current token, and no normalized-request or numeric-fence column is invented.

- 2026-07-26T12:08:00Z - Treated U05 as an additive Booking deployment using three phases: short capture transaction, transaction-free bounded Charge call, and short fenced completion transaction.
- 2026-07-26T12:26:00Z - Assigned the exact Booking V3 migration and pre-promotion recovery artifact to U05 itself; U06 consumes the proof later, removing a circular recovery dependency.

- 2026-07-26T12:55:00Z - Treated U06 as a non-deployable, checked-in evidence control plane that can mutate only the isolated Wave A project through its wrapper and derives, but cannot supply, technical PASSED.

## Deviations

- 2026-07-26T10:44:14Z - Asked no new Infrastructure Design questions for U01; Construction questions are exceptional and all deployment, storage, monitoring, pipeline, scaling, secret, and recovery decisions were already fixed by approved upstream artifacts.
- 2026-07-26T10:44:14Z - Did not select CDK, CloudFormation, Terraform, cloud regions, or production deployment strategies; the intent authorizes version-controlled Compose configuration only.
- 2026-07-26T10:44:14Z - Removed a separate full-stack CI Compose topology after architecture review; CI uses unit/Testcontainers jobs and all full-stack proof uses the guarded Wave A wrapper.
- 2026-07-26T11:04:21Z - Asked no new U02 infrastructure question because all edge, session, capacity, secret, monitoring, and deployment decisions are fixed by approved upstream artifacts.
- 2026-07-26T11:04:21Z - Asked no new U03 infrastructure question; V3 ownership, assertion, database, relay, recovery, and topology decisions are already closed upstream.
- 2026-07-26T11:31:00Z - Asked no new U04 infrastructure question; the eight engine-declared inputs already close topology, pool, storage, security, monitoring, pipeline, and recovery choices.

- 2026-07-26T12:08:00Z - Asked no new U05 infrastructure question because the approved inputs fix Booking/Charge topology, resilience arithmetic, persistence, monitoring, and recovery.

- 2026-07-26T12:55:00Z - Asked no new U06 infrastructure question because the approved NFR set already closes evidence crash recovery, Windows containment, trace sanitation, registry cardinalities, restore safety, and performance populations.

## Tradeoffs

- 2026-07-26T10:44:14Z - Reused the shared local PostgreSQL process with a Charge-specific database and role; this minimizes local cost while retaining strict database ownership, bounded pools, and cross-service non-regression evidence.
- 2026-07-26T10:44:14Z - Kept Rate reads in indexed PostgreSQL with no cache/search service; this avoids distributed invalidation and keeps immutable commercial authority observable and recoverable.
- 2026-07-26T10:44:14Z - Chose controlled local container recreation plus forward-compatible migrations instead of naming blue-green/canary/rolling production deployment; no production traffic platform is in scope.
- 2026-07-26T10:44:14Z - Defaulted recovery after V2-V4 to forward repair and made previous-image use conditional on an exact generated image/schema matrix; a missing compatibility proof cannot authorize rollback.
- 2026-07-26T10:44:14Z - Selected pinned Semgrep, Gitleaks, Trivy, Syft, Yarn audit, and one closed-schema waiver verifier so security gates are executable rather than advisory tool examples.
- 2026-07-26T10:44:14Z - After the final reviewer limit, split compatibility evidence into mutating upgrade cells and non-mutating validate-only/read-only cells with before/after hashes; only the latter can authorize a previous-image rollback.
- 2026-07-26T10:44:14Z - After the final reviewer limit, made security scans report-first and separated execution/report failure from finding policy so the closed waiver verifier is authoritative without weakening fail-closed tool failures or live-secret blocking.
- 2026-07-26T11:04:21Z - Kept admission and selector semaphores process-local rather than adding a distributed limiter; the BFF is stateless and two-process tests prove no affinity while overload remains bounded per process.
- 2026-07-26T11:04:21Z - Used a dedicated U02/U03 HMAC assertion secret instead of reusing the session secret or inventing a token exchange; the assertion is single-request context and U03 still authorizes independently.
- 2026-07-26T11:04:21Z - After U02 review, fixed the assertion wire as a versioned byte-length-framed compact header with shared TypeScript/Java golden vectors and a bounded U03 process-local nonce map; restart replay risk remains explicit for the local single-instance topology.
- 2026-07-26T11:04:21Z - After U02 review, assigned U02 Code Generation ownership for the exact security lock/config/wrapper/report/waiver files and quality-gate commands instead of treating them as already-present workspace capability.
- 2026-07-26T11:04:21Z - After the U02 reviewer limit, changed waiver expiry evaluation from source-commit time to synchronized current runner UTC so rebuilding an old commit cannot revive an expired waiver.
- 2026-07-26T11:04:21Z - Kept relay publication outside the commercial transaction with bounded claims/fenced marks; this preserves command latency and database connections while accepting explicit at-least-once duplicate identity.
- 2026-07-26T11:04:21Z - Made relay flag rollback eligible only while no row matches the complete U03 ownership classifier; after any durable active, terminal, or quarantined ownership exists, forward repair is safer than handing unknown states to an old coordinator.
- 2026-07-26T11:04:21Z - Included max-10 pool acquisition in relay recovery arithmetic and proved 103-second normal/72-second lease recovery while ten one-second command transactions saturate the pool.
- 2026-07-26T11:31:00Z - Kept U04 candidate resolution in one bounded PostgreSQL REPEATABLE READ snapshot rather than adding a commercial cache or projection; this gives one linearization point without distributed invalidation or writer locks across rendering.
- 2026-07-26T11:31:00Z - Reused U01's max-10 Hikari pool with non-overlapping claim/snapshot/completion holds; local capacity evidence must prove coexistence instead of increasing a shared limit without an environment budget.
- 2026-07-26T11:31:00Z - Made previous-image use conditional on both exact-current-schema read compatibility and absence of durable U04 semantic state; after W2 terminal/manual evidence, forward repair preserves acknowledged bytes and canonical case identity.
- 2026-07-26T11:46:00Z - Accepted a measured PostgreSQL sort after the U01 status/opened/case index for the required mixed manual order; the 10,000-row gate bounds candidates, memory to 4 MiB, disk spill to zero, page to 100, and p95 to 750 ms without stealing migration ownership.
- 2026-07-26T11:46:00Z - Replaced prose rollback eligibility with an exact read-only zero-count predicate over all W2 receipt additions and all new U04 case-evidence columns, plus byte-preserving legacy fixtures and unchanged catalog/Flyway/data hashes.
- 2026-07-26T11:46:00Z - Chose PostgreSQL time for receipt leases so two service instances share one takeover clock without adding a clock-skew assumption.
- 2026-07-26T11:54:00Z - After the U04 reviewer limit, removed the last numeric-fence phrases from the NFR set and defined prior-image rollback as drained/read-only with routing mutation blocks and a SELECT-only role; the final formal NOT-READY verdict is preserved.

- 2026-07-26T12:08:00Z - Kept circuit state process-local while durable receipt due/state remains authoritative; this avoids a new distributed store and makes restart semantics explicit.
- 2026-07-26T12:08:00Z - Kept Charge I/O outside Booking transactions and required synchronous timeout cancellation/resource release; this bounds pool/socket/thread use while preserving two-service idempotency.
- 2026-07-26T12:26:00Z - Bounded the pricing client with 10 HC5 connections/permits, 100 ms acquisition, 500 ms connect, 2-second response/overall deadline, 64 KiB body, and 32 request threads; the 512 MiB Booking budget retains 32 MiB RSS reserve.
- 2026-07-26T12:26:00Z - Confirmed U05 consumes the existing Booking nginx route unchanged; shared edge ownership remains platform/W2-02.
- 2026-07-26T12:39:00Z - After the U05 reviewer limit, moved the rollback point to the first U05 aggregate/receipt/snapshot write and added exact JSON-field detection for incompatible Booking rows.
- 2026-07-26T12:39:00Z - Corrected V3 RETRYABLE shape to persist immutable HTTP/code/snapshot evidence plus mandatory due time so pre-due replay is exact; the final formal NOT-READY verdict is preserved.

- 2026-07-26T12:55:00Z - Used an append-only framed ledger plus versioned derived manifests instead of mutable report state; this makes Windows crash reconciliation and immutable failed-run linkage explicit.
- 2026-07-26T12:55:00Z - Kept raw Playwright traces temporary and indexed only entry-sanitized, recompressed, expanded, rescanned archives; unsafe or unparseable evidence blocks rather than being retained behind access control.
- 2026-07-26T13:14:00Z - Split U06 restore identity into independent Charge and Booking targets with separate sources/OIDs/roles/backups/manifests/cleanup records, preventing cross-database replacement ambiguity.
- 2026-07-26T13:14:00Z - Selected a lockfile/digest-pinned Node `koffi` Win32 FFI writer using handle-relative no-replace rename; Windows evidence blocks rather than falling back to path-based rename.
- 2026-07-26T13:14:00Z - Hard-bounded browser workers, queues/futures, responses/logs/artifacts, ZIP entry/size/ratio, temp/run-root disk, and retention so trace sanitation cannot become an unbounded pre-check.

## Open questions

- 2026-07-26T10:44:14Z - Production account, region, availability, residency, encryption, retention, paging, and cost targets remain intentionally undefined and require a future environment-specific architecture decision.
- 2026-07-26T10:44:14Z - Production service authentication for the internal Identity authorization endpoint remains intentionally unresolved; Wave A proves decision semantics and fail-closed transport only.
- 2026-07-26T11:04:21Z - Production edge/TLS, multi-instance aggregate admission, secret rotation, and operational paging remain outside W2-03 and require an environment-specific design.
