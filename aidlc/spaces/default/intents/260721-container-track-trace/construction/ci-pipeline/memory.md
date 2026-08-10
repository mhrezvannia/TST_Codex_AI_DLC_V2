# CI Pipeline Memory

## Upstream context

This diary reflects all U01/U02/U03 `code-summary.md` artifacts,
`construction/build-and-test/build-and-test-summary.md`, and
`construction/build-and-test/build-test-results.md`.

## Interpretations

- 2026-07-22T00:00:00Z — Existing repository CI is the provider baseline; this intent extends GitHub Actions rather than adding another provider.
- 2026-07-26T12:32:27Z — Full intent gates mean every live requirement blocks merge; bounded in-process component checks supplement but do not replace Next, Vitest, Playwright, or live eventing evidence.
- 2026-07-26T12:32:27Z — The existing CI artifacts were modified in place; the latest Build and Test evidence supersedes their earlier readiness assumptions.

## Deviations

- 2026-07-22T00:00:00Z — Live acceptance remains isolated and serialized to protect the manager demo on port 8088.
- 2026-07-26T12:32:27Z — CI activation is held instead of inventing a passing W2-04 harness; no executable W2-04 live/browser/performance driver exists in the repository.

## Tradeoffs

- 2026-07-22T00:00:00Z — Reusing existing GitHub artifacts and local Compose images minimizes infrastructure drift.
- 2026-07-26T12:32:27Z — A two-job static/live topology keeps fast feedback separate from serialized acceptance while both remain blocking for integration promotion.

## Open questions

- 2026-07-26T12:32:27Z — Confirm the exact W2-02 integration commit before final visual acceptance.
- 2026-07-26T12:32:27Z — Assign implementation ownership for the missing W2-04 acceptance, Playwright, performance, and evidence-package automation.
