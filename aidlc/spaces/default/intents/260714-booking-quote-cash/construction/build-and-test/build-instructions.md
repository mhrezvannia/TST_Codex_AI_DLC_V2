# Build Instructions - W1-01 Booking Quote-to-Cash

## Upstream Inputs

These instructions consume the seven unit code-generation outputs under `construction/*/code-generation/`, especially each `code-generation-plan.md` and `code-summary.md`:

| Unit | Build-relevant surface |
|---|---|
| `booking-draft-skeleton` | Booking domain/application/dataaccess/container and Booking Next app |
| `reference-validation` | Reference Data integration, seed tooling, Booking validation UI |
| `agreement-pricing` | Charge pricing API, Booking pricing adapter, pricing UI action |
| `confirm-to-cmm-journey` | Booking confirmation outbox, CMM booking-confirmed consumer |
| `returned-status-detail` | CMM status publisher, Booking movement-status consumer/projection/UI |
| `replay-restart-safety` | Pricing idempotency fencing, replay/restart proof harness |
| `live-release-acceptance` | Live acceptance harness, real-messaging guard, Compose preflight |

## Prerequisites

- Java and Maven available on `PATH`.
- Node.js and Yarn available on `PATH`.
- Docker Desktop available for Compose config and live acceptance attempts.
- Local PostgreSQL host port remains `55432`; default `5432` is intentionally avoided.
- Git Bash is required for detector scripts on this Windows workstation: `C:\Program Files\Git\bin\bash.exe`.
- Maven dependencies are expected to be present locally; use offline mode unless a dependency refresh is intentionally needed.

## Environment Setup

Use the repository root `D:\TST_Codex_W1-01` for workspace-level commands and `D:\TST_Codex_W1-01\services` for the Maven service suite.

Relevant local runtime defaults:

```powershell
$env:POSTGRES_HOST_PORT = "55432"
$env:GRAFANA_HOST_PORT = "3003"
```

Do not start the full Compose runtime just for static validation. The live acceptance command owns runtime startup and evidence capture.

## Build Commands

Run backend compile/tests:

```powershell
cd D:\TST_Codex_W1-01\services
mvn -o -q test
```

Run Booking frontend checks:

```powershell
cd D:\TST_Codex_W1-01
yarn workspace @erp/app-booking test
yarn workspace @erp/app-booking typecheck
yarn workspace @erp/app-booking lint
yarn workspace @erp/app-booking build
```

Run workspace script checks and static Compose validation:

```powershell
cd D:\TST_Codex_W1-01
node --test scripts/w1-live-acceptance.test.mjs scripts/replay-restart-proof.test.mjs scripts/local-readiness.test.mjs scripts/run-quality-gates.test.mjs scripts/seed-local.test.mjs
docker compose config --quiet
git diff --check
```

Run audit detectors through Git Bash, not the Windows WSL `bash.exe` shim:

```powershell
& 'C:\Program Files\Git\bin\bash.exe' .claude/skills/aidlc-audit/detectors.sh
& 'C:\Program Files\Git\bin\bash.exe' .claude/skills/erp-fidelity-audit/detectors.sh
```

## Verification

The build is acceptable when all commands above exit `0`, the frontend build emits the expected Booking and API routes, Docker Compose config validates with PostgreSQL on host port `55432`, and detector outputs are reviewed as LEADS rather than ignored as failures.

Transient Maven TLS issues should be retried online only when the local cache cannot satisfy the build; the preferred repeatable gate is the offline command shown above.
