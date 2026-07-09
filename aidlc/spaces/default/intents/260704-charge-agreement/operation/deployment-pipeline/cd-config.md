# CD Config - Charge Agreement Walking Skeleton

## Source Alignment

This artifact consumes `ci-config`, `quality-gates`, `deployment-architecture`, and `cicd-pipeline`.

## Pipeline Shape

The CD configuration is local-first and evidence-driven for B01/U01.

| Stage | Entry Criteria | Action | Exit Evidence |
| --- | --- | --- | --- |
| Package | `ci-config` and `quality-gates` pass | Build backend module and Next.js app | Maven test output and Next build output |
| Assemble | Package succeeds | Prepare local host-runtime commands and reverse proxy route | Command manifest and route mapping |
| Deploy Local | User explicitly starts local runtime | Start `charge-agreement-service` on `8084`, app on `3002`, proxy under `/charge-agreements/` | Process health and HTTP module-info response |
| Smoke | Local runtime is running | Hit backend module-info and frontend health/API routes | Smoke evidence artifacts |
| Promote | Smoke passes | Mark walking skeleton deployable for further implementation units | Deployment stage approval |

## Commands

Backend package:

```powershell
$env:JAVA_HOME=(Resolve-Path .\.local-tools\jdk-21).Path
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"
.\.local-tools\apache-maven\bin\mvn.cmd -f services/pom.xml -pl charge-agreement-service/container -am test
```

Frontend package:

```powershell
node .yarn/releases/yarn-4.5.3.cjs workspace @erp/app-charge-agreements typecheck
node .yarn/releases/yarn-4.5.3.cjs workspace @erp/app-charge-agreements test
node .yarn/releases/yarn-4.5.3.cjs workspace @erp/app-charge-agreements build
```

Local runtime execution is intentionally not run in this stage because the user requested all localhost servers be stopped. These commands become deployment-execution inputs after explicit runtime start approval.

## Artifact Policy

No production artifact repository is introduced for B01/U01. GitHub Actions uploads evidence artifacts only. Container registry, Maven package repository, and object storage publication are deferred until the service has real persistence, API behavior, and deployment targets.

## Security and Compliance

This CD config does not change IAM, network policy, encryption, or external deployment targets. The security impact is limited to documenting local promotion steps for the existing host-runtime topology.

