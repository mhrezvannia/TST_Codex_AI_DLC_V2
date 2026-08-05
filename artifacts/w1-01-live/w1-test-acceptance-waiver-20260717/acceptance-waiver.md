# W1-01 Test Acceptance Waiver

Date: 2026-07-17

Intent: W1-01 booking quote-to-cash

Decision: Accepted for test-project integration by explicit user authority.

Scope: This waiver permits merging W1-01 into `integ/main-reconciled` for practice-project continuity. It is not a production release approval and does not rewrite the blocked live-acceptance manifest.

Known blocker retained: the fresh live acceptance run `w1-merge-gate-20260716-200141` reported `BLOCKED` at `compose-start` because Docker Desktop could not pull Elastic images from `docker-auth.elastic.co`.

Evidence retained:

- `artifacts/w1-01-live/w1-merge-gate-20260716-200141/manifest.json`
- `artifacts/w1-01-live/w1-merge-gate-20260716-200141/compose/compose-start.txt`

Follow-up: rerun `node scripts/w1-live-acceptance.mjs --run-id <new-run-id>` after Elastic images are cached or Docker proxy access is fixed, then replace this waiver with a normal passing live-proof record if this branch becomes release-bound.
