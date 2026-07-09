# CI Config - Charge Agreement Walking Skeleton

## Source Alignment

This artifact consumes `code-summary.md`, `build-and-test-summary.md`, and `build-test-results.md`.

## Existing Pipeline

The repository already uses GitHub Actions through `.github/workflows/quality-gates.yml`.

| Pipeline Area | Current Configuration |
| --- | --- |
| Trigger | Pull request to `main` and manual `workflow_dispatch` |
| Runner | Self-hosted on-prem Linux runner |
| Java | Temurin Java 21 with Maven cache |
| Frontend package manager | Corepack Yarn immutable install |
| Quality entry point | `node scripts/run-quality-gates.mjs --all --evidence artifacts/quality-gates/evidence.json` |
| Evidence | Uploaded `artifacts/quality-gates/evidence.json` and readiness artifacts |

## Charge Agreement CI Integration

`scripts/run-quality-gates.mjs` now treats `apps/charge-agreements/` as a first-class affected scope and includes two required frontend gates:

| Gate | Scope | Command | Required |
| --- | --- | --- | --- |
| `frontend-charge-agreements-test` | `apps/charge-agreements` | `corepack yarn workspace @erp/app-charge-agreements test` | Yes |
| `frontend-charge-agreements-typecheck` | `apps/charge-agreements` | `corepack yarn workspace @erp/app-charge-agreements typecheck` | Yes |

The `--all` CI mode now includes the `apps/charge-agreements` scope, so the full quality workflow exercises the new UI module in addition to the existing workspace, service, contract, seed, reference-data, and auth gates.

## Backend CI Integration

The existing `backend-test` gate continues to run `mvn -f services/pom.xml test`. The Charge Agreement service was added to `services/pom.xml`, so full backend CI includes the new `charge-agreement-service` modules.

The local policy domain purity check also includes:

```text
services/charge-agreement-service/domain-core/src/main/java
```

This keeps framework dependencies out of the Charge Agreement domain-core module when domain implementation is added in later units.

## Evidence Commands

The CI stage verified the executable aggregator behavior with:

```powershell
node --test scripts/run-quality-gates.test.mjs
node --input-type=module -e "import { classifyChangedPaths, selectGates } from './scripts/run-quality-gates.mjs'; const scopes = classifyChangedPaths(['apps/charge-agreements/app/page.tsx']); const gates = selectGates(scopes).map(g => g.id); console.log(JSON.stringify({ scopes, chargeGates: gates.filter(id => id.includes('charge-agreements')) }, null, 2)); if (!gates.includes('frontend-charge-agreements-test') || !gates.includes('frontend-charge-agreements-typecheck')) process.exit(1);"
```

Both commands passed. A dry-run of `--all` is not used as success evidence because this runner intentionally treats skipped required gates as failed in dry-run mode.

## Operational Notes

Local runtime smoke was not run during this CI stage because local servers were intentionally stopped at the user's request. The pipeline configuration is build/test focused and does not claim deployment readiness.

