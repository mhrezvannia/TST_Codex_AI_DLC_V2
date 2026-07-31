# Architecture Review - U01 NFR Requirements - Iteration 1

## Verdict

**NOT-READY**

The scope and stack boundary are sound: no production SLA, cloud/service/cache
expansion, shared-UI redesign, or conflict with the pricing p99 target was
introduced. Four precision blockers remain.

## Findings

### High - Identity failure mapping is ambiguous

Reliability allowed “deny or unavailable” while security requires exact
authentication/authorization semantics. Missing/invalid signed human session
must be 401; explicit authenticated Identity DENY must be 403; Identity
transport/timeout/malformed response must be typed 503; missing non-local
credentials fails readiness/configuration and cannot masquerade as DENY.
Committed activity exists only for successful mutation; failed attempts use
safe existing audit/log evidence.

### High - aggregate performance can hide a slow operation

The workload must be fixed at 50 list/50 detail and 25 each
create/edit/approve/successor. Per-operation and aggregate percentiles must be
retained, and each operation must independently meet its 500/750 ms p95 target.
Warm-up, request mix, page/filter cases, and nearest-rank calculation must be
checked-in and separate from pricing p99 evidence.

### High - race proof is not deterministic enough

Same-key approval and successor races need at least 20 barrier-synchronized
rounds each. Approval produces exactly one success and one 409
`RATE_AUTHORITY_CONFLICT`; successor produces one Draft/version and all losers
409 `RATE_DRAFT_EXISTS`. Twenty independent approvals all succeed. The tests run
through two independently wired Spring contexts sharing one PostgreSQL
Testcontainer, not “where practical.”

### Medium - recovery/observability evidence lacks exact closure

The restart clock must run from command acceptance until readiness and an
authenticated detail read. RPO 0 compares counts/canonical hashes for Rate,
RateVersion, RateActivity, and Flyway. Restore targets a new isolated DB and
validates catalog/checksums plus old/new reads. Metrics need bounded dimensions
and 500/750 ms histogram coverage; one correlation must join response,
authorization/reference, mutation, activity, latency, and redaction evidence.

## Iteration outcome

A second review is required after correction. This iteration remains
permanently NOT-READY.
