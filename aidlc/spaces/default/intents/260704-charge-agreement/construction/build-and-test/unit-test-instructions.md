# Unit Test Instructions - B01 Charge Agreement Walking Skeleton

## Source Alignment

This file consumes `code-generation-plan.md` and `code-summary.md` for U01.

## Backend Unit Tests

Run the backend unit test through Maven:

```powershell
$env:JAVA_HOME=(Resolve-Path .\.local-tools\jdk-21).Path
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"
.\.local-tools\apache-maven\bin\mvn.cmd -f services/pom.xml -pl charge-agreement-service/container -am test
```

Expected coverage: module-info endpoint returns service identity, local mode, version, and enabled backend-health capability.

## Frontend Unit Tests

Run the workbench render test:

```powershell
node .yarn/releases/yarn-4.5.3.cjs workspace @erp/app-charge-agreements test
```

Expected coverage: page heading renders, skeleton agreement is visible, and write action is disabled until later units.
