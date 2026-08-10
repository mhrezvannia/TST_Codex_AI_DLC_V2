# NFR Requirements Questions - dnd-version-trigger-governance

## Q3. Approval and successor concurrency proof

Which deterministic contention test should prove overlap locking and immutable lifecycle behavior?

- A. Run 20 concurrent approval/successor attempts on one applicability key; exactly one permitted transition succeeds, all others return defined conflict/overlap outcomes, with no deadlock or duplicate Draft. (Recommended)
- B. Run 5 concurrent attempts with the same correctness assertions.
- C. Cover concurrency only through focused repository tests, not the running stack.
- X. Other (please specify)

[Answer]:

## Q4. Unresolved Standard-enrichment atomicity

How should the approved Functional Design review finding about U02's non-atomic evidence-then-release sequence affect release readiness?

- A. Make the owner-fenced atomic release-plus-final-evidence correction a release-blocking requirement before Code Generation can be considered conformant. (Recommended)
- B. Permit the current sequence if tests show no observed mismatch.
- C. Defer the correction to a later intent.
- X. Other (please specify)

[Answer]:
