# Architecture Review - U01 NFR Design - Iteration 1

## Verdict

**NOT-READY**

No Critical findings. Two High findings require correction before the design is
implementable without guessing.

## High findings

1. Remote-call containment names bounded permits, payload bounds, and a two-
   second deadline without exact permit counts, byte limits, connect timeout,
   or deadline composition. The security text also ambiguously suggests two
   service-side Identity decisions. Define the exact adapter limits and one
   service command-boundary decision in addition to the U02 BFF gate.
2. The explicit W1 blocked/waived preservation obligation is absent from the
   NFR Design handoff. Require the original W1 artifact to remain unchanged and
   separate from W2-03 evidence; no later green result may relabel it PASS.

## Advisories

- State that advisory-lock serialization plus the authoritative overlap query,
  not a generic database constraint alone, decides Approved-window overlap.
- Define how the 20 independent approvals are distributed across the two
  Hikari pools and capture acquisition waits.

Required-section and upstream-coverage sensors pass. Linter/type-check sensors
are not applicable to these Markdown artifacts. Manager 8088 isolation,
ownership boundaries, forward-only recovery, and separation from live proof are
otherwise preserved.
