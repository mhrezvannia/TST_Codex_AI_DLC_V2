# Architecture Review - U05 NFR Requirements - Iteration 1

## Verdict

**NOT-READY**

Booking-local/end-to-end timing separation, fresh bilateral identities, five
race families, RPO/hash/fence evidence, append-only confirmation guards, outcome
distinctions, authorization/redaction, legacy compatibility, ownership boundaries,
and upstream trace are sound. Two findings block readiness.

## Findings

### High - retryable recovery is not deterministic

Provider denied, malformed provider response, and `BOOKING_CHANGED` are marked
RETRYABLE without exact due/reclaim rules. Bind each to immediate/time-gated/new-
key recovery, exact pre-due replay, higher-fence behavior, and prevent an old
changed-input key from looping forever against newer aggregate markers.

### Medium - resilience stack claim is not evidence-backed

The baseline technology record and code do not contain a pinned Resilience4j
dependency. Declare the exact new artifacts/version, module ownership and
compatibility/security evidence, or select an observed mechanism while retaining
the functional two-call/two-second/five-call/30-second/one-probe semantics.

## Iteration outcome

A second review is required after correction. This iteration remains
permanently NOT-READY.
