# Environment Validation Report - W2-01 App Shell and Auth

## Upstream Inputs

This validation report consumes per-unit `deployment-architecture`, per-unit `infrastructure-services`, and `operation/deployment-pipeline/cd-config.md`.

## Validation Summary

| Check | Status | Detail |
| --- | --- | --- |
| Compose static validation | PASS | `docker compose config --quiet` exits `0` |
| Full profile service inventory | PASS | `docker compose --profile full config --services` lists `apps-shell`, `apps-auth`, `apps-booking`, `booking-service`, `identity-service`, Keycloak, Nginx, and dependent services |
| Runtime service startup | PASS | App and observability profiles run with official Elastic 8.16.1 images; no volumes were reset |
| Clean full-profile rebuild | BLOCKED follow-up | The hard-coded full `--build` attempt timed out transferring large local build contexts; this did not invalidate the running W2 proof stack |
| W2-01 evidence package schema | PASS | `node scripts/w2-01-live-acceptance.mjs --validate --output-root artifacts/w2-01-live/app-shell-auth` passes |
| W2-01 final acceptance | PASS | `--require-pass` passes after all live scenarios and audits produced PASS evidence |
| Bash detector availability | PASS | Runner resolves `C:\Program Files\Git\bin\bash.exe` ahead of the Windows WSL shim |
| AWS provisioning | NOT APPLICABLE | No AWS IaC resources declared for W2-01 |

## Environment Health

| Component | Expected health check | Current result |
| --- | --- | --- |
| Nginx | `http://127.0.0.1:8088/health` | PASS, HTTP 200 |
| Shell | Protected `/` and `/booking*` through Nginx | PASS in live browser evidence |
| Auth/Keycloak | Login and sign-out through auth app | PASS with real OIDC subject and stale-call 401 |
| Booking | Create/detail/deny scenarios with real subject | PASS, including validate, price, and confirm |
| Identity-service | Authorization allow/deny for Booking permissions | PASS in code tests and live scenarios |
| Evidence package | Manifest and JSON/JSONL files parse | PASS with `finalDecision=PASS` and no blocker rows |

## Security Validation

| Control | Status | Notes |
| --- | --- | --- |
| No hardcoded mounted-surface auth | PASS in local detector 6d | `detector-6d.txt` reports zero hardcoded-auth hits for shell/Booking surfaces |
| Session cookie redaction | PASS | Evidence leak scan found no raw `lc_session` values |
| Protected route fail-closed behavior | PASS | Automated tests and live sign-out/stale-call proof |
| Authorization fail-closed behavior | PASS | Automated tests and live denied-role proof |
| Audit detectors | PASS | Both required Bash detectors exit `0` |

## Compliance Validation

W2-01 adds no new cloud data residency, PCI, HIPAA, or SOC 2 control claims. Compliance evidence for this intent is limited to:

- Authentication/session ownership remains with the existing auth app and Keycloak.
- Authorization evidence must show the real subject, not `local-user`.
- Evidence must not expose service tokens, cookies, secrets, or PII values.
- Audit detector outputs must be captured before W2-01 is accepted.

## Remaining Follow-Ups

1. Reduce or isolate Docker build contexts so a clean full-profile rebuild completes inside the proof-runner timeout.
2. Wire application Prometheus metrics, OTLP traces, and log shipping before making production observability claims.
3. Upload `artifacts/w2-01-live/app-shell-auth/**` and quality/audit artifacts for review.

## Final Environment Decision

Environment provisioning is complete for local/on-prem W2-01 proof, and final acceptance is PASS. Production provisioning and clean full-profile rebuild reproducibility remain outside this decision.
