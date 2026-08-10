# Build Test Results - W2-01 App Shell and Auth

## Upstream Inputs

Results correspond to the commands documented in `build-instructions.md`, `unit-test-instructions.md`, `integration-test-instructions.md`, `performance-test-instructions.md`, and `security-test-instructions.md`, which consume U01-U06 code-generation summaries.

## Build Results

| Command | Status | Details |
| --- | --- | --- |
| `yarn workspace @erp/auth typecheck` | PASS | Exit 0. |
| `yarn workspace @erp/shared-types typecheck` | PASS | Exit 0. |
| `yarn workspace @erp/app-auth typecheck` | PASS | Exit 0. |
| `yarn workspace @erp/app-booking typecheck` | PASS | Exit 0. |
| `yarn workspace @erp/app-shell typecheck` | PASS after rerun | Initial run failed because stale `.next/types` entries referenced missing generated files; `yarn workspace @erp/app-shell build` regenerated `.next/types`, then rerun passed. |
| `yarn workspace @erp/app-shell build` | PASS | Next.js 15.5.19 compiled and generated 13 routes; warning only: Next ESLint plugin not detected. |
| `docker compose config --quiet` | PASS | Exit 0. |

## Unit and Component Test Results

| Command | Status | Count |
| --- | --- | --- |
| `yarn workspace @erp/auth test` | PASS | 1 file, 11 tests. |
| `yarn workspace @erp/shared-types test` | PASS | 1 file, 3 tests. |
| `yarn workspace @erp/app-auth test` | PASS | 5 files, 12 tests. |
| `yarn workspace @erp/app-booking test` | PASS | 5 files, 22 tests. |
| `yarn workspace @erp/app-shell test` | PASS | 8 files, 20 tests. |
| `node --test scripts/w2-01-live-acceptance.test.mjs` | PASS | 4 tests. |

## Lint Results

| Command | Status | Notes |
| --- | --- | --- |
| `yarn workspace @erp/auth lint` | PASS | Exit 0. |
| `yarn workspace @erp/shared-types lint` | PASS | Exit 0. |
| `yarn workspace @erp/app-auth lint` | PASS | No ESLint warnings/errors; Next lint deprecation/plugin warnings only. |
| `yarn workspace @erp/app-booking lint` | PASS | No ESLint warnings/errors; Next lint deprecation/plugin warnings only. |
| `yarn workspace @erp/app-shell lint` | PASS | No ESLint warnings/errors; Next lint deprecation/plugin warnings only. |

## Backend Integration Results

| Command | Status | Count |
| --- | --- | --- |
| `mvn -f services/pom.xml -pl identity-service/domain-core,identity-service/application-service,booking-service/container -am "-Dtest=AuthorizationPolicyEvaluatorTest,IdentityApplicationServiceTest,HttpIdentityAuthorizationAdapterTest,BookingApiControllerTest,BookingLocalIdentityFilterTest,BookingLocalAuthorizationTest" "-Dsurefire.failIfNoSpecifiedTests=false" test` | PASS | Identity domain 8, identity app 6, booking container 19; reactor BUILD SUCCESS. |

## U06 Evidence and Security Results

| Command | Status | Details |
| --- | --- | --- |
| `node scripts/w2-01-live-acceptance.mjs --dry-run --output-root artifacts/w2-01-live/app-shell-auth` | PASS command, BLOCKED decision | Generated schema-valid package with `finalDecision=BLOCKED`. |
| `node scripts/w2-01-live-acceptance.mjs --output-root artifacts/w2-01-live/app-shell-auth` | PASS command, BLOCKED decision | Captured detector/audit outputs; detector 6d PASS, audits BLOCKED due missing Bash. |
| `node scripts/w2-01-live-acceptance.mjs --validate --output-root artifacts/w2-01-live/app-shell-auth` | PASS | `{ "status": "PASS", "failures": [] }`. |
| Prohibited frontend-library scan | PASS | No matches for Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js in scoped surfaces. |
| Protected-path `local-user` scan | PASS | No matches in `apps/shell` or `apps/booking`. |
| Evidence leak scan | PASS | No token/secret/cookie/`lc_session` value pattern matches under `artifacts/w2-01-live/app-shell-auth`. |
| Detector 6d | PASS | `zero hardcoded-auth hits for mounted shell/Booking surfaces`. |
| `erp-fidelity-audit` | BLOCKED | `bash .claude/skills/erp-fidelity-audit/detectors.sh` failed: `/bin/bash` not found through WSL relay. |
| `aidlc-audit` | BLOCKED | `bash .claude/skills/aidlc-audit/detectors.sh` failed: `/bin/bash` not found through WSL relay. |

## Live Compose Result

Command:
```powershell
docker compose --profile full up -d --build
```

Status: BLOCKED.

Observed failure:
```text
failed to resolve reference "docker.elastic.co/elasticsearch/elasticsearch:8.16.1": failed to do request: Head "https://docker.elastic.co/v2/elasticsearch/elasticsearch/manifests/8.16.1": dialing docker.elastic.co:443 container via direct connection because Docker Desktop has no HTTPS proxy: connecting to docker.elastic.co:443: dial tcp 34.56.16.77:443: connectex: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond.
```

Impact: live W2-01 browser proof through Nginx cannot be completed in this environment.

Next action: configure Docker Desktop HTTPS proxy/network access or pre-seed required Elastic images, then rerun Compose startup and the four U06 live scenarios.

## Failure Details

- No code test failures remain.
- One transient shell typecheck failure was resolved by running shell production build, which regenerated `.next/types`.
- Live acceptance remains BLOCKED; this is not a PASS and is separate from W1's existing BLOCKED `compose-start` waiver.
