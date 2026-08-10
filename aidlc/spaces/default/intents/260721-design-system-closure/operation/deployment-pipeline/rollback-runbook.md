# Rollback Runbook — W2-02 Design-System Closure

## Inputs and scope

This runbook implements the failure boundary defined by `construction/ci-pipeline/ci-config.md`, `construction/ci-pipeline/quality-gates.md`, `booking-design-system-closure/infrastructure-design/deployment-architecture.md`, and `booking-design-system-closure/infrastructure-design/cicd-pipeline.md`.

It applies only to `linercore-wave-a`. It does not authorize changes to `linercore-shared-platform`, staging, production, external registries, IAM, networks, or secrets.

## Automatic failure behavior

The live-acceptance parent owns cleanup only after proving that Wave A was absent and after arming ownership immediately before its startup invocation. On failure it:

1. records the failing gate and diagnostic hash;
2. captures available Wave A status;
3. runs wrapper-scoped cleanup when ownership is established;
4. reruns the manager guard;
5. releases the lifecycle lock;
6. publishes immutable `FAILED` lineage, or a recovery record if shared indexing fails.

It never publishes a `COMPLETED` envelope before all throwing boundaries finish.

## Manual recovery procedure

### 1. Stop and preserve

- Do not overwrite, delete, or relabel the failed run directory.
- Do not start a second attempt while the lifecycle lock is owned.
- Record the failed run ID and the first failing gate.

### 2. Verify exact targets

Confirm the intended acceptance project is `linercore-wave-a` and the protected project is `linercore-shared-platform`. Confirm the acceptance edge is port 18088 and the manager edge is port 8088.

### 3. Clean only owned Wave A resources

If the failed attempt established lifecycle ownership and automatic cleanup did not complete, use the repository wrapper with that attempt’s exact environment:

```powershell
node scripts/wave-a-compose.mjs --parallel 1 `
  -f compose.yaml `
  -f infrastructure/compose/w2-02-acceptance.compose.yaml `
  down --volumes --remove-orphans
```

Never run an unscoped `docker compose down`. Never target the manager project.

### 4. Re-establish safety

- Verify Wave A has no remaining services.
- Run `npm run demo:guard`.
- If the manager guard fails, stop. Manager recovery requires separate, explicit authorization and is not Wave A rollback.
- Confirm no stale lifecycle owner remains before opening a new attempt.

### 5. Correct and rerun

Reproduce the defect with a regression test when practical. Apply one evidence-backed correction, rerun focused checks, generate a fresh short-lived storage state, and invoke live acceptance with:

```powershell
corepack yarn w2-02:live-acceptance `
  --storage-state .w2-02-auth/storage-state.json `
  --rerun-of <failed-run-id>
```

The new attempt must remain hash-bound to the failed predecessor.

## Source and image rollback

If the correction itself must be abandoned, revert it through a normal reviewed version-control change; do not use destructive workspace reset commands. Rebuild or retag only Wave A images, then execute a new full acceptance attempt. A prior image or prior successful run cannot substitute for evidence against the new workspace identity.

## Data recovery

Wave A test data and volumes are disposable. Cleanup may remove them after evidence capture. There is no promise to recover acceptance data after volume deletion.

The manager’s data and volumes are outside this runbook. Production backup, restore, point-in-time recovery, replication, and destructive migration rollback are not defined and must not be inferred.

## Success criteria

Rollback/recovery is complete only when:

- Wave A resources are absent;
- the lifecycle lock is released;
- the failed attempt remains immutable and indexed or has a recovery record;
- the protected manager guard passes;
- the next attempt, if any, references the failed run and starts from a clean ownership check.

No failed deployment is converted into PASS.
