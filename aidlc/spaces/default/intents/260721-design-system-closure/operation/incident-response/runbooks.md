# Runbooks — W2-02 Design-System Closure

## Upstream bindings and safety boundary

These runbooks implement the constraints in `observability-setup/dashboards.md`, `observability-setup/alarms.md`, `booking-design-system-closure/nfr-design/reliability-design.md`, `security-design.md`, and `booking-design-system-closure/infrastructure-design/deployment-architecture.md`.

All Compose mutation uses `node scripts/wave-a-compose.mjs` and therefore the isolated `linercore-wave-a` project. Never run an unscoped Compose teardown, never add `--volumes` as an incident shortcut, and never target or restart `linercore-shared-platform`. There is no SSM/AWS automation library for this local-only intent.

## RB-01 — Manager guard or target mismatch

**Trigger:** `npm run demo:guard` fails, effective target values differ from the approved manager project/edge/image, or any manager resource appears changed.

1. Stop before any Wave A mutation; if already running, stop further commands.
2. Preserve the exact guard output and effective target inputs.
3. Use read-only inspection only; do not “repair” the manager from this worktree.
4. Escalate P1 to the manager-runtime owner and W2-02 delivery owner.
5. Resume only after the manager owner confirms safety and a fresh pre-guard passes.
6. Require a fresh post-guard before terminal closure.

**Success:** both guards pass against the expected protected target and no unauthorized manager change occurred.

## RB-02 — Wave A startup or health failure

**Trigger:** wrapper start fails, a required container is unhealthy, or the canonical edge does not become ready.

1. Confirm the wrapper configuration with `node scripts/wave-a-compose.mjs config`.
2. Capture `node scripts/wave-a-compose.mjs ps --all`.
3. Capture bounded service logs with `node scripts/wave-a-compose.mjs logs --tail 200 <service>`.
4. Classify image/build, configuration, dependency, health-check, port, or resource failure.
5. If isolation and manager safety remain proven, correct the scoped cause and use the wrapper to recreate only the required Wave A resources.
6. Re-run readiness and the focused smoke before starting a new full attempt.
7. On cleanup, use `node scripts/wave-a-compose.mjs down`; preserve volumes unless an separately approved recovery procedure says otherwise.

**Stop:** any project-name ambiguity, manager-guard failure, or destructive-data proposal.

## RB-03 — Booking journey, command, or UI assertion failure

**Trigger:** create/validate/price/confirm/detail fails; a command duplicates; a required state, theme, viewport, keyboard, accessibility, or layout assertion fails.

1. Retain the failing case record, screenshot, safe request/status/duration data, and browser error collectors.
2. Preserve the last safe UI state; do not assert a successful lifecycle transition.
3. Identify the owning boundary: shared UI, shell adapter, Booking BFF, Booking service, supporting service, or harness.
4. For an unknown command outcome, retain the idempotency identity and reload/retry only through the existing safe behavior.
5. Add or update the focused regression test, then rerun that check.
6. Start a new full attempt only after the focused check passes; link it to the failed attempt.

**Success:** the focused regression and new terminal acceptance attempt pass without erasing prior failure truth.

## RB-04 — Secret, credential, or unsafe trace evidence

**Trigger:** raw trace, manifest, screenshot, log, or response capture contains Authorization, Cookie, Set-Cookie, token, credential, secret, session, or configured local-identity values.

1. Stop promotion immediately and classify P1.
2. Delete the unsafe staged/raw trace through the established sanitizer failure path; never copy it into durable evidence.
3. Preserve only the secret-free sanitizer failure report and hashes that do not expose the value.
4. Notify the security responder and credential owner; rotate/revoke only through their authorized process if exposure was real.
5. Correct the allow-list/redaction defect and rerun sanitizer, archive scan, and replay validation.
6. Start a new acceptance attempt; the affected run remains failed.

**Success:** the second content scan reports zero forbidden values and the new archive is hash-bound and replay-valid.

## RB-05 — Cleanup or audit failure

**Trigger:** wrapper cleanup, post-demo guard, `aidlc-audit`, or `erp-fidelity-audit` exits non-zero.

1. Do not mark the run terminally complete.
2. Capture Wave A status and the failing command’s direct exit/output.
3. If cleanup ownership is unambiguous, retry only the wrapper-scoped cleanup.
4. Re-run the post-demo guard after cleanup.
5. Correct the audit finding in its owning scope; do not waive or relabel it.
6. Re-run both audits and retain their direct results.

**Success:** Wave A is clean, manager post-guard passes, both audits pass, and the complete manifest references those results.

## RB-06 — Optional shared observability degradation

**Trigger:** Prometheus application targets remain down, Elasticsearch is OOM-killed, Kibana times out, or optional Grafana panels lack live data.

1. Record read-only service/container/target status and timestamps.
2. Confirm whether the isolated W2-02 journey is affected.
3. If not affected, classify P3 and retain it as program observability backlog; do not call the shared profile healthy.
4. Escalate to the protected-manager/platform owner with the current evidence.
5. Do not restart, resize, reconfigure, or recreate manager services from this intent.

**Success:** program owners later provide authorized remediation evidence. This runbook does not convert the current PARTIAL state to PASS.

## RB-07 — Service-owned data or persistence concern

**Trigger:** persisted Booking state is missing, inconsistent, or unavailable after a restart.

1. Stop new lifecycle commands and retain request/correlation-safe evidence.
2. Capture scoped application/database health and logs without querying another service’s database.
3. Preserve existing volumes and determine whether the issue is application, migration, connection, or storage related.
4. Prefer forward repair within the owning service; do not use destructive reset as acceptance evidence.
5. Escalate any restore request because no backup policy, RTO, or RPO is approved.
6. Re-run restart/persistence evidence and the canonical journey after repair.

**Success:** committed state survives the approved local restart path and the owning service’s verification passes; no host/volume-destruction durability claim is made.
