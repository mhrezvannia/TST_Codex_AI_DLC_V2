# Rollback Runbook - W2-01 App Shell and Auth

## Upstream Inputs

This rollback runbook consumes `ci-config`, `quality-gates`, per-unit `deployment-architecture`, and per-unit `cicd-pipeline` artifacts.

## Rollback Triggers

Rollback or stop promotion if any of these occur:

- `node scripts/w2-01-live-acceptance.mjs --validate --require-pass` fails.
- Live Compose/Nginx proof cannot start or cannot reach Keycloak/auth/shell/Booking.
- Runtime evidence shows `local-user` on mounted shell/Booking calls.
- Booking create/detail, denied access, sign-out, stale-call, or `/bookings*` compatibility scenarios fail.
- `erp-fidelity-audit` or `aidlc-audit` fails.
- CI reports regressions in W0-01, W0-02, W1-01, or W2-02 touched surfaces.

## Immediate Actions

1. Stop promotion. Do not merge or release a W2-01 package with `finalDecision=BLOCKED`.
2. Preserve evidence under `artifacts/w2-01-live/app-shell-auth/` and `artifacts/quality-gates/`.
3. Record the failing command, scenario id, correlation id, and blocker id.
4. Notify the owning delivery, quality, and platform reviewers.

## Local Compose Rollback

Use this path for local/on-prem proof stack rollback:

```bash
git revert <w2-01-merge-sha>
docker compose config --quiet
docker compose --profile full up -d --build
node scripts/w1-live-acceptance.mjs --dry-run --run-id rollback-check
```

If W2-01 has not merged, switch back to the previous known-good branch or commit and rebuild the Compose stack. Do not remove Docker volumes unless the environment is explicitly disposable and the reviewer approves data loss.

## Route Rollback Scope

| Surface | Rollback action |
| --- | --- |
| Nginx `/`, `/booking*`, `/bookings*` routing | Restore previous Nginx routing from the last known-good commit |
| `apps-shell` | Remove from Compose/Nginx traffic until fixed |
| `apps-auth` sign-out/session changes | Revert only if sign-in/sign-out regressions are confirmed |
| `apps-booking` actor propagation | Do not reintroduce `local-user`; rollback must preserve fail-closed behavior or stop promotion |
| `booking-service` identity authorization | Revert only with matching identity-service catalog/seed rollback; do not bypass authorization |

## Validation After Rollback

Run:

```bash
docker compose config --quiet
node --test scripts/w2-01-live-acceptance.test.mjs scripts/run-quality-gates.test.mjs
node scripts/w2-01-live-acceptance.mjs --validate --output-root artifacts/w2-01-live/app-shell-auth
bash .claude/skills/erp-fidelity-audit/detectors.sh
bash .claude/skills/aidlc-audit/detectors.sh
```

If the environment supports live proof, also rerun the W1 and W2 live scenarios against the rolled-back stack. W1-01 live-proof waiver remains BLOCKED at compose-start unless real W1 evidence is captured; rollback must not rewrite that waiver as PASS.

## Escalation

Escalate to platform and delivery leads when:

- Docker proxy/image-cache issues block the proof runner.
- Bash detector execution is unavailable on the selected runner.
- Evidence indicates authorization bypass, token leakage, or session persistence after sign-out.
- Rollback requires data changes or volume removal.

## Prevention Follow-Ups

- Add a dedicated live-proof runner with Docker proxy/cache and Bash.
- Add a production-grade smoke workflow only after W2-01 local/on-prem evidence is green.
- Add SAST, dependency scanning, secret scanning, container scanning, and DAST in a later CI hardening intent.
