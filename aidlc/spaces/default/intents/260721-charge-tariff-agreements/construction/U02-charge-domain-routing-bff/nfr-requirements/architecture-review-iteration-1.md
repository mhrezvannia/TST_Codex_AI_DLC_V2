# Architecture Review - U02 NFR Requirements - Iteration 1

## Verdict

**NOT-READY**

The base-path/nginx path-preservation model, 18088 isolation and 8088
protection, no-RTK/shared-UI boundary, and truthful downstream-receipt replay
semantics are sound. Five precision findings block readiness.

## Findings

### High - brownfield dependency versions are inaccurate

The stack artifact presented manifest minimums as installed versions. The
workspace lock resolves Next 15.5.19, TypeScript 5.9.3, Zod 3.25.76, and Vitest
2.1.9. Record both package ranges and lock-resolved versions.

### High - unsafe provider failure mapping is contradictory

Define one exact result for malformed 2xx JSON, malformed non-2xx JSON,
HTML/non-JSON, and oversized responses, distinct by code from timeout/transport.

### Medium - mutation performance mix is not executable

Remove the nonexistent manual-case transition and enumerate exact Rate and
Agreement route policies with fixed counts.

### Medium - timing and resource gates can hide invalid evidence

Require one correlation-linked child backend span, fail negative/unmatched
deltas rather than clamping, and place numeric quiescent bounds on in-flight
requests, connections, heap, and RSS.

### Medium - stateless scaling proof is optional

Make the two-instance/no-affinity proof blocking or replace the requirement
with a mandatory deterministic equivalent.

## Iteration outcome

A second review is required after correction. This iteration remains
permanently NOT-READY.
