# CD Config - W2-01 App Shell and Auth

## Upstream Inputs

This CD configuration consumes `ci-config`, `quality-gates`, per-unit `deployment-architecture`, and per-unit `cicd-pipeline` artifacts from W2-01.

The relevant runtime topology from `deployment-architecture` is the existing Compose/Nginx stack with `apps-shell`, `apps-auth`, `apps-booking`, `booking-service`, `identity-service`, Keycloak, PostgreSQL, and Nginx on host port `8088`. The relevant validation path from `cicd-pipeline` is build, test, Compose static validation, live scenario evidence, detector 6d, `erp-fidelity-audit`, and `aidlc-audit`.

## Pipeline Type

| Item | Decision |
| --- | --- |
| Delivery model | Continuous delivery, not continuous deployment |
| Deployment target | Existing local/on-prem Docker Compose stack |
| Production promotion | Out of scope for W2-01 |
| Human approval | Required before merge and before any later production release |
| Publish repository | None introduced in this intent |

## Promotion Matrix

| Stage | Entry criterion | Action | Exit criterion |
| --- | --- | --- | --- |
| Intent branch CI | W2-01 code pushed to `intent/W2-01-app-shell-and-auth` or PR opened | Run `.github/workflows/quality-gates.yml` | All required non-live gates pass; evidence uploaded |
| Live local/on-prem proof | CI code gates pass and runner has Docker proxy/cache plus Bash | Run `docker compose --profile full up -d --build`, then W2-01 live evidence driver | `artifacts/w2-01-live/app-shell-auth/manifest.json` has `finalDecision=PASS` and `runtimeStatus=PASS` |
| Merge readiness | CI, live proof, detector 6d, `erp-fidelity-audit`, and `aidlc-audit` pass | Human approval and squash/merge to `integ/main-reconciled` | Merge commit preserves W0-01, W0-02, W1-01, and W2-02 behavior |
| Production release | Separate future release approval | Not executed by W2-01 | Requires future deployment architecture and production smoke plan |

## CD Commands

```bash
corepack yarn install --immutable
mvn -f services/pom.xml -q test
corepack yarn workspace @erp/auth test
corepack yarn workspace @erp/shared-types test
corepack yarn workspace @erp/app-auth test
corepack yarn workspace @erp/app-booking test
corepack yarn workspace @erp/app-shell test
docker compose config --quiet
docker compose --profile full up -d --build
node scripts/w2-01-live-acceptance.mjs --output-root artifacts/w2-01-live/app-shell-auth
node scripts/w2-01-live-acceptance.mjs --validate --require-pass --output-root artifacts/w2-01-live/app-shell-auth
bash .claude/skills/erp-fidelity-audit/detectors.sh
bash .claude/skills/aidlc-audit/detectors.sh
```

## Environment Requirements

| Requirement | Reason |
| --- | --- |
| Linux self-hosted runner with Docker Compose | Required by `deployment-architecture` and live Compose proof |
| Docker proxy or cached Elastic image | Current blocker is pull access for `docker.elastic.co/elasticsearch/elasticsearch:8.16.1` |
| Bash available | Required by `quality-gates` audit detector commands |
| Keycloak/auth local configuration | Required for sign-in, sign-out, and real-subject session evidence |
| Evidence upload enabled | Required for `quality-gates` and W2-01 final package review |

## Feature Flag Configuration

No feature flag provider is introduced. If a later release needs a shell cutover flag, it must be server-side, default off until `--require-pass` succeeds, and must never bypass auth/session/authorization checks.

## Security Notes

- Do not promote by disabling `--require-pass`, detector 6d, `erp-fidelity-audit`, or `aidlc-audit`.
- Do not roll forward with a W2-01 `BLOCKED` final decision.
- Do not publish or expose session cookies, service tokens, Keycloak secrets, or `lc_session` values in evidence.
