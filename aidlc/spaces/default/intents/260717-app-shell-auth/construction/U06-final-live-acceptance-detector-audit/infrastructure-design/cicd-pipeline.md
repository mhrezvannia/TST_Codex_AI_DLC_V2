# CI/CD Pipeline - U06 Final Live Acceptance and Audit

## Source Context

This CI/CD pipeline design consumes U06 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U06 `business-logic-model.md`. It defines final local acceptance and audit capture gates.

## Build Stages

| Stage | Scope | Required outcome |
| --- | --- | --- |
| Runtime build | Services touched by U01-U05. | Local Compose images build or blocker is recorded. |
| Evidence tooling build | Scenario/detector/audit capture scripts if added. | Tools run from repo root and write deterministic paths. |
| JSON/JSONL validation | Evidence package. | Required files parse before PASS. |
| Secret scan/review | Evidence output. | No raw tokens, cookies, service tokens, or secrets. |

## Test Stages

| Stage | Scope | Required outcome |
| --- | --- | --- |
| Runtime readiness | Compose/Nginx/Keycloak/shell/auth/Booking/identity. | `runtime-readiness.json` PASS or blocker. |
| Live scenarios | Four required scenario ids. | PASS rows in `scenarios.jsonl` or blocker rows. |
| Actor/sign-out evidence | `actor-evidence.jsonl`, `sign-out-evidence.json`. | Real subjects, no `local-user`, sign-out/stale-call proof. |
| Detector 6d | Mounted shell/Booking surfaces. | Zero hardcoded-auth hits or blocker. |
| ERP fidelity audit | W2-01 fidelity. | PASS or blocker. |
| AIDLC audit | State/artifact/gate integrity. | PASS or blocker. |
| Final decision check | Manifest and final decision. | Decision consistent with all rows and W1 waiver BLOCKED. |

## Security Gates

- Every protected actor header is non-`local-user`.
- `backendLocalUserObserved=false` for sign-out.
- Detector 6d has zero hardcoded-auth hits for PASS.
- Evidence contains no raw tokens/secrets.
- W1 waiver remains BLOCKED at `compose-start`.

## Deployment Strategy

U06 is not a deployment rollout. It is a local acceptance gate over the current branch. No production, blue-green, canary, AWS, CDN, or managed observability deployment is selected.

## Secrets Management in CI/CD

Command capture wrappers must redact or omit env variables, cookie values, OAuth/OIDC tokens, refresh tokens, service tokens, and secrets. If command output contains secret material, final decision is BLOCKED until regenerated safely.

## Artifact Management

CI/local acceptance archives the final package under `artifacts/w2-01-live/app-shell-auth/`. `manifest.json` references every command output and blocker row. Missing artifacts are blockers, not warnings.

