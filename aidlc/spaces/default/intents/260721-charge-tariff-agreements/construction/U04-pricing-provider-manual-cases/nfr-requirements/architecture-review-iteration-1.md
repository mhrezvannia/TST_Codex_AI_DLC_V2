# Architecture Review - U04 NFR Requirements - Iteration 1

## Verdict

**NOT-READY**

Authorization before replay, transient/manual separation, capacity bounds,
stack fidelity, upstream coverage, and Booking/shared-UI/8088 scope boundaries
are sound. Four evidence-precision findings block readiness.

## Findings

### High - Agreement performance subtypes can hide latency

The fixed distribution does not assign counts or independent p99 gates to
shallow/deep history and inclusive boundaries. Bind exact samples and a p99
oracle to each subtype with fresh non-replay identities.

### High - stale-fence outcomes are not executable

Name the repository outcome and exact service/public result when an old owner
attempts completion while the takeover owner is IN_PROGRESS and after it becomes
terminal. The stale transaction must roll back any case or terminal bytes.

### Medium - restart RPO omits ownership/lease state

Add normalized owner-token/fence/lease invariants, including expired IN_PROGRESS
fixtures, to restart and restore hashes or define a proven terminal cleanup form.

### Medium - success evidence lacks the full monetary oracle

Three-line count and source IDs do not prove order, category/code, currency,
basis, quantity, numeric unit rate, HALF_UP amount, total equality, basis/ref, or
exact selected source versions. Assert all and retain redacted booleans/hashes.

## Iteration outcome

A second review is required after correction. This iteration remains
permanently NOT-READY.
