# CI/CD Pipeline - W2-03

## Upstream Coverage

This design consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Pull Request Gates

1. Immutable dependency install and formatting/lint checks.
2. Charge backend domain, application, persistence, API, migration, idempotency, and outbox tests.
3. Charge UI unit tests, typecheck, lint, and production build.
4. Booking consumer plus Charge provider Pact verification against the frozen pricing contract.
5. SAST, dependency vulnerability scan, secret scan, container scan, and Compose/config lint.
6. Additive migration upgrade/backfill/restart test against existing pricing data.
7. Ephemeral Compose W2-03 acceptance: create rates, approve linked agreement, price Booking, verify itemised snapshot, change/reprice, no-rate path.
8. `aidlc-audit` and `erp-fidelity-audit`, with evidence upload on success or failure.

## Existing Workflow Gaps

`.github/workflows/quality-gates.yml` runs the Maven reactor but does not run the Charge UI workspace test/typecheck/lint/build commands and has no W2-03 live-acceptance step or evidence path. Those gates are required before this intent can merge.

## Packaging and Promotion

Build backend and frontend images once, tag with commit SHA, generate SBOMs, sign artifacts when the runner supports it, and promote the same digests. Merge deploys automatically to staging on self-hosted on-prem runners. Production promotion requires the separate manual approval mandated by project rules.

## Rollback

Automated smoke tests validate health, auth, pricing, and snapshot persistence after deploy. Roll back to the prior image digest when compatible. If a monetary schema change cannot roll back safely, stop promotion and execute the tested forward-repair/restore runbook.

## Pipeline Security

Use least-privilege GitHub permissions, protected environments, pinned action versions, isolated ephemeral databases, masked secrets, and artifact retention appropriate to commercially sensitive evidence. Do not publish raw pricing bodies in public CI logs.
