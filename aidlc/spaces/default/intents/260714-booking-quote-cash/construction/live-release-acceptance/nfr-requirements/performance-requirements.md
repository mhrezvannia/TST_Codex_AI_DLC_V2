# Performance Requirements - U07 Live Release Acceptance

## Blocking Workloads

- Pricing: 100 warm-up plus 1,000 measured valid-agreement requests at concurrency 10; nearest-rank p99 <=800 ms.
- Round trip: 10 warm-up plus 100 measured unique booking/container journeys at concurrency 5; successful Confirm response to matching visible status nearest-rank p95 <=5 s.
- Every measured error remains in raw CSV/JSON and fails its workload; no success-only filtering.
- Measurements use monotonic elapsed time and record commit, environment/images, workload parameters, correlations, resource signals, and percentile method.

## Supporting Budgets

U01-U06 local budgets are reported to diagnose violations but cannot replace the end-to-end gates. Warm-up exclusion is declared by sample index. Screenshots/browser tracing and evidence writes do not alter measured application paths.

## Source Coverage

Requirements aggregate U07 `business-logic-model.md`, `business-rules.md`, and NFR-W1-001/002 in `requirements.md` on the complete `technology-stack.md`.

## Review

**Verdict: READY.** Iteration 1 findings on stack reproducibility, measurable scalability, durability scope, and local identity were corrected across all unit NFR sets. Independent iteration 2 found no unresolved blockers. The approved default-agent fallback loaded the architecture-reviewer persona because the named role's pinned model is unsupported by this Codex account.
