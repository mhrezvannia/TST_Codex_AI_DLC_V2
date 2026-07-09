# Build Instructions - B01 Charge Agreement Walking Skeleton

## Source Alignment

This file consumes `code-generation-plan.md` and `code-summary.md` for U01.

## Environment

1. Use local JDK at `.local-tools/jdk-21` and Maven at `.local-tools/apache-maven/bin/mvn.cmd`.
2. Use vendored Yarn through `node .yarn/releases/yarn-4.5.3.cjs`.
3. Host-runtime ports are `8084` for backend and `3002` for UI; local proxy route is `/charge-agreements/`.

## Commands

```powershell
$env:JAVA_HOME=(Resolve-Path .\.local-tools\jdk-21).Path
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"
.\.local-tools\apache-maven\bin\mvn.cmd -f services/pom.xml -pl charge-agreement-service/container -am test
node .yarn/releases/yarn-4.5.3.cjs workspace @erp/app-charge-agreements typecheck
node .yarn/releases/yarn-4.5.3.cjs workspace @erp/app-charge-agreements test
node .yarn/releases/yarn-4.5.3.cjs workspace @erp/app-charge-agreements build
```

## Troubleshooting

Global `yarn` is not available in this shell. Use the vendored Yarn command. `yarn install` hit network `ECONNRESET` and timeout during this run, but package-level commands passed after workspace metadata was patched.
